/**
 * TicketsAdminPage — Panel de tickets de soporte para Admin.
 *
 * Muestra todos los tickets del sistema con filtros por estado/tipo.
 * El Admin puede actualizar el estado y dejar una nota de resolución.
 */
import { useState, useEffect } from 'react';
import { getErrorMessage } from '../../../shared/api/api';
import {
  adminListTickets,
  adminUpdateTicket,
  type TicketItem,
  type EstadoTicket,
  type TipoTicket,
} from '../api/authApi';
import './TicketsAdminPage.css';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string) {
  if (!iso) return '—';
  const utcIso = iso.endsWith('Z') || iso.includes('+') ? iso : iso + 'Z';
  return new Date(utcIso).toLocaleString('es-PE', {
    timeZone: 'America/Lima',
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const ESTADO_LABEL: Record<EstadoTicket, string> = {
  ABIERTO: 'Abierto',
  EN_REVISION: 'En revisión',
  RESUELTO: 'Resuelto',
  CERRADO: 'Cerrado',
};

const TIPO_LABEL: Record<TipoTicket, string> = {
  CAMBIO_PASSWORD: 'Cambio de contraseña',
  ACCESO_BLOQUEADO: 'Cuenta bloqueada',
  SOPORTE_TECNICO: 'Soporte técnico',
  OTRO: 'Otro',
};

function EstadoBadge({ estado }: { estado: EstadoTicket }) {
  const cls = {
    ABIERTO: 'ta-badge--open',
    EN_REVISION: 'ta-badge--review',
    RESUELTO: 'ta-badge--resolved',
    CERRADO: 'ta-badge--closed',
  }[estado];
  return <span className={`ta-badge ${cls}`}>{ESTADO_LABEL[estado]}</span>;
}

// ---------------------------------------------------------------------------
// Modal para actualizar un ticket
// ---------------------------------------------------------------------------

interface UpdateModalProps {
  ticket: TicketItem;
  onClose: () => void;
  onSaved: (updated: TicketItem) => void;
}

function UpdateModal({ ticket, onClose, onSaved }: UpdateModalProps) {
  const [estado, setEstado] = useState<EstadoTicket>(ticket.estado);
  const [nota, setNota] = useState(ticket.nota_resolucion ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const ESTADOS: EstadoTicket[] = ['ABIERTO', 'EN_REVISION', 'RESUELTO', 'CERRADO'];

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const updated = await adminUpdateTicket(ticket.id, { estado, nota_resolucion: nota || undefined });
      onSaved(updated);
      onClose();
    } catch (err: any) {
      setError(getErrorMessage(err, 'Error al actualizar el ticket.'));
      setSaving(false);
    }
  };

  return (
    <div className="ta-modal-overlay" onClick={onClose}>
      <div className="ta-modal-card" onClick={e => e.stopPropagation()}>
        <div className="ta-modal-header">
          <h2 className="ta-modal-title">Actualizar Ticket</h2>
          <button className="ta-modal-close" onClick={onClose} aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="ta-modal-info">
          <div className="ta-modal-info-row">
            <span className="ta-modal-lbl">Solicitante</span>
            <div>
              <div className="ta-user-name">{ticket.usuario_nombre ?? '—'}</div>
              <div className="ta-user-email">{ticket.usuario_email ?? '—'}</div>
            </div>
          </div>
          <div className="ta-modal-info-row">
            <span className="ta-modal-lbl">Tipo</span>
            <span>{TIPO_LABEL[ticket.tipo]}</span>
          </div>
          <div className="ta-modal-info-row">
            <span className="ta-modal-lbl">Asunto</span>
            <span className="ta-modal-asunto">{ticket.asunto}</span>
          </div>
          <div className="ta-modal-info-row ta-modal-info-row--block">
            <span className="ta-modal-lbl">Descripción</span>
            <p className="ta-modal-desc">{ticket.descripcion}</p>
          </div>
        </div>

        <form className="ta-modal-form" onSubmit={handleSave}>
          <div className="ta-form-row">
            <label className="ta-form-label" htmlFor="ta-estado">Nuevo estado</label>
            <select
              id="ta-estado"
              className="ta-form-select"
              value={estado}
              onChange={e => setEstado(e.target.value as EstadoTicket)}
            >
              {ESTADOS.map(s => (
                <option key={s} value={s}>{ESTADO_LABEL[s]}</option>
              ))}
            </select>
          </div>

          <div className="ta-form-row">
            <label className="ta-form-label" htmlFor="ta-nota">Nota de resolución (opcional)</label>
            <textarea
              id="ta-nota"
              className="ta-form-textarea"
              value={nota}
              onChange={e => setNota(e.target.value)}
              placeholder="Ej: La contraseña fue restablecida. Por favor inicia sesión con la nueva contraseña enviada a tu correo."
              rows={3}
              maxLength={500}
            />
          </div>

          {error && <p className="ta-msg ta-msg--error">{error}</p>}

          <div className="ta-modal-footer">
            <button type="button" className="ta-btn ta-btn--outline" onClick={onClose}>Cancelar</button>
            <button type="submit" className="ta-btn ta-btn--primary" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page root
// ---------------------------------------------------------------------------

const TIPO_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'Todos los tipos' },
  { value: 'CAMBIO_PASSWORD', label: 'Cambio de contraseña' },
  { value: 'ACCESO_BLOQUEADO', label: 'Cuenta bloqueada' },
  { value: 'SOPORTE_TECNICO', label: 'Soporte técnico' },
  { value: 'OTRO', label: 'Otro' },
];

const ESTADO_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'ABIERTO', label: 'Abierto' },
  { value: 'EN_REVISION', label: 'En revisión' },
  { value: 'RESUELTO', label: 'Resuelto' },
  { value: 'CERRADO', label: 'Cerrado' },
];

