/** Llamadas HTTP al Módulo 2 (Proyectos). */
import api from '../../../shared/api/api';
import type { Paginated, Project } from '../../../shared/types';

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

export interface InitialMemberInput {
  user_id: string;
  rol: 'Manager' | 'Developer' | 'Viewer';
}

export async function createProject(name: string, description?: string, members?: InitialMemberInput[]): Promise<Project> {
  const { data } = await api.post<Project>('/projects', { name, description, members });
  return data;
}

export async function deleteProject(id: string): Promise<void> {
  await api.delete(`/projects/${id}`);
}
