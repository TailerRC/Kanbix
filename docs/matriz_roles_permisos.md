# Matriz de Roles y Permisos — Kanbix

Fuente única de verdad para autorización en endpoints. Todos los permisos derivan de las Reglas de Negocio (RN) y Requerimientos Funcionales (RF).

---

## Roles

El sistema distingue entre **roles globales** (asignados por un Admin al crear la cuenta, determinan qué puede hacer el usuario en el sistema) y **roles por proyecto** (asignados por un Manager dentro de cada proyecto, determinan los permisos específicos en ese proyecto).

### Roles Globales

| Rol | Descripción |
|:----|:------------|
| **Admin** | Crea usuarios, asigna roles globales, desbloquea cuentas. Supervisa todo el sistema. No es un rol dentro de proyectos — Admin puede acceder a cualquier proyecto. |
| **Manager** | Puede crear proyectos (RN-10). Gestiona los proyectos que crea o donde tiene rol Manager por proyecto. |
| **Developer** | Usuario estándar. No puede crear proyectos. Solo participa en proyectos donde se le ha invitado con un rol por proyecto. |

### Roles por Proyecto

| Rol | Descripción |
|:----|:------------|
| **Manager** | Administra el proyecto: miembros, roles por proyecto, sprints, columnas, tareas y reportes. |
| **Developer** | Ejecuta tareas asignadas y las mueve entre columnas del tablero. |
| **Viewer** | Acceso de solo lectura a tableros, tareas y reportes. |

**Jerarquía (RN-06):** `Admin > Manager > Developer > Viewer`

La jerarquía aplica tanto a roles globales como a roles por proyecto. Un rol superior hereda todos los permisos de los roles inferiores. Por ejemplo, Admin global puede hacer todo lo que Manager, Developer y Viewer pueden, en cualquier proyecto.

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
| | **Administración de Usuarios** | | | | | |
| 47 | Crear usuario | ✅ | ❌ | ❌ | ❌ | RN-05 |
| 48 | Desbloquear cuenta de usuario | ✅ | ❌ | ❌ | ❌ | RN-32 |
| 49 | Cambiar rol global de un usuario | ✅ | ❌ | ❌ | ❌ | RN-07 |
| 50 | Ver lista de usuarios del sistema | ✅ | ❌ | ❌ | ❌ | — |
| | **Notificaciones** | | | | | |
| 43 | Ver bandeja de notificaciones | ✅ | ✅ | ✅ | ✅ | RF73 |
| 44 | Marcar notificación como leída | ✅ | ✅ | ✅ | ✅ | RF74 |
| 45 | Marcar todas como leídas | ✅ | ✅ | ✅ | ✅ | RF75 |
| 46 | Configurar preferencias de notificación | ✅ | ✅ | ✅ | ✅ | —⁵ |

---

## Notas

1. **Manager** — las acciones de Proyectos (crear, editar, eliminar) verifican el **rol global** del usuario. Las acciones dentro de un proyecto verifican el **rol por proyecto**.
2. **Admin** — puede ejecutar cualquier acción en cualquier proyecto, independientemente del rol por proyecto. También gestiona usuarios y roles globales (RN-05, RN-07).
3. **Developer** — solo puede editar tareas que le fueron asignadas.
4. **Developer** — solo puede mover tareas que le fueron asignadas. Un Manager puede mover cualquier tarea del proyecto.
5. Acción definida en contratos API pero sin RN/RF explícito. Se considera implícita por el rol Manager.

---

## Reglas de Autorización por Endpoint

Cada endpoint en los contratos API debe validar el permiso según esta tabla:

| Método | Ruta | Rol mínimo |
|:------:|:-----|:----------:|
| GET | /api/v1/auth/me | Usuario autenticado |
| POST | /api/v1/auth/register | Admin (Enterprise — auto-registro deshabilitado) |
| POST | /api/v1/auth/login | Público |
| POST | /api/v1/auth/refresh | Público (requiere refresh_token) |
| POST | /api/v1/auth/logout | Usuario autenticado |
| POST | /api/v1/admin/users | Admin |
| GET | /api/v1/admin/users | Admin |
| POST | /api/v1/admin/users/{uid}/unlock | Admin |
| PUT | /api/v1/admin/users/{uid}/role | Admin |
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
