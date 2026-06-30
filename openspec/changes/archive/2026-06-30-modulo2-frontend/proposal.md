# Proposal: Frontend del Módulo 2 — Proyectos y Equipos

## Intent

Completar la UI del módulo de Proyectos para que los usuarios puedan ver el detalle de un proyecto, editar su nombre/descripción, gestionar miembros (agregar/remover), y eliminar el proyecto. El backend ya está 100% implementado; solo falta la capa frontend.

Actualmente ProjectsPage lista proyectos y crea nuevos, pero no hay una página de detalle ni gestión de miembros.

## Scope

### In Scope
- `ProjectDetailPage` con header, lista de miembros, edición inline, eliminación y gestión de miembros (agregar/remover)
- Ampliar `projectsApi.ts` con `updateProject`, `addMember`, `removeMember`, `listUsers`
- Ruta `/projects/:id` en `App.tsx`
- Navegación desde cards de ProjectsPage a `/projects/:id`
- Permisos por rol de proyecto: Manager puede editar/eliminar/gestionar miembros; Developer y Viewer solo ven

### Out of Scope
- Modo oscuro (ya existe como feature separada)
- Notificaciones al agregar/remover miembros
- Historial de actividad del proyecto
- Gestión de sprints o tableros desde la página de detalle

## Capabilities

### New Capabilities
- `project-detail`: Visualización detallada de un proyecto con su lista de miembros, roles por proyecto, y acciones según rol

### Modified Capabilities
None

## Approach

Crear una `ProjectDetailPage` que se renderiza dentro del `DashboardLayout` existente. Usar los mismos patrones de UI de ProjectsPage (cards, modales, badges, botones pill). La página obtiene el `projectId` del parámetro de ruta, carga el detalle vía `getProject()`, y muestra:

1. **Header**: nombre, descripción, rol del usuario, fecha de creación, botones de acción (editar, eliminar) visibles solo para Manager
2. **Members section**: tabla de miembros con nombre, email, rol badge, y botón de eliminar (solo Manager)
3. **Add member modal**: selector de usuario (dropdown de usuarios del sistema) + selector de rol
4. **Edit modal**: formulario de nombre/descripción
5. **Delete confirm**: modal de confirmación de eliminación con advertencia de cascada

`projectsApi.ts` se amplía con los endpoints faltantes. `listUsers()` llama a `GET /admin/users` directamente (cross-module permitido por API).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/features/projects/pages/ProjectDetailPage.tsx` | New | Página de detalle del proyecto |
| `src/features/projects/pages/ProjectDetailPage.css` | New | Estilos de la página de detalle |
| `src/features/projects/api/projectsApi.ts` | Modified | + updateProject, addMember, removeMember, listUsers |
| `src/features/projects/pages/ProjectsPage.tsx` | Modified | Navegación de cards a `/projects/:id` |
| `src/App.tsx` | Modified | + ruta `/projects/:id` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Usuario no miembro del proyecto accede por URL | Low | Backend retorna 403; UI muestra error claro |
| Eliminar miembro deja proyecto sin Manager | Low | Backend rechaza con 400 (RN-11); mostrar error |
| listUsers() expone usuarios no autorizados | Medium | Solo Admin puede llamar `GET /admin/users`; Developer/Manager sin permisos verán 403 |

## Rollback Plan

- Revertir cambios en `projectsApi.ts`, `App.tsx`, `ProjectsPage.tsx`
- Eliminar `ProjectDetailPage.tsx` y `ProjectDetailPage.css`
- Revertir cambios en Sidebar si se modificó

## Dependencies

- Backend endpoints del Módulo 2 (100% implementados)

## Success Criteria

- [ ] Navegar de ProjectsPage a detail y volver funciona
- [ ] Editar nombre/descripción persiste en backend
- [ ] Agregar miembro aparece en la lista inmediatamente
- [ ] Eliminar miembro desaparece de la lista
- [ ] Eliminar proyecto redirige a `/projects` y ya no aparece en la lista
- [ ] Developer/Viewer no ven botones de edición/eliminación/gestión
- [ ] `tsc -b` compila sin errores
