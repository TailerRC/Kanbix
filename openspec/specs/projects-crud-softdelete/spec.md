# projects-crud-softdelete Specification

## Purpose
TBD - created by archiving change modulo2-alignment. Update Purpose after archive.
## Requirements
### Requirement: Project creation in Spanish
El sistema MUST permitir a usuarios con rol global Admin o Manager crear un proyecto especificando campos en español (`nombre`, `descripcion`, `fecha_inicio`, `fecha_fin`, `color`).

#### Scenario: Successful project creation
- **WHEN** un usuario envía un payload válido con `nombre` de 3 a 100 caracteres y `fecha_inicio` válida
- **THEN** el sistema registra el proyecto con estado `Activo`, genera automáticamente las iniciales en el avatar visual, guarda los datos en la base de datos y retorna la información en español asignando al creador como Scrum Master.

---

### Requirement: Project list and detail in Spanish
El sistema MUST retornar el listado y detalle de proyectos en español, incluyendo el rol que posee el usuario autenticado (`mi_rol`) en cada proyecto.

#### Scenario: Listing user projects
- **WHEN** el usuario autenticado solicita su lista de proyectos
- **THEN** el sistema retorna la información de los proyectos que integra, con los campos en español e indicando su rol respectivo (`mi_rol = "scrum_master" | "product_owner" | "developer"`).

---

### Requirement: Project search
El sistema MUST permitir buscar proyectos por nombre a través del parámetro query `q` de forma case-insensitive y parcial.

#### Scenario: Case-insensitive project search
- **WHEN** el usuario realiza una búsqueda de proyectos usando el query `q`
- **THEN** el sistema retorna la lista de proyectos coincidentes con ese nombre donde el usuario tiene participación.

---

### Requirement: Project soft-delete
El sistema MUST archivar lógicamente un proyecto (soft-delete) actualizando su estado a `"Archivado"`, en lugar de eliminar el documento físico de la base de datos.

#### Scenario: Archiving project logically
- **WHEN** el Scrum Master del proyecto solicita eliminar el proyecto
- **THEN** el sistema cambia el estado del proyecto a `"Archivado"`, impidiendo que aparezca en el listado activo de proyectos, pero preservando el histórico.

