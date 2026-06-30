"""Log de auditoría de acciones sensibles (RN-33).

Acciones: crear_usuario, cambiar_rol_global, crear_proyecto, eliminar_proyecto,
cambiar_estado_proyecto, cambiar_rol_proyecto.
"""
from datetime import datetime, timezone


async def log_action(
    db,
    user_id: str | None,
    accion: str,
    detalle: str = "",
    id_recurso: str | None = None,
) -> None:
    await db.audit_logs.insert_one(
        {
            "id_usuario": user_id,
            "accion": accion,
            "detalle": detalle,
            "id_recurso": id_recurso,
            "fecha": datetime.now(timezone.utc),
        }
    )
