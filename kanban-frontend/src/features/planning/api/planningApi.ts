import api from '../../../shared/api/api';
import type { Sprint } from '../../../shared/types';

export const planningApi = {
  // Sprints
  getSprints: (projectId: string): Promise<Sprint[]> =>
    api.get(`/projects/${projectId}/sprints`).then(res => res.data),

  createSprint: (projectId: string, data: { name: string; goal?: string; start_date?: string; end_date?: string }): Promise<Sprint> =>
    api.post(`/projects/${projectId}/sprints`, data).then(res => res.data),

  updateSprint: (sprintId: string, data: Partial<Sprint>): Promise<Sprint> =>
    api.put(`/sprints/${sprintId}`, data).then(res => res.data),

  startSprint: (sprintId: string): Promise<Sprint> =>
    api.post(`/sprints/${sprintId}/start`, {}).then(res => res.data),

  completeSprint: (sprintId: string): Promise<Sprint> =>
    api.post(`/sprints/${sprintId}/complete`, {}).then(res => res.data),
};
