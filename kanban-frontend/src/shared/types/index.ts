/** Tipos compartidos del dominio Kanbix (alineados con los contratos del backend). */

export type RolGlobal = 'Admin' | 'Manager' | 'Developer' | 'Viewer';
export type RolProyecto = 'Manager' | 'Developer' | 'Viewer';
export type Prioridad = 'Baja' | 'Media' | 'Alta' | 'Crítica';
export type TaskType = 'Tarea' | 'Recurso' | 'Contact' | 'Request';

export interface User {
  id: string;
  email: string;
  nombre_completo: string;
  rol_global: RolGlobal;
  cambiar_password?: boolean;
  fecha_creacion?: string;
  ultimo_acceso?: string | null;
}

export interface ProjectMember {
  user_id: string;
  nombre_completo: string;
  email: string;
  rol: RolProyecto;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  role?: RolProyecto;
  member_count?: number;
  created_at: string;
  members?: ProjectMember[];
}

export interface Paginated<T> {
  total: number;
  page: number;
  limit: number;
  data: T[];
}

export interface TaskCard {
  id: string;
  title: string;
  description?: string | null;
  assignee?: string | null;
  assignee_id?: string | null;
  priority?: Prioridad;
  due_date?: string | null;
  start_date?: string | null;
  story_points?: number | null;
  tags?: string[];
  task_type?: TaskType;
  creator_name?: string | null;
  status?: string;
  sprint_id?: string | null;
}

export interface BoardColumn {
  id: string;
  name: string;
  position: number;
  tasks: TaskCard[];
}

export interface Board {
  id: string;
  project_id?: string;
  name: string;
  description?: string;
  column_count?: number;
  created_at: string;
}

export interface BoardDetail {
  id: string;
  name: string;
  columns: BoardColumn[];
}

export interface Sprint {
  id: string;
  name: string;
  goal?: string | null;
  state: 'pending' | 'active' | 'completed';
  start_date?: string | null;
  end_date?: string | null;
}
