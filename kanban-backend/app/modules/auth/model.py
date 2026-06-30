"""Modelo de la colección `users` (Módulo 1).

MongoDB es schemaless: este módulo documenta y construye la forma del documento.
Campos derivados del modelo de dominio (entidad USUARIO).
"""
from datetime import datetime, timedelta, timezone

COLLECTION = "users"
REFRESH_COLLECTION = "refresh_tokens"

PASSWORD_VALID_DAYS = 90  # RN-31


def new_user_document(
    email: str,
    password_hash: str,
    nombre_completo: str,
    rol_global: str,
    id_creador: str | None = None,
) -> dict:
    now = datetime.now(timezone.utc)
    return {
        "email": email.lower(),
        "nombre_completo": nombre_completo,
        "password_hash": password_hash,
        "rol_global": rol_global,
        "activo": True,
        "cuenta_bloqueada": False,
        "intentos_fallidos": 0,
        "bloqueado_hasta": None,
        "cambiar_password": True,  # RN-31: cambiar en primer ingreso
        "password_expiracion": now + timedelta(days=PASSWORD_VALID_DAYS),
        "ultimas_passwords": [password_hash],
        "ultimo_acceso": None,
        "fecha_creacion": now,
        "id_creador": id_creador,
    }
