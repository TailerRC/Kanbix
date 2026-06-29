# ADR-005: FastAPI + Motor como backend stack

**Estado:** Aceptado · **Fecha:** 2026-06-21

---

## Contexto**

El backend necesita ser async, con tipado fuerte, generación automática de OpenAPI y drivers nativos async para MongoDB. Alternativas:

- **Django + Django REST Framework**: maduro, baterías incluidas, pero síncrono por defecto
- **Flask + extensions**: minimalista, pero sin tipado nativo ni async
- **FastAPI + Pydantic + Motor**: async nativo, validación Pydantic, OpenAPI automático, driver async de MongoDB

## Decisión

Se usa **FastAPI** como framework web, **Pydantic** para modelos de datos y validación, y **Motor** como driver async de MongoDB.

- Los modelos de request/response se definen con Pydantic (validación + documentación automática)
- FastAPI genera `/openapi.json` y `/docs` automáticamente desde los modelos Pydantic
- Motor permite operaciones no bloqueantes sobre MongoDB, alineado con el event loop de FastAPI
- Los endpoints se organizan por módulo en routers separados

## Consecuencias

### Positivas
- OpenAPI generado automáticamente: el frontend puede generar tipos TypeScript desde el contrato
- Async en toda la pila: múltiples requests concurrentes sin degradación
- Pydantic valida tipos en runtime + documenta automáticamente los endpoints
- FastAPI tiene soporte nativo de WebSockets, necesario para el Módulo 5

### Negativas
- FastAPI es más reciente que Django/Flask, ecosistema más pequeño
- Motor es menos popular que PyMongo (síncrono), menos ejemplos disponibles
- Python async tiene curva de aprendizaje si el equipo viene de código síncrono
- Las aggregation pipelines complejas son más difíciles de depurar en Motor que en MongoDB shell
