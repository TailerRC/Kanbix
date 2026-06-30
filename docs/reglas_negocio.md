# RN - Kanbix

> **Nota sobre roles:** El sistema distingue entre **roles globales** (asignados por un Admin al crear la cuenta) y **roles por proyecto** (asignados por un Manager dentro de cada proyecto).
> - Roles globales: **Admin**, **Manager**, **Developer**
> - Roles por proyecto: **Manager**, **Developer**, **Viewer**
> - Ver `matriz_roles_permisos.md` y `glosario.md` para definiciones detalladas.

| ID | Regla |
|----|-------|
| RN-01 | Solo usuarios autenticados acceden al sistema. No hay acceso anónimo a ningún recurso protegido. |
| RN-02 | El email es identificador único por usuario. No se permiten duplicados. |
| RN-03 | Las contraseñas se almacenan solo como hash bcrypt. Nunca en texto plano ni se transmiten así. |
| RN-04 | Tras 5 intentos fallidos consecutivos de login, la cuenta se bloquea 15 minutos. Solo un Admin puede desbloquear una cuenta manualmente (ver RN-32). |
| RN-05 | Solo un **Admin** puede crear cuentas de usuario. El Admin asigna el rol global (Admin, Manager o Developer) al crear la cuenta. El auto-registro público está deshabilitado. |
| RN-06 | Jerarquía de roles: **Admin > Manager > Developer > Viewer**. La jerarquía aplica tanto a roles globales como a roles por proyecto. |
| RN-07 | Solo un **Admin** puede asignar/modificar el **rol global** de otro usuario. Ningún usuario puede cambiar su propio rol. Dentro de un proyecto, el Manager puede asignar roles por proyecto a los miembros. Todo cambio de rol global queda registrado en el log de auditoría. |
| RN-08 | Siempre debe existir al menos un **Admin** activo. En la primera ejecución del sistema, un seed script crea el Admin inicial con credenciales por defecto, que deben cambiarse en el primer inicio de sesión. No se puede eliminar al último Admin del sistema. |
| RN-09 | Los **Viewer** tienen acceso solo lectura a nivel de proyecto. No pueden crear, editar ni eliminar ningún elemento. |
| RN-10 | Solo usuarios con rol global **Admin** o **Manager** pueden crear proyectos. El usuario con rol global Developer no puede crear proyectos. |
| RN-11 | Todo proyecto debe tener al menos un **Manager** (rol por proyecto) asignado como responsable. No puede quedar sin responsable. |
| RN-12 | El nombre de un proyecto debe ser único en el sistema. |
| RN-13 | Un usuario puede pertenecer a múltiples proyectos simultáneamente. |
| RN-14 | Solo el Manager del proyecto o un Admin pueden agregar/remover miembros del equipo. |
| RN-15 | Eliminar un proyecto elimina en cascada todos sus sprints, tareas y asignaciones. Acción irreversible. |
| RN-16 | Solo puede haber un sprint con estado **Activo** por proyecto al mismo tiempo. |
| RN-17 | Todo sprint debe tener fecha de inicio y fin obligatorias. La fecha fin debe ser posterior a la de inicio. |
| RN-18 | Al cerrar un sprint, las tareas no completadas se mueven al backlog o al siguiente sprint (no se eliminan). |
| RN-19 | Toda tarea pertenece a exactamente un proyecto y se ubica en una sola columna en todo momento. |
| RN-20 | Columnas de estado por defecto: **Backlog → To Do → In Progress → In Review → Done**. |
| RN-21 | Solo el usuario asignado a la tarea o el Manager pueden mover tarjetas entre columnas. |
| RN-22 | Una tarea en **Done** no puede volver a **Backlog** directamente; requiere reapertura explícita por el Manager. |
| RN-23 | Una tarea puede tener subtareas. La tarea padre no puede marcarse **Done** si alguna subtarea está pendiente. |
| RN-24 | La prioridad de una tarea debe ser uno de: **Baja, Media, Alta o Crítica**. |
| RN-25 | Una tarea solo puede asignarse a un miembro activo del proyecto. No a usuarios externos al equipo. |
| RN-26 | Una tarea puede declarar dependencia de otra. No puede pasar a **In Progress** si su dependiente no está en **Done**. |
| RN-27 | No se permiten dependencias circulares entre tareas. El sistema debe detectarlas y rechazarlas. |
| RN-28 | El sistema genera automáticamente una alerta cuando una tarea supera su fecha límite sin completarse. |
| RN-29 | Notificaciones en tiempo real vía WebSocket al usuario conectado; por email si está desconectado. |
| RN-30 | Solo **Admin** y **Manager** acceden a reportes completos. Los **Developer** solo ven sus métricas personales. |
| RN-31 | Todo usuario debe cambiar su contraseña en el primer inicio de sesión. Las contraseñas expiran cada 90 días y no se puede reutilizar ninguna de las últimas 5 contraseñas. |
| RN-32 | Un usuario bloqueado por intentos fallidos (RN-04) solo puede ser desbloqueado por un Admin. El Admin puede desbloquear la cuenta manualmente desde el panel de administración. |
| RN-33 | El sistema debe registrar en un log de auditoría todas las acciones sensibles: creación de usuarios, modificación de roles globales, creación/eliminación de proyectos, cambios de estado de proyectos, y cambios de roles por proyecto. |
| RN-34 | El auto-registro público de usuarios está deshabilitado. Todas las cuentas son creadas por un Admin mediante endpoint protegido y autenticado. |
