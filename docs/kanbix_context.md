# Kanbix — Contexto del Proyecto

**Curso:** Arquitectura y Evolución de Software — URP, 2026-I  
**Metodología:** Spec-Driven Development (SDD)  
**Stack:** React + TypeScript + Vite (frontend) · FastAPI + Python (backend) · MongoDB Atlas (DB)  
**Repositorios:** `kanban-frontend` / `kanban-backend`

**Equipo:**
| Código | Nombre |
|--------|--------|
| 202310515 | Chacón Uscamaita, Rodrigo Alessandro |
| 202310518 | Caballero Medina, Gianfranco |
| 202311402 | Carrasco Pariona, Jerzy Ramon |
| 202211321 | Villon Nieto, Piero Alexander |
| 202210525 | Meneses Meléndez, Allisson Leandra |
| 202311383 | Cuadros Malaga, Diego Tomas |

---

## Problemática

Los equipos desarrollan software sin especificaciones formales como base y carecen de herramientas ágiles unificadas (Kanban + sprints + alertas + reportes en un solo sistema), lo que genera inconsistencias entre diseño e implementación, APIs mal definidas y baja trazabilidad.

## Objetivo General

Diseñar y desarrollar Kanbix aplicando SDD como metodología central, donde especificaciones formales, contratos de API y reglas de negocio guíen su construcción.

## Alcance

Sistema web de gestión ágil de proyectos con tablero Kanban, planificación de sprints, asignaciones, alertas en tiempo real y dashboard de reportes. Construido bajo SDD sobre React + Vite + TypeScript (frontend), FastAPI + Python (backend) y MongoDB Atlas (base de datos).

**Excluye:** integraciones externas (Jira, GitHub), facturación, despliegue en producción empresarial.

---

## Repositorios

### kanban-backend (FastAPI + Python)
API REST que contiene toda la lógica de negocio, contratos OpenAPI autogenerados, autenticación JWT con refresh tokens, WebSockets para notificaciones en tiempo real y pipelines de aggregation de MongoDB para métricas. Es el corazón del sistema: define los contratos que guían ambos lados del desarrollo.

### kanban-frontend (React + Vite + TypeScript)
Interfaz web que consume la API REST mediante contratos tipados (tipos generados desde el OpenAPI del backend). Incluye tablero Kanban con drag & drop (dnd-kit), dashboards con Recharts y WebSockets para alertas en tiempo real.

---

## Arquitectura

**Patrón:** Layered Architecture + Cliente-Servidor. Cada capa se comunica mediante contratos estrictos (interfaces TypeScript en frontend, modelos Pydantic en backend).

| Capa | Repositorio | Tecnologías | Responsabilidad |
|------|-------------|-------------|-----------------|
| Presentación | `kanban-frontend` | React, TypeScript, Vite, Tailwind/MUI, Recharts | Vistas, componentes UI, servicios de API (HTTP) |
| Lógica de Negocio | `kanban-backend` | FastAPI, Python, Pydantic | Routers REST, validación (Pydantic), servicios de negocio, auth JWT |
| Datos | `kanban-backend` | MongoDB Atlas, Motor (async), Aggregation Pipelines | Repositorios, modelos de colecciones, pipelines de métricas |

### Stack completo

| # | Tecnología | Capa | Rol |
|---|-----------|------|-----|
| 1 | React | Frontend | UI basada en componentes, estado reactivo |
| 2 | TypeScript | Frontend | Tipado estático, trazabilidad con contratos OpenAPI |
| 3 | Vite | Frontend | Bundler con HMR instantáneo |
| 4 | Recharts | Frontend | Gráficos SVG: burndown chart, velocidad de equipo, tiempo de ciclo |
| 5 | MUI / Tailwind | Frontend | Sistemas de diseño y utilidades CSS |
| 6 | FastAPI | Backend | API REST async, genera contratos OpenAPI automáticamente |
| 7 | Python | Backend | Lenguaje principal, lógica de negocio |
| 8 | Motor | Backend | Driver async de MongoDB para Python, no bloquea el event loop |
| 9 | MongoDB Atlas | Base de datos | DB cloud JSON; estructura natural para columnas → tareas → subtareas |
| 10 | MongoDB Aggregation | Base de datos | Pipelines (`$match`, `$group`, `$sort`, `$project`) para métricas en el servidor |

### Conexión con MongoDB Atlas

Solo el backend se conecta a MongoDB Atlas usando **Motor** (driver async). El frontend nunca toca la base de datos directamente; todo pasa por la API. Para notificaciones en tiempo real (Módulo 5), el backend usa **MongoDB Change Streams**: escucha cambios en colecciones y los empuja al frontend vía WebSockets.

---

## Módulos y Responsabilidades

