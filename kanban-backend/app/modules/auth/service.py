"""Business logic for auth — register, login, tokens, logout."""

from datetime import datetime, timedelta, timezone
from typing import Optional

from app.core.database import get_database
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.modules.auth.model import (
    REFRESH_TOKENS_COLLECTION,
    USERS_COLLECTION,
    new_refresh_token_doc,
    new_user_doc,
)


# ─── Constants ───

MAX_LOGIN_ATTEMPTS = 5
LOCK_DURATION_MINUTES = 15


# ─── Register ───

async def register_user(email: str, password: str, nombre_completo: str) -> dict:
    """Register a new user. Raises ValueError if email already exists."""
    db = get_database()
    existing = await db[USERS_COLLECTION].find_one({"email": email})
    if existing:
        raise ValueError("El email ya está registrado")

    pw_hash = hash_password(password)
    user_doc = new_user_doc(email, nombre_completo, pw_hash)
    result = await db[USERS_COLLECTION].insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    return user_doc


# ─── Login ───

async def authenticate_user(email: str, password: str) -> dict:
    """Validate credentials. Returns tokens dict on success.

    Raises ValueError with appropriate messages on failure.
    """
    db = get_database()
    user = await db[USERS_COLLECTION].find_one({"email": email})
    if not user:
        raise ValueError("Credenciales inválidas")

    # Check if account is locked (RN-04)
    now = datetime.now(timezone.utc)
    if user.get("locked_until") and user["locked_until"] > now:
        raise ValueError("Cuenta bloqueada — contactar al administrador")

    # Verify password
    if not verify_password(password, user["password_hash"]):
        await _increment_login_attempts(db, user)
        raise ValueError("Credenciales inválidas")

    # Success — reset attempts and update last access
    await db[USERS_COLLECTION].update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "login_attempts": 0,
                "ultimo_acceso": now,
                "locked_until": None,
            }
        },
    )

    return await create_tokens(str(user["_id"]))


async def _increment_login_attempts(db, user):
    """Increment failed login counter and lock if threshold reached."""
    attempts = (user.get("login_attempts") or 0) + 1
    update: dict = {"$set": {"login_attempts": attempts}}

    if attempts >= MAX_LOGIN_ATTEMPTS:
        locked_until = datetime.now(timezone.utc) + timedelta(minutes=LOCK_DURATION_MINUTES)
        update["$set"]["locked_until"] = locked_until

    await db[USERS_COLLECTION].update_one({"_id": user["_id"]}, update)


# ─── Tokens ───

async def create_tokens(user_id: str) -> dict:
    """Generate access + refresh tokens and persist refresh token."""
    access_token = create_access_token({"sub": user_id})
    refresh_token = create_refresh_token({"sub": user_id})

    # Decode refresh to get expiry
    payload = decode_token(refresh_token)
    expires_at = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)

    db = get_database()
    await db[REFRESH_TOKENS_COLLECTION].insert_one(
        new_refresh_token_doc(refresh_token, user_id, expires_at)
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": 3600,
    }


async def refresh_access_token(refresh_token: str) -> dict:
    """Validate refresh token and issue a new access token."""
    db = get_database()
    stored = await db[REFRESH_TOKENS_COLLECTION].find_one({"token": refresh_token})
    if not stored:
        raise ValueError("Refresh token inválido o expirado")

    # Verify JWT is still valid
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        await db[REFRESH_TOKENS_COLLECTION].delete_one({"_id": stored["_id"]})
        raise ValueError("Refresh token inválido o expirado")

    new_access = create_access_token({"sub": payload["sub"]})
    return {"access_token": new_access, "expires_in": 3600}


async def revoke_refresh_token(refresh_token: str) -> None:
    """Delete refresh token from DB (logout)."""
    db = get_database()
    await db[REFRESH_TOKENS_COLLECTION].delete_one({"token": refresh_token})


# ─── User queries ───

async def get_user_by_id(user_id: str) -> Optional[dict]:
    """Fetch a user by _id (for middleware / profile)."""
    from bson import ObjectId

    db = get_database()
    return await db[USERS_COLLECTION].find_one({"_id": ObjectId(user_id)})
