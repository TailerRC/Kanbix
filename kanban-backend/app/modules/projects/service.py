"""Lógica de negocio del módulo de Proyectos y Equipos (Módulo 2)."""
from datetime import datetime, timezone

from bson import ObjectId

from app.modules.projects import model
from app.modules.projects.schemas import (
    AddMemberRequest,
    ProjectCreate,
    ProjectUpdate,
)
from app.shared.audit import log_action
from app.shared.authz import ensure_project_access, get_project_role
from app.shared.errors import APIError
from app.shared.utils.objectid import to_object_id


async def create_project(db, payload: ProjectCreate, creador_id: str) -> dict:
    if await db.projects.find_one({"name": payload.name}):  # RN-12
        raise APIError(400, "Ya existe un proyecto con ese nombre", "name")

    creador_oid = to_object_id(creador_id, "id_creador", "Usuario")

    initial_members = []
    if payload.members:
        for m in payload.members:
            try:
                member_oid = to_object_id(m.user_id, "user_id", "Usuario")
                initial_members.append({"user_id": member_oid, "rol": m.rol})
            except Exception:
                raise APIError(400, f"ID de usuario inválido: {m.user_id}", "members")

    doc = model.new_project_document(
        payload.name, payload.description, creador_oid, initial_members
    )
    result = await db.projects.insert_one(doc)

    await log_action(db, creador_id, "crear_proyecto",
                     f"Creó el proyecto {payload.name}", str(result.inserted_id))
    return {
        "id": str(result.inserted_id),
        "name": doc["name"],
        "description": doc["description"],
        "id_creador": creador_id,
        "created_at": doc["created_at"],
    }


async def list_projects(db, current_user: dict, page: int, limit: int) -> dict:
    limit = max(1, min(limit, 100))
    page = max(1, page)
    skip = (page - 1) * limit
    user_id = str(current_user.get("sub"))
    if current_user.get("role") == "Admin":
        query = {}
    else:
        user_oid = to_object_id(user_id, "id", "Usuario")
        query = {"members.user_id": user_oid}

    total = await db.projects.count_documents(query)
    cursor = db.projects.find(query).sort("created_at", -1).skip(skip).limit(limit)
    data = []
    async for p in cursor:
        data.append({
            "id": str(p["_id"]),
            "name": p.get("name") or p.get("nombre") or "Proyecto Sin Nombre",
            "description": p.get("description") or p.get("descripcion"),
            "role": get_project_role(p, user_id) or "Viewer",
            "member_count": len(p.get("members", [])),
            "created_at": p.get("created_at") or datetime.now(timezone.utc),
        })
    return {"total": total, "page": page, "limit": limit, "data": data}


async def get_project_detail(db, project_id: str, current_user: dict) -> dict:
    oid = to_object_id(project_id, "project_id", "Proyecto")
    project = await ensure_project_access(db, oid, current_user, "Viewer")

    member_ids = [m["user_id"] for m in project.get("members", [])]
    users = {}
    async for u in db.users.find({"_id": {"$in": member_ids}}):
        users[str(u["_id"])] = u

    members = []
    for m in project.get("members", []):
        u = users.get(str(m["user_id"]), {})
        members.append({
            "user_id": str(m["user_id"]),
            "nombre_completo": u.get("nombre_completo", ""),
            "email": u.get("email", ""),
            "rol": m["rol"],
        })

    return {
        "id": str(project["_id"]),
        "name": project.get("name") or project.get("nombre") or "Proyecto Sin Nombre",
        "description": project.get("description") or project.get("descripcion"),
        "id_creador": str(project.get("id_creador") or ""),
        "created_at": project.get("created_at") or datetime.now(timezone.utc),
        "members": members,
    }


