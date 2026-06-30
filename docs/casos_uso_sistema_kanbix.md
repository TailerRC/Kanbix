**ESPECIFICACIÓN DE CASOS DE USO DEL SISTEMA (CUS)**

# 1. Introducción

El presente documento especifica los Casos de Uso del Sistema (CUS) del proyecto Kanban/SCRUM, derivados de los 84 requisitos funcionales (RF01–RF84) definidos por el equipo y organizados en sus 6 módulos: Autenticación & Usuarios, Proyectos & Equipos, Tablero Kanban & Tareas, Planificación & Asignaciones, Alertas & Notificaciones, y Reportes & Dashboard.

Cada caso de uso agrupa uno o más requisitos funcionales que comparten un mismo objetivo de actor, siguiendo la subdivisión temática ya establecida en el documento de requerimientos (por ejemplo, "Registro & Login", "Columnas del Tablero", "Backlog"). De esta forma, el catálogo resultante contiene 22 CUS, cada uno especificado con: actores, descripción, precondiciones, flujo normal, flujos alternativos/excepciones, postcondiciones y requisitos funcionales relacionados.

## 1.1 Catálogo de Actores

| **Actor** | **Descripción** |
| --- | --- |
| **Admin** | Administrador del sistema con rol global. Crea usuarios, asigna roles globales, desbloquea cuentas y tiene acceso completo a todos los proyectos y reportes. No auto-registro público — modo Enterprise. |
| **Usuario Registrado** | Cualquier persona autenticada en el sistema. Es el rol base del que heredan todos los demás actores humanos. |
| **Manager** | Usuario con rol Manager a nivel global (puede crear proyectos) o por proyecto (administra el proyecto). Posee derechos de administración sobre el proyecto: editarlo, eliminarlo, gestionar su membresía, asignar roles, gestionar sprints, columnas, tareas y dependencias. |
| **Developer** | Rol asignado a un miembro dentro de un proyecto. Ejecuta y mueve las tareas que le son asignadas a través de las columnas del tablero. |
| **Viewer** | Rol asignado a un miembro dentro de un proyecto. Acceso de solo lectura a tableros, tareas y reportes. |
| **Sistema** | Actor automático que ejecuta validaciones, genera notificaciones y alertas, sin intervención directa de un usuario humano. |

# 2. Catálogo General de Casos de Uso

Vista consolidada de los 22 CUS identificados, con su módulo de origen y los requisitos funcionales que cubren.

