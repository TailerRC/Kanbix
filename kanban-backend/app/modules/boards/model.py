"""Modelos de las colecciones del Módulo 3: boards, columns, tasks, comments."""
from datetime import datetime, timezone

from bson import ObjectId

BOARDS = "boards"
COLUMNS = "columns"
TASKS = "tasks"
COMMENTS = "comments"

# RN-20: columnas de estado por defecto.
DEFAULT_COLUMNS = ["To Do", "In Progress", "In Review", "Done"]


def new_board_document(project_id: ObjectId, name: str, description: str | None) -> dict:
    now = datetime.now(timezone.utc)
    return {
        "project_id": project_id,
        "name": name,
        "description": description,
        "created_at": now,
        "updated_at": now,
    }


def default_column_documents(board_id: ObjectId) -> list[dict]:
    now = datetime.now(timezone.utc)
    return [
        {"board_id": board_id, "name": name, "position": i, "created_at": now}
        for i, name in enumerate(DEFAULT_COLUMNS, start=1)
    ]


def new_task_document(
    *,
    project_id: ObjectId,
    board_id: ObjectId,
    column_id: ObjectId,
    status: str,
    title: str,
    description: str | None,
    priority: str,
    assignee_id: ObjectId | None,
    creator_id: ObjectId,
    due_date: datetime | None,
    tags: list[str],
    position: int,
    start_date: datetime | None = None,
    sprint_id: ObjectId | None = None,
    dev_info: str | None = None,
) -> dict:
    now = datetime.now(timezone.utc)
    return {
        "project_id": project_id,
        "board_id": board_id,
        "column_id": column_id,
        "status": status,
        "title": title,
        "description": description,
        "priority": priority,
        "assignee_id": assignee_id,
        "creator_id": creator_id,
        "due_date": due_date,
        "start_date": start_date,
        "story_points": None,
        "tags": tags,
        "sprint_id": sprint_id,
        "dev_info": dev_info,
        "subtasks": [],
        "dependencies": [],
        "position": position,
        "deadline_alertado": False,  # RN-28
        "created_at": now,
        "updated_at": now,
    }
