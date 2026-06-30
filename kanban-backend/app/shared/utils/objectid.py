"""Utilidades para trabajar con ObjectId de MongoDB."""
from typing import Any

from bson import ObjectId
from bson.errors import InvalidId

from app.shared.errors import APIError


def to_object_id(value: str, campo: str = "id", recurso: str = "Recurso") -> ObjectId:
    """Convierte un string a ObjectId o lanza 404 si es inválido.

    Se usa 404 (no 422) para no revelar detalles de IDs inexistentes,
    según la política de la matriz de roles/permisos.
    """
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        raise APIError(404, f"{recurso} no encontrado", campo)


def serialize(doc: dict | None) -> dict | None:
    """Convierte el _id de Mongo en un campo `id` string y serializa anidados."""
    if doc is None:
        return None
    out: dict[str, Any] = {}
    for key, value in doc.items():
        if key == "_id":
            out["id"] = str(value)
        elif isinstance(value, ObjectId):
            out[key] = str(value)
        elif isinstance(value, list):
            out[key] = [
                serialize(v) if isinstance(v, dict)
                else str(v) if isinstance(v, ObjectId)
                else v
                for v in value
            ]
        elif isinstance(value, dict):
            out[key] = serialize(value)
        else:
            out[key] = value
    return out
