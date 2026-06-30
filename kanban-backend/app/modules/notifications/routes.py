"""Endpoints del Módulo 5: REST (/api/v1) + WebSocket (/ws)."""
from fastapi import APIRouter, Depends, Query, WebSocket

from app.core.database import get_database
from app.core.security import decode_token
from app.dependencies.permissions import get_current_user_id
from app.modules.notifications import controller
from app.modules.notifications.schemas import PreferencesUpdate
from app.shared.utils.objectid import to_object_id
from app.websockets.manager import manager

router = APIRouter(prefix="/notifications", tags=["Notificaciones"])
ws_router = APIRouter()


@router.get("")
async def list_notifications(
    leida: bool | None = Query(None),
    tipo: str | None = Query(None),
    limite: int = Query(20, ge=1, le=100),
    pagina: int = Query(1, ge=1),
    user_id: str = Depends(get_current_user_id),
):
    return await controller.list_(get_database(), user_id, leida, tipo, pagina, limite)


@router.put("/read-all")
async def mark_all_read(user_id: str = Depends(get_current_user_id)):
    return await controller.mark_all_read(get_database(), user_id)


@router.put("/preferences")
async def update_preferences(payload: PreferencesUpdate, user_id: str = Depends(get_current_user_id)):
    return await controller.update_preferences(get_database(), user_id, payload)


@router.put("/{notif_id}/read")
async def mark_read(notif_id: str, user_id: str = Depends(get_current_user_id)):
    return await controller.mark_read(get_database(), user_id, notif_id)


@router.delete("/{notif_id}")
async def delete_notification(notif_id: str, user_id: str = Depends(get_current_user_id)):
    return await controller.delete(get_database(), user_id, notif_id)


@ws_router.websocket("/ws/notifications/{user_id}")
async def notifications_ws(websocket: WebSocket, user_id: str, token: str = Query(...)):
    """Canal WebSocket de notificaciones en tiempo real (ADR-004)."""
    payload = decode_token(token)
    if payload is None or payload.get("type") != "access":
        await websocket.close(code=4001)  # token inválido/expirado
        return
    if payload.get("sub") != user_id:
        await websocket.close(code=4004)  # user_id no coincide con el token
        return

    db = get_database()
    try:
        user = await db.users.find_one({"_id": to_object_id(user_id, "user_id", "Usuario")})
    except Exception:
        await websocket.close(code=4004)
        return
    if user is None:
        await websocket.close(code=4004)
        return
    if not user.get("activo", True):
        await websocket.close(code=4003)  # cuenta desactivada
        return

    await manager.connect(user_id, websocket)
    try:
        while True:
            # Mantiene viva la conexión; el cliente puede enviar pings/heartbeats.
            await websocket.receive_text()
    except Exception:
        pass
    finally:
        await manager.disconnect(user_id, websocket)
