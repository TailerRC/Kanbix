/**
 * Capa de API para el Módulo 1: Autenticación y Usuarios.
 *
 * Todas las funciones usan el cliente axios central (`api`) que ya incluye:
 *   - Adjuntar el access_token en cada request
 *   - Refrescar el token automáticamente ante 401
 *
 * Alineado con el contrato: docs/contratos/modulo1_auth_usuarios.md
 */
import api from '../../../shared/api/api';
import type { RolGlobal, User } from '../../../shared/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  cambiar_password: boolean;
}

export interface RegisterPayload {
  email: string;
  password: string;
  nombre_completo: string;
  rol_global: RolGlobal;
}

export interface UserListItem {
  id: string;
  email: string;
  nombre_completo: string;
  rol_global: RolGlobal;
  activo: boolean;
  bloqueado: boolean;
  fecha_creacion: string;
  ultimo_acceso: string | null;
}

export interface UserListResponse {
  total: number;
  page: number;
  limit: number;
  data: UserListItem[];
}

export interface UnlockResponse {
  message: string;
  user_id: string;
}

export interface ChangeRoleResponse {
  message: string;
  user_id: string;
  rol_global: RolGlobal;
}

// ---------------------------------------------------------------------------
// /auth/* — autenticación
// ---------------------------------------------------------------------------

/** POST /api/v1/auth/login — público */
export async function loginApi(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', payload);
  return data;
}

/** POST /api/v1/auth/logout — requiere access_token */
export async function logoutApi(refresh_token: string): Promise<void> {
  await api.post('/auth/logout', { refresh_token });
}

/** GET /api/v1/auth/me — perfil del usuario autenticado */
export async function getMeApi(): Promise<User> {
  const { data } = await api.get<User>('/auth/me');
  return data;
}

/** POST /api/v1/auth/refresh — renovar access_token */
export async function refreshApi(refresh_token: string): Promise<{ access_token: string; expires_in: number }> {
  const { data } = await api.post('/auth/refresh', { refresh_token });
  return data;
}

// ---------------------------------------------------------------------------
// /admin/users/* — solo Admin (RN-05, RN-07, RN-32)
// ---------------------------------------------------------------------------

/** POST /api/v1/admin/users — crear usuario (solo Admin, RN-05) */
export async function adminCreateUser(payload: RegisterPayload): Promise<User> {
  const { data } = await api.post<User>('/admin/users', payload);
  return data;
}

/** GET /api/v1/admin/users — listar usuarios paginado (solo Admin) */
export async function adminListUsers(
  page = 1,
  limit = 20
): Promise<UserListResponse> {
  const { data } = await api.get<UserListResponse>('/admin/users', {
    params: { page, limit },
  });
  return data;
}

/** POST /api/v1/admin/users/{id}/unlock — desbloquear cuenta (RN-32) */
export async function adminUnlockUser(userId: string): Promise<UnlockResponse> {
  const { data } = await api.post<UnlockResponse>(`/admin/users/${userId}/unlock`);
  return data;
}

/** PUT /api/v1/admin/users/{id}/role — cambiar rol global (RN-07) */
export async function adminChangeRole(
  userId: string,
  rol_global: RolGlobal
): Promise<ChangeRoleResponse> {
  const { data } = await api.put<ChangeRoleResponse>(`/admin/users/${userId}/role`, {
    rol_global,
  });
  return data;
}

export interface AdminUpdateUserPayload {
  nombre_completo?: string;
  email?: string;
  activo?: boolean;
  password?: string;
  rol_global?: RolGlobal;
}

/** PUT /api/v1/admin/users/{id} — actualizar info completa del usuario (solo Admin) */
export async function adminUpdateUser(
  userId: string,
  payload: AdminUpdateUserPayload
): Promise<UserListItem> {
  const { data } = await api.put<UserListItem>(`/admin/users/${userId}`, payload);
  return data;
}

