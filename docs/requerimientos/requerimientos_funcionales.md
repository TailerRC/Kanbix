# RF - Kanbix

## Módulo 1 — Autenticación & Usuarios
*Responsable: Rodrigo Chacón*

### Gestión de Cuentas (Enterprise)
| ID | Descripción |
|----|-------------|
| RF01 | El **Admin** puede crear cuentas de usuario con nombre, email y contraseña, asignando el rol global (Admin, Manager o Developer) |
| RF02 | El sistema verifica que el email no esté ya registrado antes de crear la cuenta |
| RF03 | El **Admin** puede desbloquear una cuenta bloqueada por intentos fallidos |
| RF04 | El **Admin** puede cambiar el rol global de un usuario |
| RF05 | El **Admin** puede listar todos los usuarios del sistema |

### Login & Sesión
| ID | Descripción |
|----|-------------|
| RF06 | El usuario puede iniciar sesión con email y contraseña (el auto-registro público está deshabilitado — las cuentas son creadas por Admin) |
| RF07 | El sistema genera un token JWT al iniciar sesión correctamente |
| RF08 | El usuario puede cerrar sesión, invalidando su token activo |

### Perfil de Usuario
| ID | Descripción |
|----|-------------|
| RF09 | El usuario puede ver su perfil con nombre y email |
| RF10 | El usuario puede editar su nombre |
| RF11 | El usuario puede cambiar su contraseña ingresando la contraseña actual |

### Seguridad Enterprise & Sesión
| ID | Descripción |
|----|-------------|
| RF12 | El token JWT expira automáticamente después de un tiempo definido |
| RF13 | El sistema rechaza cualquier petición que no incluya un token válido |
| RF14 | El sistema puede renovar el token antes de que expire (refresh token) |
| RF15 | Todo usuario debe cambiar su contraseña en el **primer inicio de sesión** |
| RF16 | Las contraseñas expiran cada **90 días**. El usuario debe cambiarla al iniciar sesión si está vencida |
| RF17 | No se puede reutilizar ninguna de las **últimas 5 contraseñas** al cambiar la contraseña |
| RF18 | El sistema registra en un log de auditoría: creación de usuarios, cambios de rol global, creación/eliminación de proyectos y cambios de roles por proyecto |

---

## Módulo 2 — Proyectos & Equipos
*Responsable: Piero Villón*

### Proyectos
| ID | Descripción |
|----|-------------|
| RF19 | El usuario con rol global **Admin** o **Manager** puede crear un proyecto con nombre, descripción y fecha de inicio (RN-10) |
| RF20 | El usuario puede ver la lista de proyectos en los que participa |
| RF21 | El Manager del proyecto puede editar nombre y descripción del proyecto |
| RF22 | El Manager del proyecto puede eliminar el proyecto |
| RF23 | El sistema registra quién creó el proyecto y cuándo |
| RF24 | El proyecto puede tener estado: Activo, Pausado o Archivado |
| RF25 | El usuario puede buscar proyectos por nombre |
| RF26 | Al crear un proyecto, el usuario puede elegir un color identificador de una paleta predefinida |
| RF27 | El sistema genera automáticamente las iniciales del proyecto como avatar visual |
| RF28 | El proyecto tiene fecha de inicio y fecha de fin opcional |

### Equipos / Miembros
| ID | Descripción |
|----|-------------|
| RF29 | El Manager del proyecto puede invitar miembros por email |
| RF30 | Un miembro puede aceptar o rechazar una invitación |
| RF31 | El Manager puede ver todos los miembros del proyecto |
| RF32 | El Manager puede eliminar a un miembro del proyecto |

### Roles (por proyecto)
| ID | Descripción |
|----|-------------|
| RF33 | Cada miembro tiene un rol dentro del proyecto: Manager, Developer o Viewer |
| RF34 | El Manager puede cambiar el rol de un miembro dentro del proyecto |
| RF35 | Solo el Manager puede gestionar sprints |

### Sprints
| ID | Descripción |
|----|-------------|
| RF36 | El Manager puede crear un sprint con nombre, fecha inicio y fecha fin |
| RF37 | El sistema puede listar todos los sprints de un proyecto |
| RF38 | El Manager puede editar un sprint |
| RF39 | El Manager puede cerrar/archivar un sprint |
| RF40 | Un proyecto puede tener múltiples sprints pero solo uno activo a la vez |
| RF41 | El sistema bloquea activar otro sprint mientras haya uno en curso |

---

## Módulo 3 — Tablero Kanban & Tareas
*Responsable: Gianfranco Caballero*

### Columnas del Tablero
| ID | Descripción |
|----|-------------|
| RF42 | El sistema crea automáticamente columnas por defecto al crear un proyecto (Por hacer, En progreso, En Revisión, Hecho) |
| RF43 | El Manager puede crear columnas personalizadas en el tablero |
| RF44 | El Manager puede renombrar una columna existente |
| RF45 | El Manager puede eliminar una columna que no tenga tareas |
| RF46 | El Manager puede reordenar las columnas del tablero |

