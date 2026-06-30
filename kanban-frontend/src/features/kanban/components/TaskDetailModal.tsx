import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../../../shared/components/Icon';
import DatePickerPopover from './DatePickerPopover';
import { useBoard } from '../context/BoardContext';
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
  const { board, sprints, updateTaskOptimistic } = useBoard();

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

  // Local states only for text fields being actively edited (not yet saved)
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(task?.title ?? '');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState((task as any)?.description ?? '');
  const [isEditingPoints, setIsEditingPoints] = useState(false);
  const [pointsValue, setPointsValue] = useState<string>(String(task?.story_points ?? ''));
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [devOpen, setDevOpen] = useState(false);
  const [savingField, setSavingField] = useState<string | null>(null);
  const typeMenuRef = useRef<HTMLDivElement>(null);

  // Sync local editable states when task first loads (but not while editing)
  const prevTaskId = useRef<string>('');
  useEffect(() => {
    if (task && prevTaskId.current !== task.id) {
      setTitleValue(task.title);
      setDescValue((task as any).description ?? '');
      setPointsValue(String(task.story_points ?? ''));
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

  const handlePointsSave = () => {
    setIsEditingPoints(false);
    const num = parseInt(pointsValue, 10);
    const oldVal = task!.story_points ?? null;
    const newVal = isNaN(num) ? null : num;
    if (newVal !== oldVal) {
      handleUpdate('story_points', { story_points: newVal });
    }
  };

  const modalContent = (
    <div className="k-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="k-modal">

        {/* Header action buttons */}
        <div className="k-modal-header-actions">
          <button className="k-modal-btn" title="Compartir"><Icon name="share-2" size={16} /></button>
          <button className="k-modal-btn" title="Opciones"><Icon name="more-horizontal" size={16} /></button>
          <button className="k-modal-btn k-modal-close" onClick={onClose} title="Cerrar (Esc)"><Icon name="x" size={18} /></button>
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
              <button className="k-modal-placeholder-btn"><Icon name="plus" size={14} /> Añadir subtarea</button>
            </div>

            {/* Linked activities */}
            <div className="k-modal-section">
              <h3>Actividades vinculadas</h3>
              <button className="k-modal-placeholder-btn"><Icon name="plus" size={14} /> Añadir actividad vinculada</button>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="k-modal-right">

            {/* Status select */}
            <div className="k-modal-field">
              <select
                className="k-modal-select k-modal-status"
                value={currentColId}
                onChange={(e) => handleUpdate('status', { column_id: e.target.value })}
              >
                {board.columns.filter(c => c.name.toLowerCase() !== 'backlog').map(col => (
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
                    <div className="k-modal-detail-value">
                      {task.assignee ? (
                        <span className="k-user-tag"><Icon name="user" size={14} /> {task.assignee}</span>
                      ) : (
                        <span className="k-empty-val">
                          Sin asignar{' '}
                          <span className="k-link" onClick={() => handleUpdate('assignee', { assignee: 'Yo' })}>Asignarme a mí</span>
                        </span>
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

                  {/* Etiquetas */}
                  <div className="k-modal-detail-row">
                    <span className="k-modal-detail-label">Etiquetas</span>
                    <div className="k-modal-detail-value">
                      {task.tags && task.tags.length > 0 ? (
                        task.tags.map(t => <span key={t} className="k-tag-pill">{t}</span>)
                      ) : (
                        <span className="k-empty-val">Ninguna</span>
                      )}
                    </div>
                  </div>

                  {/* Team */}
                  <div className="k-modal-detail-row">
                    <span className="k-modal-detail-label">Team</span>
                    <div className="k-modal-detail-value">
                      <span className="k-empty-val">Ninguno</span>
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

                  {/* Sprint */}
                  <div className="k-modal-detail-row">
                    <span className="k-modal-detail-label">Sprint</span>
                    <div className="k-modal-detail-value">
                      <span className="k-empty-val">Sin sprint</span>
                    </div>
                  </div>

                  {/* Story points */}
                  <div className="k-modal-detail-row">
                    <span className="k-modal-detail-label">Story points</span>
                    <div className="k-modal-detail-value">
                      {isEditingPoints ? (
                        <input
                          autoFocus
                          type="number"
                          min={0}
                          className="k-modal-inline-input"
                          value={pointsValue}
                          onChange={(e) => setPointsValue(e.target.value)}
                          onBlur={handlePointsSave}
                          onKeyDown={(e) => { if (e.key === 'Enter') handlePointsSave(); if (e.key === 'Escape') { setIsEditingPoints(false); setPointsValue(String(task!.story_points ?? '')); } }}
                        />
                      ) : (
                        <span
                          className={task.story_points == null ? 'k-empty-val k-editable' : 'k-editable'}
                          onClick={() => setIsEditingPoints(true)}
                        >
                          {task.story_points ?? 'Ninguno'}
                        </span>
                      )}
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

            {/* ── Desarrollo section ── */}
            <div className="k-modal-details" style={{ marginTop: 16 }}>
              <div className="k-modal-details-header" onClick={() => setDevOpen(v => !v)}>
                <h3>Desarrollo</h3>
                <Icon name={devOpen ? 'chevron-up' : 'chevron-down'} size={16} />
              </div>
              {devOpen && (
                <p className="k-modal-placeholder-text">Sin actividad de desarrollo vinculada.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