| **Código** | **Nombre** | **Módulo** | **RF relacionados** |
| --- | --- | --- | --- |
| **CUS-AU-01** | Crear Usuario (Enterprise) | Autenticación y Usuarios | RF01, RF02, RF18 |
| **CUS-AU-02** | Iniciar y Cerrar Sesión | Autenticación y Usuarios | RF06, RF07, RF08, RF12, RF13, RF14, RF15, RF16, RF17 |
| **CUS-AU-03** | Gestionar Perfil | Autenticación y Usuarios | RF09, RF10, RF11, RF15, RF16, RF17 |
| **CUS-PE-01** | Gestionar Proyecto | Proyectos y Equipos | RF19, RF20, RF21, RF22, RF23, RF24, RF25, RF26, RF27, RF28 |
| **CUS-PE-02** | Gestionar Miembros del Proyecto | Proyectos y Equipos | RF29, RF30, RF31, RF32 |
| **CUS-PE-03** | Gestionar Roles de Miembros | Proyectos y Equipos | RF33, RF34, RF35 |
| **CUS-PE-04** | Gestionar Sprints | Proyectos y Equipos | RF36, RF37, RF38, RF39, RF40, RF41 |
| **CUS-TK-01** | Gestionar Columnas del Tablero | Tablero Kanban y Tareas | RF42, RF43, RF44, RF45, RF46 |
| **CUS-TK-02** | Gestionar Tareas | Tablero Kanban y Tareas | RF47, RF48, RF49, RF50, RF51 |
| **CUS-TK-03** | Mover Tarea entre Columnas | Tablero Kanban y Tareas | RF52, RF53, RF54 |
| **CUS-TK-04** | Filtrar y Buscar Tareas | Tablero Kanban y Tareas | RF55, RF56, RF57 |
| **CUS-PA-01** | Gestionar Asignación de Tareas | Planificación y Asignaciones | RF58, RF59, RF60, RF61, RF62 |
| **CUS-PA-02** | Planificar Sprint | Planificación y Asignaciones | RF63, RF71, RF65, RF66 |
| **CUS-PA-03** | Gestionar Backlog | Planificación y Asignaciones | RF67, RF68, RF69 |
| **CUS-PA-04** | Gestionar Dependencias entre Tareas | Planificación y Asignaciones | RF70, RF71 |
| **CUS-AN-01** | Notificar Eventos del Sistema | Alertas y Notificaciones | RF72, RF73, RF74, RF75, RF76 |
| **CUS-AN-02** | Generar Alertas de Sprint | Alertas y Notificaciones | RF77, RF78, RF79 |
| **CUS-AN-03** | Gestionar Bandeja de Notificaciones | Alertas y Notificaciones | RF80, RF81, RF82 |
| **CUS-RD-01** | Visualizar Dashboard General | Reportes y Dashboard | RF83, RF84, RF85 |
| **CUS-RD-02** | Generar Reporte de Sprint | Reportes y Dashboard | RF86, RF87, RF88 |
| **CUS-RD-03** | Visualizar Reportes de Equipo | Reportes y Dashboard | RF89, RF90 |
| **CUS-RD-04** | Exportar Reporte de Sprint | Reportes y Dashboard | RF91 |

# 3. Especificación Detallada de Casos de Uso

## 3.1 Módulo 1 — Autenticación y Usuarios (Responsable: Rodrigo Chacón)

### CUS-AU-01 — Crear Usuario (Enterprise)

| **Código** | CUS-AU-01 |
| --- | --- |
| **Nombre** | Crear Usuario |
| **Actor(es)** | Admin |
| **Descripción** | Permite al Admin crear una cuenta de usuario en el sistema, asignando nombre, email, contraseña y rol global (Admin, Manager o Developer). No existe auto-registro público. |
| **Precondiciones** | - El Admin está autenticado. El email no está registrado previamente. |
| **Flujo Normal** | 1. El Admin accede al panel de administración de usuarios.  2. El Admin completa el formulario con nombre, email, contraseña y selecciona el rol global (RF01).  3. El sistema verifica que el email no esté ya registrado (RF02).  4. El sistema crea la cuenta con el rol global asignado.  5. El sistema registra la acción en el log de auditoría (RF18). |
| **Flujos Alternativos / Excepciones** | 3a. El email ya está registrado → el sistema rechaza la creación. |
| **Postcondiciones** | - El usuario queda creado con el rol global asignado y puede iniciar sesión. |
| **Requisitos Funcionales relacionados** | RF01, RF02, RF18 |

### CUS-AU-02 — Iniciar y Cerrar Sesión

| **Código** | CUS-AU-02 |
| --- | --- |
| **Nombre** | Iniciar y Cerrar Sesión |
| **Actor(es)** | Usuario Registrado |
| **Descripción** | Permite al usuario autenticarse con email y contraseña, obteniendo un token JWT con tiempo de expiración definido y capacidad de renovación mediante refresh token. También permite cerrar sesión invalidando el token activo. Si es el primer inicio de sesión o la contraseña expiró, el sistema fuerza el cambio de contraseña antes de permitir el acceso. |
| **Precondiciones** | - El usuario tiene una cuenta activa en el sistema. |
| **Flujo Normal** | 1. El usuario ingresa su email y contraseña (RF06).  2. El sistema valida las credenciales y verifica si es el primer inicio de sesión o la contraseña expiró.  3. Si requiere cambio de contraseña → flujo alternativo 2b.  4. El sistema genera un token JWT (RF07).  5. El usuario utiliza el token para acceder a recursos protegidos (RF13).  6. El usuario renueva el token mediante un refresh token (RF14).  7. El usuario cierra sesión y el token es invalidado (RF08). |
| **Flujos Alternativos / Excepciones** | 2a. Credenciales incorrectas → el sistema rechaza el acceso.  2b. Primer inicio o contraseña expirada → el sistema redirige al cambio obligatorio de contraseña (RF15, RF16, RF17).  4a. El refresh token expiró → el usuario debe iniciar sesión nuevamente. |
| **Postcondiciones** | - El usuario tiene una sesión activa con token vigente o la sesión fue cerrada. |
| **Requisitos Funcionales relacionados** | RF06, RF07, RF08, RF12, RF13, RF14, RF15, RF16, RF17 |

