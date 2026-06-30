"""Endpoints del módulo Proyectos, Invitaciones y Sprints (Módulo 2).

Prefijo principal: /api/v1/projects
Prefijo invitaciones: /api/v1/invitations
"""
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
    ProjectCreate,
    ProjectCreatedResponse,
    ProjectDetailResponse,
    ProjectListResponse,
    ProjectUpdate,
    InvitationCreate,
    InvitationResponse,
    InvitationRespond,
    InvitationRespondResponse,
    MemberListResponse,
    RoleUpdateRequest,
    SprintCreate,
    SprintResponse,
    SprintListResponse,
    SprintUpdate,
    SprintCloseResponse,
)

router = APIRouter(prefix="/projects", tags=["Proyectos"])
invitations_router = APIRouter(prefix="/invitations", tags=["Invitaciones"])

# =====================================================================
# SECCIÓN: PROYECTOS
# =====================================================================

@router.post("", response_model=ProjectCreatedResponse, status_code=status.HTTP_201_CREATED)
async def create_project(payload: ProjectCreate, current=Depends(require_role(Role.MANAGER))):
    # RN-10: solo Admin o Manager global pueden crear proyectos.
    return await controller.create(get_database(), payload, get_current_user_id(current))


@router.get("", response_model=ProjectListResponse)
async def list_projects(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user_id: str = Depends(get_current_user_id),
):
    return await controller.list_(get_database(), user_id, page, limit)


# CRITICAL: Declarar /search ANTES de /{project_id} para evitar colisión de patrones
@router.get("/search", response_model=ProjectListResponse)
async def search_projects(
    q: str = Query("", min_length=1),
    user_id: str = Depends(get_current_user_id),
):
    return await controller.search(get_database(), q, user_id)


@router.get("/{project_id}", response_model=ProjectDetailResponse)
async def get_project(project_id: str, current=Depends(get_current_user)):
    return await controller.detail(get_database(), project_id, current)


@router.put("/{project_id}")
async def update_project(project_id: str, payload: ProjectUpdate, current=Depends(get_current_user)):
    return await controller.update(get_database(), project_id, payload, current)


@router.delete("/{project_id}")
async def delete_project(project_id: str, current=Depends(get_current_user)):
    return await controller.delete(get_database(), project_id, current)


# =====================================================================
# SECCIÓN: MIEMBROS & INVITACIONES
# =====================================================================

@router.post("/{project_id}/invitations", response_model=InvitationResponse, status_code=status.HTTP_201_CREATED)
async def invite_member(project_id: str, payload: InvitationCreate, current=Depends(get_current_user)):
    return await controller.create_invitation(get_database(), project_id, payload, current)


@invitations_router.get("", response_model=list[InvitationResponse])
async def list_my_invitations(user_id: str = Depends(get_current_user_id)):
    return await controller.list_user_invitations(get_database(), user_id)


@invitations_router.patch("/{invitation_id}/respond", response_model=InvitationRespondResponse)
async def respond_to_invitation(
    invitation_id: str, 
    payload: InvitationRespond, 
    user_id: str = Depends(get_current_user_id)
):
    return await controller.respond_invitation(get_database(), invitation_id, payload, user_id)


@router.get("/{project_id}/members", response_model=MemberListResponse)
async def list_project_members(project_id: str, current=Depends(get_current_user)):
    return await controller.list_members(get_database(), project_id, current)


@router.delete("/{project_id}/members/{member_id}")
async def remove_project_member(project_id: str, member_id: str, current=Depends(get_current_user)):
    return await controller.remove_member(get_database(), project_id, member_id, current)


@router.patch("/{project_id}/members/{member_id}/role")
async def change_project_member_role(
    project_id: str, 
    member_id: str, 
    payload: RoleUpdateRequest, 
    current=Depends(get_current_user)
):
    return await controller.change_role(get_database(), project_id, member_id, payload, current)


# =====================================================================
# SECCIÓN: SPRINTS
# =====================================================================

@router.post("/{project_id}/sprints", response_model=SprintResponse, status_code=status.HTTP_201_CREATED)
async def create_project_sprint(project_id: str, payload: SprintCreate, current=Depends(get_current_user)):
    return await controller.create_sprint(get_database(), project_id, payload, current)


@router.get("/{project_id}/sprints", response_model=SprintListResponse)
async def list_project_sprints(project_id: str, current=Depends(get_current_user)):
    return await controller.list_sprints(get_database(), project_id, current)


@router.put("/{project_id}/sprints/{sprint_id}", response_model=SprintResponse)
async def update_project_sprint(
    project_id: str, 
    sprint_id: str, 
    payload: SprintUpdate, 
    current=Depends(get_current_user)
):
    return await controller.update_sprint(get_database(), project_id, sprint_id, payload, current)


@router.patch("/{project_id}/sprints/{sprint_id}/close", response_model=SprintCloseResponse)
async def close_project_sprint(project_id: str, sprint_id: str, current=Depends(get_current_user)):
    return await controller.close_sprint(get_database(), project_id, sprint_id, current)
