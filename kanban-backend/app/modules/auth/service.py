"""Lógica de negocio del módulo de Autenticación y Usuarios (Módulo 1).

No conoce HTTP: lanza APIError (manejada por el handler global) y devuelve dicts.
"""
from datetime import datetime, timedelta, timezone

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.modules.auth import model
from app.modules.auth.schemas import RegisterRequest
from app.shared.audit import log_action
from app.shared.errors import APIError
from app.shared.utils.objectid import to_object_id

MAX_FAILED_ATTEMPTS = 5  # RN-04
LOCK_MINUTES = 15  # RN-04


def _access_expires_seconds() -> int:
    return settings.jwt_access_token_expire_minutes * 60


def _public_user(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "email": doc["email"],
        "nombre_completo": doc["nombre_completo"],
        "rol_global": doc["rol_global"],
        "fecha_creacion": doc["fecha_creacion"],
    }


async def create_user(db, payload: RegisterRequest, creador_id: str | None) -> dict:
    """RN-05/RN-34: solo Admin crea cuentas. RN-02: email único."""
    existing = await db.users.find_one({"email": payload.email.lower()})
    if existing:
        raise APIError(400, "El email ya está registrado", "email")

    doc = model.new_user_document(
        email=payload.email,
        password_hash=hash_password(payload.password),
        nombre_completo=payload.nombre_completo,
        rol_global=payload.rol_global,
        id_creador=creador_id,
    )
    result = await db.users.insert_one(doc)
    doc["_id"] = result.inserted_id

    await log_action(
        db, creador_id or "system", "crear_usuario",
        f"Creó usuario {payload.email} con rol {payload.rol_global}",
        str(result.inserted_id),
    )
    return _public_user(doc)


async def authenticate(db, email: str, password: str) -> dict:
    user = await db.users.find_one({"email": email.lower()})
    if not user:
        raise APIError(401, "Credenciales inválidas")

    if not user.get("activo", True):
        raise APIError(403, "Cuenta desactivada — contactar al administrador")

    now = datetime.now(timezone.utc)
    bloqueado_hasta = user.get("bloqueado_hasta")
    if user.get("cuenta_bloqueada"):
        if bloqueado_hasta and bloqueado_hasta.replace(tzinfo=timezone.utc) > now:
            raise APIError(403, "Cuenta bloqueada por intentos fallidos — contacta al administrador")
        # El bloqueo temporal expiró: se rehabilita automáticamente.
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"cuenta_bloqueada": False, "intentos_fallidos": 0, "bloqueado_hasta": None}},
        )
        user["intentos_fallidos"] = 0

    if not verify_password(password, user["password_hash"]):
        intentos = user.get("intentos_fallidos", 0) + 1
        update = {"intentos_fallidos": intentos}
        if intentos >= MAX_FAILED_ATTEMPTS:  # RN-04
            update["cuenta_bloqueada"] = True
            update["bloqueado_hasta"] = now + timedelta(minutes=LOCK_MINUTES)
        await db.users.update_one({"_id": user["_id"]}, {"$set": update})
        raise APIError(401, "Credenciales inválidas")

    # Login correcto: reset de intentos y registro de acceso.
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"intentos_fallidos": 0, "cuenta_bloqueada": False,
                  "bloqueado_hasta": None, "ultimo_acceso": now}},
    )

    expiracion = user.get("password_expiracion")
    expirada = bool(expiracion and expiracion.replace(tzinfo=timezone.utc) <= now)
    cambiar_password = bool(user.get("cambiar_password")) or expirada  # RN-31

    user_id = str(user["_id"])
    access = create_access_token(
        {"sub": user_id, "role": user["rol_global"], "email": user["email"]}
    )
    refresh = create_refresh_token({"sub": user_id})
    await db.refresh_tokens.insert_one(
        {"token": refresh, "user_id": user_id,
         "expires_at": now + timedelta(days=settings.jwt_refresh_token_expire_days),
         "created_at": now}
    )

    return {
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "bearer",
        "expires_in": _access_expires_seconds(),
        "cambiar_password": cambiar_password,
    }