### CUS-AU-03 — Gestionar Perfil

| **Código** | CUS-AU-03 |
| --- | --- |
| **Nombre** | Gestionar Perfil |
| **Actor(es)** | Usuario Registrado |
| **Descripción** | Permite al usuario ver y editar su perfil (nombre) y cambiar su contraseña. Incluye el cambio obligatorio de contraseña en primer inicio y contraseñas expiradas. |
| **Precondiciones** | - El usuario tiene una sesión activa. |
| **Flujo Normal** | 1. El usuario consulta su perfil con nombre y email (RF09).  2. El usuario edita su nombre (RF10).  3. El usuario cambia su contraseña ingresando la contraseña actual y la nueva contraseña (RF11).  4. El sistema valida que la nueva contraseña no esté entre las últimas 5 (RF17). |
| **Flujos Alternativos / Excepciones** | 3a. La contraseña actual no coincide → el sistema rechaza el cambio.  4a. La nueva contraseña ya fue usada recientemente → el sistema rechaza (RF17).  4b. Cambio forzado en primer inicio de sesión (RF15) o contraseña expirada (RF16) → el sistema exige el cambio antes de continuar. |
| **Postcondiciones** | - El perfil queda actualizado. |
| **Requisitos Funcionales relacionados** | RF09, RF10, RF11, RF15, RF16, RF17 |

## 3.2 Módulo 2 — Proyectos y Equipos (Responsable: Piero Villón)

### CUS-PE-01 — Gestionar Proyecto

| **Código** | CUS-PE-01 |
| --- | --- |
| **Nombre** | Gestionar Proyecto |
| **Actor(es)** | Admin; Manager (global); Usuario Registrado (miembro) |
| **Descripción** | Permite crear, consultar, buscar, editar y eliminar proyectos. Solo usuarios con rol global Admin o Manager pueden crear proyectos. |
| **Precondiciones** | - El usuario tiene una sesión activa. Para crear: rol global Admin o Manager (RN-10). |
| **Flujo Normal** | 1. El usuario (Admin o Manager global) crea un proyecto ingresando nombre, descripción, fecha de inicio y fecha de fin opcional (RF19, RF28).  2. El usuario elige un color identificador de una paleta predefinida (RF26).  3. El sistema genera automáticamente las iniciales del proyecto como avatar y registra quién lo creó y cuándo (RF23, RF27).  4. El usuario consulta la lista de proyectos en los que participa, pudiendo buscar por nombre (RF20, RF25).  5. El Manager (por proyecto) edita el nombre y la descripción del proyecto (RF21) o cambia su estado entre Activo, Pausado o Archivado (RF24).  6. El Manager (por proyecto) elimina el proyecto (RF22). |
| **Flujos Alternativos / Excepciones** | 1a. Un usuario con rol global Developer intenta crear un proyecto → el sistema rechaza la acción (RN-10).  5a/6a. Un usuario que no es Manager del proyecto intenta editar o eliminar el proyecto → el sistema rechaza la acción. |
| **Postcondiciones** | - El proyecto queda creado, actualizado o eliminado según la acción ejecutada. |
| **Requisitos Funcionales relacionados** | RF19, RF20, RF21, RF22, RF23, RF24, RF25, RF26, RF27, RF28 |

### CUS-PE-02 — Gestionar Miembros del Proyecto

