# Diagrama de Componentes — Kanbix

![Diagrama de Componentes](Diagrama_Componentes.drawio.png)

Diagrama de componentes del sistema Kanbix, mostrando la arquitectura de capas, los paquetes, componentes y flujos de comunicación entre el frontend y backend.

---

## Paquetes y Componentes

### Paquete: Interfaz (kanban-frontend)

| Componente | Descripción |
|------------|-------------|
| **BoardView** | Tablero Kanban con drag & drop (dnd-kit) |
| **Dashboard** | Métricas y gráficos (Recharts) |

### Paquete: API

| Componente | Descripción |
|------------|-------------|
| **FastAPI Gateway** | JWT Auth — CORS — Routing |

### Paquete: Capa Lógica (kanban-backend — Railway)

| Componente | Descripción |
|------------|-------------|
| **AuthService** | JWT + Refresh tokens (python-jose) |
| **ProjectsRouter** | Proyectos, equipos, sprints |
| **TaskRouter** | Tareas, columnas, deadlines, dependencias |
| **MetricRouter** | Burndown, velocidad de equipo, tiempo de ciclo |
| **WS-Streams** | Change Streams (MongoDB), WebSocket |
| **Email Notifier** | Notificaciones por email (asignación, deadline) |

### Paquete: Datos

| Componente | Descripción |
|------------|-------------|
| **MongoDB Atlas — Colecciones** | projects, teams, sprints, tasks, users |

### Paquete: Servicios Auxiliares

| Componente | Descripción |
|------------|-------------|
| **MongoDB Atlas** | Base de datos cloud |
| **SendGrid** | Servicio de envío de correos |

---

## Flujos y Conexiones

| Origen | Conexión | Destino | Tipo |
|--------|:--------:|---------|:----:|
| Interfaz (BoardView / Dashboard) | → HTTP/REST → | API (FastAPI Gateway) | Línea sólida |
| Interfaz (BoardView) | → WebSocket → | Capa Lógica (WS-Streams) | Línea punteada |
| Capa Lógica (Email Notifier) | → SMTP/API → | Servicios Auxiliares (SendGrid) | Línea punteada |
| Capa Lógica (Routers / Services) | → Motor (async) → | Datos (MongoDB Atlas) | Línea sólida |
