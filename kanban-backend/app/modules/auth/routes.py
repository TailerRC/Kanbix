"""Endpoints del módulo Auth (Módulo 1).

Expone dos routers:
- `router`        → /api/v1/auth/*
- `admin_router`  → /api/v1/admin/*
"""
from fastapi import APIRouter, Depends, Query, status

from app.core.database import get_database
from app.dependencies.permissions import (
    Role,
    get_current_user,
    get_current_user_id,
    require_role,
)
from app.modules.auth import controller
from app.modules.auth.schemas import (
    ChangeRoleRequest,
    LoginRequest,
    LoginResponse,
    LogoutRequest,
    MeResponse,
    RefreshRequest,
    RegisterRequest,
    TokenRefreshResponse,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["Autenticación"])
admin_router = APIRouter(prefix="/admin", tags=["Administración de Usuarios"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, current=Depends(require_role(Role.ADMIN))):
    return await controller.register(get_database(), payload, current.get("sub"))


@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest):
    return await controller.login(get_database(), payload)


@router.post("/refresh", response_model=TokenRefreshResponse)
async def refresh(payload: RefreshRequest):
    return await controller.refresh(get_database(), payload.refresh_token)


@router.post("/logout")
async def logout(payload: LogoutRequest, _=Depends(get_current_user)):
    return await controller.logout(get_database(), payload.refresh_token)


@router.get("/me", response_model=MeResponse)
async def me(user_id: str = Depends(get_current_user_id)):
    return await controller.me(get_database(), user_id)


@admin_router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def admin_create_user(payload: RegisterRequest, current=Depends(require_role(Role.ADMIN))):
    return await controller.register(get_database(), payload, current.get("sub"))


@admin_router.get("/users")
async def admin_list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    _=Depends(require_role(Role.ADMIN)),
):
    return await controller.list_users(get_database(), page, limit)


@admin_router.post("/users/{user_id}/unlock")
async def admin_unlock_user(user_id: str, _=Depends(require_role(Role.ADMIN))):
    return await controller.unlock(get_database(), user_id)


@admin_router.put("/users/{user_id}/role")
async def admin_change_role(
    user_id: str,
    payload: ChangeRoleRequest,
    current=Depends(require_role(Role.ADMIN)),
):
    return await controller.change_role(get_database(), current.get("sub"), user_id, payload)