### Tareas
| ID | Descripción |
|----|-------------|
| RF47 | El usuario puede crear una tarea con título, descripción y prioridad |
| RF48 | El usuario puede ver el detalle completo de una tarea |
| RF49 | El usuario puede editar el título y descripción de una tarea |
| RF50 | El Manager puede eliminar una tarea |
| RF51 | El sistema registra quién creó la tarea y cuándo |

### Movimiento de Tareas
| ID | Descripción |
|----|-------------|
| RF52 | El usuario puede mover una tarea de una columna a otra arrastrándola |
| RF53 | Solo el Developer asignado o el Manager pueden mover una tarea |
| RF54 | El sistema registra cada cambio de columna de una tarea con fecha y usuario |

### Prioridad & Etiquetas
| ID | Descripción |
|----|-------------|
| RF55 | Cada tarea tiene una prioridad: Baja, Media, Alta o Crítica (RN-24) |
| RF56 | El usuario puede filtrar las tareas del tablero por prioridad |
| RF57 | El usuario puede buscar tareas por título dentro de un proyecto |

---

## Módulo 4 — Planificación & Asignaciones
*Responsable: Jerzy Carrasco*

### Asignación de Tareas
| ID | Descripción |
|----|-------------|
| RF58 | El Manager puede asignar una tarea a un miembro del proyecto |
| RF59 | Un miembro solo puede ser asignado a tareas del proyecto al que pertenece |
| RF60 | El Manager puede reasignar una tarea a otro miembro |
| RF61 | El Manager puede quitar la asignación de una tarea |
| RF62 | Un miembro puede ver todas las tareas que tiene asignadas |

### Planificación de Sprint
| ID | Descripción |
|----|-------------|
| RF63 | El Manager puede agregar tareas a un sprint activo |
| RF64 | El Manager puede quitar una tarea de un sprint |
| RF65 | El sistema muestra todas las tareas dentro de un sprint |
| RF66 | Una tarea puede existir sin estar asignada a ningún sprint (backlog) |

### Backlog
| ID | Descripción |
|----|-------------|
| RF67 | El sistema tiene una vista de backlog con todas las tareas sin sprint asignado |
| RF68 | El Manager puede mover tareas del backlog a un sprint activo |
| RF69 | Al cerrar un sprint, las tareas no completadas regresan automáticamente al backlog |

### Dependencias de Tareas
| ID | Descripción |
|----|-------------|
| RF70 | El Manager puede establecer que una tarea depende de otra para poder iniciarse |
| RF71 | El sistema bloquea mover una tarea a "En Progreso" si tiene dependencias pendientes |

---

## Módulo 5 — Alertas & Notificaciones
*Responsable: Diego Cuadros*

### Notificaciones del Sistema
| ID | Descripción |
|----|-------------|
| RF72 | El sistema notifica al usuario cuando es invitado a un proyecto |
| RF73 | El sistema notifica al usuario cuando su rol dentro de un proyecto es cambiado |
| RF74 | El sistema notifica al usuario cuando se le asigna una tarea |
| RF75 | El sistema notifica al usuario cuando una tarea asignada es movida de columna |
| RF76 | El sistema notifica al Manager cuando un Developer marca una tarea como completada |

### Alertas de Sprint
| ID | Descripción |
|----|-------------|
| RF77 | El sistema alerta al Manager cuando un sprint está próximo a vencer (48 horas antes) |
| RF78 | El sistema alerta al equipo cuando un sprint es cerrado |
| RF79 | El sistema alerta al Manager cuando hay tareas sin asignar en un sprint activo |

### Gestión de Notificaciones
| ID | Descripción |
|----|-------------|
| RF80 | El usuario puede ver todas sus notificaciones en una bandeja |
| RF81 | El usuario puede marcar una notificación como leída |
| RF82 | El usuario puede marcar todas sus notificaciones como leídas a la vez |

---

## Módulo 6 — Reportes & Dashboard
*Responsable: Allisson Meneses*

### Dashboard General
| ID | Descripción |
|----|-------------|
| RF83 | El usuario puede ver un resumen del proyecto: total de tareas, completadas y pendientes |
| RF84 | El usuario puede ver cuántas tareas tiene asignadas personalmente |
| RF85 | El dashboard muestra el sprint activo con su fecha de inicio y fin |

### Reportes de Sprint
| ID | Descripción |
|----|-------------|
| RF86 | El sistema genera un reporte del sprint cerrado con tareas completadas y no completadas |
| RF87 | El Manager puede ver el historial de sprints cerrados de un proyecto |
| RF88 | El reporte muestra qué miembro completó cuántas tareas en el sprint |

### Reportes de Equipo
| ID | Descripción |
|----|-------------|
| RF89 | El sistema muestra la carga de trabajo por miembro: cuántas tareas tiene asignadas cada uno |
| RF90 | El Manager puede ver el rendimiento del equipo por sprint |

### Exportación
| ID | Descripción |
|----|-------------|
| RF91 | El usuario puede exportar el reporte de un sprint en formato PDF |
