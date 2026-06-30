"""Orquestación HTTP del módulo Auth: traduce requests en llamadas al service."""
from app.modules.auth import service
from app.modules.auth.schemas import (
    ChangePasswordRequest,
    ChangeRoleRequest,
    LoginRequest,
    RegisterRequest,
    AdminUpdateUserRequest,
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

