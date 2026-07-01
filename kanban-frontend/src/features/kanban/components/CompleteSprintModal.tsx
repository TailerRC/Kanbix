import { useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../../../shared/components/Icon';
import type { Sprint } from '../../../shared/types';
import './CompleteSprintModal.css';

interface CompleteSprintModalProps {
  sprintId: string;
  sprintName: string;
  sprints: Sprint[];
  doneCount: number;
  incompleteCount: number;
  busy?: boolean;
  onConfirm: (moveTo: string | null) => void;
  onClose: () => void;
}

export default function CompleteSprintModal({
  sprintId,
  sprintName,
  sprints,
  doneCount,
  incompleteCount,
  busy = false,
  onConfirm,
  onClose,
}: CompleteSprintModalProps) {
  const [target, setTarget] = useState('backlog');
  const targetSprints = sprints.filter((s) => s.id !== sprintId && s.state !== 'completed');

  return createPortal(
    <div className="csm-overlay" onClick={() => !busy && onClose()}>
      <div className="csm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="csm-head">
          <span className="csm-head-icon">
            <Icon name="check-circle" size={22} />
          </span>
          <div>
            <h2 className="csm-title">Completar {sprintName}</h2>
            <p className="csm-subtitle">Cierra el sprint y registra sus métricas en Informes.</p>
          </div>
          <button className="csm-close" onClick={onClose} disabled={busy} aria-label="Cerrar">
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="csm-stats">
          <div className="csm-stat csm-stat--done">
            <span className="csm-stat-num">{doneCount}</span>
            <span className="csm-stat-label">finalizadas</span>
          </div>
          <div className="csm-stat csm-stat--open">
            <span className="csm-stat-num">{incompleteCount}</span>
            <span className="csm-stat-label">sin finalizar</span>
          </div>
        </div>

        <div className="csm-field">
          <label className="csm-label">
            {incompleteCount > 0
              ? `Mover las ${incompleteCount} tareas sin finalizar a:`
              : 'No hay tareas sin finalizar por mover.'}
          </label>
          {incompleteCount > 0 && (
            <div className="csm-select-wrap">
              <select className="csm-select" value={target} onChange={(e) => setTarget(e.target.value)}>
                <option value="backlog">↩ Backlog</option>
                {targetSprints.map((s) => (
                  <option key={s.id} value={s.id}>
                    → {s.name}
                  </option>
                ))}
              </select>
              <Icon name="chevron-down" size={16} className="csm-select-caret" />
            </div>
          )}
        </div>

        <div className="csm-actions">
          <button className="csm-btn csm-btn--ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button
            className="csm-btn csm-btn--primary"
            onClick={() => onConfirm(target === 'backlog' ? null : target)}
            disabled={busy}
          >
            {busy ? 'Completando…' : 'Completar sprint'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