export default function TicketsAdminPage() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [selected, setSelected] = useState<TicketItem | null>(null);

  const fetchTickets = async () => {
    setLoading(true);
    const res = await adminListTickets(1, 100);
    setTickets(res.data);
    setTotal(res.total);
    setLoading(false);
  };

  useEffect(() => { fetchTickets(); }, []);

  const visible = tickets.filter(t => {
    if (filterEstado && t.estado !== filterEstado) return false;
    if (filterTipo && t.tipo !== filterTipo) return false;
    return true;
  });

  const openCount = tickets.filter(t => t.estado === 'ABIERTO').length;

  return (
    <div className="ta-page">
      <div className="ta-header">
        <div>
          <h1 className="ta-title">Tickets de Atención</h1>
          <p className="ta-subtitle">
            {total} {total === 1 ? 'ticket registrado' : 'tickets registrados'}
            {openCount > 0 && (
              <span className="ta-open-badge">{openCount} abierto{openCount > 1 ? 's' : ''}</span>
            )}
          </p>
        </div>
        <button className="ta-refresh-btn" onClick={fetchTickets} disabled={loading} aria-label="Actualizar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="1 4 1 10 7 10" /><polyline points="23 20 23 14 17 14" />
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
          </svg>
        </button>
      </div>

      {/* Filtros */}
      <div className="ta-filters">
        <select className="ta-filter-select" value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
          {ESTADO_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <select className="ta-filter-select" value={filterTipo} onChange={e => setFilterTipo(e.target.value)}>
          {TIPO_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <span className="ta-filter-count">{visible.length} resultado{visible.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Tabla */}
      <div className="ta-table-wrap">
        {loading ? (
          <div className="ta-loading">
            <div className="ta-spinner" />
            Cargando tickets…
          </div>
        ) : (
          <table className="ta-table">
            <thead>
              <tr>
                <th>Solicitante</th>
                <th>Tipo</th>
                <th>Asunto</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map(ticket => (
                <tr key={ticket.id} className="ta-row">
                  <td>
                    <div className="ta-user-name">{ticket.usuario_nombre ?? '—'}</div>
                    <div className="ta-user-email">{ticket.usuario_email ?? '—'}</div>
                  </td>
                  <td>
                    <span className={`ta-tipo-badge ta-tipo-badge--${ticket.tipo.toLowerCase()}`}>
                      {TIPO_LABEL[ticket.tipo]}
                    </span>
                  </td>
                  <td className="ta-asunto">{ticket.asunto}</td>
                  <td><EstadoBadge estado={ticket.estado} /></td>
                  <td className="ta-date">{formatDate(ticket.fecha_creacion)}</td>
                  <td>
                    <button
                      className="ta-action-btn"
                      onClick={() => setSelected(ticket)}
                      type="button"
                    >
                      Gestionar
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && !visible.length && (
                <tr>
                  <td colSpan={6} className="ta-empty">
                    No hay tickets que coincidan con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <UpdateModal
          ticket={selected}
          onClose={() => setSelected(null)}
          onSaved={updated => {
            setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
          }}
        />
      )}
    </div>
  );
}
