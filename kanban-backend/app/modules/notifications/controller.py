"""Orquestación HTTP del módulo Notificaciones."""
from app.modules.notifications import service
from app.modules.notifications.schemas import PreferencesUpdate


async def list_(db, user_id, leida, tipo, pagina, limite):
    return await service.list_notifications(db, user_id, leida, tipo, pagina, limite)


async def mark_read(db, user_id, notif_id):
    return await service.mark_read(db, user_id, notif_id)


async def mark_all_read(db, user_id):
    return await service.mark_all_read(db, user_id)


async def delete(db, user_id, notif_id):
    return await service.delete_notification(db, user_id, notif_id)


async def update_preferences(db, user_id, payload: PreferencesUpdate):
    return await service.update_preferences(db, user_id, payload)
