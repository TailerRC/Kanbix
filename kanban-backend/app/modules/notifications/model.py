"""Modelos del Módulo 5: colecciones `notifications` y `notification_preferences`.

Documento de notificación:
    { id_usuario: str, tipo: str, mensaje: str, datos: dict,
      leida: bool, fecha: datetime, fecha_lectura: datetime|None }

Documento de preferencias (1 por usuario):
    { user_id: str, email: {...}, websocket: {...} }
"""
NOTIFICATIONS = "notifications"
PREFERENCES = "notification_preferences"

TIPOS_VALIDOS = {"tarea_asignada", "deadline_proximo", "tarea_movida", "tarea_completada", "mencion"}
