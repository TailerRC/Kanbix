"""Lógica de negocio del Módulo 5: Alertas y Notificaciones."""
from datetime import datetime, timezone

from app.modules.notifications import model
from app.modules.notifications.schemas import DEFAULT_PREFERENCES, PreferencesUpdate
from app.shared.errors import APIError
from app.shared.utils.objectid import to_object_id


async def list_notifications(
    db, user_id: str, leida: bool | None, tipo: str | None, pagina: int, limite: int
) -> dict:
    limite = max(1, min(limite, 100))
    pagina = max(1, pagina)
    skip = (pagina - 1) * limite

    query: dict = {"id_usuario": user_id}
    if leida is not None:
        query["leida"] = leida
    if tipo is not None:
        if tipo not in model.TIPOS_VALIDOS:
            raise APIError(422, "Tipo de notificación inválido", "tipo")
        query["tipo"] = tipo

    total = await db.notifications.count_documents(query)
    cursor = db.notifications.find(query).sort("fecha", -1).skip(skip).limit(limite)
    notificaciones = []
    async for n in cursor:
        notificaciones.append({
            "id": str(n["_id"]),
            "tipo": n["tipo"],
            "mensaje": n["mensaje"],
            "leida": n.get("leida", False),
            "fecha": n["fecha"],
            "datos": n.get("datos", {}),
        })
    return {"total": total, "pagina": pagina, "limite": limite, "notificaciones": notificaciones}


async def _owned_notification(db, user_id: str, notif_id: str) -> dict:
    notif = await db.notifications.find_one({"_id": to_object_id(notif_id, "id", "Notificación")})
    if notif is None:
        raise APIError(404, "Notificación no encontrada", "id")
    if notif["id_usuario"] != user_id:
        raise APIError(403, "No tienes permiso para acceder a esta notificación")
    return notif


async def mark_read(db, user_id: str, notif_id: str) -> dict:
    notif = await _owned_notification(db, user_id, notif_id)
    now = datetime.now(timezone.utc)
    await db.notifications.update_one(
        {"_id": notif["_id"]}, {"$set": {"leida": True, "fecha_lectura": now}}
    )
    return {
        "mensaje": "Notificación marcada como leída",
        "notificacion_id": notif_id,
        "leida": True,
        "fecha_lectura": now,
    }


async def mark_all_read(db, user_id: str) -> dict:
    now = datetime.now(timezone.utc)
    result = await db.notifications.update_many(
        {"id_usuario": user_id, "leida": False},
        {"$set": {"leida": True, "fecha_lectura": now}},
    )
    return {
        "mensaje": "Todas las notificaciones marcadas como leídas",
        "notificaciones_actualizadas": result.modified_count,
    }


async def delete_notification(db, user_id: str, notif_id: str) -> dict:
    notif = await _owned_notification(db, user_id, notif_id)
    await db.notifications.delete_one({"_id": notif["_id"]})
    return {"mensaje": "Notificación eliminada exitosamente"}


async def update_preferences(db, user_id: str, payload: PreferencesUpdate) -> dict:
    existing = await db.notification_preferences.find_one({"user_id": user_id})
    prefs = {
        "email": dict(DEFAULT_PREFERENCES["email"]),
        "websocket": dict(DEFAULT_PREFERENCES["websocket"]),
    }
    if existing:
        prefs["email"].update(existing.get("email", {}))
        prefs["websocket"].update(existing.get("websocket", {}))

    data = payload.model_dump(exclude_unset=True)
    for canal in ("email", "websocket"):
        if data.get(canal):
            for tipo, value in data[canal].items():
                if value is not None:
                    prefs[canal][tipo] = value

    await db.notification_preferences.update_one(
        {"user_id": user_id}, {"$set": {"user_id": user_id, **prefs}}, upsert=True
    )
    return {"mensaje": "Preferencias actualizadas exitosamente", "preferencias": prefs}
