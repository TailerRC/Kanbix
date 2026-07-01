"""Endpoints del Módulo 3. Se monta en /api/v1 con rutas explícitas."""
from fastapi import APIRouter, Depends, status

from app.core.database import get_database
from app.dependencies.permissions import get_current_user
from app.modules.boards import controller
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

router = APIRouter(tags=["Tableros y Tareas"])


# ---------- Boards ----------
@router.post("/projects/{project_id}/boards", status_code=status.HTTP_201_CREATED)
async def create_board(project_id: str, payload: BoardCreate, current=Depends(get_current_user)):
    return await controller.create_board(get_database(), project_id, payload, current)


@router.get("/projects/{project_id}/boards")
async def list_boards(project_id: str, current=Depends(get_current_user)):
    return await controller.list_boards(get_database(), project_id, current)


@router.get("/projects/{project_id}/boards/{board_id}")
async def board_detail(project_id: str, board_id: str, current=Depends(get_current_user)):
    return await controller.board_detail(get_database(), project_id, board_id, current)


@router.put("/projects/{project_id}/boards/{board_id}")
async def update_board(project_id: str, board_id: str, payload: BoardUpdate, current=Depends(get_current_user)):
    return await controller.update_board(get_database(), project_id, board_id, payload, current)


@router.delete("/projects/{project_id}/boards/{board_id}")
async def delete_board(project_id: str, board_id: str, current=Depends(get_current_user)):
    return await controller.delete_board(get_database(), project_id, board_id, current)


# ---------- Columns ----------
@router.post("/boards/{board_id}/columns", status_code=status.HTTP_201_CREATED)
async def create_column(board_id: str, payload: ColumnCreate, current=Depends(get_current_user)):
    return await controller.create_column(get_database(), board_id, payload, current)


@router.put("/boards/{board_id}/columns/{column_id}")
async def update_column(board_id: str, column_id: str, payload: ColumnUpdate, current=Depends(get_current_user)):
    return await controller.update_column(get_database(), board_id, column_id, payload, current)


# ---------- Tasks ----------
@router.get("/projects/{project_id}/tasks")
async def list_project_tasks(project_id: str, current=Depends(get_current_user)):
    return await controller.list_project_tasks(get_database(), project_id, current)


@router.post("/boards/{board_id}/tasks", status_code=status.HTTP_201_CREATED)
async def create_task(board_id: str, payload: TaskCreate, current=Depends(get_current_user)):
    return await controller.create_task(get_database(), board_id, payload, current)


@router.put("/tasks/{task_id}")
async def update_task(task_id: str, payload: TaskUpdate, current=Depends(get_current_user)):
    return await controller.update_task(get_database(), task_id, payload, current)


# Alias PATCH — el frontend usa PATCH para updates parciales; delega al mismo handler.
@router.patch("/tasks/{task_id}")
async def patch_task(task_id: str, payload: TaskUpdate, current=Depends(get_current_user)):
    return await controller.update_task(get_database(), task_id, payload, current)


@router.patch("/tasks/{task_id}/move")
async def move_task(task_id: str, payload: TaskMove, current=Depends(get_current_user)):
    return await controller.move_task(get_database(), task_id, payload, current)


@router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, current=Depends(get_current_user)):
    return await controller.delete_task(get_database(), task_id, current)


# ---------- Comments ----------
@router.post("/tasks/{task_id}/comments", status_code=status.HTTP_201_CREATED)
async def add_comment(task_id: str, payload: CommentCreate, current=Depends(get_current_user)):
    return await controller.add_comment(get_database(), task_id, payload, current)


@router.get("/tasks/{task_id}/comments")
async def list_comments(task_id: str, current=Depends(get_current_user)):
    return await controller.list_comments(get_database(), task_id, current)
