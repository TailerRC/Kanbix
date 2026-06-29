# Matriz de Roles y Permisos — Kanbix

Fuente única de verdad para autorización en endpoints. Todos los permisos derivan de las Reglas de Negocio (RN) y Requerimientos Funcionales (RF).

---

## Roles

| Rol | Ámbito | Descripción |
|:----|:-------|:------------|
| **Admin** | Global | Superadministrador del sistema. No está asociado a un proyecto específico. Puede ejecutar cualquier acción en cualquier proyecto. |
| **Manager** | Por proyecto | Usuario que creó el proyecto o fue asignado con ese rol. Administra el proyecto: miembros, sprints, columnas, tareas y reportes. |
| **Developer** | Por proyecto | Ejecuta tareas que le son asignadas y las mueve entre columnas del tablero. |
| **Viewer** | Por proyecto | Acceso de solo lectura. Puede ver tableros, tareas y reportes pero no crear, editar ni eliminar nada. |

**Jerarquía (RN-06):** `Admin > Manager > Developer > Viewer`

Un rol superior hereda todos los permisos de los roles inferiores. Por ejemplo, Admin puede hacer todo lo que Manager, Developer y Viewer pueden.

---

## Matriz de Permisos

| # | Acción | Admin | Manager | Developer | Viewer | RN/RF |
|:-:|:-------|:-----:|:-------:|:---------:|:------:|:-----:|
| | **Proyectos** | | | | | |
| 1 | Crear proyecto | ✅ | ✅ | ❌ | ❌ | RN-10 |
| 2 | Ver lista de proyectos propios | ✅ | ✅ | ✅ | ✅ | RF13 |
| 3 | Ver detalle de cualquier proyecto | ✅ | ✅ | ❌ | ❌ | RN-30 |
| 4 | Ver detalle de proyectos donde es miembro | ✅ | ✅ | ✅ | ✅ | RF13 |
| 5 | Editar nombre/descripción del proyecto | ✅ | ✅¹ | ❌ | ❌ | RF14 |
| 6 | Cambiar estado del proyecto (Activo/Pausado/Archivado) | ✅ | ✅¹ | ❌ | ❌ | RF17 |
| 7 | Eliminar proyecto | ✅ | ✅¹ | ❌ | ❌ | RF15 |
| | **Miembros** | | | | | |
| 8 | Invitar miembros por email | ✅ | ✅¹ | ❌ | ❌ | RF22 |
| 9 | Ver lista de miembros del proyecto | ✅ | ✅ | ✅ | ✅ | RF24 |
| 10 | Eliminar miembro del proyecto | ✅ | ✅¹ | ❌ | ❌ | RF25 |
| 11 | Asignar rol a miembro | ✅ | ✅¹ | ❌ | ❌ | RF26, RN-07² |
| 12 | Cambiar rol de un miembro | ✅ | ✅¹ | ❌ | ❌ | RF27, RN-07² |
| | **Sprints** | | | | | |
| 13 | Crear sprint | ✅ | ✅ | ❌ | ❌ | RF29 |
| 14 | Ver lista de sprints | ✅ | ✅ | ✅ | ✅ | RF30 |
| 15 | Editar sprint | ✅ | ✅ | ❌ | ❌ | RF31 |
| 16 | Cerrar/archivar sprint | ✅ | ✅ | ❌ | ❌ | RF32 |
| 17 | Agregar tareas a sprint activo | ✅ | ✅ | ❌ | ❌ | RF56 |
| 18 | Quitar tareas de sprint activo | ✅ | ✅ | ❌ | ❌ | RF57 |
| 19 | Mover tareas del backlog al sprint | ✅ | ✅ | ❌ | ❌ | RF61 |
| | **Columnas** | | | | | |
| 20 | Crear columna personalizada | ✅ | ✅ | ❌ | ❌ | RF36 |
| 21 | Renombrar columna | ✅ | ✅ | ❌ | ❌ | RF37 |
| 22 | Eliminar columna (sin tareas) | ✅ | ✅ | ❌ | ❌ | RF38 |
| 23 | Reordenar columnas | ✅ | ✅ | ❌ | ❌ | RF39 |
| | **Tareas** | | | | | |
| 24 | Crear tarea | ✅ | ✅ | ✅ | ❌ | RF40 |
| 25 | Ver detalle de tarea | ✅ | ✅ | ✅ | ✅ | RF41 |
| 26 | Editar título/descripción de tarea | ✅ | ✅ | ✅³ | ❌ | RF42 |
| 27 | Eliminar tarea | ✅ | ✅ | ❌ | ❌ | RF43 |
| 28 | Mover tarea entre columnas | ✅ | ✅ | ✅⁴ | ❌ | RF46 |
| 29 | Asignar tarea a miembro | ✅ | ✅ | ❌ | ❌ | RF51 |
| 30 | Reasignar tarea | ✅ | ✅ | ❌ | ❌ | RF53 |
| 31 | Quitar asignación de tarea | ✅ | ✅ | ❌ | ❌ | RF54 |
| 32 | Asignar fecha límite / story points | ✅ | ✅ | ❌ | ❌ | —⁵ |
| 33 | Crear subtarea | ✅ | ✅ | ✅ | ❌ | —⁵ |
| 34 | Registrar dependencia entre tareas | ✅ | ✅ | ❌ | ❌ | RF63 |
| | **Comentarios** | | | | | |
| 35 | Comentar en una tarea | ✅ | ✅ | ✅ | ❌ | —⁵ |
| 36 | Ver comentarios de tarea | ✅ | ✅ | ✅ | ✅ | —⁵ |
| | **Dashboard y Reportes** | | | | | |
| 37 | Ver dashboard del proyecto | ✅ | ✅ | ✅ | ✅ | RF76 |
| 38 | Ver tareas propias en dashboard | ✅ | ✅ | ✅ | ✅ | RF77 |
| 39 | Ver reporte de sprint cerrado | ✅ | ✅ | ❌ | ❌ | RF80, RN-30 |
| 40 | Ver métricas personales | ✅ | ✅ | ✅ | ✅ | RN-30 |
| 41 | Ver rendimiento del equipo | ✅ | ✅ | ❌ | ❌ | RF83, RN-30 |
| 42 | Exportar reporte a PDF | ✅ | ✅ | ✅ | ✅ | RF84 |
| | **Notificaciones** | | | | | |
| 43 | Ver bandeja de notificaciones | ✅ | ✅ | ✅ | ✅ | RF73 |
| 44 | Marcar notificación como leída | ✅ | ✅ | ✅ | ✅ | RF74 |
| 45 | Marcar todas como leídas | ✅ | ✅ | ✅ | ✅ | RF75 |
| 46 | Configurar preferencias de notificación | ✅ | ✅ | ✅ | ✅ | —⁵ |

