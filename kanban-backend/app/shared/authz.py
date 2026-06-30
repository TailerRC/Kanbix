"""Autorización a nivel de proyecto (rol por proyecto + bypass de Admin global).

Helpers reutilizables (capa shared) que consultan directamente las colecciones
de Mongo. NO son un módulo de negocio: evitan que un módulo importe a otro
(prohibido por la arquitectura), centralizando la verificación de membresía.

Jerarquía de roles por proyecto (RN-06): Manager > Developer > Viewer.
Un Admin global puede acceder a cualquier proyecto (RN-30, nota matriz #2).
"""
from bson import ObjectId

from app.shared.errors import APIError

PROJECT_ROLE_RANK = {"Viewer": 1, "Developer": 2, "Manager": 3}


def get_project_role(project: dict, user_id: str) -> str | None:
    """Devuelve el rol por proyecto del usuario, o None si no es miembro."""
    for member in project.get("members", []):
        if str(member.get("user_id")) == user_id:
            return member.get("rol")
    return None


async def load_project_or_404(db, project_id: ObjectId) -> dict:
    project = await db.projects.find_one({"_id": project_id})
    if project is None:
        raise APIError(404, "Proyecto no encontrado", "project_id")
    return project


async def ensure_project_access(
    db, project_id: ObjectId, current_user: dict, minimum_role: str = "Viewer"
) -> dict:
    """Valida que el usuario pueda operar en el proyecto con el rol mínimo dado.

    - Admin global: acceso total a cualquier proyecto.
    - Resto: debe ser miembro con rol por proyecto >= minimum_role.
    Devuelve el documento del proyecto.
    """
    project = await load_project_or_404(db, project_id)

    if current_user.get("role") == "Admin":
        return project

    user_id = str(current_user.get("sub"))
    role = get_project_role(project, user_id)
    if role is None:
        # No revelar existencia a quien no es miembro (matriz: usar 404/403).
        raise APIError(403, "Usuario sin permisos para ver este proyecto")

    if PROJECT_ROLE_RANK.get(role, 0) < PROJECT_ROLE_RANK[minimum_role]:
        raise APIError(403, f"Requiere rol {minimum_role} o superior en el proyecto")

    return project
