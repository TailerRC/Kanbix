import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../../../shared/components/Icon';
import DatePickerPopover from './DatePickerPopover';
import { useBoard } from '../context/BoardContext';
import { useAuth } from '../../../shared/auth/AuthContext';
import type { TaskType } from '../../../shared/types';
import './TaskDetailModal.css';

interface TaskDetailModalProps {
  taskId: string;
  onClose: () => void;
}

const TASK_TYPES: { type: TaskType; label: string; icon: string; color: string }[] = [
  { type: 'Tarea',   label: 'Tarea',    icon: 'check-square', color: '#3B82F6' },
  { type: 'Recurso', label: 'Recurso',  icon: 'tag',          color: '#3B82F6' },
  { type: 'Contact', label: 'Contact',  icon: 'lightbulb',    color: '#F59E0B' },
  { type: 'Request', label: 'Request',  icon: 'plus-circle',  color: '#10B981' },
];

export default function TaskDetailModal({ taskId, onClose }: TaskDetailModalProps) {
  const { project, board, sprints, updateTaskOptimistic, deleteTaskOptimistic } = useBoard();
  const { user } = useAuth();

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  const [isAddingDep, setIsAddingDep] = useState(false);
  const [selectedDepTaskId, setSelectedDepTaskId] = useState('');

  // ─── Derive task reactively from board context on every render ────────────
  // This is the FIX for the desync bug: we don't store a copy in local state —
  // we compute it on each render from the single source of truth (board).
  let task = null;
  let currentColId = '';
  if (board) {
    for (const col of board.columns) {
      const t = col.tasks.find(x => x.id === taskId);
      if (t) { task = t; currentColId = col.id; break; }
    }
  }

  const allTasks = board?.columns.flatMap(c => c.tasks) || [];
  const otherTasks = allTasks.filter(t => t.id !== taskId && !(task?.dependencies || []).includes(t.id));

  // Local states only for text fields being actively edited (not yet saved)
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(task?.title ?? '');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState((task as any)?.description ?? '');
  const [devInfoValue, setDevInfoValue] = useState((task as any)?.dev_info ?? '');
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [savingField, setSavingField] = useState<string | null>(null);
  const typeMenuRef = useRef<HTMLDivElement>(null);

  // Sync local editable states when task first loads (but not while editing)
  const prevTaskId = useRef<string>('');
  useEffect(() => {
    if (task && prevTaskId.current !== task.id) {
      setTitleValue(task.title);
      setDescValue((task as any).description ?? '');
      setDevInfoValue((task as any).dev_info ?? '');
      prevTaskId.current = task.id;
    }
  }, [task?.id]);

  // ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Click-outside for type menu
  useEffect(() => {
    if (!showTypeMenu) return;
    const handler = (e: MouseEvent) => {
      if (typeMenuRef.current && !typeMenuRef.current.contains(e.target as Node)) {
        setShowTypeMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showTypeMenu]);

  if (!task || !board) return null;

  const currentType = TASK_TYPES.find(t => t.type === task!.task_type) ?? TASK_TYPES[0];

  const handleUpdate = async (field: string, updates: Record<string, unknown>) => {
    setSavingField(field);
    try {
      await updateTaskOptimistic(taskId, updates as any);
    } catch (err) {
      console.error(err);
      alert('Error al guardar el cambio.');
    } finally {
      setSavingField(null);
    }
  };

  const handleTitleSave = () => {
    setIsEditingTitle(false);
    if (titleValue.trim() && titleValue.trim() !== task!.title) {
      handleUpdate('title', { title: titleValue.trim() });
    } else {
      setTitleValue(task!.title);
    }
  };

  const handleDescSave = () => {
    setIsEditingDesc(false);
    const oldDesc = (task as any).description ?? '';
    if (descValue.trim() !== oldDesc) {
      handleUpdate('description', { description: descValue.trim() });
    }
  };



  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim() || !task) return;
    try {
      const { planningApi } = await import('../../planning/api/planningApi');
      const res = await planningApi.addSubtask(taskId, newSubtaskTitle.trim());
      const updatedSubtasks = [...(task.subtasks || []), {
        subtask_id: res.subtask_id,
        title: res.title,
        completed: res.completed
      }];
      await updateTaskOptimistic(taskId, { subtasks: updatedSubtasks });
      setNewSubtaskTitle('');
      setIsAddingSubtask(false);
    } catch (err) {
      alert('Error al agregar la subtarea.');
    }
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    if (!task) return;
    try {
      const { planningApi } = await import('../../planning/api/planningApi');
      const res = await planningApi.toggleSubtask(taskId, subtaskId);
      const updatedSubtasks = (task.subtasks || []).map(s =>
        s.subtask_id === subtaskId ? { ...s, completed: res.completed } : s
      );
      await updateTaskOptimistic(taskId, { subtasks: updatedSubtasks });
    } catch (err) {
      alert('Error al actualizar la subtarea.');
    }
  };

  const handleAddDependency = async () => {
    if (!selectedDepTaskId || !task) return;
    try {
      const { planningApi } = await import('../../planning/api/planningApi');
      const res = await planningApi.addDependency(taskId, selectedDepTaskId);
      await updateTaskOptimistic(taskId, { dependencies: res.dependencies });
      setSelectedDepTaskId('');
      setIsAddingDep(false);
    } catch (err) {
      alert('Error al registrar la actividad vinculada.');
    }
  };

  const currentUserMember = project?.members?.find(m => m.user_id === user?.id);
  const isManager = currentUserMember?.rol === 'Manager' || user?.rol_global === 'Admin';
  const isDeveloper = currentUserMember?.rol === 'Developer' && user?.rol_global !== 'Admin';

  const handleDeleteTask = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta tarea de forma permanente? Esta acción no se puede deshacer.')) {
      return;
    }
    try {
      await deleteTaskOptimistic(taskId);
      onClose();
    } catch (err) {
      alert('Error al eliminar la tarea.');
    }
  };

  const modalContent = (
    <div className="k-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="k-modal">

        {/* Header action buttons */}
        <div className="k-modal-header-actions">
          <button className="k-modal-close-btn" onClick={onClose} title="Cerrar (Esc)"><Icon name="x" size={16} /></button>
        </div>

        <div className="k-modal-layout">
          {/* ── LEFT COLUMN ── */}
          <div className="k-modal-left">

            {/* Breadcrumb with type selector */}
            <div className="k-modal-breadcrumb">
              <div className="k-type-selector" ref={typeMenuRef}>
                <button
                  className="k-type-btn"
                  onClick={() => setShowTypeMenu(v => !v)}
                  title="Cambiar tipo de actividad"
                  style={{ color: currentType.color }}
                >
                  <Icon name={currentType.icon} size={16} />
                </button>
                {showTypeMenu && (
                  <div className="k-type-menu">
                    <div className="k-type-menu-title">Cambiar tipo de actividad</div>
                    {TASK_TYPES.map(t => (
                      <button
                        key={t.type}
                        className={`k-type-menu-item ${t.type === task!.task_type ? 'active' : ''}`}
                        onClick={() => { handleUpdate('task_type', { task_type: t.type }); setShowTypeMenu(false); }}
                      >
                        <span style={{ color: t.color }}><Icon name={t.icon} size={14} /></span>
                        {t.label}
                        {t.type === task!.task_type && <Icon name="check" size={12} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span className="k-breadcrumb-code">{task.id.substring(task.id.length - 6).toUpperCase()}</span>
              {savingField && <Icon name="loader" size={14} className="k-spinner" />}
            </div>

            {/* Title */}
            <div className="k-modal-title-wrapper">
              {isEditingTitle ? (
                <input
                  autoFocus
                  className="k-modal-title-input"
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleTitleSave(); }}
                />
              ) : (
                <h1 className="k-modal-title" onClick={() => setIsEditingTitle(true)}>{task.title}</h1>
              )}
            </div>

            {/* Description */}
            <div className="k-modal-section">
              <h3>Descripción</h3>
              {isEditingDesc ? (
                <div className="k-modal-desc-editor">
                  <textarea
                    autoFocus
                    className="k-modal-desc-input"
                    value={descValue}
                    onChange={(e) => setDescValue(e.target.value)}
                    rows={5}
                  />
                  <div className="k-modal-desc-actions">
                    <button className="k-btn-primary" onClick={handleDescSave}>Guardar</button>
                    <button className="k-btn-text" onClick={() => { setIsEditingDesc(false); setDescValue((task as any).description ?? ''); }}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <div className={`k-modal-desc-preview ${!(task as any).description ? 'empty' : ''}`} onClick={() => setIsEditingDesc(true)}>
                  {(task as any).description || 'Añadir una descripción más detallada...'}
                </div>
              )}
            </div>

            {/* Subtasks */}
            <div className="k-modal-section">
              <h3>Subtareas</h3>
              <div className="k-subtasks-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                {(task.subtasks || []).map(sub => (
                  <div key={sub.subtask_id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={sub.completed}
                      onChange={() => handleToggleSubtask(sub.subtask_id)}
                      style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                    />
                    <span style={{
                      fontSize: '0.9rem',
                      textDecoration: sub.completed ? 'line-through' : 'none',
                      color: sub.completed ? 'var(--color-text-muted)' : 'var(--color-text-primary)'
                    }}>
                      {sub.title}
                    </span>
                  </div>
                ))}
              </div>
              
              {isAddingSubtask ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Título de la subtarea..."
                    className="k-modal-desc-input"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    style={{ fontSize: '0.85rem', padding: '6px 10px', flex: 1, border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-surface)' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddSubtask();
                      if (e.key === 'Escape') setIsAddingSubtask(false);
                    }}
                    autoFocus
                  />
                  <button className="k-btn-primary" onClick={handleAddSubtask} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                    Añadir
                  </button>
                  <button className="k-btn-text" onClick={() => setIsAddingSubtask(false)} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                    Cancelar
                  </button>
                </div>
              ) : (
                <button className="k-modal-placeholder-btn" onClick={() => setIsAddingSubtask(true)}>
                  <Icon name="plus" size={14} /> Añadir subtarea
                </button>
              )}
            </div>

            {/* Linked activities */}
            <div className="k-modal-section">
              <h3>Actividades vinculadas</h3>
              <div className="k-dependencies-list" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                {(task.dependencies || []).map(depId => {
                  const depTask = allTasks.find(t => t.id === depId);
                  return (
                    <div key={depId} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--color-text)', background: 'var(--color-bg)', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                      <Icon name="link" size={14} style={{ color: 'var(--color-text-light)' }} />
                      <span style={{ fontWeight: 500 }}>
                        {depTask ? `${depTask.title} (${depTask.id.substring(depTask.id.length - 6).toUpperCase()})` : `Tarea ID: ${depId}`}
                      </span>
                    </div>
                  );
                })}
              </div>

              {isAddingDep ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select
                    className="k-modal-select-inline"
                    value={selectedDepTaskId}
                    onChange={(e) => setSelectedDepTaskId(e.target.value)}
                    style={{ fontSize: '0.85rem', flex: 1 }}
                  >
                    <option value="">Seleccionar tarea...</option>
                    {otherTasks.map(t => (
                      <option key={t.id} value={t.id}>{t.title} ({t.id.substring(t.id.length - 6).toUpperCase()})</option>
                    ))}
                  </select>
                  <button className="k-btn-primary" onClick={handleAddDependency} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                    Añadir
                  </button>
                  <button className="k-btn-text" onClick={() => setIsAddingDep(false)} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                    Cancelar
                  </button>
                </div>
              ) : (
                <button className="k-modal-placeholder-btn" onClick={() => setIsAddingDep(true)}>
                  <Icon name="plus" size={14} /> Añadir actividad vinculada
                </button>
              )}
            </div>
          </div>

          {/* ── INFO DE DESARROLLO (dev_info) ── */}
          <div className="k-modal-section">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icon name="code" size={14} style={{ color: 'var(--color-primary)' }} />
              Información de Desarrollo
            </h3>
            <textarea
              className="k-modal-dev-info"
              placeholder="Describe los cambios realizados, URLs de PR/branch, notas técnicas..."
              value={devInfoValue}
              onChange={(e) => setDevInfoValue(e.target.value)}
              onBlur={() => {
                const trimmed = devInfoValue.trim();
                const current = (task as any).dev_info ?? '';
                if (trimmed !== current) {
                  handleUpdate('dev_info', { dev_info: trimmed || null });
                }
              }}
              rows={4}
              style={{
                width: '100%',
                resize: 'vertical',
                fontSize: '0.85rem',
                padding: '10px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                background: 'var(--color-bg)',
                color: 'var(--color-text-primary)',
                lineHeight: 1.5,
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)'; }}
            />
            {isDeveloper && (
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
                Los cambios se guardan automáticamente al salir del campo.
              </p>
            )}
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="k-modal-right">

            {/* PARTE 2A — PROBLEMA A:
                El dropdown de estado solo muestra columnas del kanban (sin Backlog).
                "Backlog" no es un estado de tarea — es la vista donde viven tareas sin sprint.
                Se filtra por nombre para excluirlo explícitamente.
                Al cambiar: PATCH al backend + mueve la card a la columna destino
                (updateTaskOptimistic maneja ambas cosas en un solo paso). */}
            <div className="k-modal-field">
              <select
                className="k-modal-select k-modal-status"
                value={currentColId}
                onChange={(e) => handleUpdate('status', { column_id: e.target.value })}
              >
                {board.columns
                  .filter(c => c.name.toLowerCase() !== 'backlog')
                  .map(col => (
                    <option key={col.id} value={col.id}>{col.name}</option>
                  ))}
              </select>
            </div>

            {/* ── Details section ── */}
            <div className="k-modal-details">
              <div className="k-modal-details-header" onClick={() => setDetailsOpen(v => !v)}>
                <h3>Detalles</h3>
                <Icon name={detailsOpen ? 'chevron-up' : 'chevron-down'} size={16} />
              </div>

              {detailsOpen && (
                <>
                  {/* Responsable */}
                  <div className="k-modal-detail-row">
                    <span className="k-modal-detail-label">Responsable</span>
                    <div className="k-modal-detail-value" style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                      <select
                        className="k-modal-select-inline"
                        value={task.assignee_id || ''}
                        onChange={(e) => {
                          const val = e.target.value || null;
                          const member = project?.members?.find(m => m.user_id === val);
                          handleUpdate('assignee_id', {
                            assignee_id: val,
                            assignee: member ? member.nombre_completo : null
                          });
                        }}
                        style={{ width: '100%' }}
                      >
                        <option value="">Sin asignar</option>
                        {project?.members?.map(m => (
                          <option key={m.user_id} value={m.user_id}>{m.nombre_completo}</option>
                        ))}
                      </select>
                      {user && task.assignee_id !== user.id && project?.members?.some(m => m.user_id === user.id) && (
                        <div style={{ marginTop: '2px' }}>
                          <span
                            className="k-link"
                            onClick={() => handleUpdate('assignee_id', {
                              assignee_id: user.id,
                              assignee: user.nombre_completo
                            })}
                            style={{ fontSize: '0.8rem', cursor: 'pointer', color: 'var(--color-primary)', textDecoration: 'underline' }}
                          >
                            Asignarme a mí
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sprint */}
                  <div className="k-modal-detail-row">
                    <span className="k-modal-detail-label">Sprint</span>
                    <div className="k-modal-detail-value">
                      <select
                        className="k-modal-select-inline"
                        value={task.sprint_id || ''}
                        onChange={(e) => handleUpdate('sprint_id', { sprint_id: e.target.value || null })}
                      >
                        <option value="">Sin sprint (Backlog)</option>
                        {sprints.map(s => (
                          <option key={s.id} value={s.id}>{s.name} {s.state === 'active' ? '(Activo)' : ''}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Prioridad */}
                  <div className="k-modal-detail-row">
                    <span className="k-modal-detail-label">Prioridad</span>
                    <div className="k-modal-detail-value">
                      <select
                        className="k-modal-select-inline"
                        value={task.priority || 'Media'}
                        onChange={(e) => handleUpdate('priority', { priority: e.target.value })}
                      >
                        <option value="Baja">Baja</option>
                        <option value="Media">Media</option>
                        <option value="Alta">Alta</option>
                        <option value="Crítica">Crítica</option>
                      </select>
                    </div>
                  </div>

                  {/* Vencimiento — FIX: reads directly from task (live from board context) */}
                  <div className="k-modal-detail-row">
                    <span className="k-modal-detail-label">Vencimiento</span>
                    <div className="k-modal-detail-value">
                      <DatePickerPopover
                        value={task.due_date ? new Date(task.due_date) : null}
                        onChange={(date) => handleUpdate('due_date', { due_date: date ? date.toISOString() : null })}
                        trigger={
                          <div className="k-date-trigger">
                            <Icon name="calendar" size={14} />
                            {task.due_date
                              ? new Date(task.due_date).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })
                              : 'Ninguna'}
                          </div>
                        }
                      />
                    </div>
                  </div>

                  {/* Fecha de inicio */}
                  <div className="k-modal-detail-row">
                    <span className="k-modal-detail-label">Fecha de inicio</span>
                    <div className="k-modal-detail-value">
                      <DatePickerPopover
                        value={task.start_date ? new Date(task.start_date) : null}
                        onChange={(date) => handleUpdate('start_date', { start_date: date ? date.toISOString() : null })}
                        trigger={
                          <div className="k-date-trigger">
                            <Icon name="calendar" size={14} />
                            {task.start_date
                              ? new Date(task.start_date).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })
                              : 'Ninguna'}
                          </div>
                        }
                      />
                    </div>
                  </div>

                  {/* Informador (read-only) */}
                  <div className="k-modal-detail-row">
                    <span className="k-modal-detail-label">Informador</span>
                    <div className="k-modal-detail-value">
                      {task.creator_name ? (
                        <span className="k-user-tag"><Icon name="user" size={14} /> {task.creator_name}</span>
                      ) : (
                        <span className="k-empty-val">—</span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Delete button for Managers/Admins */}
            {isManager && (
              <button
                className="k-delete-task-btn"
                onClick={handleDeleteTask}
                style={{
                  marginTop: '24px',
                  width: '100%',
                  padding: '10px 16px',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-danger, #ef4444)',
                  color: 'var(--color-danger, #ef4444)',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease-in-out'
                }}
              >
                <Icon name="trash-2" size={14} />
                Eliminar tarea
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
