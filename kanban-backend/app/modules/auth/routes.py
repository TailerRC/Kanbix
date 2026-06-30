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
    AdminUpdateUserRequest,
    UserListItem,
    AuditLogListResponse,
    UpdateProfileRequest,
    TicketCreateRequest,
    TicketUpdateRequest,
    TicketResponse,
    TicketListResponse,
    UserPreferencesRequest,
    UserPreferencesResponse,
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

@router.patch(
    "/me",
    response_model=MeResponse,
    summary="Actualizar perfil propio",
    description="Permite al usuario autenticado actualizar su nombre completo y/o correo.",
)
async def update_profile(
    payload: UpdateProfileRequest,
    user_id: str = Depends(get_current_user_id),
):
    return await controller.update_profile(get_database(), user_id, payload)


@router.get(
    "/preferences",
    response_model=UserPreferencesResponse,
    summary="Obtener preferencias de notificación",
    description="Obtiene las preferencias de alertas del usuario autenticado.",
)
async def get_preferences(
    user_id: str = Depends(get_current_user_id),
):
    return await controller.get_preferences(get_database(), user_id)


@router.patch(
    "/preferences",
    response_model=UserPreferencesResponse,
    summary="Actualizar preferencias de notificación",
    description="Actualiza las preferencias de alertas del usuario autenticado.",
)
async def update_preferences(
    payload: UserPreferencesRequest,
    user_id: str = Depends(get_current_user_id),
):
    return await controller.update_preferences(get_database(), user_id, payload)



# ---------------------------------------------------------------------------
# /tickets/* — cualquier usuario autenticado
# ---------------------------------------------------------------------------

ticket_router = APIRouter(prefix="/tickets", tags=["Tickets de Soporte"])


@ticket_router.post(
    "",
    response_model=TicketResponse,
    status_code=201,
    summary="Crear ticket de soporte",
    description="Cualquier usuario autenticado puede abrir un ticket al equipo TI (Admin).",
)
async def create_ticket(
    payload: TicketCreateRequest,
    user_id: str = Depends(get_current_user_id),
):
    return await controller.create_ticket(get_database(), user_id, payload)


@ticket_router.get(
    "",
    response_model=TicketListResponse,
    summary="Listar mis tickets",
    description="Lista los tickets propios del usuario autenticado.",
)
async def list_my_tickets(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user_id: str = Depends(get_current_user_id),
):
    return await controller.list_my_tickets(get_database(), user_id, page, limit)


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
    _=Depends(require_role(Role.ADMIN)),
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


@admin_router.put(
    "/users/{user_id}",
    response_model=UserListItem,
    summary="Actualizar información completa del usuario por el administrador",
    description="Permite modificar nombre, correo, estado activo/inactivo, contraseña y rol global (solo Admin).",
)
async def admin_update_user(
    user_id: str,
    payload: AdminUpdateUserRequest,
    current=Depends(require_role(Role.ADMIN)),
):
    return await controller.update_user(get_database(), current.get("sub"), user_id, payload)


@admin_router.get(
    "/logs",
    response_model=AuditLogListResponse,
    summary="Obtener la bitácora de logs de auditoría del sistema",
    description="Paginado. Solo accesible para administradores (RN-33)."
)
async def admin_get_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    _=Depends(require_role(Role.ADMIN))
):
    return await controller.get_audit_logs(get_database(), page, limit)


@admin_router.get(
    "/tickets",
    response_model=TicketListResponse,
    summary="Listar todos los tickets de soporte",
    description="Solo Admin puede ver todos los tickets del sistema.",
)
async def admin_list_tickets(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    _=Depends(require_role(Role.ADMIN)),
):
    return await controller.list_all_tickets(get_database(), page, limit)


@admin_router.patch(
    "/tickets/{ticket_id}",
    response_model=TicketResponse,
    summary="Actualizar estado de un ticket",
    description="Admin marca el ticket como EN_REVISION, RESUELTO o CERRADO y puede dejar una nota.",
)
async def admin_update_ticket(
    ticket_id: str,
    payload: TicketUpdateRequest,
    current=Depends(require_role(Role.ADMIN)),
):
    return await controller.update_ticket_status(get_database(), ticket_id, current.get("sub"), payload)
