/** Tipos compartidos del dominio Kanbix (alineados con los contratos del backend). */

export type RolGlobal = 'Admin' | 'Manager' | 'Developer' | 'Viewer';
export type RolProyecto = 'scrum_master' | 'product_owner' | 'developer';
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
  id_miembro: string;
  id_usuario: string;
  nombre: string;
  email: string;
  rol: RolProyecto;
  fecha_union?: string;
}

export interface Project {
  id: string;
  nombre: string;
  descripcion?: string | null;
  iniciales: string;
  color: string;
  estado: string;
  fecha_inicio: string;
  fecha_fin?: string | null;
  id_creador: string;
  mi_rol?: RolProyecto;
  total_miembros?: number;
  fecha_creacion: string;
  members?: ProjectMember[];
}

export interface Invitation {
  id: string;
  email: string;
  rol: RolProyecto;
  estado: 'pendiente' | 'aceptada' | 'rechazada' | 'expirada';
  id_proyecto: string;
  expira_en: string;
}

export interface Sprint {
  id: string;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'Activo' | 'Cerrado';
  id_proyecto: string;
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
  story_points?: number | null;
  subtasks?: { subtask_id: string; title: string; completed: boolean }[];
  dependencies?: string[];
  tags?: string[];
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
