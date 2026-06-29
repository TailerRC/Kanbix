# ADR-004: WebSockets + Change Streams para notificaciones en tiempo real

**Estado:** Aceptado · **Fecha:** 2026-06-21

---

## Contexto

El Módulo 5 requiere notificar a los usuarios en tiempo real cuando ocurren eventos: asignación de tarea, deadline próximo, movimiento de tarea, mención en comentario. Alternativas:

- **Polling HTTP**: el frontend consulta `GET /notifications` cada N segundos
- **Server-Sent Events (SSE)**: conexión unidireccional servidor → cliente
- **WebSockets + Change Streams**: conexión bidireccional persistente con eventos empujados por MongoDB
- **Socket.IO**: librería sobre WebSockets con fallback a polling

## Decisión

Se usa **WebSockets nativos de FastAPI** combinados con **MongoDB Change Streams** (`watch()` sobre colecciones `tasks` y `columns`).

- El frontend abre una conexión WS: `/ws/notifications/{user_id}?token=<jwt>`
- El backend usa `watch()` para escuchar cambios en MongoDB y los empuja al WebSocket correspondiente
- Se usa **APScheduler** para generar eventos programados (deadline_proximo cada 24h antes del vencimiento)
- Para usuarios desconectados, se usa **SendGrid** para notificaciones por email

## Consecuencias

### Positivas
- Sin polling: el servidor solo envía datos cuando hay cambios reales
- Latencia cercana a cero: el evento llega al frontend en milisegundos
- Change Streams evitan lógica custom de detección de cambios
- El frontend solo necesita mantener una conexión WS abierta (socket nativo, sin librerías extra)

### Negativas
- Change Streams requieren MongoDB replica set (Atlas lo provee, en desarrollo local no)
- Conexiones WS persistentes consumen memoria en el servidor (1 socket por usuario conectado)
- Si la conexión se cae, el frontend debe reconectar y puede perder eventos durante el corte
- Los eventos programados (deadline_proximo) añaden complejidad con APScheduler
