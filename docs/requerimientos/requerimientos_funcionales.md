# RF - Kanbix

## Módulo 1 — Autenticación & Usuarios
*Responsable: Rodrigo Chacón*

### Registro & Login
| ID | Descripción |
|----|-------------|
| RF01 | El usuario puede registrarse con nombre, email y contraseña |
| RF02 | El sistema verifica que el email no esté ya registrado antes de crear la cuenta |
| RF03 | El usuario puede iniciar sesión con email y contraseña |
| RF04 | El sistema genera un token JWT al iniciar sesión correctamente |
| RF05 | El usuario puede cerrar sesión, invalidando su token activo |

### Perfil de Usuario
| ID | Descripción |
|----|-------------|
| RF06 | El usuario puede ver su perfil con nombre y email |
| RF07 | El usuario puede editar su nombre |
| RF08 | El usuario puede cambiar su contraseña ingresando la contraseña actual |

### Seguridad & Sesión
| ID | Descripción |
|----|-------------|
| RF09 | El token JWT expira automáticamente después de un tiempo definido |
| RF10 | El sistema rechaza cualquier petición que no incluya un token válido |
| RF11 | El sistema puede renovar el token antes de que expire (refresh token) |

---

## Módulo 2 — Proyectos & Equipos
*Responsable: Piero Villón*

### Proyectos
| ID | Descripción |
|----|-------------|
| RF12 | El usuario puede crear un proyecto con nombre, descripción y fecha de inicio |
| RF13 | El usuario puede ver la lista de proyectos en los que participa |
| RF14 | El usuario puede editar nombre y descripción de un proyecto que creó |
| RF15 | El usuario puede eliminar un proyecto que creó |
| RF16 | El sistema registra quién creó el proyecto y cuándo |
| RF17 | El proyecto puede tener estado: Activo, Pausado o Archivado |
| RF18 | El usuario puede buscar proyectos por nombre |
| RF19 | Al crear un proyecto, el usuario puede elegir un color identificador de una paleta predefinida |
| RF20 | El sistema genera automáticamente las iniciales del proyecto como avatar visual |
| RF21 | El proyecto tiene fecha de inicio y fecha de fin opcional |

### Equipos / Miembros
| ID | Descripción |
|----|-------------|
| RF22 | El Manager del proyecto puede invitar miembros por email |
| RF23 | Un miembro puede aceptar o rechazar una invitación |
| RF24 | El Manager puede ver todos los miembros del proyecto |
| RF25 | El Manager puede eliminar a un miembro del proyecto |

### Roles
| ID | Descripción |
|----|-------------|
| RF26 | Cada miembro tiene un rol dentro del proyecto: Manager, Developer o Viewer |
| RF27 | El Manager puede cambiar el rol de un miembro |
| RF28 | Solo el Manager puede gestionar sprints |

### Sprints
| ID | Descripción |
|----|-------------|
| RF29 | El Manager puede crear un sprint con nombre, fecha inicio y fecha fin |
| RF30 | El sistema puede listar todos los sprints de un proyecto |
| RF31 | El Manager puede editar un sprint |
| RF32 | El Manager puede cerrar/archivar un sprint |
| RF33 | Un proyecto puede tener múltiples sprints pero solo uno activo a la vez |
| RF34 | El sistema bloquea activar otro sprint mientras haya uno en curso |

---

## Módulo 3 — Tablero Kanban & Tareas
*Responsable: Gianfranco Caballero*

### Columnas del Tablero
| ID | Descripción |
|----|-------------|
| RF35 | El sistema crea automáticamente columnas por defecto al crear un proyecto (Por hacer, En progreso, En Revisión, Hecho) |
| RF36 | El Manager puede crear columnas personalizadas en el tablero |
| RF37 | El Manager puede renombrar una columna existente |
| RF38 | El Manager puede eliminar una columna que no tenga tareas |
| RF39 | El Manager puede reordenar las columnas del tablero |

### Tareas
| ID | Descripción |
|----|-------------|
| RF40 | El usuario puede crear una tarea con título, descripción y prioridad |
| RF41 | El usuario puede ver el detalle completo de una tarea |
| RF42 | El usuario puede editar el título y descripción de una tarea |
| RF43 | El Manager puede eliminar una tarea |
| RF44 | El sistema registra quién creó la tarea y cuándo |

