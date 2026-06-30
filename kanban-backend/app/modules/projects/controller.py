"""Orquestación HTTP del módulo Proyectos."""
from app.modules.projects import service
from app.modules.projects.schemas import (
    ProjectCreate,
    ProjectUpdate,
    InvitationCreate,
    InvitationRespond,
    RoleUpdateRequest,
    SprintCreate,
    SprintUpdate,
)


async def create(db, payload: ProjectCreate, creador_id: str) -> dict:
    return await service.create_project(db, payload, creador_id)


async def list_(db, user_id: str, page: int, limit: int) -> dict:
    return await service.list_projects(db, user_id, page, limit)


async def detail(db, project_id: str, current_user: dict) -> dict:
    return await service.get_project_detail(db, project_id, current_user)


async def update(db, project_id: str, payload: ProjectUpdate, current_user: dict) -> dict:
    return await service.update_project(db, project_id, payload, current_user)


async def delete(db, project_id: str, current_user: dict) -> dict:
    return await service.delete_project(db, project_id, current_user)


async def search(db, query_str: str, user_id: str) -> dict:
    return await service.search_projects(db, query_str, user_id)


async def create_invitation(db, project_id: str, payload: InvitationCreate, current_user: dict) -> dict:
    return await service.create_invitation(db, project_id, payload, current_user)


async def respond_invitation(db, invitation_id: str, payload: InvitationRespond, current_user_id: str) -> dict:
    return await service.respond_invitation(db, invitation_id, payload, current_user_id)


async def list_user_invitations(db, user_id: str) -> list:
    return await service.list_user_invitations(db, user_id)


async def list_members(db, project_id: str, current_user: dict) -> dict:
    return await service.list_members(db, project_id, current_user)


async def remove_member(db, project_id: str, member_id: str, current_user: dict) -> dict:
    return await service.remove_member(db, project_id, member_id, current_user)


async def change_role(db, project_id: str, member_id: str, payload: RoleUpdateRequest, current_user: dict) -> dict:
    return await service.change_member_role(db, project_id, member_id, payload, current_user)


async def create_sprint(db, project_id: str, payload: SprintCreate, current_user: dict) -> dict:
    return await service.create_sprint(db, project_id, payload, current_user)


async def list_sprints(db, project_id: str, current_user: dict) -> dict:
    return await service.list_sprints(db, project_id, current_user)


async def update_sprint(db, project_id: str, sprint_id: str, payload: SprintUpdate, current_user: dict) -> dict:
    return await service.update_sprint(db, project_id, sprint_id, payload, current_user)


async def close_sprint(db, project_id: str, sprint_id: str, current_user: dict) -> dict:
    return await service.close_sprint(db, project_id, sprint_id, current_user)
