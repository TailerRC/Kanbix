# Módulo 3: Tableros, Columnas y Tareas

> Gestión de tableros Kanban, columnas, tareas, movimientos entre columnas y comentarios.

---

## Endpoints

### POST /api/v1/projects/{project_id}/boards

Crea un nuevo tablero Kanban dentro de un proyecto.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Parámetros de ruta

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| project_id | string | Sí | ID del proyecto (ObjectId de MongoDB) |

#### Request Body

```json
{
  "name": "Sprint 5",
  "description": "Tablero del Sprint 5"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| name | string | Sí | Nombre del tablero |
| description | string | No | Descripción opcional del tablero |

#### Response — 201 Created

```json
{
  "id": "64f3a1b2c5d6e7f8a9b0c1d2",
  "project_id": "64f3a1b2c5d6e7f8a9b0c1d2",
  "name": "Sprint 5",
  "description": "Tablero del Sprint 5",
  "created_at": "2026-06-21T12:00:00Z"
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token de acceso requerido, inválido o expirado |
| 403 | Sin permisos para crear tableros en este proyecto |
| 404 | Proyecto no encontrado |

---

### GET /api/v1/projects/{project_id}/boards

Lista todos los tableros de un proyecto.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Response — 200 OK

```json
[
  {
    "id": "64f3a1b2c5d6e7f8a9b0c1d2",
    "name": "Sprint 5",
    "description": "Tablero del Sprint 5",
    "column_count": 4,
    "created_at": "2026-06-21T12:00:00Z"
  }
]
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token de acceso requerido, inválido o expirado |
| 404 | Proyecto no encontrado |

---

### GET /api/v1/projects/{project_id}/boards/{board_id}

Obtiene un tablero con todas sus columnas y tareas.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Response — 200 OK

```json
{
  "id": "64f3a1b2c5d6e7f8a9b0c1d2",
  "name": "Sprint 5",
  "columns": [
    {
      "id": "64f3a1b2c5d6e7f8a9b0c333",
      "name": "To Do",
      "position": 1,
      "tasks": [
        {
          "id": "64f3a1b2c5d6e7f8a9b0c444",
          "title": "Implementar login",
          "assignee": "Juan Pérez",
          "priority": "Alta",
          "due_date": "2026-06-30T18:00:00Z",
          "sprint_id": "64f3a..."
        }
      ]
    }
  ]
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token de acceso requerido, inválido o expirado |
| 404 | Tablero o proyecto no encontrado |

---

### PUT /api/v1/projects/{project_id}/boards/{board_id}

Actualiza el nombre o descripción de un tablero.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Request Body

```json
{
  "name": "Sprint 5 — Corregido",
  "description": "Nueva descripción"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| name | string | No | Nuevo nombre del tablero |
| description | string | No | Nueva descripción |

#### Response — 200 OK

```json
{
  "id": "64f3a1b2c5d6e7f8a9b0c1d2",
  "name": "Sprint 5 — Corregido",
  "updated_at": "2026-06-22T10:00:00Z"
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token de acceso requerido, inválido o expirado |
| 403 | Sin permisos para modificar este tablero |
| 404 | Tablero no encontrado |

---

### DELETE /api/v1/projects/{project_id}/boards/{board_id}

Elimina un tablero y todas sus tareas.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Response — 200 OK

```json
{
  "message": "Tablero eliminado exitosamente"
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token de acceso requerido, inválido o expirado |
| 403 | Sin permisos para eliminar este tablero |
| 404 | Tablero no encontrado |

---

### POST /api/v1/boards/{board_id}/columns

Crea una nueva columna en un tablero.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Request Body

```json
{
  "name": "En Progreso",
  "position": 2
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| name | string | Sí | Nombre de la columna |
| position | integer | Sí | Posición ordinal dentro del tablero |

#### Response — 201 Created

```json
{
  "id": "64f3a1b2c5d6e7f8a9b0c555",
  "board_id": "64f3a1b2c5d6e7f8a9b0c1d2",
  "name": "En Progreso",
  "position": 2
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token de acceso requerido, inválido o expirado |
| 404 | Tablero no encontrado |
| 409 | Ya existe una columna en esa posición |

---

### PUT /api/v1/boards/{board_id}/columns/{column_id}

Actualiza el nombre o posición de una columna.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Request Body

```json
{
  "name": "En Revisión",
  "position": 3
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| name | string | No | Nuevo nombre |
| position | integer | No | Nueva posición |

#### Response — 200 OK

```json
{
  "id": "64f3a1b2c5d6e7f8a9b0c555",
  "name": "En Revisión",
  "position": 3
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token de acceso requerido, inválido o expirado |
| 404 | Columna no encontrada |

---

## Tareas

### GET /api/v1/projects/{project_id}/tasks

Obtiene todas las tareas de un proyecto para renderizar el tablero. Devuelve las tareas con su posición fraccional para soportar drag & drop sin reordenar toda la lista.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Parámetros de ruta

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| project_id | string | Sí | ID del proyecto (ObjectId de MongoDB) |

#### Response — 200 OK

```json
[
  {
    "id": "64f3a1b2c5d6e7f8a9b0c1d2",
    "project_id": "88f3a1b2c5d6e7f8a9b0c999",
    "title": "Configurar MongoDB",
    "status": "To Do",
    "position": 65536.0,
    "assignee_id": null
  }
]
```

> El campo `position` usa índices fraccionales (p.ej. 65536.0) para que el frontend pueda calcular nuevas posiciones al mover tarjetas sin reordenar toda la lista.

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token de acceso requerido, inválido o expirado |
| 403 | Usuario sin permisos para ver este proyecto |
| 404 | Proyecto no encontrado |

---

### POST /api/v1/boards/{board_id}/tasks

Crea una nueva tarea dentro de una columna. Calcula automáticamente su posición al final de la columna elegida.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Request Body

```json
{
  "title": "Implementar login con JWT",
  "description": "Crear el endpoint de autenticación usando JWT",
  "column_id": "64f3a1b2c5d6e7f8a9b0c333",
  "priority": "Alta",
  "assignee_id": "64f3a1b2c5d6e7f8a9b0c1d2",
  "due_date": "2026-06-30T18:00:00Z",
  "sprint_id": "64f3a...",
  "tags": ["backend", "auth"]
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| title | string | Sí | Título de la tarea |
| description | string | No | Descripción detallada |
| column_id | string | No | ID de la columna destino (default: primera columna) |
| priority | string | No | `Baja` \| `Media` \| `Alta` \| `Crítica` (default: Media) |
| assignee_id | string | No | ID del usuario asignado |
| due_date | string | No | Fecha límite en ISO 8601 UTC |
| sprint_id | string | No | ID del sprint al que pertenece la tarea |
| tags | array[string] | No | Etiquetas para clasificación |

#### Response — 201 Created

```json
{
  "id": "64f3a1b2c5d6e7f8a9b0c444",
  "board_id": "64f3a1b2c5d6e7f8a9b0c1d2",
  "column_id": "64f3a1b2c5d6e7f8a9b0c333",
  "title": "Implementar login con JWT",
  "priority": "Alta",
  "status": "To Do",
  "created_at": "2026-06-21T12:00:00Z"
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 400 | Dato faltante u obligatorio no provisto |
| 401 | Token de acceso requerido, inválido o expirado |
| 404 | Tablero o columna no encontrada |
| 422 | Datos inválidos (ej. `status` no válido) |

---

### PUT /api/v1/tasks/{task_id}

Actualiza los campos de una tarea (título, descripción, prioridad, etc.).

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Request Body

```json
{
  "title": "Implementar login con JWT + Refresh Token",
  "description": "Incluir también la lógica de refresh token",
  "assignee_id": "64f3a1b2c5d6e7f8a9b0c1d2",
  "priority": "Alta",
  "sprint_id": "64f3a..."
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| title | string | No | Nuevo título |
| description | string | No | Nueva descripción |
| priority | string | No | `Baja` \| `Media` \| `Alta` \| `Crítica` |
| assignee_id | string | No | Cambiar asignado |
| due_date | string | No | Cambiar fecha límite |
| sprint_id | string | No | Cambiar el sprint de la tarea |

#### Response — 200 OK

```json
{
  "id": "64f3a1b2c5d6e7f8a9b0c444",
  "title": "Implementar login con JWT + Refresh Token",
  "assignee_id": "64f3a1b2c5d6e7f8a9b0c1d2",
  "updated_at": "2026-06-22T10:00:00Z"
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token de acceso requerido, inválido o expirado |
| 404 | Tarea o usuario asignado no encontrados |
| 422 | Datos con formato incorrecto |

---

### PATCH /api/v1/tasks/{task_id}/move

Mueve una tarea a otra columna (cambio de estado) usando índices fraccionales para soportar drag & drop.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Request Body

```json
{
  "status": "In Progress",
  "position": 98304.5
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| status | string | No | Nueva columna. Si se omite, mueve en la misma columna |
| position | float | Sí | Nuevo valor de posición calculado por el frontend tras soltar la tarjeta |

#### Response — 200 OK

```json
{
  "id": "64f3a1b2c5d6e7f8a9b0c444",
  "column_id": "64f3a1b2c5d6e7f8a9b0c555",
  "status": "In Progress",
  "position": 98304.5
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token de acceso requerido, inválido o expirado |
| 403 | Usuario sin permisos para modificar esta tarea |
| 404 | Tarea o columna no encontrada |
| 409 | Conflicto de posición (requiere recalibración de índices) |

---

### DELETE /api/v1/tasks/{task_id}

Elimina una tarea del tablero de forma permanente.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Response — 200 OK

```json
{
  "message": "Tarea eliminada correctamente"
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token de acceso requerido, inválido o expirado |
| 403 | Sin permisos para eliminar esta tarea |
| 404 | Tarea no encontrada |

---

### POST /api/v1/tasks/{task_id}/comments

Agrega un comentario a una tarea.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Request Body

```json
{
  "content": "@Ana revisa la implementación del refresh token"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| content | string | Sí | Texto del comentario (soporta menciones @usuario) |

#### Response — 201 Created

```json
{
  "id": "64f3a1b2c5d6e7f8a9b0c666",
  "task_id": "64f3a1b2c5d6e7f8a9b0c444",
  "author_id": "64f3a1b2c5d6e7f8a9b0c1d2",
  "content": "@Ana revisa la implementación del refresh token",
  "created_at": "2026-06-21T14:00:00Z"
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token de acceso requerido, inválido o expirado |
| 404 | Tarea no encontrada |
| 422 | Contenido vacío o excede el máximo de caracteres |

---

### GET /api/v1/tasks/{task_id}/comments

Obtiene todos los comentarios de una tarea, ordenados por fecha de creación.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Response — 200 OK

```json
[
  {
    "id": "64f3a1b2c5d6e7f8a9b0c666",
    "author": "Juan Pérez",
    "content": "@Ana revisa la implementación del refresh token",
    "created_at": "2026-06-21T14:00:00Z"
  }
]
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token de acceso requerido, inválido o expirado |
| 404 | Tarea no encontrada |

---

## Resumen de Endpoints

| # | Método | Ruta | Descripción |
|---|--------|------|-------------|
| 1 | POST | /api/v1/projects/{project_id}/boards | Crear tablero |
| 2 | GET | /api/v1/projects/{project_id}/boards | Listar tableros |
| 3 | GET | /api/v1/projects/{project_id}/boards/{board_id} | Obtener tablero con columnas y tareas |
| 4 | PUT | /api/v1/projects/{project_id}/boards/{board_id} | Actualizar tablero |
| 5 | DELETE | /api/v1/projects/{project_id}/boards/{board_id} | Eliminar tablero |
| 6 | POST | /api/v1/boards/{board_id}/columns | Crear columna |
| 7 | PUT | /api/v1/boards/{board_id}/columns/{column_id} | Actualizar columna |
| 8 | GET | /api/v1/projects/{project_id}/tasks | Listar todas las tareas del proyecto |
| 9 | POST | /api/v1/boards/{board_id}/tasks | Crear tarea |
| 10 | PUT | /api/v1/tasks/{task_id} | Actualizar tarea |
| 11 | PATCH | /api/v1/tasks/{task_id}/move | Mover tarea entre columnas |
| 12 | DELETE | /api/v1/tasks/{task_id} | Eliminar tarea |
| 13 | POST | /api/v1/tasks/{task_id}/comments | Agregar comentario |
| 14 | GET | /api/v1/tasks/{task_id}/comments | Listar comentarios |

## Formato Estándar de Errores

Todos los errores devuelven la misma estructura JSON. El frontend React debe leer el campo `detail` y mostrarlo directamente al usuario.

```json
{
  "detail": "Mensaje descriptivo del error",
  "campo": "nombre_del_campo_con_error",
  "codigo": 400
}
```