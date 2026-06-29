from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# ─── Requests ───

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    nombre_completo: str = Field(..., min_length=1, max_length=120)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str


# ─── Responses ───

class UserResponse(BaseModel):
    id: str
    email: str
    nombre_completo: str
    fecha_creacion: datetime


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 3600


class RefreshResponse(BaseModel):
    access_token: str
    expires_in: int = 3600


class UserProfileResponse(BaseModel):
    id: str
    email: str
    nombre_completo: str
    fecha_creacion: datetime
    ultimo_acceso: Optional[datetime] = None


class MessageResponse(BaseModel):
    message: str


class ErrorResponse(BaseModel):
    detail: str
    campo: Optional[str] = None
    codigo: int
