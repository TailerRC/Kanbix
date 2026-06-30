"""Pydantic models del módulo de Proyectos y Equipos (Módulo 2)."""
from datetime import datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, Field, EmailStr

# Mapeo de Roles de API (Contrato) a Base de Datos (Interno)
ApiRolProyecto = Literal["scrum_master", "product_owner", "developer"]

API_TO_DB_ROLE = {
    "scrum_master": "Manager",
    "product_owner": "Viewer",
    "developer": "Developer"
}

DB_TO_API_ROLE = {
    "Manager": "scrum_master",
    "Viewer": "product_owner",
    "Developer": "developer"
}

# =====================================================================
# PROYECTOS SCHEMAS
# =====================================================================

class ProjectCreate(BaseModel):
    nombre: str = Field(min_length=3, max_length=100)
    descripcion: Optional[str] = None
    fecha_inicio: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$") # YYYY-MM-DD
    fecha_fin: Optional[str] = Field(default=None, pattern=r"^\d{4}-\d{2}-\d{2}$")
    color: Optional[str] = Field(default="#1E3A5F", pattern=r"^#[0-9a-fA-F]{6}$")

class ProjectUpdate(BaseModel):
    nombre: Optional[str] = Field(default=None, min_length=3, max_length=100)
    descripcion: Optional[str] = None
    color: Optional[str] = Field(default=None, pattern=r"^#[0-9a-fA-F]{6}$")
    estado: Optional[Literal["Activo", "Pausado", "Archivado"]] = None
    fecha_fin: Optional[str] = Field(default=None, pattern=r"^\d{4}-\d{2}-\d{2}$")

class ProjectCreatedResponse(BaseModel):
    id: str
    nombre: str
    descripcion: Optional[str] = None
    color: str
    iniciales: str
    estado: str
    fecha_inicio: str
    fecha_fin: Optional[str] = None
    id_creador: str
    fecha_creacion: str

class ProjectListItem(BaseModel):
    id: str
    nombre: str
    iniciales: str
    color: str
    estado: str
    mi_rol: str
    fecha_inicio: str

class ProjectListResponse(BaseModel):
    proyectos: List[ProjectListItem]
    total: int

class ProjectDetailResponse(BaseModel):
    id: str
    nombre: str
    descripcion: Optional[str] = None
    iniciales: str
    color: str
    estado: str
    fecha_inicio: str
    fecha_fin: Optional[str] = None
    id_creador: str
    mi_rol: str
    total_miembros: int
    fecha_creacion: str

# =====================================================================
# MIEMBROS & INVITACIONES SCHEMAS
# =====================================================================

class InvitationCreate(BaseModel):
    email: EmailStr
    rol: ApiRolProyecto

class InvitationResponse(BaseModel):
    id: str
    email: str
    rol: ApiRolProyecto
    estado: str
    id_proyecto: str
    expira_en: str

class InvitationRespond(BaseModel):
    accion: Literal["aceptar", "rechazar"]

class ProjectMemberResponse(BaseModel):
    id: str
    id_proyecto: str
    id_usuario: str
    rol: ApiRolProyecto

class InvitationRespondResponse(BaseModel):
    mensaje: str
    miembro: Optional[ProjectMemberResponse] = None

class MemberDetailResponse(BaseModel):
    id_miembro: str
    id_usuario: str
    nombre: str
    email: str
    rol: ApiRolProyecto
    fecha_union: str

class MemberListResponse(BaseModel):
    miembros: List[MemberDetailResponse]
    total: int

class RoleUpdateRequest(BaseModel):
    rol: ApiRolProyecto

# =====================================================================
# SPRINTS SCHEMAS
# =====================================================================

class SprintCreate(BaseModel):
    nombre: str = Field(min_length=1, max_length=80)
    fecha_inicio: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    fecha_fin: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")

class SprintResponse(BaseModel):
    id: str
    nombre: str
    fecha_inicio: str
    fecha_fin: str
    estado: str
    id_proyecto: str

class SprintListResponse(BaseModel):
    sprints: List[SprintResponse]
    total: int

class SprintUpdate(BaseModel):
    nombre: Optional[str] = Field(default=None, min_length=1, max_length=80)
    fecha_inicio: Optional[str] = Field(default=None, pattern=r"^\d{4}-\d{2}-\d{2}$")
    fecha_fin: Optional[str] = Field(default=None, pattern=r"^\d{4}-\d{2}-\d{2}$")

class SprintCloseResponse(BaseModel):
    mensaje: str
    sprint_id: str
    tareas_al_backlog: int
    tareas_completadas: int
