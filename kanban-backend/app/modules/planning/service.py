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
    SprintCreate,
    SprintUpdate,
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


# ----------------------------------------------------------------------------
# Sprints
# ----------------------------------------------------------------------------
async def list_sprints(db, project_id: str, current_user: dict) -> list[dict]:
    oid = to_object_id(project_id, "project_id", "Proyecto")
    await ensure_project_access(db, oid, current_user, "Viewer")

    sprints = []
    async for s in db.sprints.find({"project_id": oid}).sort("created_at", 1):
        sprints.append({
            "id": str(s["_id"]),
            "name": s["name"],
            "goal": s.get("goal"),
            "state": s["state"],
            "start_date": s.get("start_date"),
            "end_date": s.get("end_date"),
        })
    return sprints


async def create_sprint(db, project_id: str, payload: SprintCreate, current_user: dict) -> dict:
    oid = to_object_id(project_id, "project_id", "Proyecto")
    await ensure_project_access(db, oid, current_user, "Manager")

    doc = model.new_sprint_document(oid, payload.name, payload.goal, payload.start_date, payload.end_date)
    result = await db.sprints.insert_one(doc)
    return {
        "id": str(result.inserted_id),
        "name": doc["name"],
        "goal": doc["goal"],
        "state": doc["state"],
        "start_date": doc["start_date"],
        "end_date": doc["end_date"],
    }


async def update_sprint(db, sprint_id: str, payload: SprintUpdate, current_user: dict) -> dict:
    oid = to_object_id(sprint_id, "sprint_id", "Sprint")
    sprint = await db.sprints.find_one({"_id": oid})
    if sprint is None:
        raise APIError(404, "Sprint no encontrado", "sprint_id")
    
    await ensure_project_access(db, sprint["project_id"], current_user, "Manager")

    updates = payload.model_dump(exclude_unset=True)
    if updates:
        updates["updated_at"] = datetime.now(timezone.utc)
        await db.sprints.update_one({"_id": oid}, {"$set": updates})
        sprint.update(updates)
    
    return {
        "id": str(sprint["_id"]),
        "name": sprint["name"],
        "goal": sprint.get("goal"),
        "state": sprint["state"],
        "start_date": sprint.get("start_date"),
        "end_date": sprint.get("end_date"),
    }


async def start_sprint(db, sprint_id: str, current_user: dict) -> dict:
    oid = to_object_id(sprint_id, "sprint_id", "Sprint")
    sprint = await db.sprints.find_one({"_id": oid})
    if sprint is None:
        raise APIError(404, "Sprint no encontrado", "sprint_id")
    
    await ensure_project_access(db, sprint["project_id"], current_user, "Manager")

    if sprint["state"] != "pending":
        raise APIError(400, "Solo se pueden iniciar sprints pendientes", "state")

    # Verificar si hay otro sprint activo en el proyecto
    active = await db.sprints.find_one({"project_id": sprint["project_id"], "state": "active"})
    if active:
        raise APIError(400, "Ya existe un sprint activo en el proyecto", "state")

    now = datetime.now(timezone.utc)
    updates = {"state": "active", "updated_at": now}
    if not sprint.get("start_date"):
        updates["start_date"] = now

    await db.sprints.update_one({"_id": oid}, {"$set": updates})
    sprint.update(updates)
    return {
        "id": str(sprint["_id"]),
        "state": sprint["state"],
        "start_date": sprint.get("start_date"),
    }


async def delete_sprint(db, sprint_id: str, current_user: dict) -> dict:
    oid = to_object_id(sprint_id, "sprint_id", "Sprint")
    sprint = await db.sprints.find_one({"_id": oid})
    if sprint is None:
        raise APIError(404, "Sprint no encontrado", "sprint_id")

    await ensure_project_access(db, sprint["project_id"], current_user, "Manager")

    if sprint.get("state") == "active":
        raise APIError(400, "No se puede eliminar un sprint activo; complétalo primero", "state")

    # Devolver las tareas del sprint al backlog (sprint_id = None).
    await db.tasks.update_many({"sprint_id": oid}, {"$set": {"sprint_id": None}})
    await db.sprints.delete_one({"_id": oid})
    return {"message": "Sprint eliminado exitosamente"}


