# project-detail Specification

## Purpose
TBD - created by archiving change modulo2-frontend. Update Purpose after archive.
## Requirements
### Requirement: RF-M2F-01: ProjectDetailPage
The system SHALL display the project detail page at the route `/projects/:id` and restrict access to project members (Viewer+).
El header debe incluir el nombre del proyecto, descripción, rol del usuario actual, fecha de creación y cantidad de miembros.
La tabla de miembros debe listar el nombre, email y rol por proyecto de cada integrante.

#### Scenario: Visualizar detalle del proyecto como Manager
- **WHEN** el usuario autenticado tiene el rol de Manager o Admin global e ingresa a `/projects/:id`
- **THEN** la página muestra la información básica del proyecto y la tabla de miembros con las acciones habilitadas (Editar, Eliminar, Agregar/remover miembros)

#### Scenario: Visualizar detalle del proyecto como Developer o Viewer
- **WHEN** el usuario autenticado tiene el rol de Developer o Viewer e ingresa a `/projects/:id`
- **THEN** la página muestra la información básica del proyecto y la tabla de miembros sin los botones de acción para editar, eliminar o gestionar miembros

### Requirement: RF-M2F-02: Editar Proyecto
The system SHALL allow project Managers to update the project name and description via a modal form.
El nombre es obligatorio (mínimo 3 caracteres). Al guardar con éxito, el modal se cierra y el detalle del proyecto se recarga.

#### Scenario: Edición exitosa de un proyecto
- **WHEN** el Manager abre el modal de edición, ingresa un nombre válido y hace clic en "Guardar cambios"
- **THEN** el sistema envía la solicitud `PUT /api/v1/projects/{id}`, cierra el modal y actualiza los datos en pantalla

#### Scenario: Error de validación al editar
- **WHEN** el Manager intenta guardar un nombre vacío o que ya existe en el sistema
- **THEN** la UI muestra el error de validación retornado por el backend en el modal y mantiene el formulario abierto

### Requirement: RF-M2F-03: Eliminar Proyecto
The system SHALL allow project Managers to delete the project after typing the confirmation keyword "ELIMINAR".
Al confirmar con éxito, se redirige al usuario a `/projects`.

#### Scenario: Eliminación exitosa del proyecto
- **WHEN** el Manager abre el modal de eliminación, escribe "ELIMINAR" en el campo de texto y hace clic en el botón de confirmación
- **THEN** el sistema ejecuta `DELETE /api/v1/projects/{id}` y navega a `/projects` reemplazando la ruta en el historial

### Requirement: RF-M2F-04: Agregar Miembro
The system SHALL allow project Managers to add new team members with a specific project role.
El modal debe listar los usuarios del sistema y permitir seleccionar entre Manager, Developer o Viewer.

#### Scenario: Agregar miembro exitosamente
- **WHEN** el Manager abre el modal de agregar miembro, selecciona un usuario y un rol y hace clic en "Agregar"
- **THEN** el sistema ejecuta `POST /api/v1/projects/{id}/members`, cierra el modal y recarga la lista de miembros

#### Scenario: Error al agregar miembro duplicado
- **WHEN** el Manager intenta agregar a un usuario que ya forma parte del proyecto
- **THEN** el backend retorna error 400 y la UI muestra el mensaje de error inline en el modal

#### Scenario: Error por falta de permisos globales para listar usuarios
- **WHEN** un Manager de proyecto sin rol global Admin abre el modal para agregar miembros
- **THEN** el sistema recibe un error 403 al listar usuarios y muestra en pantalla "No tienes permisos para listar usuarios del sistema"

### Requirement: RF-M2F-05: Eliminar Miembro
The system SHALL allow project Managers to remove members from the project and prevent leaving the project without any Managers.

#### Scenario: Remover miembro exitosamente
- **WHEN** el Manager hace clic en el botón de remover de un miembro, confirma en la alerta y el backend procesa exitosamente `DELETE /api/v1/projects/{id}/members/{userId}`
- **THEN** la UI recarga la lista y el miembro ya no aparece en la tabla

#### Scenario: Error al intentar eliminar al último Manager
- **WHEN** el Manager intenta remover al único Manager del proyecto
- **THEN** el backend retorna error 400 (RN-11), el frontend muestra una alerta con el mensaje de error "El proyecto debe conservar al menos un Manager" y la lista de miembros se mantiene sin cambios

