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
