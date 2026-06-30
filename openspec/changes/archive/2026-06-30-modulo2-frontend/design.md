# Design: Frontend del Módulo 2 — Proyectos y Equipos

## Arquitectura

```
App.tsx
└── ProtectedLayout
    └── /projects          → ProjectsPage (existente, modificar navegación)
    └── /projects/:id      → ProjectDetailPage (NUEVO)
```

ProjectDetailPage se compone de:

```
ProjectDetailPage
├── ProjectHeader     (nombre, desc, rol badge, acciones según rol)
├── MembersSection    (tabla de miembros + botón agregar)
│   ├── MemberRow     (nombre, email, rol badge, botón eliminar)
│   └── AddMemberModal (selector usuario + selector rol)
├── EditModal         (formulario nombre/descripción)
└── DeleteConfirmModal (confirmación con "ELIMINAR")
```

## Flujo de Datos

```
projectsApi.ts (ampliado)
  ├── listProjects()      → GET /projects
  ├── getProject(id)      → GET /projects/{id}
  ├── createProject(...)  → POST /projects
  ├── updateProject(...)  → PUT /projects/{id}
  ├── deleteProject(id)   → DELETE /projects/{id}
  ├── addMember(...)      → POST /projects/{id}/members
  ├── removeMember(...)   → DELETE /projects/{id}/members/{uid}
  └── listUsers()         → GET /admin/users (para dropdown)
```

## Estados de UI

### ProjectDetailPage
| Estado | Qué mostrar |
|--------|-------------|
| Loading | Skeleton: header placeholder + 3 filas de tabla placeholder |
| Error (404/403) | Mensaje de error con botón "Volver a proyectos" |
| Success | Header + tabla de miembros + botones según rol |
| Manager | Header + miembros + botones Editar/Eliminar/Agregar |
| Developer/Viewer | Header + miembros sin botones de acción |

### Modales
| Modal | Estados |
|-------|---------|
| Edit | idle → saving → success (cierra) / error (inline) |
| Delete | idle → typing "ELIMINAR" → deleting → success (redirect) / error |
| AddMember | idle → loadingUsers (select disabled) → saving → success / error |

## Layout CSS (ProjectDetailPage.css)

Usar `BEM` como el resto del proyecto. Clases bajo namespace `project-detail`:

```
.project-detail { }                    // page wrapper, fadeIn animation
.project-detail__header { }            // flex row: title + actions
.project-detail__back { }              // back button
.project-detail__title { }             // h1
.project-detail__desc { }              // p
.project-detail__meta { }              // row of badges/info
.project-detail__actions { }           // button group (right)
.project-detail__members { }           // card wrapper for members section
.project-detail__members-header { }    // flex: h2 + add button
.project-detail__table { }             // table element
.project-detail__table th { }
.project-detail__table td { }
.project-detail__role-badge { }        // badge per member role
.project-detail__remove-btn { }        // icon button
```

### Modales específicos

```
.edit-modal, .delete-modal, .add-member-modal
  └── __overlay, __content, __title, __field, __actions
```

Usar los mismos patrones de `ProjectsPage.css`: overlay fixed, modal white con border-radius 24px, padding 28px, shadow-modal.

## Design Tokens Usados

| Token | Uso |
|-------|-----|
| `--color-primary` | Botones principales |
| `--color-surface` | Fondo de cards/tabla |
| `--color-border` | Bordes de tabla, inputs |
| `--color-error` | Botón eliminar, errores |
| `--color-bg` | Filas alternadas de tabla (opcional) |
| `--radius-lg` | Cards |
| `--radius-pill` | Badges, botones |
| `--radius-sm` | Inputs |
| `--shadow-card` | Cards de sección |
| `--shadow-modal` | Modales |
| `--fs-display/h1/h2/body/label/caption` | Escala tipográfica |

## Comportamiento de Navegación

1. ProjectsPage: `onClick={() => navigate('/board?project=' + p.id)}` → `onClick={() => navigate('/projects/' + p.id)}`
2. Botón "Volver" en detail: `navigate('/projects')`
3. Eliminar proyecto: `navigate('/projects', { replace: true })` para evitar "volver" al proyecto eliminado

## Manejo de Errores

- Usar `getErrorMessage()` de `shared/api/api.ts` para todos los errores
- Errores 403: mostrar "No tienes permisos para realizar esta acción"
- Errores 404: mostrar "El proyecto no existe o fue eliminado"
- Errores de red: mensaje genérico con sugerencia de verificar conexión

## Permisos UI (sin llamada extra al backend)

El role del usuario en el proyecto viene en el campo `role` del `Project` y también en `members[].rol`. Para determinar si el usuario puede editar:

```typescript
// Del response de getProject(), el usuario actual tiene:
const userRole = project.members?.find(m => m.user_id === currentUserId)?.rol;
const isManager = userRole === 'Manager' || currentUser?.rol_global === 'Admin';
```