async def update_project(db, project_id: str, payload: ProjectUpdate, current_user: dict) -> dict:
    oid = to_object_id(project_id, "project_id", "Proyecto")
    await ensure_project_access(db, oid, current_user, "Manager")

    updates = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    if "name" in updates:
        clash = await db.projects.find_one({"name": updates["name"], "_id": {"$ne": oid}})
        if clash:
            raise APIError(400, "Ya existe un proyecto con ese nombre", "name")

    updates["updated_at"] = datetime.now(timezone.utc)
    await db.projects.update_one({"_id": oid}, {"$set": updates})
    project = await db.projects.find_one({"_id": oid})
    return {
        "id": str(project["_id"]),
        "name": project["name"],
        "description": project.get("description"),
        "updated_at": project["updated_at"],
    }


async def delete_project(db, project_id: str, current_user: dict) -> dict:
    oid = to_object_id(project_id, "project_id", "Proyecto")
    project = await ensure_project_access(db, oid, current_user, "Manager")

    # RN-15: eliminación en cascada de todo lo contenido.
    board_ids = [b["_id"] async for b in db.boards.find({"project_id": oid}, {"_id": 1})]
    task_ids = [t["_id"] async for t in db.tasks.find({"project_id": oid}, {"_id": 1})]
    if task_ids:
        await db.comments.delete_many({"task_id": {"$in": task_ids}})
    await db.tasks.delete_many({"project_id": oid})
    if board_ids:
        await db.columns.delete_many({"board_id": {"$in": board_ids}})
    await db.boards.delete_many({"project_id": oid})
    await db.sprints.delete_many({"project_id": oid})
    await db.projects.delete_one({"_id": oid})

    await log_action(db, current_user.get("sub"), "eliminar_proyecto",
                     f"Eliminó el proyecto '{project.get('name')}'", project_id)
    return {"message": "Proyecto eliminado exitosamente"}


async def add_member(db, project_id: str, payload: AddMemberRequest, current_user: dict) -> dict:
    oid = to_object_id(project_id, "project_id", "Proyecto")
    project = await ensure_project_access(db, oid, current_user, "Manager")

    target_oid = to_object_id(payload.user_id, "user_id", "Usuario")
    target_user = await db.users.find_one({"_id": target_oid})
    if not target_user:
        raise APIError(404, "Usuario no encontrado", "user_id")

    if any(str(m["user_id"]) == payload.user_id for m in project.get("members", [])):
        raise APIError(400, "El usuario ya es miembro del proyecto", "user_id")

    await db.projects.update_one(
        {"_id": oid},
        {"$push": {"members": {"user_id": target_oid, "rol": payload.rol}}},
    )
    await log_action(db, current_user.get("sub"), "cambiar_rol_proyecto",
                     f"Agregó a {target_user.get('email')} como {payload.rol}", project_id)
    return {"message": "Miembro agregado exitosamente", "user_id": payload.user_id, "rol": payload.rol}


async def remove_member(db, project_id: str, target_user_id: str, current_user: dict) -> dict:
    oid = to_object_id(project_id, "project_id", "Proyecto")
    project = await ensure_project_access(db, oid, current_user, "Manager")

    members = project.get("members", [])
    target = next((m for m in members if str(m["user_id"]) == target_user_id), None)
    if target is None:
        raise APIError(404, "Miembro no encontrado en el proyecto", "user_id")

    # RN-11: el proyecto no puede quedar sin Manager.
    managers = [m for m in members if m["rol"] == "Manager"]
    if target["rol"] == "Manager" and len(managers) <= 1:
        raise APIError(400, "El proyecto debe conservar al menos un Manager")

    target_user = await db.users.find_one({"_id": to_object_id(target_user_id, "user_id", "Usuario")})
    target_email = target_user.get("email") if target_user else target_user_id

    await db.projects.update_one(
        {"_id": oid},
        {"$pull": {"members": {"user_id": to_object_id(target_user_id, "user_id", "Usuario")}}},
    )
    await log_action(db, current_user.get("sub"), "cambiar_rol_proyecto",
                     f"Eliminó al miembro {target_email}", project_id)
    return {"message": "Miembro eliminado del proyecto exitosamente"}
