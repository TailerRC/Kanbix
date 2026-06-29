"""Auth routes — endpoint declarations only."""

from fastapi import APIRouter, Depends

from app.modules.auth.controller import (
    login_controller,
    logout_controller,
    me_controller,
    refresh_controller,
    register_controller,
)
from app.modules.auth.schemas import (
    LoginRequest,
    LogoutRequest,
    MessageResponse,
    RefreshRequest,
    RefreshResponse,
    RegisterRequest,
    TokenResponse,
    UserProfileResponse,
    UserResponse,
)
from app.shared.middleware.auth import get_current_user

router = APIRouter(prefix="/api/v1/auth", tags=["Autenticación"])


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(body: RegisterRequest):
    return await register_controller(body)


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    return await login_controller(body)


@router.post("/refresh", response_model=RefreshResponse)
async def refresh(body: RefreshRequest):
    return await refresh_controller(body)


@router.post("/logout", response_model=MessageResponse)
async def logout(
    body: LogoutRequest,
    current_user: dict = Depends(get_current_user),
):
    return await logout_controller(body, current_user)


@router.get("/me", response_model=UserProfileResponse)
async def me(
    current_user: dict = Depends(get_current_user),
):
    return await me_controller(current_user)
