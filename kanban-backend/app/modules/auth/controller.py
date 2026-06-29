"""HTTP controller for auth endpoints — orchestrates service calls."""

from fastapi import HTTPException, status

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
from app.modules.auth.service import (
    authenticate_user,
    get_user_by_id,
    refresh_access_token,
    register_user,
    revoke_refresh_token,
)
from app.modules.auth.model import user_to_profile, user_to_response


async def register_controller(body: RegisterRequest) -> UserResponse:
    try:
        user = await register_user(body.email, body.password, body.nombre_completo)
        return UserResponse(**user_to_response(user))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


async def login_controller(body: LoginRequest) -> TokenResponse:
    try:
        tokens = await authenticate_user(body.email, body.password)
        return TokenResponse(**tokens)
    except ValueError as e:
        msg = str(e)
        if "bloqueada" in msg:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=msg)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=msg)


async def refresh_controller(body: RefreshRequest) -> RefreshResponse:
    try:
        result = await refresh_access_token(body.refresh_token)
        return RefreshResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


async def logout_controller(
    body: LogoutRequest,
    current_user: dict,
) -> MessageResponse:
    await revoke_refresh_token(body.refresh_token)
    return MessageResponse(message="Sesión cerrada exitosamente")


async def me_controller(current_user: dict) -> UserProfileResponse:
    user = await get_user_by_id(current_user["id"])
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    return UserProfileResponse(**user_to_profile(user))
