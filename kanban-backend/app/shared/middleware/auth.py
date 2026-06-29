"""Auth middleware — reusable dependency for all modules.

Usage in any route:
    from app.shared.middleware.auth import get_current_user

    @router.get("/protected")
    async def handler(current_user: dict = Depends(get_current_user)):
        ...
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import decode_token
from app.modules.auth.service import get_user_by_id

security_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
) -> dict:
    """Decode JWT and return the current user dict.

    Raises 401 if token is missing, invalid, or expired.
    """
    token = credentials.credentials
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de acceso requerido, inválido o expirado",
        )

    user = await get_user_by_id(payload["sub"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de acceso requerido, inválido o expirado",
        )

    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "nombre_completo": user["nombre_completo"],
        "rol": user["rol"],
    }
