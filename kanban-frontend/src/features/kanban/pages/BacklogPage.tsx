import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import ProjectTabs from '../../../shared/components/ProjectTabs';
import { statusLabel } from '../../../shared/utils/status';
import type { TaskCard, Prioridad } from '../../../shared/types';
import { BoardProvider, useBoard } from '../context/BoardContext';
import TaskDetailModal from '../components/TaskDetailModal';
import SprintEditModal from '../components/SprintEditModal';
import CompleteSprintModal from '../components/CompleteSprintModal';
import './BacklogPage.css';

const PRIORITY_COLOR: Record<Prioridad, string> = {
  Crítica: '#EF4444',
  Alta:    '#F97316',
  Media:   '#F59E0B',
  Baja:    '#3B82F6',
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  'To Do':       { bg: '#F1F5F9', color: '#475569' },
  'In Progress': { bg: '#EFF6FF', color: '#2563EB' },
  'In Review':   { bg: '#FFF7ED', color: '#C2410C' },
  'Done':        { bg: '#F0FDF4', color: '#16A34A' },
  'Backlog':     { bg: '#F8F9FA', color: '#6B7280' },
};

function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface Member {
  user_id: string;
  nombre_completo: string;
}

interface BacklogRowProps {
  task: TaskCard;
  columnName: string;
  columns: { id: string; name: string }[];
  members: Member[];
  onOpenDetail: (id: string) => void;
  onDragStartTask: (taskId: string) => void;
  onDragEndTask: () => void;
}

