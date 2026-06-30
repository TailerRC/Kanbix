## ADDED Requirements

### Requirement: Invite member by email
El Scrum Master del proyecto MUST poder invitar a un usuario externo o interno mediante su correo electrónico asignándole un rol inicial (`scrum_master`, `product_owner` o `developer`).

#### Scenario: Sending pending invitation
- **WHEN** el Scrum Master del proyecto envía un email válido y un rol
- **THEN** el sistema registra una invitación en estado `pendiente` con una validez de 7 días, previniendo duplicados de invitación o miembros existentes.

---

### Requirement: Respond to project invitation
Un usuario autenticado MUST poder consultar las invitaciones dirigidas a su email y aceptarlas o rechazarlas.

#### Scenario: Accepting invitation to project
- **WHEN** el usuario acepta una invitación pendiente
- **THEN** el sistema marca la invitación como aceptada, añade al usuario al arreglo de miembros del proyecto correspondiente con el rol estipulado, y le da acceso a los tableros del proyecto.

---

### Requirement: List members of project
Cualquier miembro del proyecto MUST poder consultar de forma explícita la lista completa de integrantes activos del proyecto con sus nombres, emails y roles.

#### Scenario: Retrieving members list
- **WHEN** un miembro solicita la lista de integrantes del proyecto
- **THEN** el sistema retorna la información de contacto y roles de todos los participantes.

---

### Requirement: Remove member from project
El Scrum Master del proyecto MUST poder eliminar a un miembro activo, excepto a sí mismo (el creador del proyecto).

#### Scenario: Removing project member
- **WHEN** el Scrum Master elimina a un desarrollador de la lista
- **THEN** el sistema remueve al usuario de la lista de miembros y deja sin asignar las tareas que tenía asignadas en el tablero.

---

### Requirement: Edit member role
El Scrum Master del proyecto MUST poder cambiar el rol de un miembro activo, cuidando la restricción de que solo puede existir un Scrum Master a la vez en el proyecto.

#### Scenario: Changing developer to product owner
- **WHEN** el Scrum Master actualiza el rol de un desarrollador a `product_owner`
- **THEN** el sistema modifica el rol del usuario en la base de datos y aplica los nuevos permisos de navegación.
