/** Llamadas HTTP al Módulo 6 (Reportes y Dashboard). */
import api from '../../../shared/api/api';

export interface DashboardOverview {
  metrics_7d: { created: number; updated: number; completed: number; due_soon: number };
  by_status: { status: string; count: number }[];
  by_type: { type: string; count: number }[];
  by_assignee: { assignee_id: string | null; name: string; count: number }[];
  recent_activity: {
    task_id: string;
    title: string | null;
    status: string | null;
    assignee: string | null;
    updated_at: string | null;
  }[];
}

export interface BurndownPoint {
  date: string;
  ideal_remaining: number;
  actual_remaining: number;
}

export interface BurnupPoint {
  date: string;
  scope: number;
  completed: number;
}

export interface VelocityItem {
  sprint_id: string;
  sprint_name: string;
  committed_points: number;
  completed_points: number;
}

export const reportsApi = {
  getOverview: (projectId: string): Promise<DashboardOverview> =>
    api.get(`/projects/${projectId}/dashboard/overview`).then((r) => r.data),

  getBurndown: (projectId: string, sprintId: string): Promise<BurndownPoint[]> =>
    api.get(`/projects/${projectId}/sprints/${sprintId}/burndown`).then((r) => r.data),

  getBurnup: (projectId: string, sprintId: string): Promise<BurnupPoint[]> =>
    api.get(`/projects/${projectId}/sprints/${sprintId}/burnup`).then((r) => r.data),

  getVelocity: (projectId: string): Promise<VelocityItem[]> =>
    api.get(`/projects/${projectId}/reports/velocity`).then((r) => r.data),
};
