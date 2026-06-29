# Kanbix — Índice de Documentación

> Fuente de verdad del proyecto. Leer antes de escribir cualquier línea de código.

## Estructura

| Archivo | Descripción |
|---------|-------------|
| [kanbix_context.md](./kanbix_context.md) | Contexto unificado del proyecto |
| [reglas_negocio.md](./reglas_negocio.md) | 30 reglas de negocio |
| [glosario.md](./glosario.md) | Términos del dominio |
| [matriz_roles_permisos.md](./matriz_roles_permisos.md) | Roles + permisos por endpoint |
| [entregable_modelo_dominio.md](./entregable_modelo_dominio.md) | 10 entidades, 14 relaciones |
| [casos_uso_sistema_kanbix.md](./casos_uso_sistema_kanbix.md) | 22 casos de uso |
| [diagrama_componentes.md](./diagrama_componentes.md) | Arquitectura de componentes |
| [diagrama_despliegue.md](./diagrama_despliegue.md) | Arquitectura de despliegue |

### Requerimientos

| Archivo | Descripción |
|---------|-------------|
| [requerimientos/requerimientos_funcionales.md](./requerimientos/requerimientos_funcionales.md) | RF01–RF84 |
| [requerimientos/requerimientos_no_funcionales.md](./requerimientos/requerimientos_no_funcionales.md) | RNF-01 a RNF-08 |

### Contratos API

| Archivo | Módulo |
|---------|--------|
| [contratos/modulo1_auth_usuarios.md](./contratos/modulo1_auth_usuarios.md) | Autenticación y Usuarios |
| [contratos/modulo2_proyectos.md](./contratos/modulo2_proyectos.md) | Proyectos y Equipos |
| [contratos/modulo3_tableros_tareas.md](./contratos/modulo3_tableros_tareas.md) | Tablero Kanban y Tareas |
| [contratos/modulo4_planificacion.md](./contratos/modulo4_planificacion.md) | Planificación y Asignaciones |
| [contratos/modulo5_notificaciones.md](./contratos/modulo5_notificaciones.md) | Alertas y Notificaciones |
| [contratos/modulo6_reportes.md](./contratos/modulo6_reportes.md) | Reportes y Dashboard |

### Architecture Decision Records

| ADR | Decisión |
|-----|---------|
| [adr/adr-001-sdd.md](./adr/adr-001-sdd.md) | SDD como metodología |
| [adr/adr-002-jwt-refresh.md](./adr/adr-002-jwt-refresh.md) | JWT + Refresh Token |
| [adr/adr-003-mongodb-atlas.md](./adr/adr-003-mongodb-atlas.md) | MongoDB Atlas |
| [adr/adr-004-websockets.md](./adr/adr-004-websockets.md) | WebSockets para notificaciones |
| [adr/adr-005-fastapi-motor.md](./adr/adr-005-fastapi-motor.md) | FastAPI + Motor |
| [adr/adr-006-escala-fibonacci.md](./adr/adr-006-escala-fibonacci.md) | Estimación Fibonacci |

---

## Landing zone para markdowns SDD

Cuando recibas un markdown nuevo, colocalo en la raíz de `docs/` y el agente lo moverá a su ubicación correcta según esta tabla:

| Si el archivo contiene... | Va a... |
|---------------------------|---------|
| reglas de negocio | `docs/reglas_negocio.md` |
| glosario / términos | `docs/glosario.md` |
| RF0x / requerimientos funcionales | `docs/requerimientos/requerimientos_funcionales.md` |
| RNF-0x / requerimientos no funcionales | `docs/requerimientos/requerimientos_no_funcionales.md` |
| contrato módulo N | `docs/contratos/moduloN_*.md` |
| ADR-00N | `docs/adr/adr-00N-*.md` |
| modelo de dominio / entidades | `docs/entregable_modelo_dominio.md` |
| casos de uso / CUS | `docs/casos_uso_sistema_kanbix.md` |
| contexto del proyecto | `docs/kanbix_context.md` |
| diagrama de componentes | `docs/diagrama_componentes.md` |
| diagrama de despliegue | `docs/diagrama_despliegue.md` |
| matriz roles / permisos | `docs/matriz_roles_permisos.md` |