| **Código** | CUS-PE-02 |
| --- | --- |
| **Nombre** | Gestionar Miembros del Proyecto |
| **Actor(es)** | Admin; Manager (del proyecto); Miembro Invitado |
| **Descripción** | Permite invitar miembros a un proyecto por correo electrónico, aceptar o rechazar la invitación, y consultar o remover miembros existentes. Admin y Manager del proyecto pueden gestionar miembros. |
| **Precondiciones** | - El proyecto existe. |
| **Flujo Normal** | 1. El Admin o Manager invita a un miembro ingresando su correo electrónico (RF29).  2. El sistema notifica al invitado.  3. El miembro invitado acepta o rechaza la invitación (RF30).  4. El Admin o Manager consulta la lista de miembros del proyecto (RF31).  5. El Admin o Manager elimina a un miembro del proyecto (RF32). |
| **Flujos Alternativos / Excepciones** | 3a. El miembro rechaza la invitación → no se agrega al proyecto. |
| **Postcondiciones** | - El miembro queda agregado, no agregado, o removido del proyecto. |
| **Requisitos Funcionales relacionados** | RF29, RF30, RF31, RF32 |

### CUS-PE-03 — Gestionar Roles de Miembros

| **Código** | CUS-PE-03 |
| --- | --- |
| **Nombre** | Gestionar Roles de Miembros |
| **Actor(es)** | Manager |
| **Descripción** | Permite asignar y modificar el rol de cada miembro dentro de un proyecto (Manager, Developer o Viewer), determinando sus permisos sobre sprints, tablero y tareas. |
| **Precondiciones** | - El miembro pertenece al proyecto. |
| **Flujo Normal** | 1. El Manager asigna un rol a cada miembro del proyecto (RF26).  2. El Manager cambia el rol de un miembro existente cuando es necesario (RF27).  3. El sistema restringe la gestión de sprints exclusivamente al rol Manager (RF28). |
| **Flujos Alternativos / Excepciones** | 3a. Un miembro sin rol Manager intenta gestionar un sprint → el sistema rechaza la acción. |
| **Postcondiciones** | - El miembro queda con el rol vigente, aplicable a todas las funcionalidades dependientes de rol. |
| **Requisitos Funcionales relacionados** | RF33, RF34, RF35 |

### CUS-PE-04 — Gestionar Sprints

| **Código** | CUS-PE-04 |
| --- | --- |
| **Nombre** | Gestionar Sprints |
| **Actor(es)** | Manager; Admin |
| **Descripción** | Permite crear, listar, editar y cerrar/archivar sprints de un proyecto, garantizando que exista como máximo un sprint activo a la vez. |
| **Precondiciones** | - El actor posee el rol Manager en el proyecto. |
| **Flujo Normal** | 1. El Manager crea un sprint con nombre, fecha de inicio y fecha de fin (RF36).  2. El sistema valida que no exista otro sprint activo en el proyecto (RF40, RF41).  3. El sistema lista todos los sprints del proyecto (RF37).  4. El Manager edita un sprint existente (RF38).  5. El Manager cierra/archiva el sprint activo (RF39). |
| **Flujos Alternativos / Excepciones** | 2a. Ya existe un sprint activo en el proyecto → el sistema bloquea la creación o activación de uno nuevo. |
| **Postcondiciones** | - El sprint queda creado, editado o cerrado. Su cierre dispara el retorno de tareas no completadas al backlog. |
| **Requisitos Funcionales relacionados** | RF36, RF37, RF38, RF39, RF40, RF41 |

## 3.3 Módulo 3 — Tablero Kanban y Tareas (Responsable: Gianfranco Caballero)

### CUS-TK-01 — Gestionar Columnas del Tablero

