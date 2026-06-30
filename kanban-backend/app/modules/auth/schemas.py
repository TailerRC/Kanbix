"""Pydantic models del módulo de Autenticación y Usuarios (Módulo 1)."""
import re
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

RolGlobal = Literal["Admin", "Manager", "Developer"]

_PASSWORD_RE = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$")


def _validate_password(value: str) -> str:
    if not _PASSWORD_RE.match(value):
        raise ValueError(
            "La contraseña debe tener mínimo 8 caracteres, "
            "al menos 1 mayúscula, 1 minúscula y 1 número"
        )
    return value


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


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    nombre_completo: str
    rol_global: RolGlobal
    fecha_creacion: datetime


class MeResponse(BaseModel):
    id: str
    email: EmailStr
    nombre_completo: str
    rol_global: RolGlobal
    cambiar_password: bool
    fecha_creacion: datetime
    ultimo_acceso: Optional[datetime] = None


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    cambiar_password: bool


class TokenRefreshResponse(BaseModel):
    access_token: str
    expires_in: int
