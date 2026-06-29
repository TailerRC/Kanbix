"""MongoDB document models for the auth module.

Uses raw Motor collections (not an ODM). Collection names and index
specs are centralized here for consistency.
"""

from datetime import datetime, timezone
from typing import Optional

from app.core.database import get_database

# ─── Collection names ───

USERS_COLLECTION = "users"
REFRESH_TOKENS_COLLECTION = "refresh_tokens"


# ─── Helpers ───

def _db():
    return get_database()


async def ensure_indexes():
    """Create required indexes on startup (idempotent)."""
    users = _db()[USERS_COLLECTION]
    await users.create_index("email", unique=True)

    rt = _db()[REFRESH_TOKENS_COLLECTION]
    await rt.create_index("token", unique=True)
    await rt.create_index("expires_at", expireAfterSeconds=0)


# ─── User document helpers ───

def new_user_doc(
    email: str,
    nombre_completo: str,
    password_hash: str,
    rol: str = "Developer",
) -> dict:
    return {
        "email": email,
        "nombre_completo": nombre_completo,
        "password_hash": password_hash,
        "rol": rol,
        "activo": True,
        "fecha_creacion": datetime.now(timezone.utc),
        "ultimo_acceso": None,
        "login_attempts": 0,
        "locked_until": None,
    }


def user_to_response(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "nombre_completo": user["nombre_completo"],
        "fecha_creacion": user["fecha_creacion"],
    }


def user_to_profile(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "nombre_completo": user["nombre_completo"],
        "fecha_creacion": user["fecha_creacion"],
        "ultimo_acceso": user.get("ultimo_acceso"),
    }


# ─── RefreshToken document helpers ───

def new_refresh_token_doc(token: str, user_id: str, expires_at: datetime) -> dict:
    return {
        "token": token,
        "user_id": user_id,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc),
    }
