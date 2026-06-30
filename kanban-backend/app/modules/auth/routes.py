"""Endpoints del módulo Auth (Módulo 1).

Expone dos routers:
- `router`        → /api/v1/auth/*
- `admin_router`  → /api/v1/admin/*

Todos los endpoints de /admin/* requieren rol Admin (RN-05, RN-07, RN-32).
Los endpoints de /auth/* que requieren sesión usan get_current_user.
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
    ChangePasswordRequest,
    ChangeRoleRequest,
    ChangeRoleResponse,
    LoginRequest,
    LoginResponse,
    LogoutRequest,
    LogoutResponse,
    MeResponse,
    RefreshRequest,
    RegisterRequest,
    TokenRefreshResponse,
    UnlockResponse,
    UserListResponse,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["Autenticación"])
admin_router = APIRouter(prefix="/admin", tags=["Administración de Usuarios"])


# ---------------------------------------------------------------------------
# /auth/*
# ---------------------------------------------------------------------------

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear usuario (Enterprise — solo Admin)",
    description="RN-05/RN-34: el auto-registro público está deshabilitado. Solo un Admin puede crear cuentas.",
)
async def register(
    payload: RegisterRequest,
    current=Depends(require_role(Role.ADMIN)),
):
    return await controller.register(get_database(), payload, current.get("sub"))


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Iniciar sesión",
    description="RN-04/RN-31: aplica bloqueo por intentos y fuerza cambio de contraseña si expiró.",
)
async def login(payload: LoginRequest):
    return await controller.login(get_database(), payload)


@router.post(
    "/refresh",
    response_model=TokenRefreshResponse,
    summary="Renovar access token",
    description="Requiere un refresh_token válido en el body (no access_token en header).",
)
async def refresh(payload: RefreshRequest):
    return await controller.refresh(get_database(), payload.refresh_token)


@router.post(
    "/logout",
    response_model=LogoutResponse,
    summary="Cerrar sesión",
    description="Invalida el refresh_token en base de datos.",
)
async def logout(payload: LogoutRequest, _=Depends(get_current_user)):
    return await controller.logout(get_database(), payload.refresh_token)


@router.get(
    "/me",
    response_model=MeResponse,
    summary="Obtener perfil del usuario autenticado",
    description="RN-31: incluye flag `cambiar_password` que el frontend debe respetar.",
)
async def me(user_id: str = Depends(get_current_user_id)):
    return await controller.me(get_database(), user_id)


@router.put(
    "/me/change-password",
    response_model=LogoutResponse,
    summary="Cambiar contraseña de usuario",
    description="RN-31: valida contraseña actual, valida complejidad y previene reutilización de las últimas 5.",
)
async def change_password(
    payload: ChangePasswordRequest,
    user_id: str = Depends(get_current_user_id),
):
    return await controller.change_password(get_database(), user_id, payload)



# ---------------------------------------------------------------------------
# /admin/*  — todos requieren rol Admin (RN-05, RN-07, RN-32)
# ---------------------------------------------------------------------------

@admin_router.post(
    "/users",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear usuario (ruta canónica de administración)",
    description="Equivalente a POST /auth/register. Solo Admin (RN-05).",
)
async def admin_create_user(
    payload: RegisterRequest,
    current=Depends(require_role(Role.ADMIN)),
):
    return await controller.register(get_database(), payload, current.get("sub"))


@admin_router.get(
    "/users",
    response_model=UserListResponse,
    summary="Listar todos los usuarios del sistema",
    description="Paginado. Solo Admin (RN-05). Incluye campo `bloqueado` derivado de los intentos fallidos.",
)
async def admin_list_users(
    page: int = Query(1, ge=1, description="Número de página (default: 1)"),
    limit: int = Query(20, ge=1, le=100, description="Resultados por página (max: 100)"),
    _=Depends(require_role(Role.MANAGER)),
):
    return await controller.list_users(get_database(), page, limit)


@admin_router.post(
    "/users/{user_id}/unlock",
    response_model=UnlockResponse,
    summary="Desbloquear cuenta de usuario",
    description="RN-32: solo Admin puede desbloquear cuentas bloqueadas por intentos fallidos (RN-04).",
)
async def admin_unlock_user(
    user_id: str,
    _=Depends(require_role(Role.ADMIN)),
):
    return await controller.unlock(get_database(), user_id)


@admin_router.put(
    "/users/{user_id}/role",
    response_model=ChangeRoleResponse,
    summary="Cambiar rol global de un usuario",
    description="RN-07: ningún Admin puede cambiar su propio rol. RN-08: no se puede degradar al último Admin.",
)
async def admin_change_role(
    user_id: str,
    payload: ChangeRoleRequest,
    current=Depends(require_role(Role.ADMIN)),
):
    return await controller.change_role(get_database(), current.get("sub"), user_id, payload)