---

## Notas

1. **Manager** — solo sobre proyectos donde tiene ese rol. No puede modificar proyectos de otros Managers.
2. **Admin** — puede asignar/cambiar roles de cualquier usuario en cualquier proyecto (RN-07). Manager solo puede hacerlo dentro de su propio proyecto.
3. **Developer** — solo puede editar tareas que le fueron asignadas.
4. **Developer** — solo puede mover tareas que le fueron asignadas. Un Manager puede mover cualquier tarea del proyecto.
5. Acción definida en contratos API pero sin RN/RF explícito. Se considera implícita por el rol Manager.

---

## Reglas de Autorización por Endpoint

Cada endpoint en los contratos API debe validar el permiso según esta tabla:

| Método | Ruta | Rol mínimo |
|:------:|:-----|:----------:|
| GET | /api/v1/auth/me | Usuario autenticado |
| POST | /api/v1/auth/register | Público |
| POST | /api/v1/auth/login | Público |
| POST | /api/v1/auth/refresh | Público (requiere refresh_token) |
| POST | /api/v1/auth/logout | Usuario autenticado |
| POST | /api/v1/projects | Admin, Manager |
| GET | /api/v1/projects | Usuario autenticado (miembro) |
| GET | /api/v1/projects/{id} | Viewer+ (miembro del proyecto) |
| PUT | /api/v1/projects/{id} | Manager+ (del proyecto) |
| DELETE | /api/v1/projects/{id} | Manager+ (del proyecto) |
| POST | /api/v1/projects/{id}/members | Manager+ (del proyecto) |
| DELETE | /api/v1/projects/{id}/members/{uid} | Manager+ (del proyecto) |
| GET | /api/v1/notifications | Usuario autenticado |
| PUT | /api/v1/notifications/{id}/read | Usuario autenticado (propietario) |
| PUT | /api/v1/notifications/read-all | Usuario autenticado |
| DELETE | /api/v1/notifications/{id} | Usuario autenticado (propietario) |
| PUT | /api/v1/notifications/preferences | Usuario autenticado |
| WS | /ws/notifications/{user_id} | Usuario autenticado (propietario) |
| POST | /api/v1/projects/{id}/boards | Manager+ (del proyecto) |
| GET | /api/v1/projects/{id}/boards | Viewer+ (del proyecto) |
| GET | /api/v1/projects/{id}/boards/{bid} | Viewer+ (del proyecto) |
| PUT | /api/v1/projects/{id}/boards/{bid} | Manager+ (del proyecto) |
| DELETE | /api/v1/projects/{id}/boards/{bid} | Manager+ (del proyecto) |
| POST | /api/v1/boards/{bid}/columns | Manager+ (del proyecto) |
| PUT | /api/v1/boards/{bid}/columns/{cid} | Manager+ (del proyecto) |
| POST | /api/v1/boards/{bid}/tasks | Developer+ (del proyecto) |
| PUT | /api/v1/tasks/{id} | Developer+ (asignado) / Manager+ |
| PATCH | /api/v1/tasks/{id}/move | Developer+ (asignado) / Manager+ |
| DELETE | /api/v1/tasks/{id} | Manager+ (del proyecto) |
| POST | /api/v1/tasks/{id}/comments | Developer+ (del proyecto) |
| GET | /api/v1/tasks/{id}/comments | Viewer+ (del proyecto) |
| PUT | /api/v1/tasks/{id}/planning | Manager+ (del proyecto) |
| POST | /api/v1/tasks/{id}/subtasks | Developer+ (del proyecto) |
| PATCH | /api/v1/tasks/{id}/subtasks/{sid}/toggle | Developer+ (del proyecto) |
| POST | /api/v1/tasks/{id}/dependencies | Manager+ (del proyecto) |
| GET | /api/v1/projects/{id}/workload | Manager+ (del proyecto) |
| GET | /api/v1/projects/{id}/dashboard/summary | Viewer+ (del proyecto) |
| GET | /api/v1/projects/{id}/sprints/{sid}/burndown | Viewer+ (del proyecto) |
| GET | /api/v1/projects/{id}/reports/workload | Manager+ (del proyecto) |

---

## Códigos HTTP de Error por Autorización

| Código | Significado | Cuándo usarlo |
|:------:|:------------|:--------------|
| **401** | No autenticado | Token faltante, inválido o expirado |
| **403** | No autorizado | Usuario autenticado pero sin el rol mínimo requerido |
| **404** | No encontrado | Recurso inexistente (no revelar existencia si el usuario no tiene permisos) |
