"""Endpoints del Módulo 4. Se monta en /api/v1 con rutas explícitas."""
from fastapi import APIRouter, Depends, status

from app.core.database import get_database
from app.dependencies.permissions import get_current_user
from app.modules.planning import controller
from app.modules.planning.schemas import (
    DependencyCreate,
    PlanningUpdate,
    SubtaskCreate,
)

router = APIRouter(tags=["Planificación"])


@router.put("/tasks/{task_id}/planning")
async def set_planning(task_id: str, payload: PlanningUpdate, current=Depends(get_current_user)):
    return await controller.set_planning(get_database(), task_id, payload, current)


@router.post("/tasks/{task_id}/subtasks", status_code=status.HTTP_201_CREATED)
async def add_subtask(task_id: str, payload: SubtaskCreate, current=Depends(get_current_user)):
    return await controller.add_subtask(get_database(), task_id, payload, current)


@router.patch("/tasks/{task_id}/subtasks/{subtask_id}/toggle")
async def toggle_subtask(task_id: str, subtask_id: str, current=Depends(get_current_user)):
    return await controller.toggle_subtask(get_database(), task_id, subtask_id, current)


@router.post("/tasks/{task_id}/dependencies")
async def add_dependency(task_id: str, payload: DependencyCreate, current=Depends(get_current_user)):
    return await controller.add_dependency(get_database(), task_id, payload, current)


@router.get("/projects/{project_id}/workload")
async def workload(project_id: str, current=Depends(get_current_user)):
    return await controller.workload(get_database(), project_id, current)
