"""Modelo del Módulo 4.

La planificación NO tiene colección propia: extiende los documentos de la
colección `tasks` con los campos `due_date`, `story_points`, `subtasks` y
`dependencies`. Aquí se documentan los sub-documentos que añade.

Subtarea embebida:
    { "subtask_id": ObjectId, "title": str, "completed": bool }

Dependencia:
    task.dependencies: [ ObjectId ]   # tareas de las que depende esta tarea
"""
from bson import ObjectId


def new_subtask(title: str) -> dict:
    return {"subtask_id": ObjectId(), "title": title, "completed": False}


def new_sprint_document(project_id: ObjectId, name: str, goal: str | None, start_date, end_date) -> dict:
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    return {
        "project_id": project_id,
        "name": name,
        "goal": goal,
        "state": "pending",  # pending, active, completed
        "start_date": start_date,
        "end_date": end_date,
        "created_at": now,
        "updated_at": now,
    }
