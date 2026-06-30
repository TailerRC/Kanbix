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

## Cómo Ejecutar el Proyecto

### Opción rápida (recomendada)

Ejecutar `setup.bat` en la raíz del proyecto. El script verifica las dependencias, instala lo que falte y levanta ambos servidores en ventanas separadas.

```cmd
.\setup.bat
```

### Opción manual — Backend (FastAPI + MongoDB)

```bash
cd kanban-backend

# Crear y activar entorno virtual (primera vez)
python -m venv .venv
.venv\Scripts\activate    # Windows
source .venv/bin/activate # Linux/Mac

# Instalar dependencias (primera vez)
pip install -r requirements.txt

# Configurar variables de entorno
# Copiar .env.example a .env y completar:
#   MONGO_URI: conexión a MongoDB Atlas
#   JWT_SECRET_KEY: clave secreta para JWT

# Iniciar servidor
python -m uvicorn app.main:app --reload --port 8000
```

El servidor queda en `http://localhost:8000` — Docs: `http://localhost:8000/docs`

### Opción manual — Frontend (React + Vite + TypeScript)

```bash
cd kanban-frontend

# Instalar dependencias (primera vez)
npm install

# Configurar variables de entorno (opcional)
# Crear .env con VITE_API_URL si se necesita apuntar a otro backend

# Iniciar servidor
npm run dev
```

El servidor queda en `http://localhost:5173`

### Ambos servidores juntos (sin setup.bat)

Para desarrollo, ejecutar **backend y frontend en terminales separadas**:

| Terminal | Comando |
|----------|---------|
| 1 (Backend) | `cd kanban-backend && python -m uvicorn app.main:app --reload --port 8000` |
| 2 (Frontend) | `cd kanban-frontend && npm run dev` |

---

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
