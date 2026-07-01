/**
 * Traducción de estados (nombres de columna) a español para MOSTRAR en la UI.
 *
 * El backend mantiene los nombres canónicos en inglés ("To Do", "In Progress",
 * "In Review", "Done") como fuente de verdad — los reportes dependen de "Done".
 * Aquí solo traducimos para presentación; el valor/estado real no cambia.
 */
export const STATUS_ES: Record<string, string> = {
  'To Do': 'Por hacer',
  Backlog: 'Backlog',
  'In Progress': 'En progreso',
  'In Review': 'En revisión',
  Done: 'Finalizado',
};

export function statusLabel(name: string | null | undefined): string {
  if (!name) return '—';
  return STATUS_ES[name] ?? name;
}

/** Colores por estado (consistentes en toda la app). */
export const STATUS_COLOR: Record<string, string> = {
  'To Do': '#64748B',
  Backlog: '#94A3B8',
  'In Progress': '#3B82F6',
  'In Review': '#F97316',
  Done: '#22C55E',
};

export function statusColor(name: string | null | undefined): string {
  if (!name) return '#94A3B8';
  return STATUS_COLOR[name] ?? '#94A3B8';
}
