## Why

El backend y frontend actuales del Módulo 2 (Proyectos) presentan brechas técnicas del 80-85% con respecto al nuevo contrato oficial de 15 endpoints. Se requiere alinear el idioma de las APIs (inglés a español), aplicar soft-delete a proyectos, e incorporar funcionalidades indispensables de negocio: buscador, flujo de invitaciones por email, cambio de roles en caliente, y la gestión completa del ciclo de vida de los sprints.

## What Changes

- **Alineación de campos**: Se migran todos los campos de proyectos al español (`nombre`, `descripcion`, `color`, `fecha_inicio`, `fecha_fin`, `iniciales`, `estado`, `fecha_creacion`).
- **Buscador de proyectos**: Nuevo endpoint `GET /projects/search?q={nombre}` case-insensitive para buscar proyectos.
- **Soft-delete de proyectos**: El borrado de proyectos pasa a ser lógico actualizando el estado a `Archivado` en lugar de borrar documentos físicos de la base de datos, preservando el histórico.
- **Gestión de Invitaciones**: Flujo de invitación formal por email con vencimiento de 7 días y aceptación/rechazo a través de un panel dedicado (`POST /projects/{id}/invitations` y `PATCH /invitations/{id}/respond`).
- **Edición de Roles**: Permitir cambiar el rol de un miembro activo en el proyecto (`PATCH /projects/{id}/members/{mid}/role`).
- **Gestión de Sprints**: Incorporación completa del CRUD de sprints y la acción de cerrar sprint activo (`PATCH /close`), la cual traslada automáticamente las tareas sin terminar al backlog (actualizando su `sprint_id` a `null`).

## Capabilities

### New Capabilities
- `projects-crud-softdelete`: Creación, edición, listado, buscador y soft-delete de proyectos utilizando el esquema en español.
- `invitations-members-roles`: Flujo de envío y respuesta a invitaciones de miembros, y asignación/edición de roles por proyecto.
- `sprint-management-lifecycle`: Creación, edición, listado y lógica de cierre de sprints con migración automática de tareas incompletas al backlog.

### Modified Capabilities
*Ninguna.*

## Impact

- **Base de datos**: Se añaden las colecciones `invitations` y `sprints` en MongoDB Atlas.
- **Backend (Python/FastAPI)**: Modificaciones en esquemas, modelos y rutas en `app/modules/projects/`.
- **Frontend (React/TypeScript)**: Actualización de `projectsApi.ts`, `ProjectsPage.tsx`, `ProjectDetailPage.tsx`, y adición del panel de invitaciones y gestión de sprints.
