import { useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../../../shared/components/Icon';
import { getErrorMessage } from '../../../shared/api/api';
import { planningApi } from '../../planning/api/planningApi';
import type { Sprint } from '../../../shared/types';
import './SprintEditModal.css';

interface SprintEditModalProps {
  sprint: Sprint;
  onClose: () => void;
  onSaved: () => void;
  onDeleted?: () => void;
}

/** Convierte un ISO a valor 'YYYY-MM-DD' para <input type="date">. */
function toDateInput(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Convierte 'YYYY-MM-DD' a ISO (mediodía local para evitar corrimientos de día). */
function toIso(dateStr: string): string | null {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0).toISOString();
}

export default function SprintEditModal({ sprint, onClose, onSaved, onDeleted }: SprintEditModalProps) {
  const [name, setName] = useState(sprint.name);
  const [goal, setGoal] = useState(sprint.goal ?? '');
  const [startDate, setStartDate] = useState(toDateInput(sprint.start_date));
  const [endDate, setEndDate] = useState(toDateInput(sprint.end_date));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar "${sprint.name}"? Sus tareas volverán al Backlog.`)) return;
    setSaving(true);
    setError('');
    try {
      await planningApi.deleteSprint(sprint.id);
      onDeleted?.();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo eliminar el sprint'));
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('El nombre del sprint es obligatorio.');
      return;
    }
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      setError('La fecha de fin no puede ser anterior a la de inicio.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await planningApi.updateSprint(sprint.id, {
        name: name.trim(),
        goal: goal.trim() || null,
        start_date: toIso(startDate),
        end_date: toIso(endDate),
      } as Partial<Sprint>);
      onSaved();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo actualizar el sprint'));
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="k-modal-overlay" onClick={onClose}>
      <div className="sprint-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sprint-modal__head">
          <h2 className="sprint-modal__title">Editar sprint</h2>
          <button className="k-modal-btn" onClick={onClose} aria-label="Cerrar">
            <Icon name="x" size={18} />
          </button>
        </div>

        {error && <div className="sprint-modal__error">{error}</div>}

        <label className="sprint-modal__field">
          <span>Nombre del sprint</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Sprint 1" autoFocus />
        </label>

        <label className="sprint-modal__field">
          <span>Objetivo (opcional)</span>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="¿Qué queremos lograr en este sprint?"
            rows={3}
          />
        </label>

        <div className="sprint-modal__dates">
          <label className="sprint-modal__field">
            <span>Fecha de inicio</span>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>
          <label className="sprint-modal__field">
            <span>Fecha de fin</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </label>
        </div>

        <div className="sprint-modal__actions">
          {sprint.state !== 'active' && onDeleted && (
            <button className="sprint-modal__delete" onClick={handleDelete} disabled={saving}>
              <Icon name="trash" size={14} /> Eliminar
            </button>
          )}
          <div className="sprint-modal__actions-right">
            <button className="k-btn-text" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button className="k-btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
