# Kanbix — Reglas de Arquitectura

> Archivo de referencia para Antigravity. Complementa `AGENTS.md`.
> Fuente de verdad: `docs/`. Si el código contradice la doc, la doc gana.

---

## Módulos Canónicos (6 — inamovibles)

Estos son los ÚNICOS módulos válidos. Cualquier carpeta fuera de esta lista es un error arquitectónico.

| # | Nombre | Backend | Frontend |
|---|--------|---------|---------|
| 1 | Auth + Usuarios | `app/modules/auth/` | `src/features/auth/` |
| 2 | Proyectos y Equipos | `app/modules/projects/` | `src/features/projects/` |
| 3 | Tableros + Tareas | `app/modules/boards/` | `src/features/kanban/` |
| 4 | Planificación y Asignaciones | `app/modules/planning/` | `src/features/planning/` |
| 5 | Alertas y Notificaciones | `app/modules/notifications/` | `src/features/notifications/` |
| 6 | Reportes y Dashboard | `app/modules/reports/` | `src/features/reports/` |

---

## Reglas Críticas — Falla Inmediata

1. **No crear carpetas globales de capa**: está PROHIBIDO crear `controllers/`, `models/`, `services/`, `routes/` a nivel de `app/`. Solo existen dentro de cada módulo.

2. **No crear módulos nuevos sin contrato**: si no existe `docs/contratos/moduloN_*.md` para ese módulo, no se crea la carpeta.

3. **No importar entre módulos**: ver `sdd-docs/SKILL.md` → sección Restricción de Imports.

4. **No agregar lógica de negocio a `config/` o `shared/`**: esas carpetas son infraestructura pura.

5. **No crear páginas o componentes fuera de `features/` o `shared/`**: el frontend no tiene `views/`, `pages/` globales ni `components/` masivos en `src/`.

---

## Árbol de Referencia — Backend

```
kanban-backend/
└── app/
    ├── config/          # settings.py, database.py, security.py
    ├── shared/
    │   ├── middleware/  # auth guard, rate limiting, error handler
    │   └── utils/       # helpers, validators
    └── modules/
        ├── auth/        ← routes, controller, service, model, schemas
        ├── projects/    ← routes, controller, service, model, schemas
        ├── boards/      ← routes, controller, service, model, schemas
        ├── planning/    ← routes, controller, service, model, schemas
        ├── notifications/ ← routes, controller, service, model, schemas, websockets
        └── reports/     ← routes, controller, service, model, schemas, aggregations
```

## Árbol de Referencia — Frontend

```
kanban-frontend/
└── src/
    ├── shared/
    │   ├── api/         # axios instance + interceptors JWT
    │   ├── components/  # Button, Modal, Table, Input reutilizables
    │   ├── hooks/       # useAuth, useFetch, useToast
    │   ├── layouts/     # Sidebar, Navbar, MainLayout
    │   └── types/       # interfaces TypeScript globales
    └── features/
        ├── auth/        ← api/, pages/, components/, hooks/
        ├── projects/    ← api/, pages/, components/, hooks/
        ├── kanban/      ← api/, pages/, components/, hooks/
        ├── planning/    ← api/, pages/, components/, hooks/
        ├── notifications/ ← api/, pages/, components/, hooks/
        └── reports/     ← api/, pages/, components/, hooks/
```

---

## Equipo de 6 — Asignación por Módulo

Cada desarrollador es responsable de **un módulo completo** (backend + frontend). Las colisiones son imposibles porque los módulos son autocontenidos.

| Dev | Módulo | Backend | Frontend |
|-----|--------|---------|---------|
| Dev 1 | Auth | `modules/auth/` | `features/auth/` |
| Dev 2 | Proyectos | `modules/projects/` | `features/projects/` |
| Dev 3 | Boards | `modules/boards/` | `features/kanban/` |
| Dev 4 | Planificación | `modules/planning/` | `features/planning/` |
| Dev 5 | Notificaciones | `modules/notifications/` | `features/notifications/` |
| Dev 6 | Reportes | `modules/reports/` | `features/reports/` |

Código compartido (`shared/`, `config/`) → revisión conjunta antes de merge.
