"""Lógica de negocio del Módulo 4: Planificación y Asignaciones.

Opera sobre la colección `tasks` (acceso a datos, sin importar el módulo boards).
"""
from datetime import datetime, timezone

from bson import ObjectId

from app.modules.planning import model
from app.modules.planning.schemas import (
    DependencyCreate,
    PlanningUpdate,
    SubtaskCreate,
)
from app.shared.authz import ensure_project_access
from app.shared.errors import APIError
from app.shared.utils.objectid import to_object_id


async def _get_task(db, task_id: str) -> dict:
    task = await db.tasks.find_one({"_id": to_object_id(task_id, "task_id", "Tarea")})
    if task is None:
        raise APIError(404, "Tarea no encontrada", "task_id")
    return task


async def set_planning(db, task_id: str, payload: PlanningUpdate, current_user: dict) -> dict:
    task = await _get_task(db, task_id)
    await ensure_project_access(db, task["project_id"], current_user, "Manager")

    updates = payload.model_dump(exclude_unset=True)
    updates["updated_at"] = datetime.now(timezone.utc)
    await db.tasks.update_one({"_id": task["_id"]}, {"$set": updates})
    task = await db.tasks.find_one({"_id": task["_id"]})
    return {
        "id": str(task["_id"]),
        "due_date": task.get("due_date"),
        "story_points": task.get("story_points"),
        "status": task.get("status"),
    }


async def add_subtask(db, task_id: str, payload: SubtaskCreate, current_user: dict) -> dict:
    task = await _get_task(db, task_id)
    await ensure_project_access(db, task["project_id"], current_user, "Developer")

    subtask = model.new_subtask(payload.title)
    await db.tasks.update_one({"_id": task["_id"]}, {"$push": {"subtasks": subtask}})
    return {
        "subtask_id": str(subtask["subtask_id"]),
        "parent_id": task_id,
        "title": subtask["title"],
        "completed": False,
    }


async def toggle_subtask(db, task_id: str, subtask_id: str, current_user: dict) -> dict:
    task = await _get_task(db, task_id)
    await ensure_project_access(db, task["project_id"], current_user, "Developer")

    sub_oid = to_object_id(subtask_id, "subtask_id", "Subtarea")
    subtask = next((s for s in task.get("subtasks", []) if s["subtask_id"] == sub_oid), None)
    if subtask is None:
        raise APIError(404, "Subtarea no encontrada", "subtask_id")

    nuevo_estado = not subtask.get("completed", False)
    await db.tasks.update_one(
        {"_id": task["_id"], "subtasks.subtask_id": sub_oid},
        {"$set": {"subtasks.$.completed": nuevo_estado}},
    )
    return {"subtask_id": subtask_id, "completed": nuevo_estado}


async def _would_create_cycle(db, origin_id: ObjectId, target_id: ObjectId) -> bool:
    """RN-27: ¿agregar origin→target genera un ciclo?

    Hay ciclo si target ya depende (transitivamente) de origin.
    """
    visited: set = set()
    stack = [target_id]
    while stack:
        current = stack.pop()
        if current == origin_id:
            return True
        if current in visited:
            continue
        visited.add(current)
        doc = await db.tasks.find_one({"_id": current}, {"dependencies": 1})
        if doc:
            stack.extend(doc.get("dependencies", []))
    return False


async def add_dependency(db, task_id: str, payload: DependencyCreate, current_user: dict) -> dict:
    task = await _get_task(db, task_id)
    await ensure_project_access(db, task["project_id"], current_user, "Manager")

    depends_oid = to_object_id(payload.depends_on_task_id, "depends_on_task_id", "Tarea")
    if depends_oid == task["_id"]:
        raise APIError(400, "Una tarea no puede depender de sí misma", "depends_on_task_id")

    dependency = await db.tasks.find_one({"_id": depends_oid})
    if dependency is None:
        raise APIError(404, "La tarea de la que se depende no existe", "depends_on_task_id")

    if await _would_create_cycle(db, task["_id"], depends_oid):  # RN-27
        raise APIError(400, "Dependencia circular detectada", "depends_on_task_id")

    await db.tasks.update_one({"_id": task["_id"]}, {"$addToSet": {"dependencies": depends_oid}})
    task = await db.tasks.find_one({"_id": task["_id"]})
    return {
        "message": "Dependencia registrada exitosamente",
        "task_id": task_id,
        "dependencies": [str(d) for d in task.get("dependencies", [])],
    }


async def get_workload(db, project_id: str, current_user: dict) -> list[dict]:
    oid = to_object_id(project_id, "project_id", "Proyecto")
    await ensure_project_access(db, oid, current_user, "Manager")

    pipeline = [
        {"$match": {"project_id": oid, "assignee_id": {"$ne": None}}},
        {"$group": {
            "_id": "$assignee_id",
            "total_tasks": {"$sum": 1},
            "total_story_points": {"$sum": {"$ifNull": ["$story_points", 0]}},
        }},
        {"$sort": {"total_story_points": -1}},
    ]
    result = []
    async for row in db.tasks.aggregate(pipeline):
        result.append({
            "assignee_id": str(row["_id"]),
            "total_tasks": row["total_tasks"],
            "total_story_points": row["total_story_points"],
        })
    return result
