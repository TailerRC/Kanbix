"""Pydantic models del módulo de Autenticación y Usuarios (Módulo 1)."""
import re
from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

RolGlobal = Literal["Admin", "Manager", "Developer", "Viewer"]

_PASSWORD_RE = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$")


def _validate_password(value: str) -> str:
    if not _PASSWORD_RE.match(value):
        raise ValueError(
            "La contraseña debe tener mínimo 8 caracteres, "
            "al menos 1 mayúscula, 1 minúscula y 1 número"
        )
    return value


# ---------------------------------------------------------------------------
# Requests
# ---------------------------------------------------------------------------

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    nombre_completo: str = Field(min_length=1)
    rol_global: RolGlobal

    @field_validator("password")
    @classmethod
    def check_password(cls, v: str) -> str:
        return _validate_password(v)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str


class ChangeRoleRequest(BaseModel):
    rol_global: RolGlobal


class AdminUpdateUserRequest(BaseModel):
    nombre_completo: Optional[str] = Field(None, min_length=1)
    email: Optional[EmailStr] = None
    activo: Optional[bool] = None
    password: Optional[str] = None
    rol_global: Optional[RolGlobal] = None

    @field_validator("password")
    @classmethod
    def check_password(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return _validate_password(v)
        return v


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def check_password(cls, v: str) -> str:
        return _validate_password(v)



# ---------------------------------------------------------------------------
# Responses — Auth
# ---------------------------------------------------------------------------

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    cambiar_password: bool


class TokenRefreshResponse(BaseModel):
    access_token: str
    expires_in: int


class LogoutResponse(BaseModel):
    message: str


# ---------------------------------------------------------------------------
# Responses — Usuario
# ---------------------------------------------------------------------------

class UserResponse(BaseModel):
    """Respuesta al crear un usuario (POST /auth/register · POST /admin/users)."""
    id: str
    email: EmailStr
    nombre_completo: str
    rol_global: RolGlobal
    fecha_creacion: datetime


class MeResponse(BaseModel):
    """Respuesta de GET /auth/me con todos los campos del perfil."""
    id: str
    email: EmailStr
    nombre_completo: str
    rol_global: RolGlobal
    cambiar_password: bool
    fecha_creacion: datetime
    ultimo_acceso: Optional[datetime] = None


class UserListItem(BaseModel):
    """Ítem de usuario en la lista paginada (GET /admin/users)."""
    id: str
    email: EmailStr
    nombre_completo: str
    rol_global: RolGlobal
    activo: bool
    bloqueado: bool = False
    fecha_creacion: datetime
    ultimo_acceso: Optional[datetime] = None


class UserListResponse(BaseModel):
    """Respuesta paginada de GET /admin/users."""
    total: int
    page: int
    limit: int
    data: List[UserListItem]


# ---------------------------------------------------------------------------
# Responses — Administración
# ---------------------------------------------------------------------------

class UnlockResponse(BaseModel):
    """Respuesta de POST /admin/users/{id}/unlock."""
    message: str
    user_id: str


class ChangeRoleResponse(BaseModel):
    """Respuesta de PUT /admin/users/{id}/role."""
    message: str
    user_id: str
    rol_global: RolGlobal


class AuditLogItem(BaseModel):
    id: str
    id_usuario: Optional[str] = None
    accion: str
    detalle: str = ""
    id_recurso: Optional[str] = None
    fecha: datetime
    usuario_ejecutor_email: Optional[str] = None
    usuario_ejecutor_nombre: Optional[str] = None
    recurso_afectado_nombre: Optional[str] = None
    recurso_afectado_tipo: Optional[str] = None


class AuditLogListResponse(BaseModel):
    total: int
    page: int
    limit: int
    data: List[AuditLogItem]


# ---------------------------------------------------------------------------
# Perfil de Usuario (propio)
# ---------------------------------------------------------------------------

class UpdateProfileRequest(BaseModel):
    """PATCH /auth/me — el usuario edita su propio nombre y/o correo."""
    nombre_completo: Optional[str] = Field(None, min_length=1)
    email: Optional[EmailStr] = None


# ---------------------------------------------------------------------------
# Tickets de Soporte
# ---------------------------------------------------------------------------

TipoTicket = Literal[
    "CAMBIO_PASSWORD",
    "ACCESO_BLOQUEADO",
    "SOPORTE_TECNICO",
    "OTRO",
]

EstadoTicket = Literal["ABIERTO", "EN_REVISION", "RESUELTO", "CERRADO"]


class TicketCreateRequest(BaseModel):
    tipo: TipoTicket
    asunto: str = Field(min_length=3, max_length=120)
    descripcion: str = Field(min_length=5, max_length=1000)


class TicketUpdateRequest(BaseModel):
    """PATCH /admin/tickets/{id} — Admin actualiza estado y nota."""
    estado: EstadoTicket
    nota_resolucion: Optional[str] = Field(None, max_length=500)


class TicketResponse(BaseModel):
    id: str
    id_usuario: str
    usuario_nombre: Optional[str] = None
    usuario_email: Optional[str] = None
    tipo: TipoTicket
    asunto: str
    descripcion: str
    estado: EstadoTicket
    nota_resolucion: Optional[str] = None
    fecha_creacion: datetime
    fecha_actualizacion: datetime


class TicketListResponse(BaseModel):
    total: int
    page: int
    limit: int
    data: List[TicketResponse]


# ---------------------------------------------------------------------------
# Preferencias de Notificaciones
# ---------------------------------------------------------------------------

class UserPreferencesRequest(BaseModel):
    notif_asignacion: bool
    notif_comentarios: bool
    notif_email: bool
    notif_tickets: bool


class UserPreferencesResponse(BaseModel):
    id_usuario: str
    notif_asignacion: bool
    notif_comentarios: bool
    notif_email: bool
    notif_tickets: bool

