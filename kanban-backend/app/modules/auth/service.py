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
LOCK_MINUTES = 15        # RN-04


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


def _to_utc(dt: datetime | None) -> datetime | None:
    """Garantiza que un datetime tenga tzinfo=UTC (tolerante a naive y aware)."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def _get_intentos(user: dict) -> int:
    """Lee intentos fallidos tolerando nombre de campo legacy (login_attempts)."""
    return user.get("intentos_fallidos") or user.get("login_attempts") or 0


def _is_bloqueado(user: dict) -> bool:
    """Detecta cuenta bloqueada tolerando campo legacy."""
    return bool(user.get("cuenta_bloqueada") or user.get("locked_until"))


def _get_bloqueado_hasta(user: dict) -> datetime | None:
    """Lee fecha de bloqueo tolerando campo legacy (locked_until)."""
    return _to_utc(user.get("bloqueado_hasta") or user.get("locked_until"))


def _password_expirada(user: dict, now: datetime) -> bool:
    """RN-31: verifica si la contraseña del usuario ha expirado."""
    expiracion = _to_utc(user.get("password_expiracion"))
    return bool(expiracion and expiracion <= now)


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
    """RN-04/RN-31: login con bloqueo por intentos y verificación de expiración."""
    user = await db.users.find_one({"email": email.lower()})
    if not user:
        raise APIError(401, "Credenciales inválidas")

    # RN-04: cuenta desactivada por Admin
    if not user.get("activo", True):
        raise APIError(403, "Cuenta desactivada — contactar al administrador")

    now = datetime.now(timezone.utc)

    # RN-04: verificar bloqueo (tolerante a campo legacy locked_until)
    if _is_bloqueado(user):
        bloqueado_hasta = _get_bloqueado_hasta(user)
        if bloqueado_hasta and bloqueado_hasta > now:
            raise APIError(403, "Cuenta bloqueada por intentos fallidos — contacta al administrador")
        # El bloqueo temporal expiró: rehabilitar automáticamente
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {
                "cuenta_bloqueada": False,
                "intentos_fallidos": 0,
                "bloqueado_hasta": None,
                # Limpiar también los campos legacy si existían
                "login_attempts": 0,
                "locked_until": None,
            }},
        )
        user["intentos_fallidos"] = 0

    if not verify_password(password, user["password_hash"]):
        intentos = _get_intentos(user) + 1
        update: dict = {
            "intentos_fallidos": intentos,
            "login_attempts": intentos,  # mantener campo legacy sincronizado
        }
        if intentos >= MAX_FAILED_ATTEMPTS:  # RN-04
            bloqueo = now + timedelta(minutes=LOCK_MINUTES)
            update["cuenta_bloqueada"] = True
            update["bloqueado_hasta"] = bloqueo
            update["locked_until"] = bloqueo  # mantener campo legacy sincronizado
        await db.users.update_one({"_id": user["_id"]}, {"$set": update})
        raise APIError(401, "Credenciales inválidas")

    # Login correcto: reset de intentos y registro de acceso
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "intentos_fallidos": 0,
            "login_attempts": 0,
            "cuenta_bloqueada": False,
            "bloqueado_hasta": None,
            "locked_until": None,
            "ultimo_acceso": now,
        }},
    )

    # RN-31: forzar cambio si es primer login o password expirada
    cambiar_password = bool(user.get("cambiar_password")) or _password_expirada(user, now)

    user_id = str(user["_id"])
    access = create_access_token(
        {"sub": user_id, "role": user.get("rol_global") or user.get("rol") or "Viewer", "email": user["email"]}
    )
    refresh = create_refresh_token({"sub": user_id})
    await db.refresh_tokens.insert_one(
        {
            "token": refresh,
            "user_id": user_id,
            "expires_at": now + timedelta(days=settings.jwt_refresh_token_expire_days),
            "created_at": now,
        }
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
    """GET /auth/me — RN-31: incluye verificación de expiración de password."""
    user = await db.users.find_one({"_id": to_object_id(user_id, "id", "Usuario")})
    if user is None:
        raise APIError(404, "Usuario no encontrado")

    now = datetime.now(timezone.utc)
    # RN-31: el flag puede estar activo O la password puede haber expirado
    cambiar_password = bool(user.get("cambiar_password")) or _password_expirada(user, now)

    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "nombre_completo": user["nombre_completo"],
        "rol_global": user.get("rol_global") or user.get("rol") or "Viewer",
        "cambiar_password": cambiar_password,
        "fecha_creacion": user["fecha_creacion"],
        "ultimo_acceso": user.get("ultimo_acceso"),
    }


async def change_password(db, user_id: str, current_password: str, new_password: str) -> dict:
    """RN-31: Cambiar contraseña, validar actual, y prevenir reutilización de las últimas 5 contraseñas."""
    oid = to_object_id(user_id, "id", "Usuario")
    user = await db.users.find_one({"_id": oid})
    if user is None:
        raise APIError(404, "Usuario no encontrado")

    if not verify_password(current_password, user["password_hash"]):
        raise APIError(400, "La contraseña actual es incorrecta", "current_password")

    # RN-31: no reutilizar las últimas 5 contraseñas
    ultimas = user.get("ultimas_passwords", [])
    for old_hash in ultimas:
        if verify_password(new_password, old_hash):
            raise APIError(400, "No puedes reutilizar ninguna de tus últimas 5 contraseñas", "new_password")

    # Hash y actualización de la lista
    new_hash = hash_password(new_password)
    # Agregar la nueva al principio y mantener las últimas 5
    ultimas = [new_hash] + ultimas
    ultimas = ultimas[:5]

    now = datetime.now(timezone.utc)
    await db.users.update_one(
        {"_id": oid},
        {"$set": {
            "password_hash": new_hash,
            "ultimas_passwords": ultimas,
            "cambiar_password": False,
            "password_expiracion": now + timedelta(days=90),
        }}
    )

    await log_action(db, user_id, "cambio_password_usuario", f"Usuario cambió su propia contraseña", user_id)
    return {"message": "Contraseña cambiada exitosamente"}


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
            "rol_global": u.get("rol_global") or u.get("rol") or "Viewer",
            "activo": u.get("activo", True),
            "bloqueado": _is_bloqueado(u),
            "fecha_creacion": u["fecha_creacion"],
            "ultimo_acceso": u.get("ultimo_acceso"),
        })
    return {"total": total, "page": page, "limit": limit, "data": data}


async def unlock_user(db, target_id: str) -> dict:
    """RN-32: solo Admin puede desbloquear una cuenta."""
    oid = to_object_id(target_id, "id", "Usuario")
    result = await db.users.update_one(
        {"_id": oid},
        {"$set": {
            "cuenta_bloqueada": False,
            "intentos_fallidos": 0,
            "bloqueado_hasta": None,
            "login_attempts": 0,
            "locked_until": None,
        }},
    )
    if result.matched_count == 0:
        raise APIError(404, "Usuario no encontrado")
    return {"message": "Cuenta desbloqueada exitosamente", "user_id": target_id}


async def change_global_role(db, admin_id: str, target_id: str, nuevo_rol: str) -> dict:
    """RN-07/RN-08: cambio de rol global con validaciones de seguridad."""
    if str(admin_id) == str(target_id):  # RN-07
        raise APIError(400, "No puedes cambiar tu propio rol")

    oid = to_object_id(target_id, "id", "Usuario")
    user = await db.users.find_one({"_id": oid})
    if user is None:
        raise APIError(404, "Usuario no encontrado")

    # RN-08: no dejar el sistema sin ningún Admin activo
    current_rol = user.get("rol_global") or user.get("rol") or "Viewer"
    if current_rol == "Admin" and nuevo_rol != "Admin":
        admins = await db.users.count_documents({"rol_global": "Admin", "activo": True})
        if admins <= 1:
            raise APIError(400, "No se puede degradar al último Admin del sistema")

    await db.users.update_one({"_id": oid}, {"$set": {"rol_global": nuevo_rol}})
    await log_action(
        db, admin_id, "cambiar_rol_global",
        f"Cambió rol global de {target_id} a {nuevo_rol}", target_id,
    )
    return {
        "message": "Rol global actualizado exitosamente",
        "user_id": target_id,
        "rol_global": nuevo_rol,
    }


async def ensure_seed_admin(db) -> None:
    """RN-08: garantiza un Admin inicial en la primera ejecución del sistema."""
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