| **Código** | CUS-TK-01 |
| --- | --- |
| **Nombre** | Gestionar Columnas del Tablero |
| **Actor(es)** | Sistema; Manager |
| **Descripción** | Define la estructura de columnas del tablero Kanban de un proyecto: creación automática de columnas por defecto y su personalización por parte del Manager. |
| **Precondiciones** | - El proyecto existe (para la creación automática). El actor posee el rol Manager (para la gestión manual). |
| **Flujo Normal** | 1. Al crearse un proyecto, el sistema genera automáticamente las columnas por defecto: Por hacer, En progreso, En Revisión y Hecho (RF42).  2. El Manager crea columnas personalizadas adicionales (RF43).  3. El Manager renombra una columna existente (RF44).  4. El Manager reordena las columnas del tablero (RF53).  5. El Manager elimina una columna, siempre que esta no contenga tareas (RF52). |
| **Flujos Alternativos / Excepciones** | 5a. La columna a eliminar contiene tareas → el sistema rechaza la eliminación. |
| **Postcondiciones** | - El tablero refleja la configuración de columnas vigente. |
| **Requisitos Funcionales relacionados** | RF42, RF43, RF44, RF45, RF46 |

### CUS-TK-02 — Gestionar Tareas

| **Código** | CUS-TK-02 |
| --- | --- |
| **Nombre** | Gestionar Tareas |
| **Actor(es)** | Usuario Registrado (miembro del proyecto); Manager |
| **Descripción** | Permite crear tareas con título, descripción y prioridad, consultar su detalle completo, editarlas y eliminarlas. |
| **Precondiciones** | - El actor es miembro del proyecto. |
| **Flujo Normal** | 1. El usuario crea una tarea ingresando título, descripción y prioridad (RF54).  2. El sistema registra automáticamente quién creó la tarea y en qué fecha (RF51).  3. El usuario consulta el detalle completo de una tarea (RF48).  4. El usuario edita el título y la descripción de la tarea (RF49).  5. El Manager elimina la tarea (RF50). |
| **Flujos Alternativos / Excepciones** | 5a. Un usuario sin rol Manager intenta eliminar la tarea → el sistema rechaza la acción. |
| **Postcondiciones** | - La tarea queda creada, actualizada o eliminada, y visible en su columna correspondiente del tablero. |
| **Requisitos Funcionales relacionados** | RF47, RF48, RF49, RF50, RF51 |

### CUS-TK-03 — Mover Tarea entre Columnas

| **Código** | CUS-TK-03 |
| --- | --- |
| **Nombre** | Mover Tarea entre Columnas |
| **Actor(es)** | Developer asignado; Manager |
| **Descripción** | Permite trasladar una tarea de una columna a otra del tablero mediante arrastre, dejando registro de cada cambio de columna. |
| **Precondiciones** | - La tarea existe y no posee dependencias pendientes que bloqueen su avance. |
| **Flujo Normal** | 1. El Developer asignado o el Manager arrastra la tarea hacia otra columna (RF52).  2. El sistema valida que el actor tenga permiso para mover la tarea (RF53).  3. El sistema registra el cambio de columna indicando fecha y usuario responsable (RF54).  4. El sistema notifica al responsable correspondiente del movimiento. |
| **Flujos Alternativos / Excepciones** | 2a. El actor no es el Developer asignado ni el Manager → el sistema rechaza el movimiento.  1a. La tarea posee dependencias pendientes y se intenta mover a "En Progreso" → el sistema bloquea el movimiento (RF71). |
| **Postcondiciones** | - La tarea queda ubicada en la nueva columna, con su historial de movimientos actualizado. |
| **Requisitos Funcionales relacionados** | RF52, RF53, RF54 |

### CUS-TK-04 — Filtrar y Buscar Tareas

| **Código** | CUS-TK-04 |
| --- | --- |
| **Nombre** | Filtrar y Buscar Tareas |
| **Actor(es)** | Usuario Registrado (miembro del proyecto) |
| **Descripción** | Permite filtrar las tareas del tablero por nivel de prioridad y buscarlas por título dentro de un proyecto. |
| **Precondiciones** | - El usuario es miembro del proyecto y el tablero contiene tareas. |
| **Flujo Normal** | 1. El usuario selecciona un nivel de prioridad (Baja, Media, Alta o Crítica) para filtrar las tareas del tablero (RF55, RF56).  2. El sistema muestra únicamente las tareas que cumplen el filtro seleccionado.  3. El usuario ingresa un texto para buscar tareas por título dentro del proyecto (RF57).  4. El sistema muestra las tareas coincidentes. |
| **Flujos Alternativos / Excepciones** | 4a. No existen coincidencias → el sistema muestra un resultado vacío. |
| **Postcondiciones** | - El tablero muestra el subconjunto de tareas filtrado o buscado. |
| **Requisitos Funcionales relacionados** | RF55, RF56, RF57 |

