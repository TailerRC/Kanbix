# Módulo 2: Proyectos & Equipos

> CRUD de proyectos, gestión de invitaciones, miembros y sprints.

---

## PROYECTOS

### Endpoint 1 — Crear proyecto

**POST** `/api/v1/projects`

Crea un nuevo proyecto y asigna al creador como Scrum Master.

#### Request Body
```json
{
  "nombre":       "Sistema Kanban",
  "descripcion":  "Proyecto universitario grupal",
  "fecha_inicio": "2026-06-16",
  "fecha_fin":    "2026-12-01",
  "color":        "#1E3A5F"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| nombre | string | Sí | Nombre del proyecto (máx. 100 caracteres) |
| descripcion | string | No | Descripción opcional del proyecto |
| fecha_inicio | string | Sí | Fecha en formato ISO 8601 (YYYY-MM-DD) |
| fecha_fin | string | No | Fecha de fin opcional en formato ISO 8601 |
| color | string | No | Código hex del color. Ej: #1E3A5F (default: #1E3A5F) |

#### Respuesta exitosa — 201 Created
```json
{
  "mensaje":  "Proyecto creado exitosamente",
  "proyecto": {
    "id":          "64f3a1b2c5d6e7f8a9b0c1d2",
    "nombre":      "Sistema Kanban",
    "descripcion": "Proyecto universitario grupal",
    "color":       "#1E3A5F",
    "iniciales":   "SK",
    "estado":      "Activo",
    "fecha_inicio":"2026-06-16",
    "fecha_fin":   "2026-12-01",
    "id_creador":  "64f3a1b2c5d6e7f8a9b0c1d3",
    "fecha_creacion": "2026-06-16T10:00:00Z"
  }
}
```

> [!NOTE]
> El sistema genera automáticamente las iniciales del proyecto a partir del nombre (RF20). El creador queda registrado como Scrum Master del proyecto.

#### Errores posibles
| Código HTTP | Descripción |
|-------------|-------------|
| 400 | nombre o fecha_inicio faltante o inválido |
| 401 | Token JWT no proporcionado o inválido |
| 422 | Body malformado o tipos de datos incorrectos |
| 500 | Error interno del servidor |

---

### Endpoint 2 — Listar proyectos del usuario

**GET** `/api/v1/projects`

Retorna todos los proyectos en los que participa el usuario autenticado.

#### Request Body
No requiere cuerpo en la petición.

#### Respuesta exitosa — 200 OK
```json
{
  "proyectos": [
    {
      "id":          "64f3a1b2c5d6e7f8a9b0c1d2",
      "nombre":      "Sistema Kanban",
      "iniciales":   "SK",
      "color":       "#1E3A5F",
      "estado":      "Activo",
      "mi_rol":      "scrum_master",
      "fecha_inicio":"2026-06-16"
    }
  ],
  "total": 1
}
```

> [!NOTE]
> Incluye el campo `mi_rol` para que el frontend sepa qué acciones mostrarle al usuario en cada proyecto.

#### Errores posibles
| Código HTTP | Descripción |
|-------------|-------------|
| 401 | Token JWT no proporcionado o inválido |
| 500 | Error interno del servidor |

---

### Endpoint 3 — Ver detalle de un proyecto

**GET** `/api/v1/projects/{project_id}`

Retorna la información completa de un proyecto específico.

#### Request Body
No requiere cuerpo en la petición.

#### Respuesta exitosa — 200 OK
```json
{
  "id":           "64f3a1b2c5d6e7f8a9b0c1d2",
  "nombre":       "Sistema Kanban",
  "descripcion":  "Proyecto universitario grupal",
  "iniciales":    "SK",
  "color":        "#1E3A5F",
  "estado":       "Activo",
  "fecha_inicio": "2026-06-16",
  "fecha_fin":    "2026-12-01",
  "id_creador":   "64f3a1b2c5d6e7f8a9b0c1d3",
  "mi_rol":       "scrum_master",
  "total_miembros": 4,
  "fecha_creacion": "2026-06-16T10:00:00Z"
}
```

#### Errores posibles
| Código HTTP | Descripción |
|-------------|-------------|
| 401 | Token JWT no proporcionado o inválido |
| 403 | El usuario no pertenece al proyecto |
| 404 | Proyecto no encontrado |
| 500 | Error interno del servidor |

---

### Endpoint 4 — Editar proyecto

**PUT** `/api/v1/projects/{project_id}`

Actualiza nombre, descripción, color o fechas del proyecto.

#### Request Body
```json
{
  "nombre":       "Sistema Kanban v2",
  "descripcion":  "Proyecto actualizado",
  "color":        "#2D6A4F",
  "estado":       "Pausado",
  "fecha_fin":    "2026-12-31"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| nombre | string | No | Nuevo nombre del proyecto (máx. 100 caracteres) |
| descripcion | string | No | Nueva descripción del proyecto |
| color | string | No | Nuevo código hex del color identificador |
| estado | string | No | Activo \| Pausado \| Archivado |
| fecha_fin | string | No | Nueva fecha de fin en formato ISO 8601 |

#### Respuesta exitosa — 200 OK
```json
{
  "mensaje":  "Proyecto actualizado exitosamente",
  "proyecto": {
    "id":          "64f3a1b2c5d6e7f8a9b0c1d2",
    "nombre":      "Sistema Kanban v2",
    "descripcion": "Proyecto actualizado",
    "color":       "#2D6A4F",
    "iniciales":   "SK",
    "estado":      "Pausado"
  }
}
```

> [!NOTE]
> Solo el creador del proyecto puede editarlo (RF14). Se pueden enviar únicamente los campos que se desean actualizar.

#### Errores posibles
| Código HTTP | Descripción |
|-------------|-------------|
| 400 | Ningún campo enviado o valores inválidos |
| 401 | Token JWT no proporcionado o inválido |
| 403 | Solo el creador del proyecto puede editarlo |
| 404 | Proyecto no encontrado |
| 422 | Body malformado o tipos de datos incorrectos |
| 500 | Error interno del servidor |

---

### Endpoint 5 — Eliminar proyecto

**DELETE** `/api/v1/projects/{project_id}`

Archiva el proyecto (soft delete). No elimina físicamente de la BD.

#### Request Body
No requiere cuerpo en la petición.

#### Respuesta exitosa — 200 OK
```json
{
  "mensaje": "Proyecto archivado exitosamente",
  "id":      "64f3a1b2c5d6e7f8a9b0c1d2"
}
```

> [!NOTE]
> Se usa soft delete (estado = Archivado) para preservar el historial de sprints y tareas. El proyecto deja de aparecer en la lista del usuario (RF15).

#### Errores posibles
| Código HTTP | Descripción |
|-------------|-------------|
| 401 | Token JWT no proporcionado o inválido |
| 403 | Solo el creador del proyecto puede eliminarlo |
| 404 | Proyecto no encontrado |
| 500 | Error interno del servidor |

---

### Endpoint 6 — Buscar proyectos por nombre

**GET** `/api/v1/projects/search`

Filtra los proyectos del usuario por nombre.

#### Request Body
No requiere cuerpo en la petición.

#### Parámetro de query
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| q | string | Sí | Query de búsqueda del proyecto |

#### Respuesta exitosa — 200 OK
```json
{
  "proyectos": [
    {
      "id":        "64f3a1b2c5d6e7f8a9b0c1d2",
      "nombre":    "Sistema Kanban",
      "iniciales": "SK",
      "color":     "#1E3A5F",
      "estado":    "Activo",
      "mi_rol":    "developer"
    }
  ],
  "total": 1
}
```

> [!NOTE]
> El parámetro `q` se pasa por query string. Ej: `GET /api/v1/projects/search?q=kanban`. La búsqueda es case-insensitive (RF18).

#### Errores posibles
| Código HTTP | Descripción |
|-------------|-------------|
| 400 | Parámetro q vacío o no proporcionado |
| 401 | Token JWT no proporcionado o inválido |
| 500 | Error interno del servidor |

---

## MIEMBROS & INVITACIONES

### Endpoint 7 — Invitar miembro al proyecto

**POST** `/api/v1/projects/{project_id}/invitations`

Envía una invitación por email a un usuario para unirse al proyecto.

#### Request Body
```json
{
  "email": "gianfranco@example.com",
  "rol":   "developer"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| email | string | Sí | Email del usuario a invitar |
| rol | string | Sí | scrum_master \| product_owner \| developer |

#### Respuesta exitosa — 201 Created
```json
{
  "mensaje":     "Invitación enviada exitosamente",
  "invitacion": {
    "id":          "64f3a1b2c5d6e7f8a9b0c1d4",
    "email":       "gianfranco@example.com",
    "rol":         "developer",
    "estado":      "pendiente",
    "id_proyecto": "64f3a1b2c5d6e7f8a9b0c1d2",
    "expira_en":   "2026-06-23T10:00:00Z"
  }
}
```

> [!NOTE]
> La invitación expira en 7 días (RF22). El rol enviado aquí será el rol que tendrá el miembro al aceptar.

#### Errores posibles
| Código HTTP | Descripción |
|-------------|-------------|
| 400 | Email no proporcionado o rol inválido |
| 401 | Token JWT no proporcionado o inválido |
| 403 | Solo el creador del proyecto puede invitar miembros |
| 404 | Proyecto no encontrado |
| 409 | El usuario ya es miembro del proyecto o ya tiene invitación pendiente |
| 500 | Error interno del servidor |

---

### Endpoint 8 — Responder invitación

**PATCH** `/api/v1/invitations/{invitation_id}/respond`

El usuario acepta o rechaza una invitación recibida.

#### Request Body
```json
{
  "accion": "aceptar"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| accion | string | Sí | aceptar \| rechazar |

#### Respuesta exitosa — 200 OK
```json
{
  "mensaje": "Invitación aceptada. Ahora eres miembro del proyecto.",
  "miembro": {
    "id":          "64f3a1b2c5d6e7f8a9b0c1d5",
    "id_proyecto": "64f3a1b2c5d6e7f8a9b0c1d2",
    "id_usuario":  "64f3a1b2c5d6e7f8a9b0c1d6",
    "rol":         "developer"
  }
}
```

> [!NOTE]
> Se usa PATCH porque se modifica el estado de un recurso existente (RF23). Si la acción es rechazar, el campo miembro no aparece en la respuesta.

#### Errores posibles
| Código HTTP | Descripción |
|-------------|-------------|
| 400 | Acción inválida (solo aceptar o rechazar) |
| 401 | Token JWT no proporcionado o inválido |
| 403 | Esta invitación no pertenece al usuario autenticado |
| 404 | Invitación no encontrada |
| 410 | La invitación ha expirado o ya fue respondida |
| 500 | Error interno del servidor |

---

### Endpoint 9 — Listar miembros del proyecto

**GET** `/api/v1/projects/{project_id}/members`

Retorna todos los miembros activos del proyecto con sus roles.

#### Request Body
No requiere cuerpo en la petición.

#### Respuesta exitosa — 200 OK
```json
{
  "miembros": [
    {
      "id_miembro":  "64f3a1b2c5d6e7f8a9b0c1d5",
      "id_usuario":  "64f3a1b2c5d6e7f8a9b0c1d6",
      "nombre":      "Gianfranco Caballero",
      "email":       "gianfranco@example.com",
      "rol":         "developer",
      "fecha_union": "2026-06-16T10:00:00Z"
    }
  ],
  "total": 4
}
```

> [!NOTE]
> Cualquier miembro del proyecto puede ver la lista completa (RF24). Incluye nombre y email del usuario para mostrarlos en la UI.

#### Errores posibles
| Código HTTP | Descripción |
|-------------|-------------|
| 401 | Token JWT no proporcionado o inválido |
| 403 | El usuario no pertenece al proyecto |
| 404 | Proyecto no encontrado |
| 500 | Error interno del servidor |

---

### Endpoint 10 — Eliminar miembro del proyecto

**DELETE** `/api/v1/projects/{project_id}/members/{member_id}`

Remueve a un miembro del proyecto.

#### Request Body
No requiere cuerpo en la petición.

#### Respuesta exitosa — 200 OK
```json
{
  "mensaje":    "Miembro eliminado del proyecto",
  "id_miembro": "64f3a1b2c5d6e7f8a9b0c1d5"
}
```

> [!NOTE]
> El creador del proyecto no puede ser eliminado (RF25). Al eliminar un miembro, sus tareas asignadas quedan sin asignar.

#### Errores posibles
| Código HTTP | Descripción |
|-------------|-------------|
| 401 | Token JWT no proporcionado o inválido |
| 403 | Solo el creador del proyecto puede eliminar miembros |
| 404 | Proyecto o miembro no encontrado |
| 409 | No se puede eliminar al creador del proyecto |
| 500 | Error interno del servidor |

---

## ROLES

### Endpoint 11 — Cambiar rol de un miembro

**PATCH** `/api/v1/projects/{project_id}/members/{member_id}/role`

Actualiza únicamente el rol de un miembro dentro del proyecto.

#### Request Body
```json
{
  "rol": "scrum_master"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| rol | string | Sí | scrum_master \| product_owner \| developer |

#### Respuesta exitosa — 200 OK
```json
{
  "mensaje":   "Rol actualizado exitosamente",
  "id_miembro":"64f3a1b2c5d6e7f8a9b0c1d5",
  "rol_nuevo": "scrum_master"
}
```

> [!NOTE]
> Se usa PATCH porque solo se modifica un campo del recurso (RF27). El 409 aplica si se intenta asignar un segundo Scrum Master cuando ya existe uno activo.

#### Errores posibles
| Código HTTP | Descripción |
|-------------|-------------|
| 400 | Rol inválido o no proporcionado |
| 401 | Token JWT no proporcionado o inválido |
| 403 | Solo el creador del proyecto puede cambiar roles |
| 404 | Proyecto o miembro no encontrado |
| 409 | Ya existe un Scrum Master en el proyecto |
| 500 | Error interno del servidor |

---

## SPRINTS

### Endpoint 12 — Crear sprint

**POST** `/api/v1/projects/{project_id}/sprints`

Crea un nuevo sprint dentro del proyecto.

#### Request Body
```json
{
  "nombre":       "Sprint 1",
  "fecha_inicio": "2026-06-16",
  "fecha_fin":    "2026-06-30"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| nombre | string | Sí | Nombre del sprint (máx. 80 caracteres) |
| fecha_inicio | string | Sí | Fecha de inicio en formato ISO 8601 (YYYY-MM-DD) |
| fecha_fin | string | Sí | Fecha de fin en formato ISO 8601 (YYYY-MM-DD) |

#### Respuesta exitosa — 201 Created
```json
{
  "mensaje": "Sprint creado exitosamente",
  "sprint":  {
    "id":           "64f3a1b2c5d6e7f8a9b0c1d7",
    "nombre":       "Sprint 1",
    "fecha_inicio": "2026-06-16",
    "fecha_fin":    "2026-06-30",
    "estado":       "Activo",
    "id_proyecto":  "64f3a1b2c5d6e7f8a9b0c1d2"
  }
}
```

> [!NOTE]
> Solo puede existir un sprint Activo por proyecto (RF33, RF34). El 409 bloquea la creación si ya hay uno activo.

#### Errores posibles
| Código HTTP | Descripción |
|-------------|-------------|
| 400 | Campos requeridos faltantes o fechas inválidas (fin antes de inicio) |
| 401 | Token JWT no proporcionado o inválido |
| 403 | Solo el Scrum Master puede crear sprints |
| 404 | Proyecto no encontrado |
| 409 | Ya existe un sprint Activo en el proyecto |
| 500 | Error interno del servidor |

---

### Endpoint 13 — Listar sprints del proyecto

**GET** `/api/v1/projects/{project_id}/sprints`

Retorna todos los sprints del proyecto ordenados por fecha de inicio.

#### Request Body
No requiere cuerpo en la petición.

#### Respuesta exitosa — 200 OK
```json
{
  "sprints": [
    {
      "id":           "64f3a1b2c5d6e7f8a9b0c1d7",
      "nombre":       "Sprint 1",
      "fecha_inicio": "2026-06-16",
      "fecha_fin":    "2026-06-30",
      "estado":       "Activo"
    },
    {
      "id":           "64f3a1b2c5d6e7f8a9b0c1d8",
      "nombre":       "Sprint 2",
      "fecha_inicio": "2026-07-01",
      "fecha_fin":    "2026-07-15",
      "estado":       "Cerrado"
    }
  ],
  "total": 2
}
```

> [!NOTE]
> Retorna todos los sprints (Activo, Cerrado, Planificado) para que el módulo de reportes pueda acceder al historial (RF30, RF80).

#### Errores posibles
| Código HTTP | Descripción |
|-------------|-------------|
| 401 | Token JWT no proporcionado o inválido |
| 403 | El usuario no pertenece al proyecto |
| 404 | Proyecto no encontrado |
| 500 | Error interno del servidor |

---

### Endpoint 14 — Editar sprint

**PUT** `/api/v1/projects/{project_id}/sprints/{sprint_id}`

Actualiza nombre o fechas de un sprint existente.

#### Request Body
```json
{
  "nombre":    "Sprint 1 — Extendido",
  "fecha_fin": "2026-07-05"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| nombre | string | No | Nuevo nombre del sprint |
| fecha_inicio | string | No | Nueva fecha de inicio en formato ISO 8601 |
| fecha_fin | string | No | Nueva fecha de fin en formato ISO 8601 |

#### Respuesta exitosa — 200 OK
```json
{
  "mensaje": "Sprint actualizado exitosamente",
  "sprint":  {
    "id":           "64f3a1b2c5d6e7f8a9b0c1d7",
    "nombre":       "Sprint 1 — Extendido",
    "fecha_inicio": "2026-06-16",
    "fecha_fin":    "2026-07-05",
    "estado":       "Activo"
  }
}
```

> [!NOTE]
> Permite ampliar la fecha de fin del sprint sin necesidad de cerrarlo (RF31). Solo se envían los campos a modificar.

#### Errores posibles
| Código HTTP | Descripción |
|-------------|-------------|
| 400 | Ningún campo enviado o fechas inválidas |
| 401 | Token JWT no proporcionado o inválido |
| 403 | Solo el Scrum Master puede editar sprints |
| 404 | Proyecto o sprint no encontrado |
| 422 | Body malformado o tipos incorrectos |
| 500 | Error interno del servidor |

---

### Endpoint 15 — Cerrar sprint

**PATCH** `/api/v1/projects/{project_id}/sprints/{sprint_id}/close`

Cierra el sprint activo y mueve las tareas incompletas al backlog.

#### Request Body
No requiere cuerpo en la petición.

#### Respuesta exitosa — 200 OK
```json
{
  "mensaje":               "Sprint cerrado exitosamente",
  "sprint_id":             "64f3a1b2c5d6e7f8a9b0c1d7",
  "tareas_al_backlog":     3,
  "tareas_completadas":    8
}
```

> [!NOTE]
> Al cerrar, las tareas no completadas regresan automáticamente al backlog (RF32, RF62). Dispara la generación del reporte (RF79, Módulo 6) y notificaciones al equipo (RF71, Módulo 5).

#### Errores posibles
| Código HTTP | Descripción |
|-------------|-------------|
| 401 | Token JWT no proporcionado o inválido |
| 403 | Solo el Scrum Master puede cerrar sprints |
| 404 | Proyecto o sprint no encontrado |
| 409 | El sprint ya está cerrado |
| 500 | Error interno del servidor |

---

## Resumen de Endpoints

| # | Método | Ruta | Descripción | Auth |
|---|--------|------|-------------|------|
| 1 | POST | `/api/v1/projects` | Crear un nuevo proyecto | Sí |
| 2 | GET | `/api/v1/projects` | Listar proyectos del usuario | Sí |
| 3 | GET | `/api/v1/projects/{project_id}` | Ver detalle de un proyecto | Sí |
| 4 | PUT | `/api/v1/projects/{project_id}` | Editar nombre, descripción o estado | Sí |
| 5 | DELETE | `/api/v1/projects/{project_id}` | Archivar (eliminar) un proyecto | Sí |
| 6 | GET | `/api/v1/projects/search` | Buscar proyectos por nombre | Sí |
| 7 | POST | `/api/v1/projects/{project_id}/invitations` | Invitar miembro por email | Sí |
| 8 | PATCH | `/api/v1/invitations/{invitation_id}/respond` | Aceptar o rechazar invitación | Sí |
| 9 | GET | `/api/v1/projects/{project_id}/members` | Listar miembros del proyecto | Sí |
| 10 | DELETE | `/api/v1/projects/{project_id}/members/{member_id}` | Eliminar miembro del proyecto | Sí |
| 11 | PATCH | `/api/v1/projects/{project_id}/members/{member_id}/role` | Cambiar rol de un miembro | Sí |
| 12 | POST | `/api/v1/projects/{project_id}/sprints` | Crear un sprint | Sí |
| 13 | GET | `/api/v1/projects/{project_id}/sprints` | Listar sprints del proyecto | Sí |
| 14 | PUT | `/api/v1/projects/{project_id}/sprints/{sprint_id}` | Editar un sprint | Sí |
| 15 | PATCH | `/api/v1/projects/{project_id}/sprints/{sprint_id}/close` | Cerrar sprint activo | Sí |

---

## Formato Estándar de Errores

Todos los errores devuelven la misma estructura JSON. El frontend debe leer el campo `detail` y mostrarlo directamente al usuario.

```json
{
  "detail": "Mensaje descriptivo del error",
  "campo":  "nombre_del_campo_con_error",
  "codigo": 400
}
```

---

> **CONVENCIÓN:** Los IDs son strings de MongoDB ObjectId (24 caracteres hexadecimales). Las fechas siguen el formato ISO 8601. Todos los endpoints requieren el header: `Authorization: Bearer {token}`.
