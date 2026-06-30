"""Orquestación HTTP del módulo Auth: traduce requests en llamadas al service."""
from app.modules.auth import service
from app.modules.auth.schemas import (
    ChangePasswordRequest,
    ChangeRoleRequest,
    LoginRequest,
    TicketCreateRequest,
    TicketUpdateRequest,
    UserPreferencesRequest,
)


async def register(db, payload: RegisterRequest, creador_id: str) -> dict:
    return await service.create_user(db, payload, creador_id)


async def login(db, payload: LoginRequest) -> dict:
    return await service.authenticate(db, payload.email, payload.password)


async def refresh(db, refresh_token: str) -> dict:
    return await service.refresh_access_token(db, refresh_token)


async def logout(db, refresh_token: str) -> dict:
    return await service.logout(db, refresh_token)


async def me(db, user_id: str) -> dict:
    return await service.get_me(db, user_id)


async def change_password(db, user_id: str, payload: ChangePasswordRequest) -> dict:
    return await service.change_password(db, user_id, payload.current_password, payload.new_password)


async def update_profile(db, user_id: str, payload: UpdateProfileRequest) -> dict:
    return await service.update_profile(db, user_id, payload.nombre_completo, payload.email)


async def list_users(db, page: int, limit: int) -> dict:
    return await service.list_users(db, page, limit)


async def unlock(db, target_id: str) -> dict:
    return await service.unlock_user(db, target_id)


async def change_role(db, admin_id: str, target_id: str, payload: ChangeRoleRequest) -> dict:
    return await service.change_global_role(db, admin_id, target_id, payload.rol_global)


async def update_user(db, admin_id: str, target_id: str, payload: AdminUpdateUserRequest) -> dict:
    return await service.update_user_by_admin(db, admin_id, target_id, payload)


async def get_audit_logs(db, page: int, limit: int) -> dict:
    return await service.list_audit_logs(db, page, limit)


# Tickets
async def create_ticket(db, user_id: str, payload: TicketCreateRequest) -> dict:
    return await service.create_ticket(db, user_id, payload.tipo, payload.asunto, payload.descripcion)


async def list_my_tickets(db, user_id: str, page: int, limit: int) -> dict:
    return await service.list_my_tickets(db, user_id, page, limit)


async def list_all_tickets(db, page: int, limit: int) -> dict:
    return await service.list_all_tickets(db, page, limit)


async def update_ticket_status(db, ticket_id: str, admin_id: str, payload: TicketUpdateRequest) -> dict:
    return await service.update_ticket_status(db, ticket_id, admin_id, payload.estado, payload.nota_resolucion)


# Preferencias
async def get_preferences(db, user_id: str) -> dict:
    return await service.get_user_preferences(db, user_id)


async def update_preferences(db, user_id: str, payload: UserPreferencesRequest) -> dict:
    return await service.update_user_preferences(db, user_id, payload)

