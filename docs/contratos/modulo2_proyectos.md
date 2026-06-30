# Módulo 2: Proyectos y Equipos

> CRUD de proyectos, gestión de miembros del equipo y roles (Scrum Master, Product Owner, Developer) dentro de un proyecto. Incluye invitaciones y gestión de sprints.

---

## Endpoints

### POST /api/v1/projects

Crea un nuevo proyecto. El usuario autenticado se convierte automáticamente en Scrum Master del proyecto.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Request Body

```json
{
  "nombre": "Sistema Kanban",
  "descripcion": "Proyecto universitario grupal",
  "fecha_inicio": "2026-06-16",
  "fecha_fin": "2026-12-01",
  "color": "#1E3A5F"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| nombre | string | Sí | Nombre del proyecto (máx. 100 caracteres) |
| descripcion | string | No | Descripción opcional del proyecto |
| fecha_inicio | string | Sí | Fecha en formato ISO 8601 (YYYY-MM-DD) |
| fecha_fin | string | No | Fecha de fin opcional en formato ISO 8601 |
| color | string | No | Código hex del color. Ej: #1E3A5F (default: #1E3A5F) |

#### Response — 201 Created

```json
{
  "mensaje": "Proyecto creado exitosamente",
  "proyecto": {
    "id": "64f3a1b2c5d6e7f8a9b0c1d2",
    "nombre": "Sistema Kanban",
    "descripcion": "Proyecto universitario grupal",
    "color": "#1E3A5F",
    "iniciales": "SK",
    "estado": "Activo",
    "fecha_inicio": "2026-06-16",
    "fecha_fin": "2026-12-01",
    "id_creador": "64f3a1b2c5d6e7f8a9b0c1d3",
    "fecha_creacion": "2026-06-16T10:00:00Z"
  }
}
```

> El sistema genera automáticamente las iniciales del proyecto a partir del nombre. El creador queda registrado como Scrum Master del proyecto.

#### Errors

| Código | Descripción |
|--------|-------------|
| 400 | `nombre` o `fecha_inicio` faltante o inválido |
| 401 | Token JWT no proporcionado o inválido |
| 422 | Body malformado o tipos de datos incorrectos |
| 500 | Error interno del servidor |

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
  "proyectos": [
    {
      "id": "64f3a1b2c5d6e7f8a9b0c1d2",
      "nombre": "Sistema Kanban",
      "iniciales": "SK",
      "color": "#1E3A5F",
      "estado": "Activo",
      "mi_rol": "scrum_master",
      "fecha_inicio": "2026-06-16"
    }
  ],
  "total": 1
}
```

> Incluye el campo `mi_rol` para que el frontend sepa qué acciones mostrarle al usuario en cada proyecto.

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token JWT no proporcionado o inválido |
| 500 | Error interno del servidor |

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
  "nombre": "Sistema Kanban",
  "descripcion": "Proyecto universitario grupal",
  "iniciales": "SK",
  "color": "#1E3A5F",
  "estado": "Activo",
  "fecha_inicio": "2026-06-16",
  "fecha_fin": "2026-12-01",
  "id_creador": "64f3a1b2c5d6e7f8a9b0c1d3",
  "mi_rol": "scrum_master",
  "total_miembros": 4,
  "fecha_creacion": "2026-06-16T10:00:00Z"
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token JWT no proporcionado o inválido |
| 403 | El usuario no pertenece al proyecto |
| 404 | Proyecto no encontrado |
| 500 | Error interno del servidor |

---

### PUT /api/v1/projects/{project_id}

Actualiza nombre, descripción, color, estado o fechas del proyecto. Solo el creador puede modificarlo.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Request Body

