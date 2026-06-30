"""Modelo de la colección `projects` (Módulo 2).

Los miembros se almacenan embebidos en el documento del proyecto:
    members: [ { user_id: ObjectId, rol: "Manager"|"Developer"|"Viewer" } ]
"""
from datetime import datetime, timezone

from bson import ObjectId

COLLECTION = "projects"


def new_project_document(
    name: str, description: str | None, creador_id: ObjectId
) -> dict:
    now = datetime.now(timezone.utc)
    return {
        "name": name,
        "description": description,
        "color": "#2563eb",
        "estado": "Activo",
        "id_creador": creador_id,
        "members": [{"user_id": creador_id, "rol": "Manager"}],  # RN-11
        "created_at": now,
        "updated_at": now,
    }
