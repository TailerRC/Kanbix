"""Orquestación HTTP del módulo Proyectos."""
from app.modules.projects import service
from app.modules.projects.schemas import (
    AddMemberRequest,
    ProjectCreate,
    ProjectUpdate,
)


async def create(db, payload: ProjectCreate, creador_id: str) -> dict:
    return await service.create_project(db, payload, creador_id)


async def list_(db, current_user: dict, page: int, limit: int) -> dict:
    return await service.list_projects(db, current_user, page, limit)


async def detail(db, project_id: str, current_user: dict) -> dict:
    return await service.get_project_detail(db, project_id, current_user)


async def update(db, project_id: str, payload: ProjectUpdate, current_user: dict) -> dict:
    return await service.update_project(db, project_id, payload, current_user)


async def delete(db, project_id: str, current_user: dict) -> dict:
    return await service.delete_project(db, project_id, current_user)


async def add_member(db, project_id: str, payload: AddMemberRequest, current_user: dict) -> dict:
    return await service.add_member(db, project_id, payload, current_user)


async def remove_member(db, project_id: str, user_id: str, current_user: dict) -> dict:
    return await service.remove_member(db, project_id, user_id, current_user)
