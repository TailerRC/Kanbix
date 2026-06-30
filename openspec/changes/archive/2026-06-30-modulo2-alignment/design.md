## Context

El backend actual maneja esquemas con nombres en inglés (`name`, `description`) y el ruteo de miembros de forma directa, lo que contradice el nuevo contrato oficial de 15 endpoints en español. Para lograr la alineación y dar soporte a las nuevas funcionalidades de gestión (invitaciones, roles por miembro y ciclos de sprints), se requiere rediseñar la persistencia de datos en MongoDB Atlas y actualizar los controladores y rutas en FastAPI, reflejando estos cambios en el cliente de llamadas del frontend.

---

## Goals / Non-Goals

**Goals:**
- Adaptar las colecciones y esquemas de Proyectos al español (`nombre`, `descripcion`, `color`, `fecha_inicio`, `fecha_fin`, `iniciales`, `estado`, `fecha_creacion`).
- Implementar el soft-delete lógico de proyectos (cambio de estado a `"Archivado"`).
- Desarrollar la colección y endpoints para el flujo de invitaciones por email (`invitations`).
- Implementar la colección y endpoints para el CRUD y cierre de sprints (`sprints`), incluyendo la migración (rollover) de tareas no terminadas de vuelta al backlog.
- Actualizar el frontend para consumir las APIs en español de forma consistente.

**Non-Goals:**
- No se modificará la estructura de autenticación o tokens JWT globales (Módulo 1).
- No se implementará la estimación Fibonacci en esta etapa (corresponde a la especificación del Módulo 4).

---

## Decisions

### 1. Colecciones independientes para Sprints e Invitaciones
- **Opción A**: Embeber sprints e invitaciones dentro del documento del proyecto en la colección `projects`.
- **Opción B (Elegida)**: Crear colecciones separadas `sprints` e `invitations` con llaves foráneas (`id_proyecto`).
- **Rationale**: Previene que el documento del proyecto exceda el límite físico de 16MB de MongoDB ante proyectos con alto volumen de sprints e invitaciones. Además, permite implementar ruteos y controladores limpios siguiendo patrones RESTful.

### 2. Soft-delete lógico para Proyectos
- **Opción A**: Ejecutar un borrado físico en base de datos.
- **Opción B (Elegida)**: Modificar el campo `estado` a `"Archivado"`.
- **Rationale**: Cumple con el requerimiento de mantener el histórico de métricas y tareas para el módulo de reportes (Módulo 6), evitando pérdida de integridad referencial.

### 3. Migración de Tareas en Cierre de Sprint
- **Opción A**: Mover las tareas no terminadas a una columna especial.
- **Opción B (Elegida)**: Desvincular las tareas incompletas del sprint activo asignándoles `sprint_id = null`.
- **Rationale**: Devuelve las tareas pendientes al backlog del proyecto de forma directa, lo cual es la práctica estándar en Scrum. Al reactivar un nuevo sprint, estas tareas podrán ser seleccionadas y reasignadas.

---

## Risks / Trade-offs

- **[Riesgo] Migración de variables Inglés -> Español**: Modificar la estructura JSON de la API de proyectos puede romper vistas existentes del frontend si no se actualizan al mismo tiempo.
  - *Mitigación*: Se realizarán las modificaciones de backend y frontend de forma síncrona en la misma propuesta y se certificará la compilación estricta con `npx tsc -b` antes de cualquier confirmación.
