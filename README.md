# Kanbix

Sistema Kanban colaborativo con gestión de proyectos, tableros drag & drop, tareas, notificaciones en tiempo real y reportes.

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | Python 3.12 + FastAPI + Motor |
| Base de datos | MongoDB Atlas |
| Frontend | React 18 + Vite + TypeScript |
| Auth | JWT + Refresh Token |
| Tiempo real | WebSockets |

## Estructura del Repositorio

```
kanban-repo/
├── kanban-backend/          # FastAPI — vertical slicing por módulo
│   └── app/
│       ├── config/          # settings.py, database.py, security.py
│       ├── shared/          # middleware, utils
│       └── modules/         # auth, projects, boards, planning, notifications, reports
│
├── kanban-frontend/         # React + Vite — feature slicing
│   └── src/
│       ├── shared/          # components, hooks, api, layouts, types
│       └── features/        # auth, projects, kanban, planning, notifications, reports
│
├── docs/                    # 📚 Fuente de verdad — leer antes de codear
│   ├── README.md            # Índice completo
│   ├── contratos/           # Contratos API por módulo
│   ├── requerimientos/      # RF + RNF
│   └── adr/                 # Architecture Decision Records
│
├── AGENTS.md                # Cerebro para Antigravity
├── CLAUDE.md                # Cerebro para Claude Code
├── GEMINI.md                # Cerebro para Gemini CLI
└── opencode.json            # Configuración OpenCode
```

## Documentación

→ Ver [`docs/README.md`](./docs/README.md) para el índice completo.

## Módulos

Fuente de verdad: [`docs/casos_uso_sistema_kanbix.md`](./docs/casos_uso_sistema_kanbix.md)

| # | Módulo | Backend | Frontend | CUS |
|---|--------|---------|---------|-----|
| 1 | Autenticación y Usuarios | `modules/auth/` | `features/auth/` | CUS-AU-01 a 03 |
| 2 | Proyectos y Equipos | `modules/projects/` | `features/projects/` | CUS-PE-01 a 04 |
| 3 | Tablero Kanban y Tareas | `modules/boards/` | `features/kanban/` | CUS-TK-01 a 04 |
| 4 | Planificación y Asignaciones | `modules/planning/` | `features/planning/` | CUS-PA-01 a 04 |
| 5 | Alertas y Notificaciones | `modules/notifications/` | `features/notifications/` | CUS-AN-01 a 03 |
| 6 | Reportes y Dashboard | `modules/reports/` | `features/reports/` | CUS-RD-01 a 04 |

## Regla Fundamental

> **SDD primero**: ningún módulo se codifica sin haber leído su contrato en `docs/contratos/`.
> Ver `AGENTS.md` para el proceso completo.
