"""Pydantic models del módulo de Alertas y Notificaciones (Módulo 5)."""
from typing import Optional

from pydantic import BaseModel


class ChannelPrefs(BaseModel):
    tarea_asignada: Optional[bool] = None
    deadline_proximo: Optional[bool] = None
    tarea_movida: Optional[bool] = None
    mencion: Optional[bool] = None


class PreferencesUpdate(BaseModel):
    email: Optional[ChannelPrefs] = None
    websocket: Optional[ChannelPrefs] = None


DEFAULT_PREFERENCES = {
    "email": {"tarea_asignada": True, "deadline_proximo": True, "tarea_movida": False, "mencion": True},
    "websocket": {"tarea_asignada": True, "deadline_proximo": True, "tarea_movida": True, "mencion": True},
}
