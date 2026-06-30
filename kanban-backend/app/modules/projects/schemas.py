"""Pydantic models del módulo de Proyectos y Equipos (Módulo 2)."""
from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, Field

RolProyecto = Literal["Manager", "Developer", "Viewer"]


class MemberCreateInput(BaseModel):
    user_id: str
    rol: RolProyecto


class ProjectCreate(BaseModel):
    name: str = Field(min_length=3)
    description: Optional[str] = None
    members: Optional[List[MemberCreateInput]] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=3)
    description: Optional[str] = None


class AddMemberRequest(BaseModel):
    user_id: str
    rol: RolProyecto


class ProjectCreatedResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    id_creador: str
    created_at: datetime


class ProjectListItem(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    role: str
    member_count: int
    created_at: datetime


class ProjectListResponse(BaseModel):
    total: int
    page: int
    limit: int
    data: List[ProjectListItem]


class MemberDetail(BaseModel):
    user_id: str
    nombre_completo: str
    email: str
    rol: str


class ProjectDetailResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    id_creador: str
    created_at: datetime
    members: List[MemberDetail]