async def refresh_access_token(db, refresh_token: str) -> dict:
    payload = decode_token(refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise APIError(401, "Refresh token inválido o expirado")

    stored = await db.refresh_tokens.find_one({"token": refresh_token})
    if stored is None:
        raise APIError(401, "Refresh token inválido o expirado")

    user = await db.users.find_one({"_id": to_object_id(payload["sub"], "sub", "Usuario")})
    if user is None:
        raise APIError(401, "Refresh token inválido o expirado")

    access = create_access_token(
        {"sub": str(user["_id"]), "role": user["rol_global"], "email": user["email"]}
    )
    return {"access_token": access, "expires_in": _access_expires_seconds()}


async def logout(db, refresh_token: str) -> dict:
    await db.refresh_tokens.delete_many({"token": refresh_token})
    return {"message": "Sesión cerrada exitosamente"}


async def get_me(db, user_id: str) -> dict:
    user = await db.users.find_one({"_id": to_object_id(user_id, "id", "Usuario")})
    if user is None:
        raise APIError(404, "Usuario no encontrado")
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "nombre_completo": user["nombre_completo"],
        "rol_global": user["rol_global"],
        "cambiar_password": bool(user.get("cambiar_password")),
        "fecha_creacion": user["fecha_creacion"],
        "ultimo_acceso": user.get("ultimo_acceso"),
    }


async def list_users(db, page: int, limit: int) -> dict:
    limit = max(1, min(limit, 100))
    page = max(1, page)
    skip = (page - 1) * limit
    total = await db.users.count_documents({})
    cursor = db.users.find({}).sort("fecha_creacion", -1).skip(skip).limit(limit)
    data = []
    async for u in cursor:
        data.append({
            "id": str(u["_id"]),
            "email": u["email"],
            "nombre_completo": u["nombre_completo"],
            "rol_global": u["rol_global"],
            "activo": u.get("activo", True),
            "fecha_creacion": u["fecha_creacion"],
            "ultimo_acceso": u.get("ultimo_acceso"),
        })
    return {"total": total, "page": page, "limit": limit, "data": data}


async def unlock_user(db, target_id: str) -> dict:
    oid = to_object_id(target_id, "id", "Usuario")
    result = await db.users.update_one(
        {"_id": oid},
        {"$set": {"cuenta_bloqueada": False, "intentos_fallidos": 0, "bloqueado_hasta": None}},
    )
    if result.matched_count == 0:
        raise APIError(404, "Usuario no encontrado")
    return {"message": "Cuenta desbloqueada exitosamente", "user_id": target_id}


async def change_global_role(db, admin_id: str, target_id: str, nuevo_rol: str) -> dict:
    if str(admin_id) == str(target_id):  # RN-07
        raise APIError(400, "No puedes cambiar tu propio rol")

    oid = to_object_id(target_id, "id", "Usuario")
    user = await db.users.find_one({"_id": oid})
    if user is None:
        raise APIError(404, "Usuario no encontrado")

    # RN-08: no dejar el sistema sin ningún Admin activo.
    if user["rol_global"] == "Admin" and nuevo_rol != "Admin":
        admins = await db.users.count_documents({"rol_global": "Admin", "activo": True})
        if admins <= 1:
            raise APIError(400, "No se puede degradar al último Admin del sistema")

    await db.users.update_one({"_id": oid}, {"$set": {"rol_global": nuevo_rol}})
    await log_action(
        db, admin_id, "cambiar_rol_global",
        f"Cambió rol global de {target_id} a {nuevo_rol}", target_id,
    )
    return {"message": "Rol global actualizado exitosamente", "user_id": target_id, "rol_global": nuevo_rol}


async def ensure_seed_admin(db) -> None:
    """RN-08: garantiza un Admin inicial en la primera ejecución."""
    if await db.users.count_documents({"rol_global": "Admin"}) > 0:
        return
    doc = model.new_user_document(
        email="admin@kanbix.com",
        password_hash=hash_password("Admin123"),
        nombre_completo="Administrador Kanbix",
        rol_global="Admin",
        id_creador=None,
    )
    await db.users.insert_one(doc)
    print("[SEED] Admin inicial creado: admin@kanbix.com / Admin123 (cambiar en primer login)")