## 3.4 Módulo 4 — Planificación y Asignaciones (Responsable: Jerzy Carrasco)

### CUS-PA-01 — Gestionar Asignación de Tareas

| **Código** | CUS-PA-01 |
| --- | --- |
| **Nombre** | Gestionar Asignación de Tareas |
| **Actor(es)** | Manager; Usuario Registrado (consulta) |
| **Descripción** | Permite asignar, reasignar y desasignar tareas a miembros del proyecto, y consultar las tareas asignadas a cada uno. |
| **Precondiciones** | - El miembro a asignar pertenece al proyecto. |
| **Flujo Normal** | 1. El Manager asigna una tarea a un miembro del proyecto (RF58).  2. El sistema valida que el miembro pertenezca al proyecto (RF59).  3. El Manager reasigna la tarea a otro miembro cuando es necesario (RF60).  4. El Manager quita la asignación de una tarea (RF61).  5. Un miembro consulta todas las tareas que tiene asignadas (RF62). |
| **Flujos Alternativos / Excepciones** | 2a. El miembro no pertenece al proyecto → el sistema rechaza la asignación. |
| **Postcondiciones** | - La tarea queda asignada, reasignada o sin asignar, y se notifica al miembro afectado. |
| **Requisitos Funcionales relacionados** | RF58, RF59, RF60, RF61, RF62 |

### CUS-PA-02 — Planificar Sprint

| **Código** | CUS-PA-02 |
| --- | --- |
| **Nombre** | Planificar Sprint |
| **Actor(es)** | Manager |
| **Descripción** | Permite agregar o quitar tareas de un sprint activo y consultar todas las tareas que contiene, admitiendo que existan tareas sin sprint asignado. |
| **Precondiciones** | - Existe un sprint activo en el proyecto. |
| **Flujo Normal** | 1. El Manager agrega tareas al sprint activo (RF63).  2. El sistema muestra todas las tareas contenidas en el sprint (RF65).  3. El Manager quita una tarea del sprint cuando es necesario (RF64). |
| **Flujos Alternativos / Excepciones** | 1a. No existe un sprint activo → el sistema impide agregar tareas a un sprint. |
| **Postcondiciones** | - El sprint refleja el conjunto de tareas planificado; las tareas no agregadas permanecen en el backlog (RF66). |
| **Requisitos Funcionales relacionados** | RF63, RF64, RF65, RF66 |

### CUS-PA-03 — Gestionar Backlog

| **Código** | CUS-PA-03 |
| --- | --- |
| **Nombre** | Gestionar Backlog |
| **Actor(es)** | Manager; Sistema |
| **Descripción** | Mantiene la vista de tareas sin sprint asignado, permite moverlas a un sprint activo, y retorna automáticamente al backlog las tareas no completadas cuando un sprint se cierra. |
| **Precondiciones** | - Existen tareas sin sprint asignado, o un sprint próximo a cerrarse. |
| **Flujo Normal** | 1. El sistema muestra la vista de backlog con todas las tareas sin sprint asignado (RF67).  2. El Manager mueve una tarea del backlog a un sprint activo (RF68).  3. Al cerrarse un sprint, el sistema retorna automáticamente las tareas no completadas al backlog (RF69). |
| **Flujos Alternativos / Excepciones** | No aplica. |
| **Postcondiciones** | - El backlog queda actualizado con las tareas pendientes de planificación. |
| **Requisitos Funcionales relacionados** | RF67, RF68, RF69 |

### CUS-PA-04 — Gestionar Dependencias entre Tareas

