/** Tipos compartidos del dominio Kanbix (alineados con los contratos del backend). */

export type RolGlobal = 'Admin' | 'Manager' | 'Developer' | 'Viewer';
export type RolProyecto = 'Manager' | 'Developer' | 'Viewer';
export type Prioridad = 'Baja' | 'Media' | 'Alta' | 'Crítica';

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
  assignee?: string | null;
  priority?: Prioridad;
  due_date?: string | null;
}

export interface BoardColumn {
  id: string;
  name: string;
  position: number;
  tasks: TaskCard[];
}

export interface BoardDetail {
  id: string;
  name: string;
  columns: BoardColumn[];
}
