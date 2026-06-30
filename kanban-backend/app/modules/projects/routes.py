"""Endpoints del módulo Proyectos y Equipos (Módulo 2). Prefijo: /api/v1/projects"""
from fastapi import APIRouter, Depends, Query, status

from app.core.database import get_database
from app.dependencies.permissions import (
    Role,
    get_current_user,
    get_current_user_id,
    require_role,
)
from app.modules.projects import controller
from app.modules.projects.schemas import (
    AddMemberRequest,
    ProjectCreate,
    ProjectCreatedResponse,
    ProjectDetailResponse,
    ProjectListResponse,
    ProjectUpdate,
)

router = APIRouter(prefix="/projects", tags=["Proyectos"])


@router.post("", response_model=ProjectCreatedResponse, status_code=status.HTTP_201_CREATED)
async def create_project(payload: ProjectCreate, current=Depends(require_role(Role.MANAGER))):
    # RN-10: solo Admin o Manager global pueden crear proyectos.
    return await controller.create(get_database(), payload, current.get("sub"))


@router.get("", response_model=ProjectListResponse)
async def list_projects(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user_id: str = Depends(get_current_user_id),
):
    return await controller.list_(get_database(), user_id, page, limit)


@router.get("/{project_id}", response_model=ProjectDetailResponse)
async def get_project(project_id: str, current=Depends(get_current_user)):
    return await controller.detail(get_database(), project_id, current)


@router.put("/{project_id}")
async def update_project(project_id: str, payload: ProjectUpdate, current=Depends(get_current_user)):
    return await controller.update(get_database(), project_id, payload, current)


@router.delete("/{project_id}")
async def delete_project(project_id: str, current=Depends(get_current_user)):
    return await controller.delete(get_database(), project_id, current)


@router.post("/{project_id}/members", status_code=status.HTTP_201_CREATED)
async def add_member(project_id: str, payload: AddMemberRequest, current=Depends(get_current_user)):
    return await controller.add_member(get_database(), project_id, payload, current)


@router.delete("/{project_id}/members/{user_id}")
async def remove_member(project_id: str, user_id: str, current=Depends(get_current_user)):
    return await controller.remove_member(get_database(), project_id, user_id, current)
