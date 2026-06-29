# ADR-003: MongoDB Atlas como base de datos

**Estado:** Aceptado · **Fecha:** 2026-06-21

---

## Contexto

El sistema necesita almacenar proyectos, tableros, columnas, tareas, subtareas, comentarios, sprints, notificaciones y reportes. Muchas de estas entidades tienen estructuras jerárquicas y anidadas (tablero → columnas → tareas → subtareas → comentarios). Alternativas consideradas:

- **PostgreSQL** o MySQL: base de datos relacional con esquemas rígidos y joins
- **MongoDB Atlas**: base de datos NoSQL documental, schemaless, con Change Streams nativos

## Decisión

Se usa **MongoDB Atlas** como única base de datos.

- Las relaciones padre-hijo se modelan con **documentos embebidos** cuando son 1:N pequeños (subtareas dentro de tarea, comentarios dentro de tarea)
- Las relaciones entre proyectos y miembros se modelan con **referencias** (colección separada `members`)
- Change Streams se usan para notificaciones en tiempo real (Módulo 5)
- Aggregation Pipelines para métricas del dashboard (evita transferir datos al servidor)

## Consecuencias

### Positivas
- Modelado natural para estructuras jerárquicas (columnas → tareas → subtareas)
- Change Streams integrados: no necesita infraestructura adicional para eventos en tiempo real
- Aggregation Pipelines permiten calcular burndown, velocidad de equipo y tiempo de ciclo en el servidor de BD
- Schemaless permite evolucionar el modelo sin migraciones complejas

### Negativas
- No hay joins nativos: las consultas que cruzan colecciones requieren múltiples queries o aggregation pipelines
- MongoDB no valida relaciones foráneas: la consistencia referencial se debe validar en la aplicación
- Mayor consumo de memoria que PostgreSQL para cargas de trabajo relacionales pesadas
