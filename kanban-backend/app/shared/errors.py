"""Manejo centralizado de errores con el formato estándar de los contratos.

Todos los errores devuelven la estructura:
    { "detail": "...", "campo": "...", "codigo": 400 }
El frontend lee `detail` directamente.
"""
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

HTTP_422 = 422


class APIError(Exception):
    """Excepción de negocio con código HTTP y campo opcional."""

    def __init__(self, status_code: int, detail: str, campo: str | None = None):
        self.status_code = status_code
        self.detail = detail
        self.campo = campo
        super().__init__(detail)


def _payload(detail: str, codigo: int, campo: str | None = None) -> dict:
    body = {"detail": detail, "codigo": codigo}
    if campo is not None:
        body["campo"] = campo
    return body


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(APIError)
    async def _api_error_handler(_: Request, exc: APIError):
        return JSONResponse(
            status_code=exc.status_code,
            content=_payload(exc.detail, exc.status_code, exc.campo),
        )

    @app.exception_handler(StarletteHTTPException)
    async def _http_error_handler(_: Request, exc: StarletteHTTPException):
        detail = exc.detail if isinstance(exc.detail, str) else "Error en la solicitud"
        return JSONResponse(
            status_code=exc.status_code,
            content=_payload(detail, exc.status_code),
            headers=getattr(exc, "headers", None),
        )

    @app.exception_handler(RequestValidationError)
    async def _validation_error_handler(_: Request, exc: RequestValidationError):
        first = exc.errors()[0] if exc.errors() else {}
        loc = first.get("loc", [])
        campo = str(loc[-1]) if loc else None
        msg = str(first.get("msg", "Datos inválidos"))
        return JSONResponse(
            status_code=HTTP_422,
            content=_payload(msg, HTTP_422, campo),
        )
