import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import type { TaskCard, Prioridad } from '../../../shared/types';
import { BoardProvider, useBoard } from '../context/BoardContext';
import TaskDetailModal from '../components/TaskDetailModal';
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

interface BacklogRowProps {
  task: TaskCard;
  columnName: string;
  columns: { id: string; name: string }[];
  onOpenDetail: (id: string) => void;
}

function BacklogRow({ task, columnName, columns, onOpenDetail }: BacklogRowProps) {
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
    updateTaskOptimistic(task.id, { column_id: colId });
  };

  return (
    <tr className="bl-row" onDoubleClick={() => onOpenDetail(task.id)}>
      <td className="bl-cell bl-cell--check">
        <input type="checkbox" className="bl-checkbox" onClick={(e) => e.stopPropagation()} />
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
            <option key={col.id} value={col.id}>{col.name}</option>
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
        {task.assignee ? (
          <span className="bl-avatar" title={task.assignee}>{getInitials(task.assignee)}</span>
        ) : (
          <span className="bl-avatar bl-avatar--empty" title="Sin asignar">
            <Icon name="user" size={12} />
          </span>
        )}
      </td>
    </tr>
  );
}

interface SprintGroupProps {
  tasks: TaskCard[];
  columns: { id: string; name: string }[];
  sprint: any | null; // null means backlog
  isBacklog?: boolean;
  onOpenDetail: (id: string) => void;
  onStartSprint?: (sprintId: string) => void;
  onCompleteSprint?: (sprintId: string) => void;
}

function SprintGroup({ tasks, columns, sprint, isBacklog = false, onOpenDetail, onStartSprint, onCompleteSprint }: SprintGroupProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const { createTaskOptimistic } = useBoard();
  const total = tasks.length;

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      setIsCreating(false);
      return;
    }
    const firstCol = columns.find(c => c.name.toLowerCase() !== 'backlog');
    if (firstCol) {
      await createTaskOptimistic(firstCol.id, newTitle.trim(), { sprint_id: sprint ? sprint.id : null });
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
    <section className="bl-sprint-group">
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
          <span className="bl-sprint-dates">
            {new Date(sprint.start_date).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })} - {new Date(sprint.end_date).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
          </span>
        )}
        {!isBacklog && (!sprint?.start_date || !sprint?.end_date) && (
          <span className="bl-sprint-dates bl-sprint-dates--empty">Añadir fechas</span>
        )}

        <span className="bl-sprint-count">({total} {total === 1 ? 'actividad' : 'actividades'})</span>

        {Object.entries(statusCounts).map(([status, count]) => {
          const sc = STATUS_COLORS[status] ?? { bg: '#F1F5F9', color: '#475569' };
          return (
            <span key={status} className="bl-sprint-stat" style={{ color: sc.color }}>
              {count} {status}
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
                  onOpenDetail={onOpenDetail}
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

  const allTasks = board.columns
    .filter((c) => c.name.toLowerCase() !== 'backlog')
    .flatMap((c) => c.tasks.map((t) => ({ ...t, status: c.name })));

  const backlogTasks = allTasks.filter(t => !t.sprint_id);
  
  const totalTasks = allTasks.length;

  const handleCreateSprint = async () => {
    const num = sprints.length + 1;
    try {
      await import('../../planning/api/planningApi').then(m => m.planningApi.createSprint(projectId!, { name: `Sprint ${num}` }));
      loadSprints(projectId!);
    } catch (err: any) {
      alert('Error al crear el sprint: ' + err.message);
    }
  };

  const handleStartSprint = async (sprintId: string) => {
    try {
      await import('../../planning/api/planningApi').then(m => m.planningApi.startSprint(sprintId));
      loadSprints(projectId!);
    } catch (err: any) {
      alert('Error al iniciar el sprint: ' + err.message);
    }
  };

  const handleCompleteSprint = (sprintId: string) => {
    const sprint = sprints.find(s => s.id === sprintId);
    if (sprint) setCompletingSprint({ id: sprint.id, name: sprint.name });
  };

  const confirmCompleteSprint = async (moveToSprintId: string | null) => {
    if (!completingSprint) return;
    try {
      const sprintTasks = allTasks.filter(t => t.sprint_id === completingSprint.id);
      const incompleteTasks = sprintTasks.filter(t => t.status !== 'Done');

      // Mover tareas incompletas
      for (const task of incompleteTasks) {
        await updateTaskOptimistic(task.id, { sprint_id: moveToSprintId });
      }

      await import('../../planning/api/planningApi').then(m => m.planningApi.completeSprint(completingSprint.id));
      await loadSprints(projectId!);
      setCompletingSprint(null);
    } catch (err: any) {
      alert('Error al completar el sprint: ' + err.message);
    }
  };

  return (
    <div className="bl-page">
      <header className="bl-header">
        <div className="bl-header-left">
          <h1 className="bl-title">{project.name} — Backlog</h1>
          <p className="bl-subtitle">{totalTasks} tareas en total</p>
        </div>
        <nav className="bl-header-tabs" aria-label="Vistas del proyecto">
          <button className="k-btn-secondary" onClick={() => setAddingTaskColId(allColumns.find(c => c.name.toLowerCase() === 'backlog')?.id!)} style={{ marginRight: 8 }}>
            <Icon name="plus" size={14} /> Nueva Tarea
          </button>
          <button className="k-btn-primary" onClick={handleCreateSprint} style={{ marginRight: 16 }}>
            <Icon name="plus" size={14} /> Crear Sprint
          </button>
          <button
            id="tab-backlog"
            className="bl-tab bl-tab--active"
            onClick={() => navigate(`/proyectos/${projectId}/backlog`)}
          >
            <Icon name="list" size={14} /> Backlog
          </button>
          <button
            id="tab-tablero"
            className="bl-tab"
            onClick={() => navigate(`/proyectos/${projectId}/tablero`)}
          >
            <Icon name="layout" size={14} /> Tablero
          </button>
        </nav>
      </header>

      <div className="bl-body">
        {sprints.filter(s => s.state !== 'completed').map(sprint => {
          const sprintTasks = allTasks.filter(t => t.sprint_id === sprint.id);
          return (
            <SprintGroup
              key={sprint.id}
              tasks={sprintTasks}
              columns={allColumns}
              sprint={sprint}
              onOpenDetail={setEditingTaskId}
              onStartSprint={handleStartSprint}
              onCompleteSprint={handleCompleteSprint}
            />
          );
        })}

        <SprintGroup
          tasks={backlogTasks}
          columns={allColumns}
          sprint={null}
          isBacklog
          onOpenDetail={setEditingTaskId}
        />
      </div>

      {editingTaskId && (
        <TaskDetailModal taskId={editingTaskId} onClose={() => setEditingTaskId(null)} />
      )}

      {completingSprint && (
        <div className="k-modal-overlay">
          <div className="k-modal-content" style={{ maxWidth: 400, padding: 24 }}>
            <h2 style={{ margin: '0 0 16px 0' }}>Completar {completingSprint.name}</h2>
            <p style={{ margin: '0 0 24px 0', color: 'var(--color-text-muted)' }}>
              ¿A dónde quieres mover las tareas incompletas?
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="k-btn-text" onClick={() => setCompletingSprint(null)}>Cancelar</button>
              <button className="k-btn-primary" onClick={() => confirmCompleteSprint(null)}>
                Mover al Backlog
              </button>
            </div>
          </div>
        </div>
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