def _sprint_points(task: dict) -> float:
    return float(task.get("story_points") or 1)


async def complete_sprint(db, sprint_id: str, current_user: dict, move_incomplete_to: str | None = None) -> dict:
    oid = to_object_id(sprint_id, "sprint_id", "Sprint")
    sprint = await db.sprints.find_one({"_id": oid})
    if sprint is None:
        raise APIError(404, "Sprint no encontrado", "sprint_id")

    await ensure_project_access(db, sprint["project_id"], current_user, "Manager")

    if sprint["state"] != "active":
        raise APIError(400, "Solo se pueden completar sprints activos", "state")

    # Destino de las tareas incompletas (otro sprint válido, o backlog = None).
    target_oid = None
    if move_incomplete_to:
        target_oid = to_object_id(move_incomplete_to, "move_incomplete_to", "Sprint")
        dest = await db.sprints.find_one({"_id": target_oid, "project_id": sprint["project_id"]})
        if dest is None:
            raise APIError(404, "Sprint destino no encontrado", "move_incomplete_to")
        if dest.get("state") == "completed":
            raise APIError(400, "No se pueden mover tareas a un sprint cerrado", "move_incomplete_to")

    # Snapshot ANTES de mover: comprometido vs completado (para Velocity/Informes).
    tasks = [t async for t in db.tasks.find({"sprint_id": oid})]
    committed_points = sum(_sprint_points(t) for t in tasks)
    completed_points = sum(_sprint_points(t) for t in tasks if t.get("status") == "Done")
    total_tasks = len(tasks)
    completed_tasks = sum(1 for t in tasks if t.get("status") == "Done")

    now = datetime.now(timezone.utc)

    # Compilar reporte detallado del sprint para el Manager
    member_ids = [t["assignee_id"] for t in tasks if t.get("assignee_id")]
    names = {}
    if member_ids:
        async for u in db.users.find({"_id": {"$in": member_ids}}, {"nombre_completo": 1}):
            names[str(u["_id"])] = u.get("nombre_completo", "")

    task_snapshots = []
    for t in tasks:
        task_snapshots.append({
            "id": str(t["_id"]),
            "title": t["title"],
            "status": t["status"],
            "priority": t.get("priority", "Media"),
            "assignee_name": names.get(str(t.get("assignee_id")), "Sin asignar") if t.get("assignee_id") else "Sin asignar",
            "story_points": float(t.get("story_points") or 1.0),
            "due_date": t.get("due_date").isoformat() if t.get("due_date") else None,
            "subtasks_count": len(t.get("subtasks", [])),
            "completed_subtasks_count": sum(1 for s in t.get("subtasks", []) if s.get("completed")),
        })

    report_doc = {
        "project_id": sprint["project_id"],
        "sprint_id": sprint["_id"],
        "sprint_name": sprint["name"],
        "goal": sprint.get("goal"),
        "start_date": sprint.get("start_date") or sprint.get("fecha_inicio"),
        "end_date": sprint.get("end_date") or sprint.get("fecha_fin"),
        "completed_at": now,
        "completed_by": to_object_id(current_user["sub"], "current_user", "Usuario"),
        "metrics": {
            "committed_points": float(committed_points),
            "completed_points": float(completed_points),
            "total_tasks": int(total_tasks),
            "completed_tasks": int(completed_tasks),
        },
        "tasks": task_snapshots,
    }
    await db.sprint_reports.insert_one(report_doc)

    # Mover las tareas NO finalizadas fuera del sprint (backlog u otro sprint).
    await db.tasks.update_many(
        {"sprint_id": oid, "status": {"$ne": "Done"}},
        {"$set": {"sprint_id": target_oid, "updated_at": now}},
    )

    await db.sprints.update_one(
        {"_id": oid},
        {"$set": {
            "state": "completed",
            "completed_at": now,
            "committed_points": committed_points,
            "completed_points": completed_points,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "updated_at": now,
        }},
    )

    return {
        "id": str(sprint["_id"]),
        "state": "completed",
        "committed_points": committed_points,
        "completed_points": completed_points,
        "moved_incomplete": total_tasks - completed_tasks,
    }
