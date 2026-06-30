"""Módulo de envío de correos transaccionales vía Resend (RN-29).

Soporta simulación local si no se configura la API Key.
En modo Sandbox (usando onboarding@resend.dev), redirige la entrega al correo verificado de desarrollo.
"""
import asyncio
import logging
import resend

from app.core.config import settings

logger = logging.getLogger(__name__)


async def send_email_via_resend(to_email: str, subject: str, html_content: str) -> bool:
    """Envía un correo electrónico mediante el SDK de Resend.

    Si no se encuentra configurada la variable RESEND_API_KEY, imprime el
    contenido del correo en la terminal para desarrollo/testing sin dependencias externas.
    """
    api_key = settings.resend_api_key
    from_email = settings.resend_from_email or "onboarding@resend.dev"

    if not api_key:
        print("\n" + "=" * 60)
        print(" SIMULACIÓN DE ENVÍO DE EMAIL (SIN RESEND KEY) ")
        print(f"Remitente:   {from_email}")
        print(f"Destinatario: {to_email}")
        print(f"Asunto:       {subject}")
        print("-" * 60)
        print(html_content)
        print("=" * 60 + "\n")
        return True

    try:
        resend.api_key = api_key
        target_email = to_email

        # Si usamos la dirección por defecto de onboarding en modo sandbox
        if from_email == "onboarding@resend.dev":
            target_email = "tailer56rodrigo@gmail.com"
            logger.info(
                f"[Resend Sandbox] Redirigiendo correo de '{to_email}' a '{target_email}'"
            )
            html_content = (
                f"<div style='background:#f3f4f6;padding:8px;border:1px solid #e5e7eb;margin-bottom:16px;font-size:12px;color:#4b5563;'>"
                f"<strong>Modo Sandbox de Resend:</strong> Este correo estaba destinado originalmente a: <code>{to_email}</code>"
                f"</div>"
                + html_content
            )

        # Dado que el SDK oficial de resend en Python realiza llamadas HTTP síncronas,
        # lo corremos en el pool de ejecutores de asyncio para no bloquear el loop principal de FastAPI.
        def _execute_send():
            return resend.Emails.send(
                {
                    "from": from_email,
                    "to": target_email,
                    "subject": subject,
                    "html": html_content,
                }
            )

        loop = asyncio.get_running_loop()
        response = await loop.run_in_executor(None, _execute_send)
        logger.info(f"Email enviado vía Resend con éxito (ID: {response.get('id')})")
        return True

    except Exception as e:
        logger.error(f"Error al enviar correo vía Resend a {to_email}: {e}")
        # Imprimir en consola en caso de fallo para ayudar al diagnóstico
        print(f"\n[FALLO EMAIL] No se pudo enviar a {to_email} a través de Resend. Error: {e}\n")
        return False
