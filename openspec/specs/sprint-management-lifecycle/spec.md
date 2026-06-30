# sprint-management-lifecycle Specification

## Purpose
TBD - created by archiving change modulo2-alignment. Update Purpose after archive.
## Requirements
### Requirement: Create and list sprints
El Scrum Master del proyecto MUST poder crear múltiples sprints con nombre, fecha de inicio y fecha de fin, permitiendo listar todo el historial del proyecto.

#### Scenario: Creating a sprint when none are active
- **WHEN** el Scrum Master crea un sprint con nombre y fechas válidas y no existe ningún otro sprint en estado `Activo` en el proyecto
- **THEN** el sistema registra el sprint y lo guarda con estado `Activo`.

---

### Requirement: Sprint exclusivity active state
El sistema MUST asegurar la exclusividad de estados activos: solo puede haber un sprint en estado `Activo` a la vez por proyecto.

#### Scenario: Blocking creation of second active sprint
- **WHEN** el Scrum Master intenta crear un sprint activo mientras ya existe otro sprint en estado `Activo` en el proyecto
- **THEN** el sistema rechaza la solicitud retornando un código de error de conflicto 409.

---

### Requirement: Edit sprint metadata
El Scrum Master del proyecto MUST poder editar el nombre y las fechas del sprint para ampliar su duración.

#### Scenario: Extending sprint end date
- **WHEN** el Scrum Master cambia la fecha de fin del sprint activo
- **THEN** el sistema actualiza la fecha permitiendo más tiempo para finalizar las tareas.

---

### Requirement: Close active sprint and rollover
El Scrum Master MUST poder cerrar el sprint activo del proyecto. El cierre del sprint debe trasladar de forma automática todas las tareas que no se encuentren en la columna "Done"/"Hecho" de regreso al backlog.

#### Scenario: Closing active sprint with rollover
- **WHEN** el Scrum Master cierra el sprint activo
- **THEN** el sistema actualiza el estado del sprint a `Cerrado`, busca todas las tareas asignadas al sprint que no estén en la columna "Done"/"Hecho", actualiza su campo `sprint_id` a `null` (devolviéndolas al backlog), y retorna el recuento de tareas movidas y completadas.

