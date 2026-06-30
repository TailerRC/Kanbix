# Módulo 2: Proyectos y Equipos

> CRUD de proyectos, gestión de miembros del equipo y roles (Manager, Developer, Viewer) dentro de un proyecto.

---

## Endpoints

### POST /api/v1/projects

Crea un nuevo proyecto. El usuario autenticado se convierte automáticamente en Manager del proyecto. (Enterprise: requiere rol global Admin o Manager — solo estos roles pueden crear proyectos.)

**Auth:** Requiere token JWT con rol global Admin o Manager (Authorization: Bearer \<access_token\>)

#### Request Body

```json
{
  "name": "Kanbix Backend",
  "description": "Proyecto para desarrollar el backend de Kanbix"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| name | string | Sí | Nombre del proyecto (mínimo 3 caracteres) |
| description | string | No | Descripción opcional del proyecto |

#### Response — 201 Created

```json
{
  "id": "64f3a1b2c5d6e7f8a9b0c1d2",
  "name": "Kanbix Backend",
  "description": "Proyecto para desarrollar el backend de Kanbix",
  "id_creador": "64f3a1b2c5d6e7f8a9b0c1d2",
  "created_at": "2026-06-21T12:00:00Z"
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token de acceso requerido, inválido o expirado |
| 403 | Solo Admin o Manager global pueden crear proyectos |
| 422 | Datos inválidos (nombre vacío, etc.) |

---

### GET /api/v1/projects

Lista todos los proyectos donde el usuario autenticado es miembro.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Parámetros de query

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| page | integer | No | Número de página (default: 1) |
| limit | integer | No | Resultados por página (default: 20, max: 100) |

#### Response — 200 OK

```json
{
  "total": 1,
  "page": 1,
  "limit": 20,
  "data": [
    {
      "id": "64f3a1b2c5d6e7f8a9b0c1d2",
      "name": "Kanbix Backend",
      "description": "Backend de Kanbix",
      "role": "Manager",
      "member_count": 5,
      "created_at": "2026-06-21T12:00:00Z"
    }
  ]
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token de acceso requerido, inválido o expirado |

---

### GET /api/v1/projects/{project_id}

Obtiene los detalles de un proyecto específico.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Parámetros de ruta

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| project_id | string | Sí | ID del proyecto (ObjectId de MongoDB) |

#### Response — 200 OK

```json
{
  "id": "64f3a1b2c5d6e7f8a9b0c1d2",
  "name": "Kanbix Backend",
  "description": "Proyecto para desarrollar el backend de Kanbix",
  "id_creador": "64f3a1b2c5d6e7f8a9b0c1d2",
  "created_at": "2026-06-21T12:00:00Z",
  "members": [
    {
      "user_id": "64f3a1b2c5d6e7f8a9b0c1d2",
      "nombre_completo": "Juan Pérez",
      "email": "juan@example.com",
      "rol": "Manager"
    }
  ]
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token de acceso requerido, inválido o expirado |
| 403 | Usuario sin permisos para ver este proyecto |
| 404 | Proyecto no encontrado |

---

### PUT /api/v1/projects/{project_id}

Actualiza los datos de un proyecto existente. Solo el Manager puede modificar el proyecto.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Request Body

```json
{
  "name": "Kanbix Backend v2",
  "description": "Nueva descripción del proyecto"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| name | string | No | Nuevo nombre del proyecto |
| description | string | No | Nueva descripción del proyecto |

#### Response — 200 OK

```json
{
  "id": "64f3a1b2c5d6e7f8a9b0c1d2",
  "name": "Kanbix Backend v2",
  "description": "Nueva descripción del proyecto",
  "updated_at": "2026-06-22T10:00:00Z"
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token de acceso requerido, inválido o expirado |
| 403 | No tienes permisos para modificar este proyecto |
| 404 | Proyecto no encontrado |

---

### DELETE /api/v1/projects/{project_id}

Elimina un proyecto y todos sus datos asociados (tableros, tareas, sprints). Solo el Manager puede eliminar el proyecto.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Response — 200 OK

```json
{
  "message": "Proyecto eliminado exitosamente"
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token de acceso requerido, inválido o expirado |
| 403 | No tienes permisos para eliminar este proyecto |
| 404 | Proyecto no encontrado |

---

### POST /api/v1/projects/{project_id}/members

Agrega un miembro al proyecto con un rol específico. Solo el Manager puede agregar miembros.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Request Body

```json
{
  "user_id": "64f3a1b2c5d6e7f8a9b0c1d2",
  "rol": "Developer"
    }

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| user_id | string | Sí | ID del usuario a agregar |
| rol | string | Sí | Rol dentro del proyecto: Manager \| Developer \| Viewer |

#### Response — 201 Created

```json
{
  "message": "Miembro agregado exitosamente",
  "user_id": "64f3a1b2c5d6e7f8a9b0c1d2",
  "rol": "Developer"
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 400 | El usuario ya es miembro del proyecto |
| 401 | Token de acceso requerido, inválido o expirado |
| 403 | No tienes permisos para agregar miembros |
| 404 | Proyecto o usuario no encontrado |

---

### DELETE /api/v1/projects/{project_id}/members/{user_id}

Elimina un miembro del proyecto. Solo el Manager puede eliminar miembros.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Response — 200 OK

```json
{
  "message": "Miembro eliminado del proyecto exitosamente"
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token de acceso requerido, inválido o expirado |
| 403 | No tienes permisos para eliminar miembros |
| 404 | Proyecto o miembro no encontrado |

---

## Resumen de Endpoints

| # | Método | Ruta | Descripción |
|---|--------|------|-------------|
| 1 | POST | /api/v1/projects | Crear proyecto |
| 2 | GET | /api/v1/projects | Listar proyectos del usuario |
| 3 | GET | /api/v1/projects/{project_id} | Obtener detalle de proyecto |
| 4 | PUT | /api/v1/projects/{project_id} | Actualizar proyecto |
| 5 | DELETE | /api/v1/projects/{project_id} | Eliminar proyecto |
| 6 | POST | /api/v1/projects/{project_id}/members | Agregar miembro |
| 7 | DELETE | /api/v1/projects/{project_id}/members/{user_id} | Eliminar miembro |

## Formato Estándar de Errores

Todos los errores devuelven la misma estructura JSON. El frontend React debe leer el campo `detail` y mostrarlo directamente al usuario.

```json
{
  "detail": "Mensaje descriptivo del error",
  "campo": "nombre_del_campo_con_error",
  "codigo": 400
}
```
