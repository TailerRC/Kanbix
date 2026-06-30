# Kanbix — Cerebro del Agente

> Este archivo es la fuente de verdad para cualquier agente de IA trabajando en este proyecto.
> Leer completo antes de escribir cualquier línea de código.

---

## 1. Contexto del Proyecto

**Nombre**: Kanbix
**Propósito**: Sistema Kanban colaborativo con gestión de proyectos, tableros, tareas, notificaciones en tiempo real y reportes.

**Stack**:
- Backend: Python + FastAPI + Motor (async MongoDB driver)
- Base de datos: MongoDB Atlas
- Frontend: React + Vite + TypeScript
- Auth: JWT + Refresh Token (ver ADR-002)
- Tiempo real: WebSockets (ver ADR-004)
- Estimación: Escala Fibonacci (ver ADR-006)

**Metodología**: SDD (Spec-Driven Development) — ningún módulo se codifica sin spec aprobada.

---

## 2. Módulos del Sistema

| # | Módulo | Backend path | Frontend path | Contrato |
|---|--------|-------------|---------------|---------|
| 1 | Auth + Usuarios | `kanban-backend/app/modules/auth/` | `kanban-frontend/src/features/auth/` | `docs/contratos/modulo1_auth_usuarios.md` |
| 2 | Proyectos y Equipos | `kanban-backend/app/modules/projects/` | `kanban-frontend/src/features/projects/` | `docs/contratos/modulo2_proyectos.md` |
| 3 | Tableros + Tareas | `kanban-backend/app/modules/boards/` | `kanban-frontend/src/features/kanban/` | `docs/contratos/modulo3_tableros_tareas.md` |
| 4 | Planificación y Asignaciones | `kanban-backend/app/modules/planning/` | `kanban-frontend/src/features/planning/` | `docs/contratos/modulo4_planificacion.md` |
| 5 | Alertas y Notificaciones | `kanban-backend/app/modules/notifications/` | `kanban-frontend/src/features/notifications/` | `docs/contratos/modulo5_notificaciones.md` |
| 6 | Reportes y Dashboard | `kanban-backend/app/modules/reports/` | `kanban-frontend/src/features/reports/` | `docs/contratos/modulo6_reportes.md` |

---

## 3. Arquitectura — Reglas Obligatorias

### Backend (Vertical Slicing)
- Cada módulo en `app/modules/<nombre>/` es AUTOCONTENIDO.
- Archivos por módulo: `routes.py`, `controller.py`, `service.py`, `model.py`, `schemas.py`
- `app/config/` → configuración global (settings, database, security). NO lógica de negocio.
- `app/shared/` → código reutilizable (middleware, utils). NO lógica de negocio.
- **PROHIBIDO**: importar directamente entre módulos. Si un módulo necesita datos de otro, llama su API.

### Frontend (Feature Slicing)
- Cada feature en `src/features/<nombre>/` es AUTOCONTENIDA.
- Subcarpetas por feature: `pages/`, `components/`, `hooks/`, `api/`
- `src/shared/` → componentes, hooks, api client, layouts y tipos reutilizables.
- **PROHIBIDO**: importar de `src/features/X/` desde `src/features/Y/`.

---

## 4. SDD — Metodología Obligatoria

Antes de escribir código de cualquier módulo:
1. Leer `docs/README.md` → localizar el contrato del módulo.
2. Leer el contrato completo (`docs/contratos/moduloN_*.md`).
3. Leer `docs/reglas_negocio.md` para las reglas que aplican al módulo.
4. Leer `docs/matriz_roles_permisos.md` para los permisos de los endpoints.
5. Seguir los pasos de la skill `sdd-docs`.

**No existe "empezar a codear para entender"**. Primero se entiende, después se codea.

---

## 5. Skill sdd-docs — Referencia Obligatoria

Antes de codificar cualquier módulo, cargar y seguir la skill:

```
.agents/skills/sdd-docs/SKILL.md
```

---

## 6. Reglas de Código

### Formato de respuestas API (backend)
```json
{
  "success": true,
  "data": {},
  "message": "Human readable message"
}
```

### Errores
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

### Auth
- Todos los endpoints (excepto `/auth/login`) requieren `Authorization: Bearer <token>`. El registro de usuarios es exclusivo de Admin (Enterprise).
- El middleware de auth vive en `app/shared/middleware/`.
- Para permisos por rol, consultar `docs/matriz_roles_permisos.md`.

### Commits
- Usar Conventional Commits: `feat(boards): add card drag endpoint`
- Scope = nombre del módulo en inglés.

---

## 7. Fuente de Verdad

**Toda decisión de diseño está documentada en `docs/`**.
Si hay contradicción entre el código y la documentación, la documentación tiene razón.
Actualizar siempre el doc correspondiente antes de hacer un cambio de arquitectura.
