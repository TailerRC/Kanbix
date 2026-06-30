# Modelo de Dominio — Kanbix

Diagrama del modelo de dominio del sistema Kanbix, mostrando las entidades, sus atributos y las relaciones entre ellas.

---

## Entidades y Atributos

### USUARIO

| Atributo | Tipo | Descripción |
|----------|------|-------------|
| id_usuario | int | Identificador único |
| nombre | varchar | Nombre completo del usuario |
| email | varchar | Email único (RN-02) |
| password_hash | varchar | Hash bcrypt de la contraseña (RN-03) |
| rol_global | varchar | Rol global: Admin, Manager o Developer (RN-05) |
| ultimo_acceso | datetime | Fecha y hora del último login |
| cuenta_bloqueada | boolean | True si la cuenta está bloqueada (RN-04) |
| intentos_fallidos | int | Contador de intentos fallidos consecutivos |
| bloqueado_hasta | datetime | Hasta cuándo está bloqueada la cuenta |
| cambiar_password | boolean | True si debe cambiar contraseña en el próximo login (RN-31) |
| password_expiracion | date | Fecha de expiración de la contraseña (RN-31) |
| ultimas_passwords | text | Lista de las últimas 5 contraseñas hasheadas (RN-31) |
| fecha_creacion | datetime | Cuándo se creó la cuenta |
| id_creador | int | Admin que creó la cuenta |

### PROYECTO

| Atributo | Tipo | Descripción |
|----------|------|-------------|
| id_proyecto | int | Identificador único |
| nombre | varchar | Nombre único del proyecto (RN-12) |
| descripción | varchar | Descripción del proyecto |
| color | varchar | Color identificador del proyecto |
| estado | varchar | Activo, Pausado o Archivado (RF24) |
| fecha | date | Fecha de creación |
| id_creador | int | Usuario que creó el proyecto |

### TABLERO (BOARD)

| Atributo | Tipo | Descripción |
|----------|------|-------------|
| id_tablero | int | Identificador único |
| nombre | varchar | Nombre del tablero |
| id_proyecto | int | FK → PROYECTO |

### COLUMNA

| Atributo | Tipo | Descripción |
|----------|------|-------------|
| id_columna | int | Identificador único |
| nombre | varchar | Nombre de la columna |
| orden | int | Posición dentro del tablero |
| id_proyecto | int | FK → PROYECTO |
| id_tablero | int | FK → TABLERO (opcional) |

### SPRINT

| Atributo | Tipo | Descripción |
|----------|------|-------------|
| id_sprint | int | Identificador único |
| nombre | varchar | Nombre del sprint |
| fecha_inicio | date | Fecha de inicio (RN-17) |
| fecha_fin | date | Fecha de fin, debe ser posterior a inicio (RN-17) |
| estado | varchar | Planeado, Activo, Cerrado |
| id_proyecto | int | FK → PROYECTO |

### TAREA

| Atributo | Tipo | Descripción |
|----------|------|-------------|
| id_tarea | int | Identificador único |
| titulo | varchar | Título de la tarea |
| descripcion | varchar | Descripción detallada |
| prioridad | varchar | Baja, Media, Alta o Crítica (RN-24) |
| story_points | int | Estimación Fibonacci (1,2,3,5,8,13) |
| fecha_creacion | datetime | Cuándo se creó |
| fecha_limite | date | Fecha límite opcional |
| id_creador | int | FK → USUARIO (quien creó) |
| id_usuario_asignado | int | FK → USUARIO (a quién está asignada) |
| id_columna | int | FK → COLUMNA |
| id_proyecto | int | FK → PROYECTO |
| id_sprint | int | FK → SPRINT (puede ser null = backlog) |

### DEPENDENCIA

| Atributo | Tipo | Descripción |
|----------|------|-------------|
| id_dependencia | int | Identificador único |
| id_tarea_origen | int | FK → TAREA (tarea que depende) |
| id_tarea_destino | int | FK → TAREA (tarea de la que depende) |

### MIEMBRO

| Atributo | Tipo | Descripción |
|----------|------|-------------|
| id_miembro | int | Identificador único |
| id_proyecto | int | FK → PROYECTO |
| id_usuario | int | FK → USUARIO |
| rol_proyecto | varchar | Manager, Developer o Viewer (rol dentro del proyecto) |

