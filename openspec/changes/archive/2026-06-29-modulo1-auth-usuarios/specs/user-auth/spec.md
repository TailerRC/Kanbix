## ADDED Requirements

### Requirement: User registration
The system SHALL allow new users to register with email, password, and full name. The email SHALL be unique across the system (RN-02). Passwords SHALL be stored as bcrypt hash (RN-03). New users SHALL receive the Developer role by default (RN-05).

#### Scenario: Successful registration
- **WHEN** a user submits valid email, password (8+ chars, 1 upper, 1 lower, 1 number), and full name
- **THEN** the system creates the user with role "Developer" and returns 201 with user id, email, full name, and creation date

#### Scenario: Duplicate email
- **WHEN** a user submits an email that is already registered
- **THEN** the system returns 400 with error detail "El email ya está registrado"

#### Scenario: Invalid data format
- **WHEN** a user submits an invalid email, or password shorter than 8 characters
- **THEN** the system returns 422 with validation error details

---

### Requirement: User login
The system SHALL authenticate users by email and password, returning a JWT access_token (30 min expiry) and a refresh_token (7 day expiry) (ADR-002).

#### Scenario: Successful login
- **WHEN** a user submits valid email and matching password
- **THEN** the system returns 200 with access_token, refresh_token, token_type "bearer", and expires_in

#### Scenario: Invalid credentials
- **WHEN** a user submits email with incorrect password
- **THEN** the system increments login_attempts, and if attempts < 5, returns 401 with "Credenciales inválidas"

#### Scenario: Account locked after 5 failed attempts
- **WHEN** a user reaches 5 consecutive failed login attempts
- **THEN** the system locks the account for 15 minutes and returns 403 with "Cuenta bloqueada — contactar al administrador" (RN-04)

#### Scenario: Login while account locked
- **WHEN** a user attempts login while locked_until is in the future
- **THEN** the system returns 403 regardless of password correctness

#### Scenario: Successful login resets attempt counter
- **WHEN** a user logs in successfully after previous failed attempts
- **THEN** the system resets login_attempts to 0 and updates ultimo_acceso

#### Scenario: Locked account automatic unlock
- **WHEN** 15 minutes have passed since the account was locked
- **THEN** the system SHALL allow login attempts again (implicit unlock on next attempt)

---

### Requirement: Token refresh
The system SHALL accept a valid refresh_token and return a new access_token (ADR-002).

#### Scenario: Successful token refresh
- **WHEN** a user sends a valid, non-expired refresh_token
- **THEN** the system returns 200 with a new access_token and expires_in

#### Scenario: Invalid or expired refresh token
- **WHEN** a user sends an invalid or expired refresh_token
- **THEN** the system returns 401 with "Refresh token inválido o expirado"

---

### Requirement: Logout
The system SHALL invalidate a refresh_token when the user logs out (ADR-002).

#### Scenario: Successful logout
- **WHEN** an authenticated user sends a valid refresh_token
- **THEN** the system deletes the refresh_token from the database and returns 200 with "Sesión cerrada exitosamente"

#### Scenario: Logout without valid access token
- **WHEN** a request to logout has no valid access_token
- **THEN** the system returns 401

---

### Requirement: Get authenticated user profile
The system SHALL return the profile of the currently authenticated user.

#### Scenario: Authenticated user requests profile
- **WHEN** an authenticated user sends GET /auth/me with a valid access_token
- **THEN** the system returns 200 with user id, email, full_name, creation date, and last access date

#### Scenario: User not found
- **WHEN** the access_token is valid but the user no longer exists in the database
- **THEN** the system returns 404 with "Usuario no encontrado"

#### Scenario: Unauthenticated request
- **WHEN** a request to /auth/me has no valid access_token
- **THEN** the system returns 401

---

### Requirement: Role hierarchy
The system SHALL enforce the role hierarchy: Admin > Manager > Developer > Viewer (RN-06). Only an Admin can assign or modify another user's role. No user can change their own role (RN-07). There SHALL always be at least one active Admin (RN-08).

#### Scenario: Default role on registration
- **WHEN** a new user registers
- **THEN** the system assigns role "Developer" by default (RN-05)

#### Scenario: Admin cannot be deleted if last one
- **WHEN** an attempt is made to delete the last active Admin
- **THEN** the system SHALL reject the operation (implementation in Módulo 2, spec defined here for completeness)

---

### Requirement: Auth middleware
The system SHALL provide a reusable dependency that validates JWT access_tokens and injects the current user into request handlers for use by all modules.

#### Scenario: Valid token passes middleware
- **WHEN** a request includes a valid, non-expired access_token in the Authorization header
- **THEN** the middleware decodes the token, fetches the user, and makes user available to the handler

#### Scenario: Missing or invalid token
- **WHEN** a request to a protected endpoint has no token, an expired token, or an invalid token
- **THEN** the middleware returns 401
