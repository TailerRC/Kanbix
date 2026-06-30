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
from app.modules.auth.schemas import RegisterRequest, AdminUpdateUserRequest
from app.shared.audit import log_action
from app.shared.email import send_email_via_resend
from app.shared.errors import APIError
from app.shared.utils.objectid import to_object_id
import asyncio

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

    # Correo de bienvenida
    email_html = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #4f46e5; margin-top: 0;">¡Bienvenido a Kanbix, {payload.nombre_completo}!</h2>
        <p>Se ha creado tu cuenta en el sistema de gestión ágil <strong>Kanbix</strong>.</p>
        <p>A continuación se detallan tus credenciales de acceso:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 120px;">Email:</td>
                <td style="padding: 8px 0; color: #1f2937;">{payload.email}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: bold;">Contraseña:</td>
                <td style="padding: 8px 0; color: #1f2937;"><code>{payload.password}</code></td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: bold;">Rol Global:</td>
                <td style="padding: 8px 0; color: #1f2937;">{payload.rol_global}</td>
            </tr>
        </table>
        <p style="background: #fef3c7; color: #92400e; padding: 10px; border-radius: 6px; font-size: 14px;">
            ⚠️ <strong>Nota:</strong> Deberás cambiar tu contraseña al iniciar sesión por primera vez (RN-31).
        </p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="font-size: 12px; color: #6b7280; text-align: center;">El Equipo de Kanbix</p>
    </div>
    """
    asyncio.create_task(
        send_email_via_resend(
            to_email=payload.email,
            subject="Bienvenido a Kanbix - Tus credenciales",
            html_content=email_html
        )
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
        f"Cambió rol global de {user.get('email')} a {nuevo_rol}", target_id,
    )
    return {
        "message": "Rol global actualizado exitosamente",
        "user_id": target_id,
        "rol_global": nuevo_rol,
    }


async def update_user_by_admin(db, admin_id: str, target_id: str, payload: AdminUpdateUserRequest) -> dict:
    """Actualiza la información de un usuario por parte de un administrador con validaciones (RN-02, RN-07, RN-08, RN-31, RN-33)."""
    target_oid = to_object_id(target_id, "id", "Usuario")
    user = await db.users.find_one({"_id": target_oid})
    if user is None:
        raise APIError(404, "Usuario no encontrado")

    updates = {}
    audit_changes = []

    # 1. Validar y actualizar nombre completo
    if payload.nombre_completo is not None:
        if payload.nombre_completo != user.get("nombre_completo"):
            updates["nombre_completo"] = payload.nombre_completo
            audit_changes.append(f"nombre a '{payload.nombre_completo}'")

    # 2. Validar y actualizar email (RN-02)
    if payload.email is not None:
        new_email = payload.email.lower()
        if new_email != user.get("email"):
            existing = await db.users.find_one({"email": new_email})
            if existing:
                raise APIError(400, "El email ya está registrado", "email")
            updates["email"] = new_email
            audit_changes.append(f"email a '{new_email}'")

    # 3. Validar y actualizar estado activo (RN-08)
    if payload.activo is not None:
        new_activo = payload.activo
        if new_activo != user.get("activo", True):
            if not new_activo:
                # Si se desactiva, verificar que no sea el mismo admin
                if str(admin_id) == str(target_id):
                    raise APIError(400, "No puedes desactivarte a ti mismo")
                
                # Verificar si es el último Admin activo del sistema
                current_rol = user.get("rol_global") or user.get("rol") or "Viewer"
                if current_rol == "Admin":
                    admins = await db.users.count_documents({"rol_global": "Admin", "activo": True})
                    if admins <= 1:
                        raise APIError(400, "No se puede desactivar al último Admin activo del sistema")
            
            updates["activo"] = new_activo
            state_str = "activo" if new_activo else "inactivo"
            audit_changes.append(f"estado a '{state_str}'")

    # 4. Validar y actualizar contraseña (RN-31)
    if payload.password is not None:
        new_hash = hash_password(payload.password)
        updates["password_hash"] = new_hash
        updates["cambiar_password"] = True
        updates["intentos_fallidos"] = 0
        updates["cuenta_bloqueada"] = False
        updates["bloqueado_hasta"] = None
        updates["login_attempts"] = 0
        updates["locked_until"] = None
        
        # Opcionalmente actualizar la lista de últimas contraseñas si el admin lo cambia
        ultimas = user.get("ultimas_passwords", [])
        ultimas = [new_hash] + ultimas
        updates["ultimas_passwords"] = ultimas[:5]
        
        audit_changes.append("contraseña cambiada")

    # 5. Validar y actualizar rol global (RN-07, RN-08)
    if payload.rol_global is not None:
        nuevo_rol = payload.rol_global
        current_rol = user.get("rol_global") or user.get("rol") or "Viewer"
        if nuevo_rol != current_rol:
            if str(admin_id) == str(target_id):
                raise APIError(400, "No puedes cambiar tu propio rol")
            
            # RN-08: no degradar al último Admin activo
            if current_rol == "Admin" and nuevo_rol != "Admin":
                admins = await db.users.count_documents({"rol_global": "Admin", "activo": True})
                if admins <= 1:
                    raise APIError(400, "No se puede degradar al último Admin del sistema")

            updates["rol_global"] = nuevo_rol
            audit_changes.append(f"rol a '{nuevo_rol}'")

    # Si hay actualizaciones, aplicarlas
    if updates:
        await db.users.update_one({"_id": target_oid}, {"$set": updates})
        
        # Loguear acción de auditoría
        changes_desc = ", ".join(audit_changes)
        await log_action(
            db, admin_id, "actualizar_usuario_admin",
            f"Admin actualizó usuario {user.get('email')} -> {changes_desc}",
            str(target_oid)
        )
        
        # Mezclar los cambios en el objeto original para retornar
        for k, v in updates.items():
            user[k] = v

    # Retornar el usuario actualizado en el formato esperado
    return {
        "id": str(target_oid),
        "email": user["email"],
        "nombre_completo": user["nombre_completo"],
        "rol_global": user.get("rol_global") or user.get("rol") or "Viewer",
        "activo": user.get("activo", True),
        "bloqueado": _is_bloqueado(user),
        "fecha_creacion": user["fecha_creacion"],
        "ultimo_acceso": user.get("ultimo_acceso"),
    }


async def list_audit_logs(db, page: int, limit: int) -> dict:
    """Obtiene la bitácora de auditoría de forma paginada, ordenada por fecha descendente (RN-33)

    y resolviendo nombres/correos de forma masiva (batch query).
    """
    from bson import ObjectId

    limit = max(1, min(limit, 100))
    page = max(1, page)
    skip = (page - 1) * limit
    total = await db.audit_logs.count_documents({})
    cursor = db.audit_logs.find({}).sort("fecha", -1).skip(skip).limit(limit)
    data = []

    # 1. Cargar lista básica
    async for log in cursor:
        data.append({
            "id": str(log["_id"]),
            "id_usuario": log.get("id_usuario"),
            "accion": log.get("accion"),
            "detalle": log.get("detalle", ""),
            "id_recurso": log.get("id_recurso"),
            "fecha": log.get("fecha"),
        })

    # 2. Recolectar IDs únicos
    user_ids = set()
    project_ids = set()

    for log in data:
        uid = log.get("id_usuario")
        if uid and uid != "system":
            user_ids.add(uid)

        rid = log.get("id_recurso")
        if rid:
            action = (log.get("accion") or "").lower()
            if "proyecto" in action:
                project_ids.add(rid)
            else:
                user_ids.add(rid)

    # 3. Validar ObjectIds
    user_oids = []
    for uid in user_ids:
        try:
            user_oids.append(ObjectId(uid))
        except Exception:
            pass

    project_oids = []
    for pid in project_ids:
        try:
            project_oids.append(ObjectId(pid))
        except Exception:
            pass

    # 4. Realizar consultas en batch
    user_map = {}
    if user_oids:
        users = await db.users.find(
            {"_id": {"$in": user_oids}},
            {"email": 1, "nombre_completo": 1}
        ).to_list(length=len(user_oids))
        for u in users:
            user_map[str(u["_id"])] = {
                "email": u.get("email"),
                "nombre_completo": u.get("nombre_completo")
            }

    project_map = {}
    if project_oids:
        projects = await db.projects.find(
            {"_id": {"$in": project_oids}},
            {"name": 1}
        ).to_list(length=len(project_oids))
        for p in projects:
            project_map[str(p["_id"])] = {
                "name": p.get("name")
            }

    # 5. Mapear datos enriquecidos
    for log in data:
        uid = log.get("id_usuario")
        rid = log.get("id_recurso")
        action = (log.get("accion") or "").lower()

        # Ejecutor
        if uid == "system":
            log["usuario_ejecutor_email"] = None
            log["usuario_ejecutor_nombre"] = "Sistema"
        elif uid and uid in user_map:
            log["usuario_ejecutor_email"] = user_map[uid]["email"]
            log["usuario_ejecutor_nombre"] = user_map[uid]["nombre_completo"]
        else:
            log["usuario_ejecutor_email"] = None
            log["usuario_ejecutor_nombre"] = None

        # Recurso afectado
        log["recurso_afectado_nombre"] = None
        log["recurso_afectado_tipo"] = None

        if rid:
            if "proyecto" in action:
                if rid in project_map:
                    log["recurso_afectado_nombre"] = project_map[rid]["name"]
                    log["recurso_afectado_tipo"] = "proyecto"
            else:
                if rid in user_map:
                    log["recurso_afectado_nombre"] = user_map[rid]["email"]
                    log["recurso_afectado_tipo"] = "usuario"
                # Fallback cruzado
                elif rid in project_map:
                    log["recurso_afectado_nombre"] = project_map[rid]["name"]
                    log["recurso_afectado_tipo"] = "proyecto"

    return {"total": total, "page": page, "limit": limit, "data": data}


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