function BacklogRow({ task, columnName, columns, members, onOpenDetail, onDragStartTask, onDragEndTask }: BacklogRowProps) {
  const { updateTaskOptimistic } = useBoard();
  const priority = (task.priority || 'Media') as Prioridad;
  const statusStyle = STATUS_COLORS[columnName] ?? { bg: '#F1F5F9', color: '#475569' };

  let isOverdue = false;
  let dueDateDisplay = '';
  if (task.due_date) {
    const due = new Date(task.due_date);
    due.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    isOverdue = due.getTime() < today.getTime();
    dueDateDisplay = due.toLocaleDateString('es-PE', { month: 'short', day: 'numeric' });
  }

  const handleStatusChange = (colId: string) => {
    updateTaskOptimistic(task.id, { column_id: colId }).catch((err: any) =>
      alert('No se pudo cambiar el estado: ' + (err?.response?.data?.detail ?? err?.message ?? ''))
    );
  };

  const handleAssign = (userId: string) => {
    if (userId === (task.assignee_id ?? '')) return;
    const member = members.find((m) => m.user_id === userId);
    updateTaskOptimistic(task.id, {
      assignee_id: userId || null,
      assignee: member ? member.nombre_completo : null,
    }).catch((err: any) => alert('No se pudo asignar: ' + (err?.message ?? 'permiso denegado (requiere Manager)')));
  };

  return (
    <tr
      className="bl-row"
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStartTask(task.id); }}
      onDragEnd={onDragEndTask}
      onDoubleClick={() => onOpenDetail(task.id)}
    >
      <td className="bl-cell bl-cell--check">
        <button
          className="bl-view-btn"
          title="Ver detalles de la tarea"
          aria-label="Ver detalles"
          onClick={(e) => { e.stopPropagation(); onOpenDetail(task.id); }}
        >
          <Icon name="eye" size={15} />
        </button>
        <span className="bl-type-icon" title={task.task_type || 'Tarea'}>
          <Icon
            name={task.task_type === 'Recurso' ? 'tag' : task.task_type === 'Contact' ? 'lightbulb' : task.task_type === 'Request' ? 'plus-circle' : 'check-square'}
            size={13}
          />
        </span>
      </td>

      <td className="bl-cell bl-cell--id">
        <span className="bl-id">KBX-{task.id.substring(task.id.length - 4).toUpperCase()}</span>
      </td>

      <td className="bl-cell bl-cell--title">
        <button className="bl-title-btn" onClick={() => onOpenDetail(task.id)}>
          {task.title}
        </button>
      </td>

      <td className="bl-cell bl-cell--status">
        <select
          className="bl-status-select"
          value={columns.find((c) => c.name === columnName)?.id ?? ''}
          style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
          onChange={(e) => handleStatusChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
        >
          {columns.map((col) => (
            <option key={col.id} value={col.id}>{statusLabel(col.name)}</option>
          ))}
        </select>
      </td>

      <td className="bl-cell bl-cell--date">
        {task.due_date ? (
          <span className={`bl-date-badge ${isOverdue ? 'bl-date-badge--overdue' : ''}`}>
            <Icon name={isOverdue ? 'alert-triangle' : 'calendar'} size={12} />
            {dueDateDisplay}
          </span>
        ) : (
          <span className="bl-date-empty">—</span>
        )}
      </td>

      <td className="bl-cell bl-cell--priority">
        <span className="bl-priority-pill" style={{ color: PRIORITY_COLOR[priority], backgroundColor: `${PRIORITY_COLOR[priority]}18` }}>
          {priority}
        </span>
      </td>

      <td className="bl-cell bl-cell--assignee">
        <div className="bl-assignee" title={task.assignee || 'Sin asignar'}>
          {task.assignee ? (
            <span className="bl-avatar">{getInitials(task.assignee)}</span>
          ) : (
            <span className="bl-avatar bl-avatar--empty">
              <Icon name="user" size={12} />
            </span>
          )}
          <select
            className="bl-assignee-select"
            value={task.assignee_id ?? ''}
            onChange={(e) => handleAssign(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            aria-label="Asignar responsable"
          >
            <option value="">Sin asignar</option>
            {members.map((m) => (
              <option key={m.user_id} value={m.user_id}>{m.nombre_completo}</option>
            ))}
          </select>
        </div>
      </td>
    </tr>
  );
}

interface SprintGroupProps {
  tasks: TaskCard[];
  columns: { id: string; name: string }[];
  members: Member[];
  sprint: any | null; // null means backlog
  isBacklog?: boolean;
  onOpenDetail: (id: string) => void;
  onStartSprint?: (sprintId: string) => void;
  onCompleteSprint?: (sprintId: string) => void;
  onEditSprint?: (sprint: any) => void;
  onDropTask: (target: string | null) => void;
  onDragStartTask: (taskId: string) => void;
  onDragEndTask: () => void;
  isDragging: boolean;
}

function SprintGroup({ tasks, columns, members, sprint, isBacklog = false, onOpenDetail, onStartSprint, onCompleteSprint, onEditSprint, onDropTask, onDragStartTask, onDragEndTask, isDragging }: SprintGroupProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const { createTaskOptimistic } = useBoard();
  const total = tasks.length;
  const target: string | null = isBacklog ? null : sprint?.id ?? null;

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      setIsCreating(false);
      return;
    }
    const firstCol = columns.find(c => c.name.toLowerCase() !== 'backlog');
    if (firstCol) {
      await createTaskOptimistic(firstCol.id, newTitle.trim(), 'Media', undefined, undefined, sprint ? sprint.id : null);
    }
    setNewTitle('');
    setIsCreating(false);
  };

  // count tasks per status label
  const statusCounts: Record<string, number> = {};
  tasks.forEach((t) => {
    const label = t.status || 'To Do';
    statusCounts[label] = (statusCounts[label] ?? 0) + 1;
  });

  return (
    <section
      className={`bl-sprint-group ${dragOver ? 'bl-sprint-group--dragover' : ''} ${isDragging ? 'bl-sprint-group--droppable' : ''}`}
      onDragOver={(e) => { e.preventDefault(); if (!dragOver) setDragOver(true); }}
      onDragLeave={(e) => {
        // Solo desactivar si el puntero sale realmente de la sección
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false);
      }}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); onDropTask(target); }}
    >
      <div className="bl-sprint-header">
        <button
          className="bl-sprint-collapse"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? 'Expandir' : 'Colapsar'}
        >
          <Icon name={collapsed ? 'chevron-right' : 'chevron-down'} size={15} />
        </button>

        <span className="bl-sprint-icon">
          <Icon name={isBacklog ? 'inbox' : 'layout'} size={14} />
        </span>
        <span className="bl-sprint-name">{isBacklog ? 'Backlog' : sprint.name} {sprint?.state === 'active' ? '(Activo)' : ''}</span>
        
        {!isBacklog && sprint?.start_date && sprint?.end_date && (
          <button className="bl-sprint-dates" onClick={() => onEditSprint?.(sprint)} title="Editar sprint">
            {new Date(sprint.start_date).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })} - {new Date(sprint.end_date).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
          </button>
        )}
        {!isBacklog && (!sprint?.start_date || !sprint?.end_date) && (
          <button className="bl-sprint-dates bl-sprint-dates--empty" onClick={() => onEditSprint?.(sprint)}>
            + Añadir fechas
          </button>
        )}

        {!isBacklog && onEditSprint && (
          <button className="bl-sprint-edit" onClick={() => onEditSprint(sprint)} title="Editar sprint" aria-label="Editar sprint">
            <Icon name="edit" size={13} />
          </button>
        )}

        <span className="bl-sprint-count">({total} {total === 1 ? 'actividad' : 'actividades'})</span>

        {Object.entries(statusCounts).map(([status, count]) => {
          const sc = STATUS_COLORS[status] ?? { bg: '#F1F5F9', color: '#475569' };
          return (
            <span key={status} className="bl-sprint-stat" style={{ color: sc.color, background: sc.bg }}>
              {count} {statusLabel(status)}
            </span>
          );
        })}

        {!isBacklog && sprint?.state === 'pending' && (
          <div className="bl-sprint-actions">
            <button className="bl-sprint-btn" onClick={() => onStartSprint?.(sprint.id)} disabled={total === 0} title={total === 0 ? 'El sprint no tiene tareas' : ''}>
              <Icon name="play" size={12} />
              Iniciar sprint
            </button>
          </div>
        )}
        {!isBacklog && sprint?.state === 'active' && (
          <div className="bl-sprint-actions">
            <button className="bl-sprint-btn" onClick={() => onCompleteSprint?.(sprint.id)}>
              <Icon name="check" size={12} />
              Completar sprint
            </button>
          </div>
        )}
      </div>

      {!collapsed && (
        <table className="bl-table">
          <colgroup>
            <col style={{ width: 60 }} />
            <col style={{ width: 88 }} />
            <col />
            <col style={{ width: 148 }} />
            <col style={{ width: 112 }} />
            <col style={{ width: 104 }} />
            <col style={{ width: 52 }} />
          </colgroup>
          <thead>
            <tr className="bl-thead-row">
              <th className="bl-th" />
              <th className="bl-th">ID</th>
              <th className="bl-th">Título</th>
              <th className="bl-th">Estado</th>
              <th className="bl-th">Vencimiento</th>
              <th className="bl-th">Prioridad</th>
              <th className="bl-th">
                <Icon name="user" size={13} />
              </th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 && !isCreating ? (
              <tr>
                <td colSpan={7} className="bl-empty-row">
                  <Icon name="inbox" size={16} />
                  <span>{isBacklog ? 'El Backlog está vacío' : 'Arrastra actividades aquí para planificar este sprint'}</span>
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <BacklogRow
                  key={task.id}
                  task={task}
                  columnName={task.status ?? 'To Do'}
                  columns={columns}
                  members={members}
                  onOpenDetail={onOpenDetail}
                  onDragStartTask={onDragStartTask}
                  onDragEndTask={onDragEndTask}
                />
              ))
            )}
            {isCreating ? (
              <tr className="bl-inline-create-row">
                <td colSpan={7}>
                  <div className="bl-inline-create-container">
                    <input
                      autoFocus
                      className="bl-inline-create-input"
                      placeholder="¿Qué hay que hacer?"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreate();
                        if (e.key === 'Escape') setIsCreating(false);
                      }}
                      onBlur={handleCreate}
                    />
                  </div>
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan={7}>
                  <button className="bl-inline-create-btn" onClick={() => setIsCreating(true)}>
                    <Icon name="plus" size={12} /> Crear tarea
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </section>
  );
}

