# Tasks: Frontend del Módulo 2 — Proyectos y Equipos

## T1: Ampliar projectsApi.ts

**Archivo**: `kanban-frontend/src/features/projects/api/projectsApi.ts`

Agregar 4 funciones:

```typescript
export async function updateProject(
  id: string,
  data: { name?: string; description?: string }
): Promise<Project> {
  const { data: res } = await api.put<Project>(`/projects/${id}`, data);
  return res;
}

export async function addMember(
  projectId: string,
  userId: string,
  rol: RolProyecto
): Promise<void> {
  await api.post(`/projects/${projectId}/members`, { user_id: userId, rol });
}

export async function removeMember(
  projectId: string,
  userId: string
): Promise<void> {
  await api.delete(`/projects/${projectId}/members/${userId}`);
}

import type { User } from '../../shared/types';
export async function listUsers(): Promise<User[]> {
  const { data } = await api.get<Paginated<User>>('/admin/users');
  return data.data;
}
```

Actualizar el import de `RolProyecto` y `User` desde `shared/types`.

**✅ Acceptance**: `tsc -b` compila sin errores.

---

## T2: Crear ProjectDetailPage

**Archivos**: `kanban-frontend/src/features/projects/pages/ProjectDetailPage.tsx` + `ProjectDetailPage.css`

### Componente principal

1. **Obtener `projectId`** de `useParams()`
2. **Estado local**: `project`, `loading`, `error`, modales `showEdit`, `showDelete`, `showAddMember`
3. **`useEffect`**: llamar `getProject(projectId)` al montar y recargar después de cada mutación
4. **Obtener `user`** de `useAuth()` para determinar rol global

### Layout de la página

#### Header (flex row)
- Título h1 + badge de rol del usuario
- Descripción (o "Sin descripción" en muted)
- Meta: fecha creación, member count
- **Botones** (solo si Manager/Admin):
  - Editar (btn--outline)
  - Eliminar (btn--outline, color-error al hover)

#### Members Section (card)
- Header: "Miembros ({count})" + botón "Agregar miembro" (solo Manager)
- Tabla: Nombre | Email | Rol (badge) | Acciones
- **Badge por rol**: Manager=violeta(#6366F1), Developer=azul(#3B82F6), Viewer=gris(#94A3B8)
- **Acciones**: botón ✕ para eliminar (solo Manager), con confirmación

#### Estados
- Loading: skeleton de 3 filas
- Error: mensaje + botón "Volver a proyectos"
- Vacío: proyecto sin miembros (raro pero posible)

### Modal: Editar Proyecto

- Mismo patrón que el modal de crear en ProjectsPage
- Campos pre-poblados con valores actuales
- Al submit: `updateProject(id, { name, description })` → recargar

### Modal: Eliminar Proyecto

- Advertencia en rojo sobre eliminación en cascada
- Input: escribir "ELIMINAR" para habilitar botón
- Botón rojo: "Eliminar proyecto"
- Al confirmar: `deleteProject(id)` → `navigate('/projects', { replace: true })`

### Modal: Agregar Miembro

- **Select de usuarios**: cargar vía `listUsers()` al abrir el modal
  - Mostrar "Cargando usuarios…" mientras fetch
  - Si error (403 para no-Admin): mostrar mensaje "No tienes permisos para listar usuarios del sistema"
- **Select de rol**: Manager, Developer, Viewer
- Al submit: `addMember(projectId, userId, rol)` → recargar miembros
- Si el usuario ya es miembro: mostrar error del backend

### CSS

Seguir el patrón de `ProjectsPage.css`:

```css
.project-detail { animation: fadeIn 0.4s ease both; }
.project-detail__header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; }
.project-detail__back { ... }
.project-detail__info { ... }
.project-detail__title { font-size: var(--fs-display); font-weight: var(--fw-bold); }
.project-detail__desc { color: var(--color-text-secondary); margin-top: 4px; }
.project-detail__meta { display: flex; gap: 16px; margin-top: 8px; font-size: var(--fs-caption); color: var(--color-text-muted); }
.project-detail__actions { display: flex; gap: 10px; }
.project-detail__members { background: var(--color-surface); border-radius: var(--radius-lg); box-shadow: var(--shadow-card); padding: 24px; }
.project-detail__members-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.project-detail__table { width: 100%; border-collapse: collapse; }
.project-detail__table th { text-align: left; font-size: var(--fs-caption); color: var(--color-text-muted); padding: 8px 12px; border-bottom: 1px solid var(--color-border); }
.project-detail__table td { padding: 12px; border-bottom: 1px solid var(--color-bg); font-size: var(--fs-body); }
.project-detail__role-badge { display: inline-flex; padding: 2px 10px; border-radius: var(--radius-pill); font-size: var(--fs-caption); font-weight: var(--fw-medium); }
.project-detail__remove-btn { background: none; border: none; color: var(--color-text-muted); cursor: pointer; padding: 4px; border-radius: var(--radius-sm); }
.project-detail__remove-btn:hover { background: var(--color-error-bg); color: var(--color-error); }
```

Usar el mismo patrón de modales que `ProjectsPage.css` con overlay + modal white.

---

## T3: Agregar ruta /projects/:id

**Archivo**: `kanban-frontend/src/App.tsx`

Agregar dentro del `<Route element={<ProtectedLayout />}>`:

```typescript
import ProjectDetailPage from './features/projects/pages/ProjectDetailPage';
// ...
<Route path="/projects/:id" element={<ProjectDetailPage />} />
```

**✅ Acceptance**: Navegar a `/projects/abc123` renderiza ProjectDetailPage. Navegar a `/projects` renderiza ProjectsPage.

---

## T4: Actualizar navegación en ProjectsPage

**Archivo**: `kanban-frontend/src/features/projects/pages/ProjectsPage.tsx`

Cambiar `onClick` de las cards:

```typescript
// Antes:
onClick={() => navigate(`/board?project=${p.id}`)}
// Después:
onClick={() => navigate(`/projects/${p.id}`)}
```

**✅ Acceptance**: Click en card navega a `/projects/{id}`.

---

## T5: Verificar compilación y consistencia

```bash
cd kanban-frontend
npx tsc -b
```

- Verificar que no hay errores de tipo
- Verificar que los imports son correctos
- Verificar que los estilos siguen el patrón BEM y usan design tokens
- Verificar que no hay imports cross-module de `features/` a `features/`
