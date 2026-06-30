/** Llamadas HTTP al Módulo 2 (Proyectos). */
import api from '../../../shared/api/api';
import type { Paginated, Project, User, RolProyecto } from '../../../shared/types';

export async function listProjects(page = 1, limit = 20): Promise<Paginated<Project>> {
  const { data } = await api.get<Paginated<Project>>('/projects', {
    params: { page, limit },
  });
  return data;
}

export async function getProject(id: string): Promise<Project> {
  const { data } = await api.get<Project>(`/projects/${id}`);
  return data;
}

export async function createProject(name: string, description?: string): Promise<Project> {
  const { data } = await api.post<Project>('/projects', { name, description });
  return data;
}

export async function updateProject(
  id: string,
  payload: { name?: string; description?: string }
): Promise<Project> {
  const { data } = await api.put<Project>(`/projects/${id}`, payload);
  return data;
}

export async function deleteProject(id: string): Promise<void> {
  await api.delete(`/projects/${id}`);
}

export async function addMember(
  projectId: string,
  userId: string,
  rol: RolProyecto
): Promise<void> {
  await api.post(`/projects/${projectId}/members`, { user_id: userId, rol });
}

export async function removeMember(
  projectId: string,
  userId: string
): Promise<void> {
  await api.delete(`/projects/${projectId}/members/${userId}`);
}

export async function listUsers(): Promise<User[]> {
  const { data } = await api.get<Paginated<User>>('/admin/users');
  return data.data;
}