export interface AuditLogItem {
  id: string;
  id_usuario?: string | null;
  accion: string;
  detalle: string;
  id_recurso?: string | null;
  fecha: string;
  usuario_ejecutor_email?: string | null;
  usuario_ejecutor_nombre?: string | null;
  recurso_afectado_nombre?: string | null;
  recurso_afectado_tipo?: string | null;
}

export interface AuditLogListResponse {
  total: number;
  page: number;
  limit: number;
  data: AuditLogItem[];
}

/** GET /api/v1/admin/logs — listar logs de auditoría paginado (solo Admin) */
export async function adminListLogs(
  page = 1,
  limit = 50
): Promise<AuditLogListResponse> {
  const { data } = await api.get<AuditLogListResponse>('/admin/logs', {
    params: { page, limit },
  });
  return data;
}

// ---------------------------------------------------------------------------
// Perfil propio
// ---------------------------------------------------------------------------

export interface UpdateProfilePayload {
  nombre_completo?: string;
  email?: string;
}

/** PATCH /api/v1/auth/me — actualizar nombre y/o correo del propio usuario */
export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const { data } = await api.patch<User>('/auth/me', payload);
  return data;
}

// ---------------------------------------------------------------------------
// Tickets de Soporte
// ---------------------------------------------------------------------------

export type TipoTicket = 'CAMBIO_PASSWORD' | 'ACCESO_BLOQUEADO' | 'SOPORTE_TECNICO' | 'OTRO';
export type EstadoTicket = 'ABIERTO' | 'EN_REVISION' | 'RESUELTO' | 'CERRADO';

export interface TicketItem {
  id: string;
  id_usuario: string;
  usuario_nombre?: string | null;
  usuario_email?: string | null;
  tipo: TipoTicket;
  asunto: string;
  descripcion: string;
  estado: EstadoTicket;
  nota_resolucion?: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface TicketListResponse {
  total: number;
  page: number;
  limit: number;
  data: TicketItem[];
}

export interface CreateTicketPayload {
  tipo: TipoTicket;
  asunto: string;
  descripcion: string;
}

export interface UpdateTicketPayload {
  estado: EstadoTicket;
  nota_resolucion?: string;
}

/** POST /api/v1/tickets — crear ticket de soporte */
export async function createTicket(payload: CreateTicketPayload): Promise<TicketItem> {
  const { data } = await api.post<TicketItem>('/tickets', payload);
  return data;
}

/** GET /api/v1/tickets — listar mis tickets */
export async function listMyTickets(page = 1, limit = 20): Promise<TicketListResponse> {
  const { data } = await api.get<TicketListResponse>('/tickets', { params: { page, limit } });
  return data;
}

/** GET /api/v1/admin/tickets — todos los tickets (solo Admin) */
export async function adminListTickets(page = 1, limit = 50): Promise<TicketListResponse> {
  const { data } = await api.get<TicketListResponse>('/admin/tickets', { params: { page, limit } });
  return data;
}

/** PATCH /api/v1/admin/tickets/{id} — Admin actualiza estado (solo Admin) */
export async function adminUpdateTicket(ticketId: string, payload: UpdateTicketPayload): Promise<TicketItem> {
  const { data } = await api.patch<TicketItem>(`/admin/tickets/${ticketId}`, payload);
  return data;
}

// Preferencias de Notificaciones
export interface UserPreferences {
  id_usuario: string;
  notif_asignacion: boolean;
  notif_comentarios: boolean;
  notif_email: boolean;
  notif_tickets: boolean;
}

export interface UpdatePreferencesPayload {
  notif_asignacion: boolean;
  notif_comentarios: boolean;
  notif_email: boolean;
  notif_tickets: boolean;
}

export async function getUserPreferences(): Promise<UserPreferences> {
  const { data } = await api.get<UserPreferences>('/auth/preferences');
  return data;
}

export async function updateUserPreferences(payload: UpdatePreferencesPayload): Promise<UserPreferences> {
  const { data } = await api.patch<UserPreferences>('/auth/preferences', payload);
  return data;
}

