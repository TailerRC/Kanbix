# Módulo 1: Autenticación y Usuarios

> Registro, inicio de sesión, renovación de tokens y perfil del usuario autenticado.

---

## Endpoints

### POST /api/v1/auth/register

Registra un nuevo usuario en el sistema.

**Auth:** No requiere autenticación

#### Request Body

```json
{
  "email": "usuario@example.com",
  "password": "SecureP@ss1",
  "nombre_completo": "Juan Pérez"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| email | string | Sí | Correo electrónico válido |
| password | string | Sí | Mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula y 1 número |
| nombre_completo | string | Sí | Nombre completo del usuario |

#### Response — 201 Created

```json
{
  "id": "64f3a1b2c5d6e7f8a9b0c1d2",
  "email": "usuario@example.com",
  "nombre_completo": "Juan Pérez",
  "fecha_creacion": "2026-06-21T12:00:00Z"
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 400 | El email ya está registrado |
| 422 | Datos inválidos (formato de email, longitud de password, etc.) |

---

### POST /api/v1/auth/login

Inicia sesión y devuelve tokens de acceso y refresco.

**Auth:** No requiere autenticación

#### Request Body

```json
{
  "email": "usuario@example.com",
  "password": "SecureP@ss1"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| email | string | Sí | Correo electrónico del usuario |
| password | string | Sí | Contraseña del usuario |

#### Response — 200 OK

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "dGhpcyBpcyBhIHJlZnJl...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Credenciales inválidas |
| 403 | Cuenta desactivada — contactar al administrador |

---

### POST /api/v1/auth/refresh

Renueva el `access_token` usando un `refresh_token` válido.

**Auth:** No requiere access_token; requiere refresh_token en el body

#### Request Body

```json
{
  "refresh_token": "dGhpcyBpcyBhIHJlZnJl..."
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| refresh_token | string | Sí | Token de refresco emitido en el login |

#### Response — 200 OK

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 3600
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Refresh token inválido o expirado |

---

### POST /api/v1/auth/logout

Invalida el `refresh_token` del usuario.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Request Body

```json
{
  "refresh_token": "dGhpcyBpcyBhIHJlZnJl..."
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| refresh_token | string | Sí | Token de refresco a invalidar |

#### Response — 200 OK

```json
{
  "message": "Sesión cerrada exitosamente"
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token de acceso requerido, inválido o expirado |

---

### GET /api/v1/auth/me

Obtiene el perfil del usuario autenticado.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Request Body

No requiere cuerpo en la petición.

#### Response — 200 OK

```json
{
  "id": "64f3a1b2c5d6e7f8a9b0c1d2",
  "email": "usuario@example.com",
  "nombre_completo": "Juan Pérez",
  "fecha_creacion": "2026-06-21T12:00:00Z",
  "ultimo_acceso": "2026-06-22T08:30:00Z"
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token de acceso requerido, inválido o expirado |
| 404 | Usuario no encontrado |

---

## Resumen de Endpoints

| # | Método | Ruta | Descripción |
|---|--------|------|-------------|
| 1 | POST | /api/v1/auth/register | Registrar nuevo usuario |
| 2 | POST | /api/v1/auth/login | Iniciar sesión |
| 3 | POST | /api/v1/auth/refresh | Renovar access_token |
| 4 | POST | /api/v1/auth/logout | Cerrar sesión |
| 5 | GET | /api/v1/auth/me | Obtener perfil del usuario autenticado |

## Formato Estándar de Errores

Todos los errores devuelven la misma estructura JSON. El frontend React debe leer el campo `detail` y mostrarlo directamente al usuario.

```json
{
  "detail": "Mensaje descriptivo del error",
  "campo": "nombre_del_campo_con_error",
  "codigo": 400
}
```
