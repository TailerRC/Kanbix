"""Emisión de notificaciones (persistencia + tiempo real) — RN-29.

Capa compartida que desacopla a los módulos productores de eventos (boards,
planning) del módulo notifications. Persiste la notificación y la empuja por
WebSocket si el usuario está conectado; si no, queda como pendiente (el email
se gestiona según preferencias).
"""
import asyncio
from datetime import datetime, timezone
from bson import ObjectId

from app.websockets.manager import manager
from app.shared.email import send_email_via_resend

# Tipos válidos (contrato Módulo 5).
TAREA_ASIGNADA = "tarea_asignada"
DEADLINE_PROXIMO = "deadline_proximo"
TAREA_MOVIDA = "tarea_movida"
TAREA_COMPLETADA = "tarea_completada"
MENCION = "mencion"


def get_notification_email_content(tipo: str, mensaje: str, datos: dict) -> tuple[str, str]:
    """Genera el asunto y el cuerpo HTML del correo según el tipo de notificación."""
    subject = "Notificación de Kanbix"

    if tipo == "tarea_asignada":
        subject = f"Te han asignado una tarea en Kanbix: {datos.get('titulo', '')}"
        content = f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="color: #4f46e5; margin-top: 0;">Nueva tarea asignada</h3>
            <p style="font-size: 16px; color: #111827; font-weight: bold; margin: 8px 0;">{datos.get('titulo')}</p>
            <p style="margin: 6px 0;"><strong>Proyecto:</strong> {datos.get('proyecto', '—')}</p>
            <p style="margin: 6px 0;"><strong>Asignado por:</strong> {datos.get('asignado_por', '—')}</p>
            <p style="margin: 6px 0;"><strong>Fecha límite:</strong> {datos.get('deadline') or 'Sin fecha límite'}</p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="font-size: 12px; color: #6b7280; text-align: center; margin: 0;">Kanbix — Gestión Ágil</p>
        </div>
        """
    elif tipo == "deadline_proximo":
        subject = f"Tu tarea vence pronto: {datos.get('titulo', '')}"
        content = f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="color: #dc2626; margin-top: 0;">Próximo vencimiento de tarea</h3>
            <p style="font-size: 16px; color: #111827; font-weight: bold; margin: 8px 0;">{datos.get('titulo')}</p>
            <p style="margin: 6px 0;"><strong>Proyecto:</strong> {datos.get('proyecto', '—')}</p>
            <p style="margin: 6px 0;"><strong>Vence en:</strong> {datos.get('horas_restantes', 24)} horas</p>
            <p style="margin: 6px 0;"><strong>Fecha límite:</strong> {datos.get('deadline', '—')}</p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="font-size: 12px; color: #6b7280; text-align: center; margin: 0;">Kanbix — Gestión Ágil</p>
        </div>
        """
    elif tipo == "mencion":
        subject = f"Te han mencionado en Kanbix: {datos.get('titulo', '')}"
        content = f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="color: #4f46e5; margin-top: 0;">Te han mencionado en un comentario</h3>
            <p style="margin: 6px 0;"><strong>Mencionado por:</strong> {datos.get('mencionado_por', '—')}</p>
            <p style="margin: 6px 0;"><strong>Tarea:</strong> {datos.get('titulo', '—')}</p>
            <blockquote style="border-left: 4px solid #4f46e5; padding-left: 12px; margin: 16px 0; color: #4b5563; font-style: italic;">
                "{datos.get('comentario', '')}"
            </blockquote>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="font-size: 12px; color: #6b7280; text-align: center; margin: 0;">Kanbix — Gestión Ágil</p>
        </div>
        """
    elif tipo == "tarea_movida":
        subject = f"Tarea movida: {datos.get('titulo', '')}"
        content = f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="color: #0d9488; margin-top: 0;">Tarea movida de columna</h3>
            <p style="font-size: 16px; color: #111827; font-weight: bold; margin: 8px 0;">{datos.get('titulo')}</p>
            <p style="margin: 6px 0;"><strong>Movido por:</strong> {datos.get('movido_por', '—')}</p>
            <p style="margin: 6px 0;"><strong>Columna anterior:</strong> <span style="text-decoration: line-through; color: #9ca3af;">{datos.get('columna_anterior', '—')}</span></p>
            <p style="margin: 6px 0;"><strong>Columna nueva:</strong> <span style="color: #0d9488; font-weight: bold;">{datos.get('columna_nueva', '—')}</span></p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="font-size: 12px; color: #6b7280; text-align: center; margin: 0;">Kanbix — Gestión Ágil</p>
        </div>
        """
    else:
        content = f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="color: #4f46e5; margin-top: 0;">Notificación del sistema</h3>
            <p style="line-height: 1.5;">{mensaje}</p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="font-size: 12px; color: #6b7280; text-align: center; margin: 0;">Kanbix — Gestión Ágil</p>
        </div>
        """
    return subject, content


async def notify(db, user_id: str | None, tipo: str, mensaje: str, datos: dict) -> None:
    """Crea la notificación persistente, la entrega en tiempo real y gestiona notificaciones por email."""
    if not user_id:
        return
    now = datetime.now(timezone.utc)

    # 1. Registrar en la base de datos
    await db.notifications.insert_one({
        "id_usuario": user_id,
        "tipo": tipo,
        "mensaje": mensaje,
        "datos": datos,
        "leida": False,
        "fecha": now,
    })

    # 2. Enviar por websocket en tiempo real
    await manager.send_to_user(user_id, {
        "evento": tipo,
        "timestamp": now.isoformat(),
        "datos": datos,
    })

    # 3. Procesar notificaciones por email según preferencias (RN-29)
    try:
        # Tipos por defecto para email: tarea_asignada=True, deadline_proximo=True, tarea_movida=False, mencion=True
        default_map = {
            "tarea_asignada": True,
            "deadline_proximo": True,
            "tarea_movida": False,
            "mencion": True
        }
        pref_default = default_map.get(tipo, False)

        prefs = await db.notification_preferences.find_one({"user_id": user_id})
        if prefs and "email" in prefs and tipo in prefs["email"]:
            should_send_email = bool(prefs["email"][tipo])
        else:
            should_send_email = pref_default

        if should_send_email:
            # Obtener email del usuario destinatario
            user = await db.users.find_one({"_id": ObjectId(user_id)})
            if user and user.get("email"):
                subj, body = get_notification_email_content(tipo, mensaje, datos)
                asyncio.create_task(
                    send_email_via_resend(
                        to_email=user["email"],
                        subject=subj,
                        html_content=body
                    )
                )
    except Exception as e:
        # No bloquear el flujo principal si el envío del correo falla
        import logging
        logging.getLogger(__name__).error(f"Fallo silencioso en notify (email routing): {e}")
