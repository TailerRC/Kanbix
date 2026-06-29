# Módulo 5: Alertas y Notificaciones

> Sistema de alertas y notificaciones en tiempo real. Utiliza MongoDB Change Streams para detectar cambios en la colección `tasks`, propaga eventos al frontend mediante WebSockets, y envía notificaciones por email vía SendGrid para eventos críticos.

---

## Endpoints REST

### GET /api/v1/notifications

Retorna todas las notificaciones del usuario autenticado, con filtros y paginación.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Parámetros de query

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| leida | boolean | No | Filtra por estado de lectura: true (leídas) o false (no leídas) |
| limite | integer | No | Cantidad máxima de resultados (default: 20, max: 100) |
| pagina | integer | No | Número de página para paginación (default: 1) |
| tipo | string | No | Filtra por tipo: `tarea_asignada` \| `deadline_proximo` \| `tarea_movida` \| `mencion` |

#### Response — 200 OK

```json
{
  "total": 3,
  "pagina": 1,
  "limite": 20,
  "notificaciones": [
    {
      "id": "64f3a1b2c5d6e7f8a9b0c1d2",
      "tipo": "tarea_asignada",
      "mensaje": "Se te ha asignado la tarea: Implementar login",
      "leida": false,
      "fecha": "2024-09-01T10:30:00Z",
      "datos": {
        "tarea_id": "64f3a1b2c5d6e7f8a9b0c1f0",
        "proyecto": "Kanbix Backend",
        "asignado_por": "Carlos López"
      }
    }
  ]
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token de acceso requerido o inválido |
| 403 | Cuenta desactivada — contactar al administrador |
| 500 | Error interno del servidor |

---

### PUT /api/v1/notifications/{id}/read

Marca una notificación específica como leída.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Parámetros de ruta

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| id | string | Sí | ID de la notificación (ObjectId de MongoDB) |

#### Response — 200 OK

```json
{
  "mensaje": "Notificación marcada como leída",
  "notificacion_id": "64f3a1b2c5d6e7f8a9b0c1d2",
  "leida": true,
  "fecha_lectura": "2024-09-01T11:00:00Z"
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token de acceso requerido o inválido |
| 403 | No tienes permiso para acceder a esta notificación (pertenece a otro usuario) |
| 404 | Notificación no encontrada |
| 500 | Error interno del servidor |

---

### PUT /api/v1/notifications/read-all

Marca como leídas todas las notificaciones no leídas del usuario autenticado.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Response — 200 OK

```json
{
  "mensaje": "Todas las notificaciones marcadas como leídas",
  "notificaciones_actualizadas": 5
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token de acceso requerido o inválido |
| 403 | Cuenta desactivada — contactar al administrador |
| 500 | Error interno del servidor |

---

### DELETE /api/v1/notifications/{id}

Elimina permanentemente una notificación del usuario.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Parámetros de ruta

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| id | string | Sí | ID de la notificación a eliminar (ObjectId de MongoDB) |

#### Response — 200 OK

```json
{
  "mensaje": "Notificación eliminada exitosamente"
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 401 | Token de acceso requerido o inválido |
| 403 | No tienes permiso para eliminar esta notificación |
| 404 | Notificación no encontrada |
| 500 | Error interno del servidor |

---

### PUT /api/v1/notifications/preferences

Configura qué tipos de notificaciones recibe el usuario por WebSocket y por email.

**Auth:** Requiere token JWT (Authorization: Bearer \<access_token\>)

#### Request Body

```json
{
  "email": {
    "tarea_asignada": true,
    "deadline_proximo": true,
    "tarea_movida": false,
    "mencion": true
  },
  "websocket": {
    "tarea_asignada": true,
    "deadline_proximo": true,
    "tarea_movida": true,
    "mencion": true
  }
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| email.tarea_asignada | boolean | No | Email al asignar tarea (default: true) |
| email.deadline_proximo | boolean | No | Email 24h antes del vencimiento (default: true) |
| email.tarea_movida | boolean | No | Email al cambiar de columna (default: false) |
| email.mencion | boolean | No | Email al ser mencionado (default: true) |
| websocket.* | boolean | No | Mismos tipos para notificaciones en tiempo real vía WS |

#### Response — 200 OK

```json
{
  "mensaje": "Preferencias actualizadas exitosamente",
  "preferencias": {
    "email": { "tarea_asignada": true, "deadline_proximo": true, "tarea_movida": false, "mencion": true },
    "websocket": { "tarea_asignada": true, "deadline_proximo": true, "tarea_movida": true, "mencion": true }
  }
}
```

#### Errors

| Código | Descripción |
|--------|-------------|
| 400 | Estructura del body incorrecta |
| 401 | Token de acceso requerido o inválido |
| 422 | Datos con formato incorrecto |
| 500 | Error interno del servidor |

---

## WebSocket Events

El frontend mantiene una conexión WebSocket persistente mientras el usuario está en la aplicación. Los eventos son empujados por el servidor cuando MongoDB Change Streams detecta cambios relevantes en las colecciones `tasks` y `columns`.

### WS /ws/notifications/{user_id}

Canal WebSocket persistente de notificaciones en tiempo real.

**Auth:** El token JWT se envía como query parameter: `/ws/notifications/{user_id}?token=<access_token>`

#### Parámetros de conexión

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| user_id | string | Sí | ID del usuario autenticado (ObjectId de MongoDB) |
| token | string | Sí | access_token JWT como query parameter |

#### Eventos emitidos por el servidor

**Evento: `tarea_asignada`** — Emitido cuando Change Streams detecta que el campo `asignado_a` de una tarea cambia al `user_id` conectado.

```json
{
  "evento": "tarea_asignada",
  "timestamp": "2024-09-01T10:30:00Z",
  "datos": {
    "tarea_id": "64f3a1b2c5d6e7f8a9b0c1f0",
    "titulo": "Implementar login con JWT",
    "proyecto": "Kanbix Backend",
    "sprint": "Sprint 2",
    "columna": "En Progreso",
    "asignado_por": "Carlos López",
    "deadline": "2024-09-10T23:59:00Z"
  }
}
```

**Evento: `deadline_proximo`** — Emitido por un job programado (APScheduler) cuando faltan exactamente 24 horas para el deadline.

```json
{
  "evento": "deadline_proximo",
  "timestamp": "2024-09-09T23:59:00Z",
  "datos": {
    "tarea_id": "64f3a1b2c5d6e7f8a9b0c1f0",
    "titulo": "Implementar login con JWT",
    "proyecto": "Kanbix Backend",
    "deadline": "2024-09-10T23:59:00Z",
    "horas_restantes": 24
  }
}
```

**Evento: `tarea_movida`** — Emitido cuando Change Streams detecta que el campo `columna_id` de una tarea cambia.

```json
{
  "evento": "tarea_movida",
  "timestamp": "2024-09-01T14:20:00Z",
  "datos": {
    "tarea_id": "64f3a1b2c5d6e7f8a9b0c1f0",
    "titulo": "Implementar login con JWT",
    "columna_anterior": "En Progreso",
    "columna_nueva": "En Revisión",
    "movido_por": "Ana García"
  }
}
```

**Evento: `mencion`** — Emitido cuando Change Streams detecta una inserción en comentarios que contiene `@user_id` del usuario conectado.

```json
{
  "evento": "mencion",
  "timestamp": "2024-09-01T15:05:00Z",
  "datos": {
    "tarea_id": "64f3a1b2c5d6e7f8a9b0c1f0",
    "titulo": "Implementar login con JWT",
    "comentario": "@Ana revisa la implementación del refresh token",
    "mencionado_por": "Carlos López"
  }
}
```

#### Errores / Cierre de conexión

```json
{
  "evento": "error",
  "codigo": 4001,
  "detalle": "Token expirado — reconectar con nuevo access_token"
}
```

| Código WS | Descripción |
|-----------|-------------|
| 4001 | Token JWT inválido o expirado |
| 4003 | Cuenta desactivada |
| 4004 | user_id no encontrado o sin permisos |
| 1011 | Error interno del servidor |

---

## Notificaciones por Email — SendGrid

El Email Notifier se activa desde el mismo listener de Change Streams. Según las preferencias del usuario, envía correos HTML transaccionales a través de la API de SendGrid.

| Trigger | Asunto del email | Destinatario | Condición |
|---------|------------------|--------------|-----------|
| tarea_asignada | Te han asignado una tarea en Kanbix | Usuario asignado | email.tarea_asignada = true |
| deadline_proximo | Tu tarea vence en 24 horas — Kanbix | Usuario asignado | Faltan exactamente 24h para el deadline |
| mencion | Te han mencionado en un comentario — Kanbix | Usuario mencionado | email.mencion = true |

---

## Resumen de Endpoints

| # | Método | Ruta | Descripción |
|---|--------|------|-------------|
| 1 | GET | /api/v1/notifications | Listar notificaciones del usuario |
| 2 | PUT | /api/v1/notifications/{id}/read | Marcar notificación como leída |
| 3 | PUT | /api/v1/notifications/read-all | Marcar todas como leídas |
| 4 | DELETE | /api/v1/notifications/{id} | Eliminar notificación |
| 5 | PUT | /api/v1/notifications/preferences | Actualizar preferencias de notificación |
| WS | WS | /ws/notifications/{user_id}?token=\<jwt\> | Canal WebSocket en tiempo real |

## Formato Estándar de Errores

Todos los errores REST devuelven la misma estructura JSON. El frontend React debe leer el campo `detail` y mostrarlo directamente al usuario.

```json
{
  "detail": "Mensaje descriptivo del error",
  "campo": "nombre_del_campo_con_error",
  "codigo": 400
}
```
