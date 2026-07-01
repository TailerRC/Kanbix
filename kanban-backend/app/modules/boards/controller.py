"""Orquestación HTTP del módulo Tableros, Columnas y Tareas."""
from app.modules.boards import service
from app.modules.boards.schemas import (
    BoardCreate,
    BoardUpdate,
    ColumnCreate,
    ColumnUpdate,
    CommentCreate,
    TaskCreate,
    TaskMove,
    TaskUpdate,
)


async def create_board(db, project_id, payload: BoardCreate, current):
    return await service.create_board(db, project_id, payload, current)


async def list_boards(db, project_id, current):
    return await service.list_boards(db, project_id, current)


async def board_detail(db, project_id, board_id, current):
    return await service.get_board_detail(db, project_id, board_id, current)


async def update_board(db, project_id, board_id, payload: BoardUpdate, current):
    return await service.update_board(db, project_id, board_id, payload, current)


async def delete_board(db, project_id, board_id, current):
    return await service.delete_board(db, project_id, board_id, current)


async def create_column(db, board_id, payload: ColumnCreate, current):
    return await service.create_column(db, board_id, payload, current)


async def update_column(db, board_id, column_id, payload: ColumnUpdate, current):
    return await service.update_column(db, board_id, column_id, payload, current)


async def list_project_tasks(db, project_id, current):
    return await service.list_project_tasks(db, project_id, current)


async def create_task(db, board_id, payload: TaskCreate, current):
    return await service.create_task(db, board_id, payload, current)


async def update_task(db, task_id, payload: TaskUpdate, current):
    return await service.update_task(db, task_id, payload, current)


async def move_task(db, task_id, payload: TaskMove, current):
    return await service.move_task(db, task_id, payload, current)


async def delete_task(db, task_id, current):
    return await service.delete_task(db, task_id, current)


async def add_comment(db, task_id, payload: CommentCreate, current):
    return await service.add_comment(db, task_id, payload, current)


async def list_comments(db, task_id, current):
    return await service.list_comments(db, task_id, current)