function BacklogContent() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { project, board, sprints, loading, error, loadBoard, loadSprints } = useBoard();
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [completingSprint, setCompletingSprint] = useState<{ id: string, name: string } | null>(null);
  const [editingSprint, setEditingSprint] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [completingBusy, setCompletingBusy] = useState(false);
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const { updateTaskOptimistic } = useBoard();

  useEffect(() => {
    if (!projectId) {
      navigate('/projects', { replace: true });
      return;
    }
    localStorage.setItem('lastProjectId', projectId);
    loadBoard(projectId);
  }, [projectId, navigate, loadBoard]);

  if (loading) return <div className="app-loader">Cargando backlog...</div>;
  if (error)   return <div style={{ padding: '24px', color: 'var(--color-danger)' }}>{error}</div>;
  if (!project || !board) return null;

  const allColumns = board.columns
    .filter((c) => c.name.toLowerCase() !== 'backlog')
    .map((c) => ({ id: c.id, name: c.name }));

  const allTasksRaw = board.columns
    .filter((c) => c.name.toLowerCase() !== 'backlog')
    .flatMap((c) => c.tasks.map((t) => ({ ...t, status: c.name })));

  const q = search.trim().toLowerCase();
  const allTasks = q
    ? allTasksRaw.filter((t) => t.title.toLowerCase().includes(q))
    : allTasksRaw;

  const backlogTasks = allTasks.filter(t => !t.sprint_id);

  const totalTasks = allTasksRaw.length;

  const members = (project.members ?? []).map((m) => ({ user_id: m.user_id, nombre_completo: m.nombre_completo }));

  // Validación: no se puede crear un nuevo sprint mientras exista uno sin cerrar.
  const unfinishedSprint = sprints.find((s) => s.state !== 'completed');

  const handleDropTask = (target: string | null) => {
    const taskId = dragTaskId;
    setDragTaskId(null);
    if (!taskId) return;
    const task = allTasksRaw.find((t) => t.id === taskId);
    if (!task) return;
    const current = task.sprint_id ?? null;
    if (current === target) return;
    // Validación: no mover tareas a un sprint ya cerrado.
    if (target) {
      const dest = sprints.find((s) => s.id === target);
      if (dest?.state === 'completed') {
        alert('No puedes mover tareas a un sprint ya cerrado.');
        return;
      }
    }
    updateTaskOptimistic(taskId, { sprint_id: target }).catch((err: any) =>
      alert('No se pudo mover la tarea: ' + (err?.message ?? ''))
    );
  };

  const handleCreateSprint = async () => {
    // RN: solo un sprint sin cerrar a la vez (no crear si hay pendiente/activo).
    if (unfinishedSprint) {
      alert(
        `No puedes crear un nuevo sprint mientras "${unfinishedSprint.name}" no esté completado. ` +
        `Completa o cierra el sprint actual primero.`
      );
      return;
    }
    const num = sprints.length + 1;
    // Fechas por defecto: hoy → +14 días (ciclo Scrum de 2 semanas).
    const start = new Date();
    const end = new Date(Date.now() + 14 * 86400000);
    try {
      await import('../../planning/api/planningApi').then(m =>
        m.planningApi.createSprint(projectId!, {
          name: `Sprint ${num}`,
          start_date: new Date(start.getFullYear(), start.getMonth(), start.getDate(), 12).toISOString(),
          end_date: new Date(end.getFullYear(), end.getMonth(), end.getDate(), 12).toISOString(),
        })
      );
      loadSprints(projectId!);
    } catch (err: any) {
      alert('Error al crear el sprint: ' + err.message);
    }
  };

  const handleStartSprint = async (sprintId: string) => {
    const sprint = sprints.find((s) => s.id === sprintId);
    // Validación: el sprint necesita fechas antes de iniciarse (para burndown).
    if (sprint && (!sprint.start_date || !sprint.end_date)) {
      alert('Añade fecha de inicio y fin al sprint antes de iniciarlo.');
      setEditingSprint(sprint);
      return;
    }
    // Validación: no puede haber dos sprints activos a la vez.
    if (sprints.some((s) => s.state === 'active')) {
      alert('Ya hay un sprint activo. Complétalo antes de iniciar otro.');
      return;
    }
    try {
      await import('../../planning/api/planningApi').then(m => m.planningApi.startSprint(sprintId));
      loadSprints(projectId!);
    } catch (err: any) {
      alert('Error al iniciar el sprint: ' + (err?.response?.data?.detail ?? err.message));
    }
  };

  const handleCompleteSprint = (sprintId: string) => {
    const sprint = sprints.find(s => s.id === sprintId);
    if (sprint) setCompletingSprint({ id: sprint.id, name: sprint.name });
  };

  const confirmCompleteSprint = async (moveToSprintId: string | null) => {
    if (!completingSprint) return;
    setCompletingBusy(true);
    try {
      // El backend mueve las tareas incompletas y registra el snapshot para Informes.
      await import('../../planning/api/planningApi').then(m =>
        m.planningApi.completeSprint(completingSprint.id, moveToSprintId)
      );
      await loadSprints(projectId!);
      await loadBoard(projectId!);
      setCompletingSprint(null);
    } catch (err: any) {
      alert('Error al completar el sprint: ' + (err?.response?.data?.detail ?? err.message));
    } finally {
      setCompletingBusy(false);
    }
  };

  return (
    <div className="bl-page">
      <header className="bl-header">
        <div className="bl-header-top">
          <div className="bl-header-left">
            <h1 className="bl-title">{project.name} — Backlog</h1>
            <p className="bl-subtitle">{totalTasks} tareas en total</p>
          </div>
          <div className="bl-header-tools">
            <div className="bl-search">
              <Icon name="search" size={15} />
              <input
                type="text"
                placeholder="Buscar en el backlog…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="bl-search__clear" onClick={() => setSearch('')} aria-label="Limpiar">
                  <Icon name="x" size={13} />
                </button>
              )}
            </div>
            <button
              className="k-btn-primary"
              onClick={handleCreateSprint}
              disabled={!!unfinishedSprint}
              title={unfinishedSprint ? `Completa "${unfinishedSprint.name}" antes de crear otro sprint` : 'Crear un nuevo sprint'}
            >
              <Icon name="plus" size={14} /> Crear Sprint
            </button>
          </div>
        </div>
        <ProjectTabs projectId={projectId!} />
      </header>

      <div className="bl-body">
        {sprints.filter(s => s.state !== 'completed').map(sprint => {
          const sprintTasks = allTasks.filter(t => t.sprint_id === sprint.id);
          return (
            <SprintGroup
              key={sprint.id}
              tasks={sprintTasks}
              columns={allColumns}
              members={members}
              sprint={sprint}
              onOpenDetail={setEditingTaskId}
              onStartSprint={handleStartSprint}
              onCompleteSprint={handleCompleteSprint}
              onEditSprint={setEditingSprint}
              onDropTask={handleDropTask}
              onDragStartTask={setDragTaskId}
              onDragEndTask={() => setDragTaskId(null)}
              isDragging={dragTaskId !== null}
            />
          );
        })}

        <SprintGroup
          tasks={backlogTasks}
          columns={allColumns}
          members={members}
          sprint={null}
          isBacklog
          onOpenDetail={setEditingTaskId}
          onDropTask={handleDropTask}
          onDragStartTask={setDragTaskId}
          onDragEndTask={() => setDragTaskId(null)}
          isDragging={dragTaskId !== null}
        />
      </div>

      {editingTaskId && (
        <TaskDetailModal taskId={editingTaskId} onClose={() => setEditingTaskId(null)} />
      )}

      {completingSprint && (
        <CompleteSprintModal
          sprintId={completingSprint.id}
          sprintName={completingSprint.name}
          sprints={sprints}
          doneCount={allTasksRaw.filter((t) => t.sprint_id === completingSprint.id && t.status === 'Done').length}
          incompleteCount={allTasksRaw.filter((t) => t.sprint_id === completingSprint.id && t.status !== 'Done').length}
          busy={completingBusy}
          onConfirm={confirmCompleteSprint}
          onClose={() => setCompletingSprint(null)}
        />
      )}

      {editingSprint && (
        <SprintEditModal
          sprint={editingSprint}
          onClose={() => setEditingSprint(null)}
          onSaved={() => loadSprints(projectId!)}
          onDeleted={() => { loadSprints(projectId!); loadBoard(projectId!); }}
        />
      )}
    </div>
  );
}

export default function BacklogPage() {
  return (
    <BoardProvider>
      <BacklogContent />
    </BoardProvider>
  );
}
