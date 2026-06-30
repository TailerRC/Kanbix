"""Modelo de las colecciones del Módulo 2 (Proyectos, Invitaciones y Sprints).

Los miembros se almacenan embebidos en el documento del proyecto:
    members: [ { user_id: ObjectId, rol: "Manager"|"Developer"|"Viewer" } ]
"""
from datetime import datetime, timezone, timedelta
from bson import ObjectId

COLLECTION_PROJECTS = "projects"
COLLECTION_INVITATIONS = "invitations"
COLLECTION_SPRINTS = "sprints"


def new_project_document(
    nombre: str,
    descripcion: str | None,
    creador_id: ObjectId,
    fecha_inicio: str,
    fecha_fin: str | None,
    color: str | None,
) -> dict:
    now = datetime.now(timezone.utc)
    
    # Genera automáticamente las iniciales del proyecto (RF27)
    words = [w for w in nombre.strip().split() if w]
    if len(words) >= 2:
        iniciales = (words[0][0] + words[1][0]).upper()
    elif len(words) == 1:
        iniciales = words[0][:2].upper()
    else:
        iniciales = "PR"

    return {
        "nombre": nombre,
        "descripcion": descripcion,
        "color": color or "#1E3A5F",
        "iniciales": iniciales,
        "estado": "Activo",
        "fecha_inicio": fecha_inicio,
        "fecha_fin": fecha_fin,
        "id_creador": creador_id,
        "members": [{"user_id": creador_id, "rol": "Manager"}],  # Se mapeará externamente a scrum_master
        "created_at": now,
        "updated_at": now,
    }


def new_invitation_document(
    email: str, rol_db: str, proyecto_id: ObjectId
) -> dict:
    now = datetime.now(timezone.utc)
    expira_en = now + timedelta(days=7)  # RF22: La invitación expira en 7 días
    return {
        "email": email.strip().lower(),
        "rol": rol_db,
        "estado": "pendiente",
        "id_proyecto": proyecto_id,
        "expira_en": expira_en,
        "created_at": now,
    }


def new_sprint_document(
    nombre: str, fecha_inicio: str, fecha_fin: str, proyecto_id: ObjectId
) -> dict:
    now = datetime.now(timezone.utc)
    return {
        "nombre": nombre,
        "fecha_inicio": fecha_inicio,
        "fecha_fin": fecha_fin,
        "estado": "Activo",
        "id_proyecto": proyecto_id,
        "created_at": now,
        "updated_at": now,
    }