### Movimiento de Tareas
| ID | Descripción |
|----|-------------|
| RF45 | El usuario puede mover una tarea de una columna a otra arrastrándola |
| RF46 | Solo el Developer asignado o el Manager pueden mover una tarea |
| RF47 | El sistema registra cada cambio de columna de una tarea con fecha y usuario |

### Prioridad & Etiquetas
| ID | Descripción |
|----|-------------|
| RF48 | Cada tarea tiene una prioridad: Alta, Media o Baja |
| RF49 | El usuario puede filtrar las tareas del tablero por prioridad |
| RF50 | El usuario puede buscar tareas por título dentro de un proyecto |

---

## Módulo 4 — Planificación & Asignaciones
*Responsable: Jerzy Carrasco*

### Asignación de Tareas
| ID | Descripción |
|----|-------------|
| RF51 | El Manager puede asignar una tarea a un miembro del proyecto |
| RF52 | Un miembro solo puede ser asignado a tareas del proyecto al que pertenece |
| RF53 | El Manager puede reasignar una tarea a otro miembro |
| RF54 | El Manager puede quitar la asignación de una tarea |
| RF55 | Un miembro puede ver todas las tareas que tiene asignadas |

### Planificación de Sprint
| ID | Descripción |
|----|-------------|
| RF56 | El Manager puede agregar tareas a un sprint activo |
| RF57 | El Manager puede quitar una tarea de un sprint |
| RF58 | El sistema muestra todas las tareas dentro de un sprint |
| RF59 | Una tarea puede existir sin estar asignada a ningún sprint (backlog) |

### Backlog
| ID | Descripción |
|----|-------------|
| RF60 | El sistema tiene una vista de backlog con todas las tareas sin sprint asignado |
| RF61 | El Manager puede mover tareas del backlog a un sprint activo |
| RF62 | Al cerrar un sprint, las tareas no completadas regresan automáticamente al backlog |

### Dependencias de Tareas
| ID | Descripción |
|----|-------------|
| RF63 | El Manager puede establecer que una tarea depende de otra para poder iniciarse |
| RF64 | El sistema bloquea mover una tarea a "En Progreso" si tiene dependencias pendientes |

---

## Módulo 5 — Alertas & Notificaciones
*Responsable: Diego Cuadros*

### Notificaciones del Sistema
| ID | Descripción |
|----|-------------|
| RF65 | El sistema notifica al usuario cuando es invitado a un proyecto |
| RF66 | El sistema notifica al usuario cuando su rol dentro de un proyecto es cambiado |
| RF67 | El sistema notifica al usuario cuando se le asigna una tarea |
| RF68 | El sistema notifica al usuario cuando una tarea asignada es movida de columna |
| RF69 | El sistema notifica al Manager cuando un Developer marca una tarea como completada |

### Alertas de Sprint
| ID | Descripción |
|----|-------------|
| RF70 | El sistema alerta al Manager cuando un sprint está próximo a vencer (48 horas antes) |
| RF71 | El sistema alerta al equipo cuando un sprint es cerrado |
| RF72 | El sistema alerta al Manager cuando hay tareas sin asignar en un sprint activo |

### Gestión de Notificaciones
| ID | Descripción |
|----|-------------|
| RF73 | El usuario puede ver todas sus notificaciones en una bandeja |
| RF74 | El usuario puede marcar una notificación como leída |
| RF75 | El usuario puede marcar todas sus notificaciones como leídas a la vez |

---

## Módulo 6 — Reportes & Dashboard
*Responsable: Allisson Meneses*

### Dashboard General
| ID | Descripción |
|----|-------------|
| RF76 | El usuario puede ver un resumen del proyecto: total de tareas, completadas y pendientes |
| RF77 | El usuario puede ver cuántas tareas tiene asignadas personalmente |
| RF78 | El dashboard muestra el sprint activo con su fecha de inicio y fin |

### Reportes de Sprint
| ID | Descripción |
|----|-------------|
| RF79 | El sistema genera un reporte del sprint cerrado con tareas completadas y no completadas |
| RF80 | El Manager puede ver el historial de sprints cerrados de un proyecto |
| RF81 | El reporte muestra qué miembro completó cuántas tareas en el sprint |

### Reportes de Equipo
| ID | Descripción |
|----|-------------|
| RF82 | El sistema muestra la carga de trabajo por miembro: cuántas tareas tiene asignadas cada uno |
| RF83 | El Manager puede ver el rendimiento del equipo por sprint |

### Exportación
| ID | Descripción |
|----|-------------|
| RF84 | El usuario puede exportar el reporte de un sprint en formato PDF |
