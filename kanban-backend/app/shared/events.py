"""Emisión de notificaciones (persistencia + tiempo real) — RN-29.

Capa compartida que desacopla a los módulos productores de eventos (boards,
planning) del módulo notifications. Persiste la notificación y la empuja por
WebSocket si el usuario está conectado; si no, queda como pendiente (el email
se gestiona según preferencias).
"""
from datetime import datetime, timezone

from app.websockets.manager import manager

# Tipos válidos (contrato Módulo 5).
TAREA_ASIGNADA = "tarea_asignada"
DEADLINE_PROXIMO = "deadline_proximo"
TAREA_MOVIDA = "tarea_movida"
MENCION = "mencion"


async def notify(db, user_id: str | None, tipo: str, mensaje: str, datos: dict) -> None:
    """Crea la notificación persistente y la entrega en tiempo real."""
    if not user_id:
        return
    now = datetime.now(timezone.utc)
    await db.notifications.insert_one({
        "id_usuario": user_id,
        "tipo": tipo,
        "mensaje": mensaje,
        "datos": datos,
        "leida": False,
        "fecha": now,
    })
    await manager.send_to_user(user_id, {
        "evento": tipo,
        "timestamp": now.isoformat(),
        "datos": datos,
    })
