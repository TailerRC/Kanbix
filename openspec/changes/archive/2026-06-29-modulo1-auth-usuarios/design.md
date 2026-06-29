## Context

Kanbix necesita un sistema de autenticación stateless para una API REST. El backend usa FastAPI + Motor (async MongoDB), el frontend React + Vite + TypeScript. Se elige JWT con refresh tokens (ADR-002) para mantener la API stateless en requests regulares, con la capacidad de invalidar sesiones en logout.

El módulo auth es la base de todos los demás módulos — sin autenticación no hay acceso al sistema (RN-01).

## Goals / Non-Goals

**Goals:**
- Registro de usuarios con email único y hash bcrypt
- Login con JWT access_token (30min) + refresh_token (7d)
- Renovación silenciosa de access_token via refresh_token
- Logout invalidando refresh_token en BD
- Perfil del usuario autenticado (`/auth/me`)
- Bloqueo temporal tras 5 intentos fallidos de login (RN-04)
- Asignación automática de rol Developer al registrar (RN-05)
- Middleware de autenticación reutilizable para otros módulos
- Frontend: páginas de login, registro, manejo de tokens y ruteo protegido

**Non-Goals:**
- CRUD de usuarios (cambiar rol, eliminar usuarios) — se hará en Módulo 2
- Recuperación de contraseña — fuera de scope inicial
- OAuth social (Google, GitHub) — fuera de scope inicial
- 2FA / MFA — fuera de scope inicial

## Decisions

### 1. JWT con Access + Refresh Token
**Decisión:** Access token de 30 minutos, refresh token de 7 días almacenado en MongoDB.
**Alternativa considerada:** Sessions con cookies — se descarta por requerir estado en servidor.
**Alternativa considerada:** JWT único de larga duración — se descarta por seguridad (no se puede invalidar).
**Rationale:** Stateless para requests normales, el refresh token en BD permite invalidación en logout.

### 2. Estructura del módulo (Vertical Slicing)
**Decisión:** Cada archivo tiene una responsabilidad: routes (declaración), controller (orquestación HTTP), service (lógica de negocio), model (MongoDB), schemas (Pydantic).
**Rationale:** Consistencia con la arquitectura definida en AGENTS.md y sdd-docs.

### 3. Middleware de autenticación en shared
**Decisión:** El decorador/dependencia `get_current_user` vive en `app/shared/middleware/auth.py`.
**Rationale:** Es código reutilizable compartido entre todos los módulos, no lógica de negocio de auth.

### 4. Bloqueo de cuenta en la colección users
**Decisión:** Los campos `login_attempts` (int) y `locked_until` (datetime) se almacenan directamente en el documento del usuario.
**Rationale:** Evita una colección separada, es atómico, y el bloqueo se verifica en el mismo query de login.

### 5. Refresh token como documento independiente
**Decisión:** Colección separada `refresh_tokens` con referencia al user_id.
**Rationale:** Un usuario puede tener múltiples sesiones activas. Al hacer logout se elimina solo el token específico, no todos.

## Architecture

### Backend — Flujo de Autenticación

```
Cliente                    FastAPI                     MongoDB
  │                          │                           │
  │  POST /auth/register     │                           │
  │ ──────────────────────►  │  INSERT user (bcrypt)     │
  │  ◄────────────────────── │ ◄──────────────────────── │
  │    201 + user data       │                           │
  │                          │                           │
  │  POST /auth/login        │                           │
  │ ──────────────────────►  │  FIND user by email       │
  │                          │ ────────────────────────► │
  │                          │  VERIFY password (bcrypt) │
  │                          │  INSERT refresh_token     │
  │                          │ ────────────────────────► │
  │  ◄────────────────────── │                           │
  │    access + refresh      │                           │
  │                          │                           │
  │  GET /auth/me            │                           │
  │  Authorization: Bearer   │                           │
  │ ──────────────────────►  │  DECODE JWT (stateless)   │
  │  ◄────────────────────── │                           │
  │    user profile          │                           │
```

### Modelo de Datos

**Colección `users`:**
```json
{
  "_id": "ObjectId",
  "email": "usuario@example.com",
  "nombre_completo": "Juan Pérez",
  "password_hash": "$2b$12$...",
  "rol": "Developer",
  "activo": true,
  "fecha_creacion": "2026-06-21T12:00:00Z",
  "ultimo_acceso": "2026-06-22T08:30:00Z",
  "login_attempts": 0,
  "locked_until": null
}
```

**Colección `refresh_tokens`:**
```json
{
  "_id": "ObjectId",
  "token": "hashed_token_value",
  "user_id": "ObjectId",
  "expires_at": "2026-06-29T12:00:00Z",
  "created_at": "2026-06-22T12:00:00Z"
}
```

### Frontend — Flujo

```
[Login Page] ──login──► [AuthContext] ──store tokens──► [localStorage]
                              │
                              ▼
                   [Axios Interceptor]
                   Lee token del storage
                   Lo agrega a cada request
                              │
                         [401?] ──sí──► [Refresh Token]
                              │               │
                              no          [éxito?] ──no──► [Logout]
                                             │
                                           [renueva access_token]
                                           [reintenta request original]
```

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|-----------|
| Access_token robado: ventana de 30min de exposición | Refresh token en BD permite rotación; duración reducida de access_token limita daño |
| Refresh_token robado: acceso prolongado | Se invalida en logout; en futuras versiones agregar rotación de refresh tokens |
| MongoDB latency en login (verificar bloqueo + password + insert refresh) | Solo 3 operaciones; MongoDB Atlas con réplica set garantiza baja latencia |
| Frontend: refresh race condition (múltiples requests 401 simultáneos) | Cola de refrescos: solo un refresh a la vez, los demás esperan |
| Frontend: perder tokens al recargar pestaña | Almacenar en localStorage o sessionStorage; AuthContext se rehidrata al montar |

## Frontend Structure

```
src/features/auth/
├── api/
│   └── authApi.ts          # Llamadas HTTP: register, login, refresh, logout, getMe
├── pages/
│   ├── LoginPage.tsx       # Formulario de inicio de sesión
│   └── RegisterPage.tsx    # Formulario de registro
├── hooks/
│   ├── useAuth.ts          # Hook principal: login, logout, register, user, isAuthenticated
│   └── useAuthGuard.ts     # Redirección si no está autenticado
└── components/
    └── ProtectedRoute.tsx   # Wrapper para rutas que requieren auth
```

## Open Questions

- Ninguna por ahora — el contrato, ADRs y reglas de negocio cubren todos los casos.
