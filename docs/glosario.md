# Glosario — Kanbix

Definiciones de términos técnicos y de dominio usados en la documentación del proyecto. Mantiene alineados a los 6 módulos y evita ambigüedades entre frontend y backend.

---

## A

### Access Token
Token JWT de corta duración (1 hora por defecto) que el frontend envía en el header `Authorization: Bearer <token>` para autenticar cada petición a la API. Se obtiene via `POST /auth/login` y se renueva via `POST /auth/refresh`.

### Aggregation Pipeline
Sistema de MongoDB para procesar documentos dentro de la base de datos usando etapas (`$match`, `$group`, `$sort`, `$project`, etc.). Se usa en Kanbix para calcular métricas del dashboard (burndown, velocidad de equipo, tiempo de ciclo) sin transferir datos al servidor.

---

## B

### Backlog
Lista de tareas pendientes que aún no han sido asignadas a un sprint. Las tareas no completadas al cerrar un sprint vuelven al backlog automáticamente (RN-18).

### Burndown Chart
Gráfico que compara el progreso real de un sprint contra la línea ideal de trabajo restante. Eje X = días del sprint, Eje Y = story points (o tareas) pendientes. Se implementa con Recharts en el frontend y aggregation pipelines en MongoDB.

---

## C

### Change Streams
Funcionalidad de MongoDB que permite escuchar cambios en tiempo real sobre colecciones (`watch()`). En Kanbix, se usa en el Módulo 5 para detectar inserciones/actualizaciones en `tasks` y propagar eventos al frontend via WebSocket.

### Carga de Trabajo (Workload)
Total de story points asignados a cada miembro del equipo en un proyecto. Se consulta via `GET /projects/{id}/workload`.

### Columna
Estado dentro de un tablero Kanban. Columnas por defecto: **Backlog → To Do → In Progress → In Review → Done** (RN-20). Son personalizables por proyecto y tienen un orden posicional.

### Comentario
Mensaje asociado a una tarea que soporta menciones a usuarios con sintaxis `@username`. Las menciones disparan notificaciones en tiempo real.

---

## D

### Dashboard
Vista general del proyecto que muestra métricas de alto nivel: total de tareas, completadas, pendientes, sprint activo, burndown, carga de trabajo y velocidad del equipo. Módulo 6.

### Dependencia (entre tareas)
Relación donde una tarea no puede pasar a **In Progress** hasta que otra tarea (la dependencia) esté en **Done** (RN-26). El backend debe validar que no se creen dependencias circulares (RN-27, CUS-PA-04).

### Dependencia Circular
Bucle prohibido donde la tarea A depende de B y B depende de A (directa o transitivamente). Detectado y rechazado por el backend en `POST /tasks/{id}/dependencies`.

### dnd-kit
Librería React para drag & drop. Se usa en el Módulo 3 para mover tareas entre columnas del tablero Kanban.

### Drag & Drop (DnD)
Interacción de arrastrar y soltar. En Kanbix, se usa para reordenar tareas dentro de una columna y moverlas entre columnas para cambiar su estado.

---

## E

### Embedding (MongoDB)
Estrategia de modelado que almacena documentos anidados dentro de un documento padre. Se usa para subtareas dentro de una tarea y comentarios dentro de una tarea.

### Estado de Proyecto
Valores posibles: **Activo**, **Pausado**, **Archivado** (RF17). Un proyecto archivado es readonly.

---

## F

### FastAPI
Framework Python async para construcción de APIs REST. Genera automáticamente documentación OpenAPI en `/docs` y `/openapi.json`. Es el backend de Kanbix.

### Fibonacci (Escala)
Escala de estimación de story points: 1, 2, 3, 5, 8, 13. Usada en planificación de sprints para asignar esfuerzo a tareas (Módulo 4). Validada por el backend.

---

## J

### JWT (JSON Web Token)
Estándar de token de autenticación basado en JSON firmado. Kanbix usa JWT con `access_token` (corta duración) y `refresh_token` (larga duración) para manejo de sesiones.

---

## M

### Miembro
Usuario que pertenece a un proyecto con un rol específico. La relación es N:N resuelta por la entidad intermedia MIEMBRO.

### Motor
Driver asíncrono de MongoDB para Python. Permite operaciones no bloqueantes sobre la base de datos, necesario para que FastAPI mantenga su naturaleza async.

