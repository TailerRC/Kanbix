## Why

Kanbix requiere un sistema de autenticación y gestión de usuarios como base para todos los módulos del sistema. Sin autenticación no hay proyectos, tareas, ni acceso controlado a ningún recurso. Este módulo sienta las bases de seguridad del sistema, implementando registro, inicio de sesión, renovación de tokens y perfil de usuario.

## What Changes

- Implementar registro de usuarios con email único y hash bcrypt (RN-02, RN-03)
- Implementar login con JWT + Refresh Token (ADR-002)
- Implementar renovación de access_token mediante refresh_token
- Implementar logout invalidando el refresh_token
- Implementar endpoint de perfil del usuario autenticado (`/auth/me`)
- Bloqueo de cuenta tras 5 intentos fallidos de login por 15 minutos (RN-04)
- Asignar rol Developer por defecto al registrar (RN-05)
- Crear colecciones `users` y `refresh_tokens` en MongoDB

## Capabilities

### New Capabilities
- `user-auth`: Registro, autenticación, renovación de tokens y cierre de sesión de usuarios en Kanbix. Roles: Admin, Manager, Developer, Viewer (jerarquía RN-06).

### Modified Capabilities
*(ninguna — es el primer módulo)*

## Impact

- **Backend**: Implementar `app/modules/auth/` completo (routes, controller, service, model, schemas)
- **Modelo MongoDB**: Nueva colección `users` con campos: email, nombre_completo, password_hash, rol, activo, fecha_creacion, ultimo_acceso, login_attempts, locked_until
- **Modelo MongoDB**: Nueva colección `refresh_tokens` con campos: token, user_id, expires_at, created_at
- **Auth middleware**: Implementar dependencia de autenticación en `app/shared/middleware/auth.py`
- **Frontend**: Implementar `src/features/auth/` completo (páginas de login, registro, hooks de autenticación, API client)
- **Dependencias nuevas**: `python-jose` (JWT) y `passlib` (bcrypt) ya en requirements.txt, `bcrypt` (librería nativa)