| Módulo | Responsable | Descripción |
|--------|-------------|-------------|
| 1 — Autenticación y Usuarios | Rodrigo Chacón | Registro/login con JWT + refresh tokens, middlewares de seguridad, perfil de usuario. Base del sistema, debe entregarse primero. |
| 2 — Proyectos y Equipos | Piero Villón | CRUD de proyectos, invitación de miembros por email, roles (Manager, Developer, Viewer), gestión de sprints. |
| 3 — Tablero Kanban y Tareas | Gianfranco Caballero | Columnas personalizables, tareas con prioridad, drag & drop (dnd-kit), filtros y búsqueda. Único módulo fullstack. |
| 4 — Planificación y Asignaciones | Jerzy Carrasco | Asignación de tareas a miembros, planificación de sprints, backlog, dependencias entre tareas con detección de ciclos. |
| 5 — Alertas y Notificaciones | Diego Cuadros | Notificaciones en tiempo real vía WebSockets (Change Streams), alertas de sprint, bandeja de notificaciones, email vía SendGrid. |
| 6 — Reportes y Dashboard | Allisson Meneses | Dashboard general, burndown chart, velocidad de equipo, tiempo de ciclo, carga de trabajo por miembro, exportación a PDF. |

---

## Documentos de Especificación

| Tipo | Archivo |
|------|---------|
| Reglas de Negocio | [`reglas_negocio.md`](reglas_negocio.md) |
| Requerimientos Funcionales | [`requerimientos_funcionales.md`](requerimientos_funcionales.md) |
| Requerimientos No Funcionales | [`requerimientos_no_funcionales.md`](requerimientos_no_funcionales.md) |
| Casos de Uso | [`casos_uso_sistema_kanbix.md`](casos_uso_sistema_kanbix.md) |
| Diagrama de Componentes | [`diagrama_componentes.md`](diagrama_componentes.md) |
| Diagrama de Despliegue | [`diagrama_despliegue.md`](diagrama_despliegue.md) |
| Modelo de Dominio | [`entregable_modelo_dominio.md`](entregable_modelo_dominio.md) |
| Glosario | [`glosario.md`](glosario.md) |
| Matriz de Roles y Permisos | [`matriz_roles_permisos.md`](matriz_roles_permisos.md) |
| Contratos API — Módulo 1: Autenticación y Usuarios | [`modulo1_contratos_api.md`](modulo1_contratos_api.md) |
| Contratos API — Módulo 2: Proyectos y Equipos | [`modulo2_contratos_api.md`](modulo2_contratos_api.md) |
| Contratos API — Módulo 3: Tablero Kanban y Tareas | [`modulo3_contratos_api.md`](modulo3_contratos_api.md) |
| Contratos API — Módulo 4: Planificación y Asignaciones | [`modulo4_contratos_api.md`](modulo4_contratos_api.md) |
| Contratos API — Módulo 5: Alertas y Notificaciones | [`modulo5_contratos_api.md`](modulo5_contratos_api.md) |
| Contratos API — Módulo 6: Reportes y Dashboards | [`modulo6_contratos_api.md`](modulo6_contratos_api.md) |

---

## Architecture Decision Records (ADRs)

| ADR | Decisión |
|:----|:---------|
| [ADR-001](adr-001-sdd-como-metodologia.md) | SDD como metodología de desarrollo |
| [ADR-002](adr-002-jwt-con-refresh-tokens.md) | JWT + Refresh Tokens para autenticación |
| [ADR-003](adr-003-mongodb-atlas.md) | MongoDB Atlas como base de datos |
| [ADR-004](adr-004-websockets-notificaciones.md) | WebSockets + Change Streams para notificaciones |
| [ADR-005](adr-005-fastapi-motor.md) | FastAPI + Motor como backend stack |
| [ADR-006](adr-006-escala-fibonacci-story-points.md) | Escala Fibonacci para story points |

## Notas de Diseño Clave (SDD)

- **Especificación primero:** los endpoints se diseñan en OpenAPI antes de implementarse. El frontend genera tipos TypeScript desde ese contrato, eliminando inconsistencias entre capas.
- **Async/Await en toda la pila:** FastAPI + Motor ejecutan aggregation pipelines de forma no bloqueante; múltiples usuarios pueden solicitar reportes simultáneamente sin degradar rendimiento.
- **Métricas calculadas en MongoDB:** burndown chart (`$group` por fecha de cierre), velocidad de equipo (`$group` por sprint + `$sum` de story points) y tiempo de ciclo (`$subtract` entre fecha "In Progress" y "Done") se calculan directamente en Atlas con pipelines, minimizando transferencia de datos.
- **Trazabilidad total:** cada módulo puede rastrearse desde su historia de usuario → contrato OpenAPI → endpoint → prueba automatizada.
- **Notificaciones reactivas:** MongoDB Change Streams + WebSockets permiten broadcasting en tiempo real sin polling, usando `watch()` sobre la colección de tareas.
