/** Llamadas HTTP al Módulo 2 (Proyectos, Invitaciones, Sprints). */
import api from '../../../shared/api/api';
import type { Project, User, RolProyecto, ProjectMember, Invitation, Sprint, Paginated } from '../../../shared/types';

// Endpoint 1: Crear proyecto
export async function createProject(payload: {
  nombre: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  color?: string;
}): Promise<{ mensaje: string; proyecto: Project }> {
  const { data } = await api.post<{ mensaje: string; proyecto: Project }>('/projects', payload);
  return data;
}

// Endpoint 2: Listar proyectos
export async function listProjects(page = 1, limit = 20): Promise<{ proyectos: Project[]; total: number }> {
  const { data } = await api.get<{ proyectos: Project[]; total: number }>('/projects', {
    params: { page, limit },
  });
  return data;
}

// Endpoint 3: Ver detalle de un proyecto
export async function getProject(id: string): Promise<Project> {
  const { data } = await api.get<Project>(`/projects/${id}`);
  return data;
}

// Endpoint 4: Editar proyecto
export async function updateProject(
  id: string,
  payload: {
    nombre?: string;
    descripcion?: string;
    color?: string;
    estado?: string;
    fecha_fin?: string;
  }
): Promise<{ mensaje: string; proyecto: Project }> {
  const { data } = await api.put<{ mensaje: string; proyecto: Project }>(`/projects/${id}`, payload);
  return data;
}

// Endpoint 5: Eliminar proyecto
export async function deleteProject(id: string): Promise<{ mensaje: string; id: string }> {
  const { data } = await api.delete<{ mensaje: string; id: string }>(`/projects/${id}`);
  return data;
}

// Endpoint 6: Buscar proyectos por nombre
export async function searchProjects(q: string): Promise<{ proyectos: Project[]; total: number }> {
  const { data } = await api.get<{ proyectos: Project[]; total: number }>('/projects/search', {
    params: { q },
  });
  return data;
}

// Endpoint 7: Invitar miembro al proyecto
export async function inviteMember(
  projectId: string,
  email: string,
  rol: RolProyecto
): Promise<{ mensaje: string; invitacion: Invitation }> {
  const { data } = await api.post<{ mensaje: string; invitacion: Invitation }>(
    `/projects/${projectId}/invitations`,
    { email, rol }
  );
  return data;
}

// Endpoint 8: Responder invitación
export async function respondInvitation(
  invitationId: string,
  accion: 'aceptar' | 'rechazar'
): Promise<{ mensaje: string; miembro?: any }> {
  const { data } = await api.patch<{ mensaje: string; miembro?: any }>(
    `/invitations/${invitationId}/respond`,
    { accion }
  );
  return data;
}

// Listar invitaciones dirigidas al usuario autenticado
export async function listMyInvitations(): Promise<Invitation[]> {
  const { data } = await api.get<Invitation[]>('/invitations');
  return data;
}

// Endpoint 9: Listar miembros del proyecto
export async function listMembers(projectId: string): Promise<{ miembros: ProjectMember[]; total: number }> {
  const { data } = await api.get<{ miembros: ProjectMember[]; total: number }>(`/projects/${projectId}/members`);
  return data;
}

// Endpoint 10: Eliminar miembro del proyecto
export async function removeMember(projectId: string, memberId: string): Promise<{ mensaje: string; id_miembro: string }> {
  const { data } = await api.delete<{ mensaje: string; id_miembro: string }>(`/projects/${projectId}/members/${memberId}`);
  return data;
}

// Endpoint 11: Cambiar rol de un miembro
export async function changeMemberRole(
  projectId: string,
  memberId: string,
  rol: RolProyecto
): Promise<{ mensaje: string; id_miembro: string; rol_nuevo: RolProyecto }> {
  const { data } = await api.patch<{ mensaje: string; id_miembro: string; rol_nuevo: RolProyecto }>(
    `/projects/${projectId}/members/${memberId}/role`,
    { rol }
  );
  return data;
}

// Endpoint 12: Crear sprint
export async function createSprint(
  projectId: string,
  payload: { nombre: string; fecha_inicio: string; fecha_fin: string }
): Promise<{ mensaje: string; sprint: Sprint }> {
  const { data } = await api.post<{ mensaje: string; sprint: Sprint }>(`/projects/${projectId}/sprints`, payload);
  return data;
}

// Endpoint 13: Listar sprints del proyecto
export async function listSprints(projectId: string): Promise<{ sprints: Sprint[]; total: number }> {
  const { data } = await api.get<{ sprints: Sprint[]; total: number }>(`/projects/${projectId}/sprints`);
  return data;
}

// Endpoint 14: Editar sprint
export async function updateSprint(
  projectId: string,
  sprintId: string,
  payload: { nombre?: string; fecha_inicio?: string; fecha_fin?: string }
): Promise<{ mensaje: string; sprint: Sprint }> {
  const { data } = await api.put<{ mensaje: string; sprint: Sprint }>(
    `/projects/${projectId}/sprints/${sprintId}`,
    payload
  );
  return data;
}

// Endpoint 15: Cerrar sprint
export async function closeSprint(
  projectId: string,
  sprintId: string
): Promise<{ mensaje: string; sprint_id: string; tareas_al_backlog: number; tareas_completadas: number }> {
  const { data } = await api.patch<{
    mensaje: string;
    sprint_id: string;
    tareas_al_backlog: number;
    tareas_completadas: number;
  }>(`/projects/${projectId}/sprints/${sprintId}/close`);
  return data;
}

// Utilidad administrativa global para buscar usuarios en Invitaciones
export async function listUsers(): Promise<User[]> {
  const { data } = await api.get<Paginated<User>>('/admin/users');
  return data.data;
}
