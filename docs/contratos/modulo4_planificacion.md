# Módulo 4: Planificación y Asignaciones

> Gestión de Sprints, asignación de fechas límite, estimaciones, subtareas, dependencias entre tareas y consulta de carga de trabajo del equipo.

---

## Endpoints

### PUT /api/v1/tasks/{task_id}/planning

Establece o actualiza los parámetros temporales y de esfuerzo para la planificación de una tarea.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Parámetros de ruta

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| task_id | string | Sí | ID de la tarea (ObjectId de MongoDB) |

#### Request Body

```json
{
  "due_date": "2026-06-30T18:00:00Z",
  "story_points": 5
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| due_date | string | No | Fecha y hora límite en formato ISO 8601 UTC |
| story_points | integer | No | Puntos de historia (escala Fibonacci: 1, 2, 3, 5, 8, 13) |

#### Response — 200 OK

```json
{
  "id": "64f3a1b2c5d6e7f8a9b0c1d2",
  "due_date": "2026-06-30T18:00:00Z",
  "story_points": 5,
  "status": "To Do"
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token de acceso requerido, inválido o expirado |
| 404 | Tarea no encontrada |
| 422 | Formato de fecha inválido o story_points fuera de la escala Fibonacci |

---

### POST /api/v1/tasks/{task_id}/subtasks

Añade una subtarea anidada a una tarea padre.

> Aplica la regla **RN-23**: la tarea padre no puede cerrarse si tiene subtareas pendientes.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Request Body

```json
{
  "title": "Implementar cifrado con bcrypt"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| title | string | Sí | Título breve de la subtarea |

#### Response — 201 Created

```json
{
  "subtask_id": "64f3a1b2c5d6e7f8a9b0c991",
  "parent_id": "64f3a1b2c5d6e7f8a9b0c1d2",
  "title": "Implementar cifrado con bcrypt",
  "completed": false
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token de acceso requerido, inválido o expirado |
| 404 | Tarea padre no encontrada |
| 422 | El campo title es obligatorio o excede los caracteres permitidos |

---

### PATCH /api/v1/tasks/{task_id}/subtasks/{subtask_id}/toggle

Modifica el estado de cumplimiento de una subtarea específica (completada ↔ pendiente).

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Parámetros de ruta

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| task_id | string | Sí | ID de la tarea padre |
| subtask_id | string | Sí | ID de la subtarea |

#### Request Body

No requiere cuerpo en la petición.

#### Response — 200 OK

```json
{
  "subtask_id": "64f3a1b2c5d6e7f8a9b0c991",
  "completed": true
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token de acceso requerido, inválido o expirado |
| 404 | Tarea padre o subtarea no encontrada |

---

### POST /api/v1/tasks/{task_id}/dependencies

Registra una dependencia entre tareas (una tarea depende de otra).

> Aplica la regla **RN-27**: validación obligatoria contra dependencias circulares en el backend.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Request Body

```json
{
  "depends_on_task_id": "64f3a1b2c5d6e7f8a9b0c777"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| depends_on_task_id | string | Sí | ID de la tarea bloqueante que debe resolverse primero |

#### Response — 200 OK

```json
{
  "message": "Dependencia registrada exitosamente",
  "task_id": "64f3a1b2c5d6e7f8a9b0c1d2",
  "dependencies": ["64f3a1b2c5d6e7f8a9b0c777"]
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 400 | Dependencia circular detectada |
| 401 | Token de acceso requerido, inválido o expirado |
| 404 | Una o ambas tareas no existen |

---

### GET /api/v1/projects/{project_id}/workload

Retorna un consolidado de los Story Points totales asignados a cada miembro del proyecto.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Parámetros de ruta

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| project_id | string | Sí | ID del proyecto (ObjectId de MongoDB) |

#### Response — 200 OK

```json
[
  {
    "assignee_id": "64f3a1b2c5d6e7f8a9b0c1d2",
    "total_tasks": 4,
    "total_story_points": 18
  },
  {
    "assignee_id": "64f3a1b2c5d6e7f8a9b0c345",
    "total_tasks": 2,
    "total_story_points": 8
  }
]
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token de acceso requerido, inválido o expirado |
| 404 | Proyecto no encontrado |

---

### Sprints

#### GET /api/v1/projects/{project_id}/sprints
Lista todos los sprints de un proyecto.

**Auth:** Requiere token JWT

**Response — 200 OK**
```json
[
  {
    "id": "64f3a...",
    "name": "Sprint 1",
    "goal": "Completar auth",
    "state": "pending",
    "start_date": null,
    "end_date": null
  }
]
```

#### POST /api/v1/projects/{project_id}/sprints
Crea un sprint en estado `pending`.

**Request Body**
```json
{
  "name": "Sprint 1",
  "goal": "Opcional",
  "start_date": "2026-06-30T10:00:00Z",
  "end_date": "2026-07-15T10:00:00Z"
}
```

#### PUT /api/v1/sprints/{sprint_id}
Actualiza campos de un sprint.

#### POST /api/v1/sprints/{sprint_id}/start
Inicia el sprint. Falla si ya hay otro sprint `active`.

#### POST /api/v1/sprints/{sprint_id}/complete
Completa el sprint (estado `completed`).

---

## Resumen de Endpoints

| # | Método | Ruta | Descripción |
|---|--------|------|-------------|
| 1 | PUT | /api/v1/tasks/{task_id}/planning | Asigna fecha límite y story points |
| 2 | POST | /api/v1/tasks/{task_id}/subtasks | Crea una subtarea |
| 3 | PATCH | /api/v1/tasks/{task_id}/subtasks/{subtask_id}/toggle | Marca subtarea completada/pendiente |
| 4 | POST | /api/v1/tasks/{task_id}/dependencies | Registra dependencia entre tareas |
| 5 | GET | /api/v1/projects/{project_id}/workload | Carga de trabajo del equipo |

## Formato Estándar de Errores

Todos los errores devuelven la misma estructura JSON. El frontend React debe leer el campo `detail` y mostrarlo directamente al usuario.

```json
{
  "detail": "Dependencia circular detectada: la tarea no puede depender de sí misma ni generar bucles.",
  "campo": "depends_on_task_id",
  "codigo": 400
}
```
