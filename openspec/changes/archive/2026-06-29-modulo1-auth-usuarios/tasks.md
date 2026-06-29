## 1. Backend — Models (MongoDB)

- [x] 1.1 Create `User` model with fields: email, nombre_completo, password_hash, rol, activo, fecha_creacion, ultimo_acceso, login_attempts, locked_until
- [x] 1.2 Create `RefreshToken` model with fields: token, user_id, expires_at, created_at
- [x] 1.3 Add indexes: unique email on users, token on refresh_tokens, TTL index on refresh_tokens.expires_at

## 2. Backend — Schemas (Pydantic)

- [x] 2.1 Create `RegisterRequest` schema (email, password, nombre_completo) with validation
- [x] 2.2 Create `LoginRequest` schema (email, password)
- [x] 2.3 Create `UserResponse` schema (id, email, nombre_completo, fecha_creacion)
- [x] 2.4 Create `TokenResponse` schema (access_token, refresh_token, token_type, expires_in)
- [x] 2.5 Create `RefreshRequest` schema (refresh_token)
- [x] 2.6 Create `RefreshResponse` schema (access_token, expires_in)
- [x] 2.7 Create `LogoutRequest` schema (refresh_token)
- [x] 2.8 Create `UserProfileResponse` schema (id, email, nombre_completo, fecha_creacion, ultimo_acceso)
- [x] 2.9 Create `ErrorResponse` schema (detail, campo, codigo)

## 3. Backend — Service (business logic)

- [x] 3.1 Implement `register_user`: validate email uniqueness, hash password, create user with Developer role, return user data
- [x] 3.2 Implement `authenticate_user`: verify email exists, check locked_until, verify password, reset login_attempts on success, increment on failure, lock after 5 attempts
- [x] 3.3 Implement `create_tokens`: generate access_token + refresh_token, store refresh_token in DB
- [x] 3.4 Implement `refresh_access_token`: validate refresh_token in DB, generate new access_token
- [x] 3.5 Implement `revoke_refresh_token`: delete refresh_token from DB
- [x] 3.6 Implement `get_user_by_id`: fetch user by _id for middleware

## 4. Backend — Controller + Routes

- [x] 4.1 Implement `POST /api/v1/auth/register` — controller: validate input → call service → return UserResponse
- [x] 4.2 Implement `POST /api/v1/auth/login` — controller: validate credentials → create tokens → return TokenResponse
- [x] 4.3 Implement `POST /api/v1/auth/refresh` — controller: validate refresh → return new access_token
- [x] 4.4 Implement `POST /api/v1/auth/logout` — controller: revoke refresh_token → return success message
- [x] 4.5 Implement `GET /api/v1/auth/me` — controller: return authenticated user profile

## 5. Backend — Auth Middleware

- [x] 5.1 Create `app/shared/middleware/__init__.py`
- [x] 5.2 Implement `get_current_user` dependency: decode JWT → fetch user from DB → inject into handler
- [x] 5.3 Implement `require_auth` dependency wrapper for routes that need authentication
- [x] 5.4 Register auth router in `app/main.py`

## 6. Frontend — API Client

- [x] 6.1 Create `src/features/auth/api/authApi.ts` with Axios calls: register, login, refresh, logout, getMe
- [x] 6.2 Create Axios interceptor for automatic token refresh on 401
- [x] 6.3 Create Axios interceptor to attach Authorization header from localStorage

## 7. Frontend — Hooks + Context

- [x] 7.1 Create `AuthContext` with state: user, isAuthenticated, isLoading
- [x] 7.2 Create `useAuth` hook exposing: login, logout, register, user, isAuthenticated
- [x] 7.3 Create `useAuthGuard` hook: redirect to /login if not authenticated
- [x] 7.4 Implement token storage (localStorage) and hydration on app mount

## 8. Frontend — Pages + Components

- [x] 8.1 Create `LoginPage.tsx` with email/password form, error display, redirect to / on success
- [x] 8.2 Create `RegisterPage.tsx` with email/password/name form, validation, redirect to /login on success
- [x] 8.3 Create `ProtectedRoute.tsx` wrapper component using useAuthGuard

## 9. Frontend — App Integration

- [x] 9.1 Update `App.tsx` with AuthProvider, routes for /login and /register
- [x] 9.2 Add React Router routes for auth pages
- [x] 9.3 Configure Vite proxy (or CORS) for backend API calls
