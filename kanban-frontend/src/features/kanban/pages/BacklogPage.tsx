import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import type { TaskCard, Prioridad, Sprint } from '../../../shared/types';
import { BoardProvider, useBoard } from '../context/BoardContext';
import TaskDetailModal from '../components/TaskDetailModal';
import { planningApi } from '../../planning/api/planningApi';
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
  sprint: Sprint | null; // null means backlog
  isBacklog?: boolean;
  onOpenDetail: (id: string) => void;
  onStartSprint?: (sprintId: string) => void;
  onCompleteSprint?: (sprintId: string) => void;
  onUpdateSprintDates?: (sprintId: string, startDate: string, endDate: string) => void;
  forceCreateOpen?: boolean;
  onCloseCreate?: () => void;
}

function SprintGroup({ 
  tasks, 
  columns, 
  sprint, 
  isBacklog = false, 
  onOpenDetail, 
  onStartSprint, 
  onCompleteSprint,
  onUpdateSprintDates,
  forceCreateOpen = false,
  onCloseCreate
}: SprintGroupProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');

  const { createTaskOptimistic } = useBoard();
  const inputRef = useRef<HTMLInputElement>(null);

  const total = tasks.length;

  useEffect(() => {
    if (forceCreateOpen) {
      setIsCreating(true);
      setCollapsed(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [forceCreateOpen]);

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      setIsCreating(false);
      if (onCloseCreate) onCloseCreate();
      return;
    }
    
    // El frontend pide usar el primer id del kanban (To Do por lo general)
    const firstCol = columns.find(c => c.name.toLowerCase() !== 'backlog') || columns[0];
    if (firstCol) {
      await createTaskOptimistic(
        firstCol.id, 
        newTitle.trim(), 
        'Media', 
        undefined, 
        undefined, 
        { sprint_id: sprint ? sprint.id : null }
      );
    }
    setNewTitle('');
    // Mantiene abierto para crear en cadena, al menos que no haya texto
  };

  const handleSaveDates = () => {
    if (tempStartDate && tempEndDate && onUpdateSprintDates && sprint) {
      onUpdateSprintDates(sprint.id, tempStartDate, tempEndDate);
    }
    setShowDatePicker(false);
  };

  const statusCounts: Record<string, number> = { 'To Do': 0, 'In Progress': 0, 'Done': 0 };
  tasks.forEach((t) => {
    const label = t.status || 'To Do';
    if (label === 'In Review') {
       statusCounts['In Progress'] = (statusCounts['In Progress'] || 0) + 1;
    } else {
       statusCounts[label] = (statusCounts[label] || 0) + 1;
    }
  });

  const hasDates = sprint?.start_date && sprint?.end_date;

  return (
    <section className={`bl-sprint-group ${sprint?.state === 'active' ? 'bl-sprint-group--active' : ''}`}>
      <div className="bl-sprint-header" onClick={(e) => {
        // Evita colapsar si se hace click en botones o inputs
        if ((e.target as HTMLElement).closest('button, input, .bl-date-picker-popover, select')) return;
        setCollapsed(v => !v);
      }}>
        <button
          className="bl-sprint-collapse"
          onClick={(e) => { e.stopPropagation(); setCollapsed((v) => !v); }}
          aria-label={collapsed ? 'Expandir' : 'Colapsar'}
        >
          <Icon name={collapsed ? 'chevron-right' : 'chevron-down'} size={15} />
        </button>

        <span className="bl-sprint-icon">
          <Icon name={isBacklog ? 'inbox' : 'layout'} size={14} />
        </span>
        <span className="bl-sprint-name">{isBacklog ? 'Backlog' : sprint?.name} {sprint?.state === 'active' ? '(Activo)' : ''}</span>
        
        {!isBacklog && (
          <div className="bl-date-picker-container" onClick={e => e.stopPropagation()}>
            {hasDates ? (
              <span className="bl-sprint-dates" onClick={() => setShowDatePicker(v => !v)}>
                {new Date(sprint.start_date!).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })} – {new Date(sprint.end_date!).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
              </span>
            ) : (
              <span className="bl-sprint-dates bl-sprint-dates--empty" onClick={() => setShowDatePicker(v => !v)}>Añadir fechas</span>
            )}
            
            {showDatePicker && (
              <div className="bl-date-picker-popover">
                <div className="bl-date-picker-inputs">
                  <input type="date" value={tempStartDate} onChange={e => setTempStartDate(e.target.value)} />
                  <span>-</span>
                  <input type="date" value={tempEndDate} onChange={e => setTempEndDate(e.target.value)} />
                </div>
                <div className="bl-date-picker-actions">
                  <button onClick={handleSaveDates} className="k-btn-primary k-btn-sm" disabled={!tempStartDate || !tempEndDate}>Guardar</button>
                  <button onClick={() => setShowDatePicker(false)} className="k-btn-text k-btn-sm">Cancelar</button>
                </div>
              </div>
            )}
          </div>
        )}

        <span className="bl-sprint-count">({total} {total === 1 ? 'actividad' : 'actividades'})</span>

        <div className="bl-sprint-stats-badges">
          <span className="bl-stat-badge bl-stat-badge--todo" title="To Do">{statusCounts['To Do'] || 0}</span>
          <span className="bl-stat-badge bl-stat-badge--progress" title="In Progress">{statusCounts['In Progress'] || 0}</span>
          <span className="bl-stat-badge bl-stat-badge--done" title="Done">{statusCounts['Done'] || 0}</span>
        </div>

        {!isBacklog && sprint?.state === 'pending' && (
          <div className="bl-sprint-actions">
            <button 
              className="bl-sprint-btn bl-sprint-btn--start" 
              onClick={(e) => { e.stopPropagation(); onStartSprint?.(sprint.id); }} 
              disabled={!hasDates} 
              title={!hasDates ? 'Añade fechas para iniciar' : ''}
            >
              Iniciar sprint
            </button>
          </div>
        )}
        {!isBacklog && sprint?.state === 'active' && (
          <div className="bl-sprint-actions">
            <button 
              className="bl-sprint-btn bl-sprint-btn--complete" 
              onClick={(e) => { e.stopPropagation(); onCompleteSprint?.(sprint.id); }}
            >
              Completar sprint
            </button>
          </div>
        )}
        
        {!isBacklog && (
           <button className="bl-sprint-more" onClick={e => e.stopPropagation()} title="Opciones">
             <Icon name="more-horizontal" size={16} />
           </button>
        )}
      </div>

      {!collapsed && (
        <div className="bl-table-container">
          <table className="bl-table">
            <colgroup>
              <col style={{ width: 48 }} />
              <col style={{ width: 100 }} />
              <col />
              <col style={{ width: 140 }} />
              <col style={{ width: 120 }} />
              <col style={{ width: 100 }} />
              <col style={{ width: 48 }} />
            </colgroup>
            {tasks.length > 0 && (
              <thead>
                <tr className="bl-thead-row">
                  <th className="bl-th" />
                  <th className="bl-th">ID</th>
                  <th className="bl-th">Título</th>
                  <th className="bl-th">Estado</th>
                  <th className="bl-th">Vencimiento</th>
                  <th className="bl-th">Prioridad</th>
                  <th className="bl-th" style={{ textAlign: 'center' }}>
                    <Icon name="user" size={13} />
                  </th>
                </tr>
              </thead>
            )}
            <tbody>
              {tasks.length === 0 && !isCreating ? (
                <tr>
                  <td colSpan={7} className="bl-empty-row">
                    <div className="bl-sprint-empty">
                      <p>{isBacklog ? 'El Backlog está vacío' : 'Planifica un sprint arrastrando actividades hasta él o arrastrando el pie de página del sprint.'}</p>
                    </div>
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
                      <input type="checkbox" disabled className="bl-checkbox" />
                      <Icon name="chevron-down" size={14} color="var(--color-text-muted)" />
                      <input
                        ref={inputRef}
                        className="bl-inline-create-input"
                        placeholder="¿Qué hay que hacer?"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCreate();
                          if (e.key === 'Escape') {
                            setIsCreating(false);
                            if (onCloseCreate) onCloseCreate();
                          }
                        }}
                      />
                      <Icon name="calendar" size={14} color="var(--color-text-muted)" />
                      <Icon name="user" size={14} color="var(--color-text-muted)" />
                      <button 
                        className="bl-inline-save-btn" 
                        onClick={handleCreate}
                        disabled={!newTitle.trim()}
                      >
                        Crear ↵
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={7} className="bl-create-trigger-cell">
                    <button className="bl-inline-create-btn" onClick={() => setIsCreating(true)}>
                      <Icon name="plus" size={12} /> Crear tarea
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function BacklogContent() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { project, board, sprints, loading, error, loadBoard, loadSprints, updateTaskOptimistic } = useBoard();
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [completingSprint, setCompletingSprint] = useState<{ id: string, name: string } | null>(null);
  const [moveToSprintId, setMoveToSprintId] = useState<string>('backlog');
  
  // Para el botón "+ Nueva Tarea" del header
  const [forceCreateInBacklog, setForceCreateInBacklog] = useState(false);

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

  // Las columnas que son estados válidos para tareas.
  // Se excluye 'backlog' si existe como columna, pero en Kanbix suele usarse status real
  const allColumns = board.columns
    .filter((c) => c.name.toLowerCase() !== 'backlog')
    .map((c) => ({ id: c.id, name: c.name }));

  // Todas las tareas del proyecto distribuidas en el board, sin importar la columna.
  // OJO: board.columns ya tiene las tareas distribuidas. 
  // No filtramos la columna backlog al extraer tareas para no perder las que accidentalmente cayeron ahí.
  const allTasks = board.columns
    .flatMap((c) => c.tasks.map((t) => ({ ...t, status: c.name })));

  const backlogTasks = allTasks.filter(t => !t.sprint_id);
  const totalTasks = allTasks.length;

  const handleCreateSprint = async () => {
    const num = sprints.length + 1;
    try {
      await planningApi.createSprint(projectId!, { name: `Sprint ${num}` });
      loadSprints(projectId!);
    } catch (err: any) {
      alert('Error al crear el sprint: ' + err.message);
    }
  };

  const handleUpdateSprintDates = async (sprintId: string, startDate: string, endDate: string) => {
    try {
      await planningApi.updateSprint(sprintId, { start_date: startDate, end_date: endDate });
      loadSprints(projectId!);
    } catch (err: any) {
      alert('Error al guardar fechas: ' + err.message);
    }
  }

  const handleStartSprint = async (sprintId: string) => {
    // Verificar que no haya otro sprint activo
    const activeExists = sprints.some(s => s.state === 'active');
    if (activeExists) {
      alert('Ya existe un sprint activo. Complétalo antes de iniciar uno nuevo.');
      return;
    }
    try {
      await planningApi.startSprint(sprintId);
      loadSprints(projectId!);
    } catch (err: any) {
      alert('Error al iniciar el sprint: ' + err.message);
    }
  };

  const handleCompleteSprint = (sprintId: string) => {
    const sprint = sprints.find(s => s.id === sprintId);
    if (sprint) setCompletingSprint({ id: sprint.id, name: sprint.name });
  };

  const confirmCompleteSprint = async () => {
    if (!completingSprint) return;
    try {
      const sprintTasks = allTasks.filter(t => t.sprint_id === completingSprint.id);
      const incompleteTasks = sprintTasks.filter(t => t.status !== 'Done');

      const targetSprintId = moveToSprintId === 'backlog' ? null : moveToSprintId;

      for (const task of incompleteTasks) {
        await updateTaskOptimistic(task.id, { sprint_id: targetSprintId });
      }

      await planningApi.completeSprint(completingSprint.id);
      await loadSprints(projectId!);
      setCompletingSprint(null);
    } catch (err: any) {
      alert('Error al completar el sprint: ' + err.message);
    }
  };

  const activeSprintsFirst = [...sprints]
    .filter(s => s.state !== 'completed')
    .sort((a, b) => {
      if (a.state === 'active' && b.state !== 'active') return -1;
      if (b.state === 'active' && a.state !== 'active') return 1;
      return 0;
    });

  return (
    <div className="bl-page">
      <header className="bl-header">
        <div className="bl-header-left">
          <h1 className="bl-title">{project.name} — Backlog</h1>
          <p className="bl-subtitle">{totalTasks} tareas en total</p>
        </div>
        <div className="bl-header-actions">
          <button className="k-btn-secondary" onClick={() => setForceCreateInBacklog(true)}>
            <Icon name="plus" size={14} /> Nueva Tarea
          </button>
          <button className="bl-btn-dark" onClick={handleCreateSprint}>
            Crear Sprint
          </button>
          <nav className="bl-header-tabs" aria-label="Vistas del proyecto">
            <button
              id="tab-backlog"
              className="bl-tab bl-tab--active"
              onClick={() => navigate(`/proyectos/${projectId}/backlog`)}
            >
              Backlog
            </button>
            <button
              id="tab-tablero"
              className="bl-tab"
              onClick={() => navigate(`/proyectos/${projectId}/tablero`)}
            >
              Tablero
            </button>
          </nav>
        </div>
      </header>

      <div className="bl-body">
        {/* Sprints Activos y Pendientes */}
        {activeSprintsFirst.map(sprint => {
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
              onUpdateSprintDates={handleUpdateSprintDates}
            />
          );
        })}

        {/* Backlog siempre al fondo */}
        <SprintGroup
          tasks={backlogTasks}
          columns={allColumns}
          sprint={null}
          isBacklog
          onOpenDetail={setEditingTaskId}
          forceCreateOpen={forceCreateInBacklog}
          onCloseCreate={() => setForceCreateInBacklog(false)}
        />
      </div>

      {editingTaskId && (
        <TaskDetailModal taskId={editingTaskId} onClose={() => setEditingTaskId(null)} />
      )}

      {/* Modal Completar Sprint */}
      {completingSprint && (
        <div className="k-modal-overlay">
          <div className="k-modal-content" style={{ maxWidth: 450, padding: 24, borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: 'var(--fs-title)' }}>Completar {completingSprint.name}</h2>
            
            <p style={{ margin: '0 0 16px 0', color: 'var(--color-text-muted)' }}>
              Hay tareas incompletas en este sprint. Selecciona a dónde deseas moverlas.
            </p>
            
            <select 
              value={moveToSprintId} 
              onChange={(e) => setMoveToSprintId(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', marginBottom: 24, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
            >
              <option value="backlog">Backlog</option>
              {sprints.filter(s => s.state === 'pending').map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="k-btn-text" onClick={() => setCompletingSprint(null)}>Cancelar</button>
              <button className="k-btn-primary" onClick={confirmCompleteSprint}>
                Completar sprint
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