### MongoDB Atlas
Base de datos NoSQL cloud-native. Kanbix la usa como única fuente de datos. Las colecciones principales son: `users`, `projects`, `boards`, `columns`, `tasks`, `subtasks`, `comments`, `notifications`, `sprints`, `reports`.

---

## N

### Notificación
Mensaje generado por eventos del sistema: asignación de tarea, deadline próximo, movimiento de tarea, mención en comentario. Se entregan via WebSocket (tiempo real) o email (SendGrid, si el usuario está desconectado). Módulo 5.

---

## P

### Prioridad de Tarea
Nivel de importancia: **Baja**, **Media**, **Alta**, **Crítica** (RN-24). Determina el orden de atención dentro de una columna.

### Proyecto
Entidad raíz que agrupa tableros, sprints, tareas y miembros. Tiene nombre único (RN-12), descripción, color, estado y fechas. Creado por un usuario que se convierte automáticamente en su Manager.

### Pydantic
Librería Python para definición de modelos con validación de tipos. FastAPI la usa para validar request/response bodies. Cada endpoint de Kanbix tiene modelos Pydantic asociados.

---

## R

### Recharts
Librería React para gráficos SVG declarativos. Se usa en el Módulo 6 para renderizar burndown charts, velocidad de equipo y tiempo de ciclo.

### Refresh Token
Token de larga duración (7 días) usado para renovar el `access_token` sin que el usuario tenga que volver a hacer login. Se invalida en logout (RN-05).
### Rol

Conjunto de permisos dentro de un proyecto. Valores: **Manager**, **Developer**, **Viewer**. Los roles determinan qué acciones puede realizar un miembro (crear tareas, mover columnas, eliminar proyectos, etc.).

- **Manager** — administra el proyecto: gestiona miembros, roles, sprints, columnas, tareas, dependencias y reportes. Corresponde al rol que creó el proyecto.
- **Developer** — ejecuta tareas asignadas y las mueve entre columnas del tablero.
- **Viewer** — acceso de solo lectura a tableros, tareas y reportes.

### Admin
Usuario con privilegios globales sobre todo el sistema. Puede crear proyectos en cualquier contexto, asignar y modificar roles de cualquier usuario, y acceder a todos los reportes. No es un rol asignable por proyecto — es un nivel superior al sistema de roles por proyecto.

---

## S

### SDD (Spec-Driven Development)
Metodología del proyecto donde las especificaciones formales (reglas de negocio, contratos API, reqs funcionales) se definen primero y guían toda la implementación. El código se genera a partir de las specs, no al revés.

### SendGrid
Servicio externo de envío de emails transaccionales via API. Kanbix lo usa en el Módulo 5 para notificaciones por email cuando el usuario está desconectado.

### Sprint
Período de tiempo con fecha de inicio y fin obligatorias (RN-17). Solo puede haber un sprint **Activo** por proyecto (RN-16). Al cerrar un sprint, las tareas no completadas vuelven al backlog (RN-18).

### Story Point
Unidad relativa de estimación de esfuerzo usando la escala Fibonacci (1, 2, 3, 5, 8, 13). Se asigna a tareas en la planificación del sprint. No es tiempo real, es esfuerzo relativo.

### Subtarea
Tarea anidada dentro de una tarea padre. La tarea padre no puede marcarse **Done** si alguna subtarea está pendiente (RN-23).

---

## T

### Tablero (Board)
Representación visual del flujo de trabajo de un proyecto. Contiene columnas que a su vez contienen tareas. Un proyecto puede tener múltiples tableros (ej: uno por sprint).

### Tarea
Unidad mínima de trabajo en Kanbix. Pertenece a un proyecto, una columna y opcionalmente a un sprint. Tiene título, descripción, prioridad, asignado, fecha límite, story points, etiquetas y comentarios.

### Tiempo de Ciclo (Cycle Time)
Métrica que mide el tiempo desde que una tarea entra en **In Progress** hasta que llega a **Done**. Calculada con aggregation pipelines en MongoDB usando `$subtract`.

### Token
Ver **Access Token**, **Refresh Token**, **JWT**.

---

## V

### Velocidad del Equipo (Team Velocity)
Métrica que suma los story points completados por sprint. Calculada con `$group` por sprint + `$sum` de story points en tareas **Done**. Se usa para planificar sprints futuros.

---

## W

### WebSocket (WS)
Protocolo de comunicación bidireccional persistente. Kanbix expone `/ws/notifications/{user_id}` para enviar notificaciones en tiempo real al frontend sin polling.