### INVITACION

| Atributo | Tipo | Descripción |
|----------|------|-------------|
| id_invitacion | int | Identificador único |
| email | varchar | Email del invitado |
| estado | varchar | Pendiente, Aceptada, Rechazada |
| tiempo_expiracion | number | Tiempo de expiración en horas |
| id_proyecto | int | FK → PROYECTO |
| id_invitador | int | FK → USUARIO (quien invitó) |

### NOTIFICACION

| Atributo | Tipo | Descripción |
|----------|------|-------------|
| id_notificacion | int | Identificador único |
| id_usuario | int | FK → USUARIO (destinatario) |
| tipo | varchar | Tipo de notificación |
| mensaje | varchar | Contenido de la notificación |
| leida | boolean | Si fue leída |
| fecha_creacion | datetime | Cuándo se generó |

### REPORTE

| Atributo | Tipo | Descripción |
|----------|------|-------------|
| id_reporte | int | Identificador único |
| id_sprint | int | FK → SPRINT |
| fecha_generacion | datetime | Cuándo se generó |
| tareas_completadas | int | Cantidad de tareas completadas |
| tareas_no_completadas | int | Cantidad de tareas no completadas |

### LOG_AUDITORIA

| Atributo | Tipo | Descripción |
|----------|------|-------------|
| id_log | int | Identificador único |
| id_usuario | int | FK → USUARIO (quien ejecutó la acción) |
| accion | varchar | Tipo de acción: crear_usuario, cambiar_rol_global, crear_proyecto, eliminar_proyecto, cambiar_rol_proyecto |
| detalle | text | Descripción de la acción |
| id_recurso | int | ID del recurso afectado (opcional) |
| fecha | datetime | Cuándo ocurrió la acción |

---

## Relaciones y Multiplicidad

| Entidad Origen | Mult. | Relación | Entidad Destino | Mult. |
|----------------|:-----:|----------|:---------------:|:-----:|
| USUARIO | 1 | Crea → | USUARIO | N (Admin crea usuarios) |
| USUARIO | 1 | Crea → | PROYECTO | N |
| USUARIO | 1 | Es → | MIEMBRO | N |
| USUARIO | 1 | Participa en → | TAREA | N |
| USUARIO | 1 | Recibe → | NOTIFICACION | N |
| USUARIO | 1 | Registra → | LOG_AUDITORIA | N |
| PROYECTO | 1 | Tiene (Composición) → | MIEMBRO | N |
| PROYECTO | 1 | Tiene (Composición) → | TABLERO | N |
| PROYECTO | 1 | Tiene (Composición) → | COLUMNA | N |
| PROYECTO | 1 | Dirige (Composición) → | SPRINT | N |
| PROYECTO | 1 | Tiene (Composición) → | TAREA | N |
| PROYECTO | 1 | Genera → | INVITACION | N |
| TABLERO | 1 | Tiene (Composición) → | COLUMNA | N |
| COLUMNA | 1 | Ubica → | TAREA | N |
| SPRINT | 1 | Agrupa → | TAREA | N (puede ser null = backlog) |
| SPRINT | 1 | Genera (Composición) → | REPORTE | N |
| TAREA | 1 | Tiene → | DEPENDENCIA | N |
| USUARIO | 1 | Recibe → | INVITACION | N |

---

## Resumen de Cardinalidades

- **Composición (vida dependiente)**: PROYECTO → MIEMBRO, TABLERO, COLUMNA, SPRINT, TAREA. Si se elimina un proyecto, todo lo que contiene se elimina en cascada.
- **Agregación**: SPRINT → TAREA (las tareas pueden existir sin sprint - backlog).
- **Asociación simple**: USUARIO → INVITACION, NOTIFICACION, LOG_AUDITORIA; TAREA → DEPENDENCIA.
- Un USUARIO puede ser miembro de múltiples PROYECTOS (N:N resuelto por la entidad MIEMBRO).
- **Auto-referencia**: USUARIO → USUARIO (id_creador referencia al Admin que creó la cuenta).
- **LOG_AUDITORIA**: registro de acciones sensibles del sistema (RN-33).
