## 1. Backend: Proyectos en Español y Soft-Delete

- [x] 1.1 Modificar la colección `projects` y sus esquemas Pydantic (`ProjectCreate`, `ProjectUpdate`, `ProjectCreatedResponse`, `ProjectDetailResponse`) en `kanban-backend/app/modules/projects/schemas.py` para usar nombres de campos en español.
- [x] 1.2 Actualizar el controlador `controller.py` and el servicio `service.py` para mapear los campos en español en MongoDB Atlas (`nombre`, `descripcion`, `color`, `fecha_inicio`, `fecha_fin`, `iniciales`, `estado`, `id_creador`, `created_at`, `updated_at`).
- [x] 1.3 Modificar el endpoint `DELETE /projects/{project_id}` para realizar soft-delete (actualizar `estado` a `"Archivado"` en lugar de hard delete).
- [x] 1.4 Implementar el endpoint `GET /projects/search?q={nombre}` case-insensitive para búsqueda de proyectos.

## 2. Backend: Invitaciones, Miembros y Roles

- [x] 2.1 Crear el modelo y esquema Pydantic para invitaciones en `app/modules/projects/schemas.py`.
- [x] 2.2 Crear el servicio de invitaciones (`POST /projects/{project_id}/invitations`) para registrar invitaciones pendientes con vencimiento de 7 días.
- [x] 2.3 Crear la ruta `PATCH /invitations/{invitation_id}/respond` para que un usuario pueda aceptar o rechazar la invitación, añadiéndolo al proyecto si acepta.
- [x] 2.4 Crear el endpoint explícito `GET /projects/{project_id}/members` para retornar la lista de miembros con campos en español.
- [x] 2.5 Actualizar el borrado de miembro (`DELETE /projects/{project_id}/members/{member_id}`) y añadir la ruta de actualización de rol (`PATCH /projects/{project_id}/members/{member_id}/role`).

## 3. Backend: Gestión de Sprints y Rollover

- [x] 3.1 Crear la colección `sprints` y sus esquemas Pydantic (`SprintCreate`, `SprintResponse`, `SprintUpdate`).
- [x] 3.2 Implementar los endpoints de creación (`POST`), listado (`GET`) y edición (`PUT`) de sprints para un proyecto específico, validando la regla de exclusividad de sprint activo.
- [x] 3.3 Implementar el endpoint de cierre de sprint `PATCH /projects/{project_id}/sprints/{sprint_id}/close` que actualice el estado a `Cerrado` y mueva automáticamente las tareas no finalizadas (columna distinta de "Done") al backlog (`sprint_id = null`).

## 4. Frontend: Migración a Español y Nuevas Vistas

- [x] 4.1 Modificar el archivo `projectsApi.ts` para adecuar los nombres de campos a español y agregar las llamadas API de invitaciones, roles y sprints.
- [x] 4.2 Actualizar `ProjectsPage.tsx` para consumir campos en español, iniciales generadas y agregar el buscador case-insensitive en la cabecera.
- [x] 4.3 Implementar el panel de "Invitaciones Recibidas" en la UI de proyectos para permitir aceptar o rechazar invitaciones activas.
- [x] 4.4 Modificar `ProjectDetailPage.tsx` para consumir el listado de miembros desde el nuevo endpoint, permitir invitar por email y editar roles en caliente en la tabla.
- [x] 4.5 Desarrollar el panel de administración de Sprints dentro del detalle del proyecto, permitiendo crear, editar y cerrar sprints (rollover de tareas al backlog).
