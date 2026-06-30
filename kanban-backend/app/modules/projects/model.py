"""Modelo de la colección `projects` (Módulo 2).

Los miembros se almacenan embebidos en el documento del proyecto:
    members: [ { user_id: ObjectId, rol: "Manager"|"Developer"|"Viewer" } ]
"""
from datetime import datetime, timezone

from bson import ObjectId

COLLECTION = "projects"


def new_project_document(
    name: str,
    description: str | None,
    creador_id: ObjectId,
    initial_members: list | None = None,
) -> dict:
    now = datetime.now(timezone.utc)
    members_list = [{"user_id": creador_id, "rol": "Manager"}]
    if initial_members:
        creator_str = str(creador_id)
        for m in initial_members:
            if str(m["user_id"]) != creator_str:
                members_list.append({"user_id": m["user_id"], "rol": m["rol"]})
    return {
        "name": name,
        "description": description,
        "color": "#2563eb",
        "estado": "Activo",
        "id_creador": creador_id,
        "members": members_list,  # RN-11
        "created_at": now,
        "updated_at": now,
    }
