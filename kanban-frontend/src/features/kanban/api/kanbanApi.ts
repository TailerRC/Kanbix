/** Llamadas HTTP al Módulo 3 (Tableros, Columnas y Tareas). */
import api from '../../../shared/api/api';
import type { BoardDetail, TaskCard } from '../../../shared/types';

interface BoardSummary {
  id: string;
  name: string;
  description?: string | null;
  column_count: number;
  created_at: string;
}

export async function listBoards(projectId: string): Promise<BoardSummary[]> {
  const { data } = await api.get<BoardSummary[]>(`/projects/${projectId}/boards`);
  return data;
}

export async function getBoardDetail(projectId: string, boardId: string): Promise<BoardDetail> {
  const { data } = await api.get<BoardDetail>(`/projects/${projectId}/boards/${boardId}`);
  return data;
}

export async function createBoard(projectId: string, name: string, description?: string) {
  const { data } = await api.post(`/projects/${projectId}/boards`, { name, description });
  return data;
}

export async function moveTask(taskId: string, columnId: string, position?: number) {
  const { data } = await api.patch(`/tasks/${taskId}/move`, { column_id: columnId, position });
  return data;
}

export async function createTask(
  boardId: string,
  payload: { title: string; column_id?: string; priority?: string; assignee_id?: string; due_date?: string }
) {
  const { data } = await api.post(`/boards/${boardId}/tasks`, payload);
  return data;
}

export async function updateTask(taskId: string, payload: Partial<TaskCard>) {
  const { data } = await api.patch(`/tasks/${taskId}`, payload);
  return data;
}