```json
{
  "nombre": "Sistema Kanban v2",
  "descripcion": "Proyecto actualizado",
  "color": "#2D6A4F",
  "estado": "Pausado",
  "fecha_fin": "2026-12-31"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| nombre | string | No | Nuevo nombre del proyecto (máx. 100 caracteres) |
| descripcion | string | No | Nueva descripción del proyecto |
| color | string | No | Nuevo código hex del color identificador |
| estado | string | No | `Activo` \| `Pausado` \| `Archivado` |
| fecha_fin | string | No | Nueva fecha de fin en formato ISO 8601 |

#### Response — 200 OK

```json
{
  "mensaje": "Proyecto actualizado exitosamente",
  "proyecto": {
    "id": "64f3a1b2c5d6e7f8a9b0c1d2",
    "nombre": "Sistema Kanban v2",
    "descripcion": "Proyecto actualizado",
    "color": "#2D6A4F",
    "iniciales": "SK",
    "estado": "Pausado"
  }
}
```

> Solo el creador del proyecto puede editarlo. Se pueden enviar únicamente los campos que se desean actualizar.

#### Errors

| Código | Descripción |
|--------|-------------|
| 400 | Ningún campo enviado o valores inválidos |
| 401 | Token JWT no proporcionado o inválido |
| 403 | Solo el creador del proyecto puede editarlo |
| 404 | Proyecto no encontrado |
| 422 | Body malformado o tipos de datos incorrectos |
| 500 | Error interno del servidor |

---

### DELETE /api/v1/projects/{project_id}

Archiva el proyecto (soft delete). No elimina físicamente de la BD. Solo el creador puede archivarlo.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Response — 200 OK

```json
{
  "mensaje": "Proyecto archivado exitosamente",
  "id": "64f3a1b2c5d6e7f8a9b0c1d2"
}
```

> Se usa soft delete (`estado = Archivado`) para preservar el historial de sprints y tareas. El proyecto deja de aparecer en la lista del usuario.

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token JWT no proporcionado o inválido |
| 403 | Solo el creador del proyecto puede eliminarlo |
| 404 | Proyecto no encontrado |
| 500 | Error interno del servidor |

---

### GET /api/v1/projects/search

Filtra los proyectos del usuario por nombre.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Parámetros de query

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| q | string | Sí | Texto a buscar en el nombre del proyecto |

> Ejemplo: `GET /api/v1/projects/search?q=kanban`. La búsqueda es case-insensitive.

#### Response — 200 OK

```json
{
  "proyectos": [
    {
      "id": "64f3a1b2c5d6e7f8a9b0c1d2",
      "nombre": "Sistema Kanban",
      "iniciales": "SK",
      "color": "#1E3A5F",
      "estado": "Activo",
      "mi_rol": "developer"
    }
  ],
  "total": 1
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 400 | Parámetro `q` vacío o no proporcionado |
| 401 | Token JWT no proporcionado o inválido |
| 500 | Error interno del servidor |

---

## Miembros & Invitaciones

### POST /api/v1/projects/{project_id}/invitations

Envía una invitación por email a un usuario para unirse al proyecto. Solo el creador puede invitar miembros.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Request Body

```json
{
  "email": "gianfranco@example.com",
  "rol": "developer"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| email | string | Sí | Email del usuario a invitar |
| rol | string | Sí | `scrum_master` \| `product_owner` \| `developer` |

#### Response — 201 Created

```json
{
  "mensaje": "Invitación enviada exitosamente",
  "invitacion": {
    "id": "64f3a1b2c5d6e7f8a9b0c1d4",
    "email": "gianfranco@example.com",
    "rol": "developer",
    "estado": "pendiente",
    "id_proyecto": "64f3a1b2c5d6e7f8a9b0c1d2",
    "expira_en": "2026-06-23T10:00:00Z"
  }
}
```

> La invitación expira en 7 días. El rol enviado aquí será el rol que tendrá el miembro al aceptar.

#### Errors

| Código | Descripción |
|--------|-------------|
| 400 | Email no proporcionado o rol inválido |
| 401 | Token JWT no proporcionado o inválido |
| 403 | Solo el creador del proyecto puede invitar miembros |
| 404 | Proyecto no encontrado |
| 409 | El usuario ya es miembro del proyecto o ya tiene invitación pendiente |
| 500 | Error interno del servidor |

---

### PATCH /api/v1/invitations/{invitation_id}/respond

El usuario acepta o rechaza una invitación recibida.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Parámetros de ruta

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| invitation_id | string | Sí | ID de la invitación (ObjectId de MongoDB) |

#### Request Body

```json
{
  "accion": "aceptar"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| accion | string | Sí | `aceptar` \| `rechazar` |

#### Response — 200 OK

```json
{
  "mensaje": "Invitación aceptada. Ahora eres miembro del proyecto.",
  "miembro": {
    "id": "64f3a1b2c5d6e7f8a9b0c1d5",
    "id_proyecto": "64f3a1b2c5d6e7f8a9b0c1d2",
    "id_usuario": "64f3a1b2c5d6e7f8a9b0c1d6",
    "rol": "developer"
  }
}
```

> Se usa PATCH porque se modifica el estado de un recurso existente. Si la acción es `rechazar`, el campo `miembro` no aparece en la respuesta.

#### Errors

| Código | Descripción |
|--------|-------------|
| 400 | Acción inválida (solo `aceptar` o `rechazar`) |
| 401 | Token JWT no proporcionado o inválido |
| 403 | Esta invitación no pertenece al usuario autenticado |
| 404 | Invitación no encontrada |
| 410 | La invitación ha expirado o ya fue respondida |
| 500 | Error interno del servidor |

---

### GET /api/v1/projects/{project_id}/members

Retorna todos los miembros activos del proyecto con sus roles. Cualquier miembro del proyecto puede consultarlo.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Response — 200 OK

```json
{
  "miembros": [
    {
      "id_miembro": "64f3a1b2c5d6e7f8a9b0c1d5",
      "id_usuario": "64f3a1b2c5d6e7f8a9b0c1d6",
      "nombre": "Gianfranco Caballero",
      "email": "gianfranco@example.com",
      "rol": "developer",
      "fecha_union": "2026-06-16T10:00:00Z"
    }
  ],
  "total": 4
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token JWT no proporcionado o inválido |
| 403 | El usuario no pertenece al proyecto |
| 404 | Proyecto no encontrado |
| 500 | Error interno del servidor |

---

### DELETE /api/v1/projects/{project_id}/members/{member_id}

Remueve a un miembro del proyecto. Solo el creador puede eliminar miembros.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Response — 200 OK

```json
{
  "mensaje": "Miembro eliminado del proyecto",
  "id_miembro": "64f3a1b2c5d6e7f8a9b0c1d5"
}
```

> El creador del proyecto no puede ser eliminado. Al eliminar un miembro, sus tareas asignadas quedan sin asignar.

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token JWT no proporcionado o inválido |
| 403 | Solo el creador del proyecto puede eliminar miembros |
| 404 | Proyecto o miembro no encontrado |
| 409 | No se puede eliminar al creador del proyecto |
| 500 | Error interno del servidor |

---

## Roles

### PATCH /api/v1/projects/{project_id}/members/{member_id}/role

Actualiza únicamente el rol de un miembro dentro del proyecto. Solo el creador puede cambiar roles.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Request Body

```json
{
  "rol": "scrum_master"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| rol | string | Sí | `scrum_master` \| `product_owner` \| `developer` |

#### Response — 200 OK

```json
{
  "mensaje": "Rol actualizado exitosamente",
  "id_miembro": "64f3a1b2c5d6e7f8a9b0c1d5",
  "rol_nuevo": "scrum_master"
}
```

> Se usa PATCH porque solo se modifica un campo del recurso. El 409 aplica si se intenta asignar un segundo Scrum Master cuando ya existe uno activo.

#### Errors

| Código | Descripción |
|--------|-------------|
| 400 | Rol inválido o no proporcionado |
| 401 | Token JWT no proporcionado o inválido |
| 403 | Solo el creador del proyecto puede cambiar roles |
| 404 | Proyecto o miembro no encontrado |
| 409 | Ya existe un Scrum Master en el proyecto |
| 500 | Error interno del servidor |

---

## Sprints

### POST /api/v1/projects/{project_id}/sprints

Crea un nuevo sprint dentro del proyecto. Solo puede existir un sprint Activo por proyecto.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Request Body

```json
{
  "nombre": "Sprint 1",
  "fecha_inicio": "2026-06-16",
  "fecha_fin": "2026-06-30"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| nombre | string | Sí | Nombre del sprint (máx. 80 caracteres) |
| fecha_inicio | string | Sí | Fecha de inicio en formato ISO 8601 (YYYY-MM-DD) |
| fecha_fin | string | Sí | Fecha de fin en formato ISO 8601 (YYYY-MM-DD) |

#### Response — 201 Created

```json
{
  "mensaje": "Sprint creado exitosamente",
  "sprint": {
    "id": "64f3a1b2c5d6e7f8a9b0c1d7",
    "nombre": "Sprint 1",
    "fecha_inicio": "2026-06-16",
    "fecha_fin": "2026-06-30",
    "estado": "Activo",
    "id_proyecto": "64f3a1b2c5d6e7f8a9b0c1d2"
  }
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 400 | Campos requeridos faltantes o fechas inválidas (fin antes de inicio) |
| 401 | Token JWT no proporcionado o inválido |
| 403 | Solo el Scrum Master puede crear sprints |
| 404 | Proyecto no encontrado |
| 409 | Ya existe un sprint Activo en el proyecto |
| 500 | Error interno del servidor |

---

### GET /api/v1/projects/{project_id}/sprints

Retorna todos los sprints del proyecto ordenados por fecha de inicio.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Response — 200 OK

```json
{
  "sprints": [
    {
      "id": "64f3a1b2c5d6e7f8a9b0c1d7",
      "nombre": "Sprint 1",
      "fecha_inicio": "2026-06-16",
      "fecha_fin": "2026-06-30",
      "estado": "Activo"
    },
    {
      "id": "64f3a1b2c5d6e7f8a9b0c1d8",
      "nombre": "Sprint 2",
      "fecha_inicio": "2026-07-01",
      "fecha_fin": "2026-07-15",
      "estado": "Cerrado"
    }
  ],
  "total": 2
}
```

> Retorna todos los sprints (`Activo`, `Cerrado`, `Planificado`) para que el módulo de reportes pueda acceder al historial.

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token JWT no proporcionado o inválido |
| 403 | El usuario no pertenece al proyecto |
| 404 | Proyecto no encontrado |
| 500 | Error interno del servidor |

---

### PUT /api/v1/projects/{project_id}/sprints/{sprint_id}

Actualiza nombre o fechas de un sprint existente. Solo el Scrum Master puede editarlo.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Request Body

```json
{
  "nombre": "Sprint 1 — Extendido",
  "fecha_fin": "2026-07-05"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| nombre | string | No | Nuevo nombre del sprint |
| fecha_inicio | string | No | Nueva fecha de inicio en formato ISO 8601 |
| fecha_fin | string | No | Nueva fecha de fin en formato ISO 8601 |

#### Response — 200 OK

```json
{
  "mensaje": "Sprint actualizado exitosamente",
  "sprint": {
    "id": "64f3a1b2c5d6e7f8a9b0c1d7",
    "nombre": "Sprint 1 — Extendido",
    "fecha_inicio": "2026-06-16",
    "fecha_fin": "2026-07-05",
    "estado": "Activo"
  }
}
```

> Permite ampliar la fecha de fin del sprint sin necesidad de cerrarlo. Solo se envían los campos a modificar.

#### Errors

| Código | Descripción |
|--------|-------------|
| 400 | Ningún campo enviado o fechas inválidas |
| 401 | Token JWT no proporcionado o inválido |
| 403 | Solo el Scrum Master puede editar sprints |
| 404 | Proyecto o sprint no encontrado |
| 422 | Body malformado o tipos incorrectos |
| 500 | Error interno del servidor |

---

### PATCH /api/v1/projects/{project_id}/sprints/{sprint_id}/close

Cierra el sprint activo y mueve las tareas incompletas al backlog.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Response — 200 OK

```json
{
  "mensaje": "Sprint cerrado exitosamente",
  "sprint_id": "64f3a1b2c5d6e7f8a9b0c1d7",
  "tareas_al_backlog": 3,
  "tareas_completadas": 8
}
```

> Al cerrar, las tareas no completadas regresan automáticamente al backlog. Dispara la generación del reporte y notificaciones al equipo.

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token JWT no proporcionado o inválido |
| 403 | Solo el Scrum Master puede cerrar sprints |
| 404 | Proyecto o sprint no encontrado |
| 409 | El sprint ya está cerrado |
| 500 | Error interno del servidor |

---

## Resumen de Endpoints

| # | Método | Ruta | Descripción |
|---|--------|------|-------------|
| 1 | POST | /api/v1/projects | Crear proyecto |
| 2 | GET | /api/v1/projects | Listar proyectos del usuario |
| 3 | GET | /api/v1/projects/{project_id} | Obtener detalle de proyecto |
| 4 | PUT | /api/v1/projects/{project_id} | Actualizar proyecto |
| 5 | DELETE | /api/v1/projects/{project_id} | Archivar (eliminar) proyecto |
| 6 | GET | /api/v1/projects/search?q={nombre} | Buscar proyectos por nombre |
| 7 | POST | /api/v1/projects/{project_id}/invitations | Invitar miembro por email |
| 8 | PATCH | /api/v1/invitations/{invitation_id}/respond | Aceptar o rechazar invitación |
| 9 | GET | /api/v1/projects/{project_id}/members | Listar miembros del proyecto |
| 10 | DELETE | /api/v1/projects/{project_id}/members/{member_id} | Eliminar miembro |
| 11 | PATCH | /api/v1/projects/{project_id}/members/{member_id}/role | Cambiar rol de un miembro |
| 12 | POST | /api/v1/projects/{project_id}/sprints | Crear sprint |
| 13 | GET | /api/v1/projects/{project_id}/sprints | Listar sprints del proyecto |
| 14 | PUT | /api/v1/projects/{project_id}/sprints/{sprint_id} | Editar sprint |
| 15 | PATCH | /api/v1/projects/{project_id}/sprints/{sprint_id}/close | Cerrar sprint activo |

## Formato Estándar de Errores

Todos los errores devuelven la misma estructura JSON. El frontend debe leer el campo `detail` y mostrarlo directamente al usuario.

```json
{
  "detail": "Mensaje descriptivo del error",
  "campo": "nombre_del_campo_con_error",
  "codigo": 400
}
```

> **Convención:** Los IDs son strings de MongoDB ObjectId (24 caracteres hexadecimales). Las fechas siguen el formato ISO 8601. Todos los endpoints requieren el header: `Authorization: Bearer {token}`