| **Código** | CUS-PA-04 |
| --- | --- |
| **Nombre** | Gestionar Dependencias entre Tareas |
| **Actor(es)** | Manager |
| **Descripción** | Permite establecer que una tarea dependa de otra para poder iniciarse, bloqueando su avance a "En Progreso" mientras la dependencia no se resuelva. |
| **Precondiciones** | - Ambas tareas (dependiente y dependencia) existen en el proyecto. |
| **Flujo Normal** | 1. El Manager establece que una tarea depende de otra (RF70).  2. El sistema valida la dependencia cada vez que se intenta mover la tarea a "En Progreso" (RF71). |
| **Flujos Alternativos / Excepciones** | 2a. La dependencia no está resuelta → el sistema bloquea el movimiento. |
| **Postcondiciones** | - La tarea queda vinculada a su dependencia; su movimiento permanece bloqueado hasta que esta se resuelva. |
| **Requisitos Funcionales relacionados** | RF70, RF71 |

## 3.5 Módulo 5 — Alertas y Notificaciones (Responsable: Diego Cuadros)

### CUS-AN-01 — Notificar Eventos del Sistema

| **Código** | CUS-AN-01 |
| --- | --- |
| **Nombre** | Notificar Eventos del Sistema |
| **Actor(es)** | Sistema |
| **Descripción** | Genera notificaciones automáticas hacia los usuarios cuando ocurren eventos relevantes: invitación a un proyecto, cambio de rol, asignación de tarea, movimiento de una tarea asignada y finalización de una tarea por un Developer. |
| **Precondiciones** | - Ocurre un evento disparador en otro caso de uso del sistema. |
| **Flujo Normal** | 1. Se produce un evento disparador (invitación, cambio de rol, asignación o movimiento de tarea).  2. El sistema genera la notificación correspondiente para el destinatario (RF72, RF73, RF74, RF75).  3. El sistema notifica al Manager cuando un Developer marca una tarea como completada (RF76).  4. La notificación queda disponible en la bandeja del destinatario. |
| **Flujos Alternativos / Excepciones** | No aplica. |
| **Postcondiciones** | - La notificación queda registrada y visible para su destinatario. |
| **Requisitos Funcionales relacionados** | RF72, RF73, RF74, RF75, RF76 |

### CUS-AN-02 — Generar Alertas de Sprint

| **Código** | CUS-AN-02 |
| --- | --- |
| **Nombre** | Generar Alertas de Sprint |
| **Actor(es)** | Sistema |
| **Descripción** | Genera alertas automáticas relacionadas con el ciclo de vida del sprint: vencimiento próximo, cierre, y existencia de tareas sin asignar mientras el sprint está activo. |
| **Precondiciones** | - Existe un sprint activo en el proyecto. |
| **Flujo Normal** | 1. El sistema verifica periódicamente la fecha de fin del sprint activo.  2. Si faltan 48 horas para el vencimiento, alerta al Manager (RF77).  3. Al cerrarse el sprint, el sistema alerta a todo el equipo (RF78).  4. Si existen tareas sin asignar dentro del sprint activo, el sistema alerta al Manager (RF79). |
| **Flujos Alternativos / Excepciones** | No aplica. |
| **Postcondiciones** | - Las alertas correspondientes quedan generadas y visibles para sus destinatarios. |
| **Requisitos Funcionales relacionados** | RF77, RF78, RF79 |

### CUS-AN-03 — Gestionar Bandeja de Notificaciones

| **Código** | CUS-AN-03 |
| --- | --- |
| **Nombre** | Gestionar Bandeja de Notificaciones |
| **Actor(es)** | Usuario Registrado |
| **Descripción** | Permite al usuario consultar todas sus notificaciones y marcarlas como leídas, individualmente o en conjunto. |
| **Precondiciones** | - El usuario tiene notificaciones generadas. |
| **Flujo Normal** | 1. El usuario consulta su bandeja de notificaciones (RF80).  2. El usuario marca una notificación específica como leída (RF81).  3. El usuario marca todas sus notificaciones como leídas a la vez (RF82). |
| **Flujos Alternativos / Excepciones** | No aplica. |
| **Postcondiciones** | - El estado de lectura de las notificaciones queda actualizado. |
| **Requisitos Funcionales relacionados** | RF80, RF81, RF82 |

