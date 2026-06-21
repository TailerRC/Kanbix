from enum import Enum

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.security import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


class Role(str, Enum):
    """RN-06: jerarquía de roles Admin > Manager > Developer > Viewer."""
    ADMIN = "Admin"
    MANAGER = "Manager"
    DEVELOPER = "Developer"
    VIEWER = "Viewer"


ROLE_HIERARCHY = {
    Role.ADMIN: 4,
    Role.MANAGER: 3,
    Role.DEVELOPER: 2,
    Role.VIEWER: 1,
}


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """RN-01: solo usuarios autenticados pueden acceder a recursos protegidos."""
    payload = decode_token(token)
    if payload is None or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload


def require_role(minimum_role: Role):
    """Dependency factory: exige que el usuario tenga al menos cierto rol."""

    async def role_checker(current_user: dict = Depends(get_current_user)) -> dict:
        user_role = Role(current_user.get("role", Role.VIEWER))
        if ROLE_HIERARCHY[user_role] < ROLE_HIERARCHY[minimum_role]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requiere rol {minimum_role.value} o superior",
            )
        return current_user

    return role_checker
