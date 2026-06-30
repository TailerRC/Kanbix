"""Gestor de conexiones WebSocket para notificaciones en tiempo real (ADR-004).

Mantiene un registro de las conexiones activas por usuario y permite empujar
eventos a un usuario concreto. Infra compartida (no es un módulo de negocio).
"""
import asyncio

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self._connections: dict[str, list[WebSocket]] = {}
        self._lock = asyncio.Lock()

    async def connect(self, user_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        async with self._lock:
            self._connections.setdefault(user_id, []).append(websocket)

    async def disconnect(self, user_id: str, websocket: WebSocket) -> None:
        async with self._lock:
            conns = self._connections.get(user_id)
            if conns and websocket in conns:
                conns.remove(websocket)
            if conns is not None and not conns:
                self._connections.pop(user_id, None)

    def is_online(self, user_id: str) -> bool:
        return bool(self._connections.get(user_id))

    async def send_to_user(self, user_id: str, message: dict) -> bool:
        """Envía un mensaje JSON a todas las conexiones del usuario.

        Devuelve True si se entregó a al menos una conexión.
        """
        conns = list(self._connections.get(user_id, []))
        delivered = False
        for ws in conns:
            try:
                await ws.send_json(message)
                delivered = True
            except Exception:
                await self.disconnect(user_id, ws)
        return delivered


manager = ConnectionManager()