## 3.6 Módulo 6 — Reportes y Dashboard (Responsable: Alisson Meneses)

### CUS-RD-01 — Visualizar Dashboard General

| **Código** | CUS-RD-01 |
| --- | --- |
| **Nombre** | Visualizar Dashboard General |
| **Actor(es)** | Usuario Registrado |
| **Descripción** | Muestra al usuario un resumen general del proyecto: total de tareas, tareas completadas y pendientes, tareas asignadas personalmente, y datos del sprint activo. |
| **Precondiciones** | - El usuario es miembro del proyecto. |
| **Flujo Normal** | 1. El usuario accede al dashboard del proyecto.  2. El sistema muestra el resumen general de tareas: total, completadas y pendientes (RF83).  3. El sistema muestra cuántas tareas tiene asignadas el usuario (RF84).  4. El sistema muestra el sprint activo con sus fechas de inicio y fin (RF85). |
| **Flujos Alternativos / Excepciones** | No aplica. |
| **Postcondiciones** | - El dashboard refleja el estado actual del proyecto. |
| **Requisitos Funcionales relacionados** | RF83, RF84, RF85 |

### CUS-RD-02 — Generar Reporte de Sprint

| **Código** | CUS-RD-02 |
| --- | --- |
| **Nombre** | Generar Reporte de Sprint |
| **Actor(es)** | Manager; Sistema |
| **Descripción** | Genera, al cerrarse un sprint, un reporte con las tareas completadas y no completadas, detallando cuántas completó cada miembro, y permite consultar el historial de sprints cerrados. |
| **Precondiciones** | - Un sprint ha sido cerrado. |
| **Flujo Normal** | 1. Al cerrarse un sprint, el sistema genera el reporte con las tareas completadas y no completadas (RF86).  2. El reporte detalla cuántas tareas completó cada miembro (RF88).  3. El Manager consulta el historial de sprints cerrados del proyecto (RF87). |
| **Flujos Alternativos / Excepciones** | No aplica. |
| **Postcondiciones** | - El reporte del sprint queda disponible en el historial del proyecto. |
| **Requisitos Funcionales relacionados** | RF86, RF87, RF88 |

### CUS-RD-03 — Visualizar Reportes de Equipo

| **Código** | CUS-RD-03 |
| --- | --- |
| **Nombre** | Visualizar Reportes de Equipo |
| **Actor(es)** | Manager |
| **Descripción** | Muestra la carga de trabajo por miembro y el rendimiento del equipo a lo largo de los sprints. |
| **Precondiciones** | - El proyecto cuenta con miembros y tareas asignadas. |
| **Flujo Normal** | 1. El sistema muestra la carga de trabajo por miembro: cuántas tareas tiene asignadas cada uno (RF89).  2. El Manager consulta el rendimiento del equipo por sprint (RF90). |
| **Flujos Alternativos / Excepciones** | No aplica. |
| **Postcondiciones** | - El reporte de equipo queda disponible para el Manager. |
| **Requisitos Funcionales relacionados** | RF89, RF90 |

### CUS-RD-04 — Exportar Reporte de Sprint

| **Código** | CUS-RD-04 |
| --- | --- |
| **Nombre** | Exportar Reporte de Sprint |
| **Actor(es)** | Usuario Registrado |
| **Descripción** | Permite exportar el reporte de un sprint en formato PDF. |
| **Precondiciones** | - Existe un reporte de sprint generado. |
| **Flujo Normal** | 1. El usuario selecciona el reporte de sprint que desea exportar.  2. El sistema genera el archivo en formato PDF (RF91).  3. El sistema entrega el archivo para su descarga. |
| **Flujos Alternativos / Excepciones** | No aplica. |
| **Postcondiciones** | - El usuario obtiene el archivo PDF del reporte. |
| **Requisitos Funcionales relacionados** | RF91 |
