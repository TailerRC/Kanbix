# Módulo 1: Autenticación y Usuarios

> **Modo Enterprise activo:** El auto-registro público está deshabilitado (RN-34). Las cuentas las crea exclusivamente un Admin mediante endpoint administrado. El inicio de sesión fuerza el cambio de contraseña en primer ingreso y verifica expiración (RN-31).
>
> Registro, inicio de sesión, renovación de tokens, perfil del usuario autenticado y administración de cuentas.

---

## Endpoints

### POST /api/v1/auth/register

Registra un nuevo usuario en el sistema. (Enterprise: endpoint restringido a Admin — auto-registro público deshabilitado.)

**Auth:** Requiere token JWT con rol Admin (Authorization: Bearer \<access_token\>)

#### Request Body

```json
{
  "email": "usuario@example.com",
  "password": "SecureP@ss1",
  "nombre_completo": "Juan Pérez",
  "rol_global": "Developer"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| email | string | Sí | Correo electrónico válido |
| password | string | Sí | Mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula y 1 número |
| nombre_completo | string | Sí | Nombre completo del usuario |
| rol_global | string | Sí | Rol global: Admin, Manager o Developer (ver matriz de roles) |

#### Response — 201 Created

```json
{
  "id": "64f3a1b2c5d6e7f8a9b0c1d2",
  "email": "usuario@example.com",
  "nombre_completo": "Juan Pérez",
  "rol_global": "Developer",
  "fecha_creacion": "2026-06-21T12:00:00Z"
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 400 | El email ya está registrado |
| 401 | Token de acceso requerido, inválido o expirado |
| 403 | Solo un Admin puede crear usuarios |
| 422 | Datos inválidos (formato de email, longitud de password, etc.) |

---

### POST /api/v1/auth/login

Inicia sesión y devuelve tokens de acceso y refresco. Si es el primer inicio de sesión o la contraseña expiró, el sistema fuerza el cambio de contraseña (RF15, RF16).

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
  "expires_in": 3600,
  "cambiar_password": true
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
  "rol_global": "Developer",
  "cambiar_password": true,
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

### POST /api/v1/admin/users

Crea un nuevo usuario en el sistema. Ruta canónica de administración (Enterprise). Equivalente a `/auth/register`.

**Auth:** Requiere token JWT con rol Admin (Authorization: Bearer \<access_token\>)

#### Request Body

```json
{
  "email": "usuario@example.com",
  "password": "SecureP@ss1",
  "nombre_completo": "Juan Pérez",
  "rol_global": "Developer"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| email | string | Sí | Correo electrónico válido |
| password | string | Sí | Mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula y 1 número |
| nombre_completo | string | Sí | Nombre completo del usuario |
| rol_global | string | Sí | Rol global: Admin, Manager o Developer (ver matriz de roles) |

#### Response — 201 Created

```json
{
  "id": "64f3a1b2c5d6e7f8a9b0c1d2",
  "email": "usuario@example.com",
  "nombre_completo": "Juan Pérez",
  "rol_global": "Developer",
  "fecha_creacion": "2026-06-21T12:00:00Z"
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 400 | El email ya está registrado |
| 401 | Token de acceso requerido, inválido o expirado |
| 403 | Solo un Admin puede crear usuarios |
| 422 | Datos inválidos (formato de email, longitud de password, rol inválido, etc.) |

---

### GET /api/v1/admin/users

Lista todos los usuarios del sistema con paginación.

**Auth:** Requiere token JWT con rol Admin (Authorization: Bearer \<access_token\>)

#### Parámetros de query

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| page | integer | No | Número de página (default: 1) |
| limit | integer | No | Resultados por página (default: 20, max: 100) |

#### Response — 200 OK

```json
{
  "total": 10,
  "page": 1,
  "limit": 20,
  "data": [
    {
      "id": "64f3a1b2c5d6e7f8a9b0c1d2",
      "email": "usuario@example.com",
      "nombre_completo": "Juan Pérez",
      "rol_global": "Developer",
      "activo": true,
      "fecha_creacion": "2026-06-21T12:00:00Z",
      "ultimo_acceso": "2026-06-22T08:30:00Z"
    }
  ]
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token de acceso requerido, inválido o expirado |
| 403 | Solo un Admin puede listar usuarios |

---

### POST /api/v1/admin/users/{id}/unlock

Desbloquea la cuenta de un usuario que fue bloqueada por superar los 5 intentos fallidos de inicio de sesión (RN-33).

**Auth:** Requiere token JWT con rol Admin (Authorization: Bearer \<access_token\>)

#### Parámetros de ruta

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| id | string | Sí | ID del usuario a desbloquear (ObjectId de MongoDB) |

#### Response — 200 OK

```json
{
  "message": "Cuenta desbloqueada exitosamente",
  "user_id": "64f3a1b2c5d6e7f8a9b0c1d2"
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token de acceso requerido, inválido o expirado |
| 403 | Solo un Admin puede desbloquear cuentas |
| 404 | Usuario no encontrado |

---

### PUT /api/v1/admin/users/{id}/role

Cambia el rol global de un usuario (Admin, Manager o Developer). No permite que un Admin se cambie su propio rol a sí mismo para evitar dejar el sistema sin administradores.

**Auth:** Requiere token JWT con rol Admin (Authorization: Bearer \<access_token\>)

#### Parámetros de ruta

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| id | string | Sí | ID del usuario (ObjectId de MongoDB) |

#### Request Body

```json
{
  "rol_global": "Manager"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| rol_global | string | Sí | Nuevo rol global: Admin, Manager o Developer |

#### Response — 200 OK

```json
{
  "message": "Rol global actualizado exitosamente",
  "user_id": "64f3a1b2c5d6e7f8a9b0c1d2",
  "rol_global": "Manager"
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 400 | No puedes cambiar tu propio rol |
| 401 | Token de acceso requerido, inválido o expirado |
| 403 | Solo un Admin puede cambiar roles globales |
| 404 | Usuario no encontrado |
| 422 | Rol inválido (debe ser Admin, Manager o Developer) |

---

## Resumen de Endpoints

| # | Método | Ruta | Auth | Descripción |
|---|--------|------|:----:|-------------|
| 1 | POST | /api/v1/auth/register | Admin | Crear nuevo usuario (Enterprise — solo Admin) |
| 2 | POST | /api/v1/auth/login | Público | Iniciar sesión |
| 3 | POST | /api/v1/auth/refresh | Público¹ | Renovar access_token |
| 4 | POST | /api/v1/auth/logout | Usuario | Cerrar sesión |
| 5 | GET | /api/v1/auth/me | Usuario | Obtener perfil del usuario autenticado |
| 6 | POST | /api/v1/admin/users | Admin | Crear usuario (alternativa a register) |
| 7 | GET | /api/v1/admin/users | Admin | Listar todos los usuarios del sistema |
| 8 | POST | /api/v1/admin/users/{id}/unlock | Admin | Desbloquear cuenta de usuario |
| 9 | PUT | /api/v1/admin/users/{id}/role | Admin | Cambiar rol global de un usuario |

¹ Requiere refresh_token en el body, no access_token.

## Formato Estándar de Errores

Todos los errores devuelven la misma estructura JSON. El frontend React debe leer el campo `detail` y mostrarlo directamente al usuario.

```json
{
  "detail": "Mensaje descriptivo del error",
  "campo": "nombre_del_campo_con_error",
  "codigo": 400
}
```
