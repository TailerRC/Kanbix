# Modelo de Dominio — Kanbix

Diagrama del modelo de dominio del sistema Kanbix, mostrando las entidades, sus atributos y las relaciones entre ellas.

---

## Entidades y Atributos

### USUARIO

| Atributo | Tipo |
|----------|------|
| id_usuario | int |
| nombre | varchar |
| email | varchar |

### PROYECTO

| Atributo | Tipo |
|----------|------|
| id_proyecto | int |
| nombre | varchar |
| descripción | varchar |
| color | varchar |
| estado | varchar |
| fecha | date |
| id_creador | int |

### INVITACION

| Atributo | Tipo |
|----------|------|
| id_invitacion | int |
| email | varchar |
| estado | varchar |
| tiempo_expiracion | number |
| id_proyecto | int |

### MIEMBRO

| Atributo | Tipo |
|----------|------|
| id_miembro | int |
| id_proyecto | int |
| id_usuario | int |
| rol | varchar |

### COLUMNA

| Atributo | Tipo |
|----------|------|
| id_columna | int |
| nombre | varchar |
| orden | int |
| id_proyecto | int |

### SPRINT

| Atributo | Tipo |
|----------|------|
| id_sprint | int |
| nombre | varchar |
| fecha_inicio | date |
| fecha_fin | date |
| estado | varchar |

### TAREA

| Atributo | Tipo |
|----------|------|
| id_tarea | int |
| titulo | varchar |
| descripcion | varchar |
| prioridad | varchar |
| fecha_creacion | datetime |
| id_creador | int |
| id_usuario_asignado | int |
| id_columna | int |
| id_proyecto | int |
| id_sprint | int |

### NOTIFICACION

| Atributo | Tipo |
|----------|------|
| id_notificacion | int |
| id_usuario | int |
| tipo | varchar |
| mensaje | varchar |
| leida | boolean |
| fecha_creacion | datetime |

### REPORTE

| Atributo | Tipo |
|----------|------|
| id_reporte | int |
| id_sprint | int |
| fecha_generacion | datetime |
| tareas_completadas | int |
| tareas_no_completadas | int |

### DEPENDENCIA

| Atributo | Tipo |
|----------|------|
| id_dependencia | int |
| id_tarea_origen | int |
| id_tarea_destino | int |

---

## Relaciones y Multiplicidad

| Entidad Origen | Mult. | Relación | Entidad Destino | Mult. |
|----------------|:-----:|----------|:---------------:|:-----:|
| PROYECTO | 1 | Genera → | INVITACION | N |
| USUARIO | 1 | Recibe → | INVITACION | N |
| USUARIO | 1 | Crea → | PROYECTO | N |
| USUARIO | 1 | Es → | MIEMBRO | N |
| PROYECTO | 1 | Tiene (Composición) → | MIEMBRO | N |
| PROYECTO | 1 | Tiene (Composición) → | COLUMNA | N |
| PROYECTO | 1 | Dirige (Composición) → | SPRINT | N |
| PROYECTO | 1 | Tiene (Composición) → | TAREA | N |
| COLUMNA | 1 | Ubica → | TAREA | N |
| SPRINT | 1 | Agrupa → | TAREA | N |
| USUARIO | 1 | Participa en → | TAREA | N |
| SPRINT | 1 | Genera (Composición) → | REPORTE | N |
| TAREA | 1 | Tiene → | DEPENDENCIA | N |
| USUARIO | 1 | Recibe → | NOTIFICACION | N |

---

## Resumen de Cardinalidades

- **Composición (vida dependiente)**: PROYECTO → MIEMBRO, COLUMNA, SPRINT, TAREA. Si se elimina un proyecto, todo lo que contiene se elimina en cascada.
- **Agregación**: SPRINT → TAREA (las tareas pueden existir sin sprint - backlog).
- **Asociación simple**: USUARIO → INVITACION, NOTIFICACION; TAREA → DEPENDENCIA.
- Un USUARIO puede ser miembro de múltiples PROYECTOS (N:N resuelto por la entidad MIEMBRO).
