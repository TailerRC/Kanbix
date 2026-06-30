# Módulo 6: Reportes y Dashboard

> Métricas de alto nivel del proyecto, datos para gráficos Burndown y distribución de carga de trabajo por miembro.

---

## Endpoints

### GET /api/v1/projects/{project_id}/dashboard/summary

Devuelve las métricas de alto nivel del proyecto y el estado del sprint activo.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Parámetros de ruta

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| project_id | string | Sí | Identificador del proyecto (ObjectId de MongoDB) |

#### Response — 200 OK

```json
{
  "total_tasks": 145,
  "completed_tasks": 120,
  "pending_tasks": 25,
  "active_sprint": {
    "id": "64f3a1b2c5d6e7f8a9b0c1d2",
    "name": "Sprint 5",
    "start_date": "2026-06-01T00:00:00Z",
    "end_date": "2026-06-15T00:00:00Z"
  }
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token de acceso requerido, inválido o expirado |
| 403 | Usuario sin permisos para ver este proyecto |
| 404 | Proyecto no encontrado |

---

### GET /api/v1/projects/{project_id}/sprints/{sprint_id}/burndown

Devuelve el histórico diario de tareas pendientes vs el progreso ideal para el gráfico Burndown.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Parámetros de ruta

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| project_id | string | Sí | Identificador del proyecto |
| sprint_id | string | Sí | Identificador del sprint |

#### Response — 200 OK

```json
[
  { "date": "2026-06-01", "ideal_remaining": 40, "actual_remaining": 40 },
  { "date": "2026-06-02", "ideal_remaining": 36, "actual_remaining": 38 },
  { "date": "2026-06-03", "ideal_remaining": 32, "actual_remaining": 30 }
]
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token de acceso requerido o inválido |
| 404 | Proyecto o Sprint no encontrado |

---

### GET /api/v1/projects/{project_id}/reports/workload

Calcula cuántas tareas tiene asignadas cada miembro del equipo y su estado actual.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Parámetros de ruta

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| project_id | string | Sí | Identificador del proyecto |

#### Response — 200 OK

```json
[
  {
    "member_id": "64f3a1b2c5d6e7f8a9b0c111",
    "member_name": "Gianfranco Caballero",
    "tasks_todo": 2,
    "tasks_in_progress": 3,
    "tasks_done": 15
  },
  {
    "member_id": "64f3a1b2c5d6e7f8a9b0c222",
    "member_name": "Rodrigo Chacón",
    "tasks_todo": 0,
    "tasks_in_progress": 1,
    "tasks_done": 8
  }
]
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token de acceso requerido o inválido |
| 404 | Proyecto no encontrado |

---

## Resumen de Endpoints

| # | Método | Ruta | Descripción |
|---|--------|------|-------------|
| 1 | GET | /api/v1/projects/{project_id}/dashboard/summary | Métricas generales del dashboard |
| 2 | GET | /api/v1/projects/{project_id}/sprints/{sprint_id}/burndown | Datos para gráfico Burndown |
| 3 | GET | /api/v1/projects/{project_id}/reports/workload | Distribución de tareas por usuario |

## Formato Estándar de Errores

Todos los errores devuelven la misma estructura JSON. El frontend debe leer el campo `detail` y mostrarlo directamente al usuario.

```json
{
  "detail": "Mensaje descriptivo del error",
  "campo": "nombre_del_campo_con_error",
  "codigo": 400
}
```