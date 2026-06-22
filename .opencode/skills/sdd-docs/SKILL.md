---
name: sdd-docs
description: >
  Guía obligatoria antes de codificar cualquier módulo de Kanbix.
  Se activa cuando se va a escribir código en kanban-backend/app/modules/*
  o kanban-frontend/src/features/*, o cuando se discute arquitectura,
  contratos, permisos o reglas de negocio de Kanbix.
---

# sdd-docs — Pasos Obligatorios Antes de Codificar

## Regla de Oro

> **No escribas una línea de código de un módulo sin haber leído su contrato y las reglas de negocio que lo afectan.**

La documentación es la fuente de verdad. Si hay duda entre el código y el doc, el doc gana.

---

## Pasos Obligatorios por Módulo

Antes de codificar cualquier módulo, ejecutar estos pasos en orden:

1. **Leer `docs/README.md`** — ubicar el contrato y los ADRs relevantes.
2. **Leer el contrato del módulo** (`docs/contratos/moduloN_*.md`) — entender todos los endpoints, parámetros, respuestas y errores.
3. **Leer `docs/reglas_negocio.md`** — filtrar las reglas que aplican al módulo.
4. **Leer `docs/matriz_roles_permisos.md`** — verificar qué roles tienen acceso a cada endpoint.
5. **Leer el ADR relevante** si la decisión técnica del módulo tiene un ADR asociado.
6. Solo después de los pasos 1–5: empezar a codificar.

---

## Tabla de Mapeo

| # | Módulo | Contrato | Backend | Frontend |
|---|--------|----------|---------|---------|
| 1 | Auth + Usuarios | `docs/contratos/modulo1_auth_usuarios.md` | `kanban-backend/app/modules/auth/` | `kanban-frontend/src/features/auth/` |
| 2 | Proyectos y Equipos | `docs/contratos/modulo2_proyectos.md` | `kanban-backend/app/modules/projects/` | `kanban-frontend/src/features/projects/` |
| 3 | Tableros + Tareas | `docs/contratos/modulo3_tableros_tareas.md` | `kanban-backend/app/modules/boards/` | `kanban-frontend/src/features/kanban/` |
| 4 | Planificación y Asignaciones | `docs/contratos/modulo4_planificacion.md` | `kanban-backend/app/modules/planning/` | `kanban-frontend/src/features/planning/` |
| 5 | Alertas y Notificaciones | `docs/contratos/modulo5_notificaciones.md` | `kanban-backend/app/modules/notifications/` | `kanban-frontend/src/features/notifications/` |
| 6 | Reportes y Dashboard | `docs/contratos/modulo6_reportes.md` | `kanban-backend/app/modules/reports/` | `kanban-frontend/src/features/reports/` |

---

## Estructura Esperada por Módulo

### Backend (`app/modules/<modulo>/`)
```
<modulo>/
├── __init__.py
├── routes.py      # FastAPI APIRouter — solo declaración de endpoints
├── controller.py  # Orquesta llamadas a service; maneja request/response HTTP
├── service.py     # Lógica de negocio pura; no conoce HTTP
├── model.py       # Schema de MongoDB (colección)
└── schemas.py     # Pydantic models (request body, response)
```

### Frontend (`src/features/<modulo>/`)
```
<modulo>/
├── api/           # Llamadas HTTP al backend (axios)
├── pages/         # Componentes de página (ruteados)
├── components/    # Componentes UI específicos del módulo
└── hooks/         # Custom hooks del módulo (estado local, llamadas API)
```

---

## Restricción de Imports Cross-Módulo

### Backend
```python
# ✅ PERMITIDO — imports dentro del mismo módulo
from app.modules.auth.schemas import UserResponse

# ✅ PERMITIDO — imports desde shared
from app.shared.middleware.auth import require_auth

# ❌ PROHIBIDO — un módulo importa directamente de otro módulo
from app.modules.projects.service import get_project  # desde boards/service.py
```

Si un módulo necesita datos de otro módulo: **llama su endpoint HTTP**, no su función Python.

### Frontend
```typescript
// ✅ PERMITIDO — imports dentro del mismo feature
import { useLogin } from './hooks/useLogin';

// ✅ PERMITIDO — imports desde shared
import { Button } from '@/shared/components/Button';

// ❌ PROHIBIDO — feature importa de otro feature
import { useProjectList } from '../projects/hooks/useProjectList'; // desde kanban/
```

---

## Checklist Rápido

Antes de hacer commit de código de un módulo, verificar:

- [ ] El endpoint existe en el contrato del módulo (`docs/contratos/`)
- [ ] Los roles y permisos coinciden con `docs/matriz_roles_permisos.md`
- [ ] Las reglas de negocio que aplican están implementadas (ver `docs/reglas_negocio.md`)
- [ ] No hay imports directos entre módulos
- [ ] El formato de respuesta sigue el estándar definido en `AGENTS.md` § 6
