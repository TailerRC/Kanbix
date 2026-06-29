# ADR-002: Autenticación con JWT y Refresh Tokens

**Estado:** Aceptado · **Fecha:** 2026-06-21

---

## Contexto

El sistema necesita autenticar usuarios en una API REST stateless. Las alternativas consideradas:

- **Sessions con cookies**: el servidor almacena la sesión en memoria o Redis, el cliente envía un cookie ID
- **JWT sin refresh**: un solo token de larga duración (7-30 días)
- **JWT + refresh tokens**: token corto (1h) para acceso + token largo (7d) para renovación

## Decisión

Se usa **JWT con access_token (1h) + refresh_token (7d)**.

- El access_token se envía en header `Authorization: Bearer <token>` en cada request
- El refresh_token se envía en el body de `POST /auth/refresh` para obtener un nuevo access_token
- El refresh_token se invalida en `POST /auth/logout` (se elimina de la base de datos)

## Consecuencias

### Positivas
- Stateless para requests regulares (1h): no hay que consultar BD en cada request para validar la sesión
- Si un access_token se filtra, expira en 1h como máximo
- Refresh token permite sesiones persistentes sin pedir credenciales de nuevo
- Invalidation en logout evita refresh token reutilizable

### Negativas
- Completitud: hay que implementar la lógica de refresh + blacklist de refresh tokens
- El frontend debe manejar renovación silenciosa de tokens (interceptar 401, refrescar, reintentar)
- Los refresh tokens en BD agregan latencia al login/logout
