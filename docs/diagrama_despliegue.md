# Diagrama de Despliegue — Kanbix

![Diagrama de Despliegue](Diagrama_Despliegue.drawio.png)

Diagrama de despliegue del sistema Kanbix, ilustrando la topología de nodos, componentes distribuidos y protocolos de comunicación entre entornos.

---

## Nodos y Componentes

### Nodo: Cliente

| Componente | Descripción |
|------------|-------------|
| **Navegador React SPA** | Aplicación de página única ejecutada en el navegador del usuario |

### Nodo: Vercel (CDN Global — kanban-frontend)

| Componente | Descripción |
|------------|-------------|
| **React + Vite SPA** | BoardView (dnd-kit), Dashboard (Recharts) |
| **WS Cliente** | Hook `useWebSocket` para conexiones en tiempo real |
| **API Client** | Axios con interceptors JWT |

### Nodo: Railway (kanban-backend — FastAPI)

| Componente | Descripción |
|------------|-------------|
| **FastAPI Gateway** | JWT Auth — CORS — Puerto 8000 |
| **Auth Router** | `POST /auth/login`, `POST /auth/refresh` |
| **Projects Router** | `GET /projects`, `POST /projects` |
| **Task Router** | `GET /tasks`, `PATCH /tasks/{id}` |
| **Metrics Router** | `GET /metrics/burndown`, `GET /metrics/velocity` |
| **WS Manager + Change Streams** | `WS /ws/board/{board_id}`, `watch()` sobre colección tasks, broadcast en insert/update, Motor async |

### Nodo: MongoDB Atlas (Cluster cloud — Motor driver)

| Componente | Descripción |
|------------|-------------|
| **Base de datos** | Colecciones: projects, teams, sprints, tasks, columns, users |

### Nodo: SendGrid

| Componente | Descripción |
|------------|-------------|
| **SMTP API** | Servicio de envío de correos electrónicos |

---

## Conexiones y Protocolos (Flujo de Red)

| Origen | Protocolo | Destino | Tipo de Línea |
|--------|:---------:|---------|:-------------:|
| Cliente (Navegador) | HTTPS | Vercel (kanban-frontend) | Sólida |
| Vercel (API Client) | REST API | Railway (FastAPI Gateway) | Sólida |
| Vercel (WS Cliente) | WEBSOCKET | Railway (WS Manager) | Sólida |
| Railway (WS Manager) | push evento → | Vercel (WS Cliente) | Punteada |
| Railway (WS Manager) | watch() → | MongoDB Atlas | Punteada |
| Railway (Routers/Services) | find / insertOne (Motor async) | MongoDB Atlas | Sólida |
| Railway (Email Notifier) | SMTP | SendGrid | Punteada |
