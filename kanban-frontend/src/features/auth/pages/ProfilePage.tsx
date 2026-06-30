/**
 * ProfilePage — Perfil del usuario autenticado.
 *
 * Secciones:
 * 1. Mis Datos       — editar nombre completo y correo
 * 2. Seguridad       — solicitar cambio de contraseña vía ticket
 * 3. Mis Tickets     — historial de tickets propios con estado
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/auth/AuthContext';
import {
  updateProfile,
  createTicket,
  listMyTickets,
  type TicketItem,
  type TipoTicket,
  type EstadoTicket,
} from '../api/authApi';
import './ProfilePage.css';

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
    ABIERTO: 'ticket-badge--open',
    EN_REVISION: 'ticket-badge--review',
    RESUELTO: 'ticket-badge--resolved',
    CERRADO: 'ticket-badge--closed',
  }[estado];
  return <span className={`ticket-badge ${cls}`}>{ESTADO_LABEL[estado]}</span>;
}

// ---------------------------------------------------------------------------
// Sección: Mis Datos
// ---------------------------------------------------------------------------

function ProfileDataSection({ onUpdate }: { onUpdate: () => void }) {
  const { user } = useAuth();
  const [nombre, setNombre] = useState(user?.nombre_completo ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const payload: Record<string, string> = {};
    if (nombre.trim() !== user?.nombre_completo) payload.nombre_completo = nombre.trim();
    if (email.trim().toLowerCase() !== user?.email) payload.email = email.trim().toLowerCase();
    if (!Object.keys(payload).length) { setError('No hay cambios para guardar.'); return; }
    setSaving(true);
    try {
      await updateProfile(payload);
      setSuccess('Perfil actualizado exitosamente.');
      onUpdate();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Error al actualizar el perfil.');
    } finally { setSaving(false); }
  };

  return (
    <section className="profile-section">
      <div className="profile-section__header">
        <div className="profile-avatar">
          <span className="profile-avatar__initials">
            {(user?.nombre_completo ?? 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
          </span>
        </div>
        <div>
          <h2 className="profile-section__title">Mis Datos</h2>
          <p className="profile-section__sub">Actualiza tu nombre completo y correo electrónico</p>
        </div>
      </div>

      <form className="profile-form" onSubmit={handleSave}>
        <div className="profile-form__row">
          <label className="profile-form__label" htmlFor="profile-nombre">Nombre completo</label>
          <input
            id="profile-nombre"
            className="profile-form__input"
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            minLength={1}
            required
          />
        </div>

        <div className="profile-form__row">
          <label className="profile-form__label" htmlFor="profile-email">Correo electrónico</label>
          <input
            id="profile-email"
            className="profile-form__input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="profile-form__row">
          <label className="profile-form__label">Rol global</label>
          <div className={`profile-form__role-badge role-badge--${(user?.rol_global ?? '').toLowerCase()}`}>
            {user?.rol_global}
          </div>
        </div>

        {error && <p className="profile-msg profile-msg--error">{error}</p>}
        {success && <p className="profile-msg profile-msg--success">{success}</p>}

        <div className="profile-form__actions">
          <button type="submit" className="profile-btn profile-btn--primary" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Sección: Seguridad + Formulario de ticket
// ---------------------------------------------------------------------------

const TIPO_OPTIONS: { value: TipoTicket; label: string }[] = [
  { value: 'CAMBIO_PASSWORD', label: 'Cambio de contraseña' },
  { value: 'ACCESO_BLOQUEADO', label: 'Cuenta bloqueada' },
  { value: 'SOPORTE_TECNICO', label: 'Soporte técnico' },
  { value: 'OTRO', label: 'Otro' },
];

function TicketFormSection({ defaultTipo, onCreated }: { defaultTipo?: TipoTicket; onCreated: () => void }) {
  const [tipo, setTipo] = useState<TipoTicket>(defaultTipo ?? 'SOPORTE_TECNICO');
  const [asunto, setAsunto] = useState(defaultTipo === 'CAMBIO_PASSWORD' ? 'Solicitud de cambio de contraseña' : '');
  const [descripcion, setDescripcion] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setSending(true);
    try {
      await createTicket({ tipo, asunto: asunto.trim(), descripcion: descripcion.trim() });
      setSuccess('Ticket enviado al equipo de TI. Te notificaremos por correo cuando sea atendido.');
      setAsunto(''); setDescripcion('');
      onCreated();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Error al enviar el ticket.');
    } finally { setSending(false); }
  };

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <div className="profile-form__row">
        <label className="profile-form__label" htmlFor="ticket-tipo">Tipo de solicitud</label>
        <select
          id="ticket-tipo"
          className="profile-form__input"
          value={tipo}
          onChange={e => setTipo(e.target.value as TipoTicket)}
        >
          {TIPO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="profile-form__row">
        <label className="profile-form__label" htmlFor="ticket-asunto">Asunto</label>
        <input
          id="ticket-asunto"
          className="profile-form__input"
          type="text"
          value={asunto}
          onChange={e => setAsunto(e.target.value)}
          placeholder="Ej: No puedo iniciar sesión"
          minLength={3}
          maxLength={120}
          required
        />
      </div>

      <div className="profile-form__row">
        <label className="profile-form__label" htmlFor="ticket-desc">Descripción</label>
        <textarea
          id="ticket-desc"
          className="profile-form__textarea"
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          placeholder="Describe tu problema o solicitud con el mayor detalle posible…"
          minLength={5}
          maxLength={1000}
          rows={4}
          required
        />
      </div>

      {error && <p className="profile-msg profile-msg--error">{error}</p>}
      {success && <p className="profile-msg profile-msg--success">{success}</p>}

      <div className="profile-form__actions">
        <button type="submit" className="profile-btn profile-btn--primary" disabled={sending}>
          {sending ? 'Enviando…' : 'Enviar ticket'}
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Sección: Mis Tickets (historial)
// ---------------------------------------------------------------------------

function MyTicketsSection({ refreshKey }: { refreshKey: number }) {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    listMyTickets().then(r => { setTickets(r.data); setLoading(false); });
  }, [refreshKey]);

  if (loading) return <div className="profile-loading">Cargando tickets…</div>;
  if (!tickets.length) return (
    <div className="profile-empty">
      <p>No tienes tickets registrados aún.</p>
    </div>
  );

  return (
    <div className="ticket-list">
      {tickets.map(t => (
        <div key={t.id} className={`ticket-card ${expanded === t.id ? 'ticket-card--expanded' : ''}`}>
          <div className="ticket-card__header" onClick={() => setExpanded(expanded === t.id ? null : t.id)}>
            <div className="ticket-card__left">
              <span className={`ticket-tipo ticket-tipo--${t.tipo.toLowerCase()}`}>{TIPO_LABEL[t.tipo]}</span>
              <span className="ticket-card__asunto">{t.asunto}</span>
            </div>
            <div className="ticket-card__right">
              <EstadoBadge estado={t.estado} />
              <span className="ticket-card__date">{formatDate(t.fecha_creacion)}</span>
              <svg className={`ticket-card__chevron ${expanded === t.id ? 'ticket-card__chevron--open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
          {expanded === t.id && (
            <div className="ticket-card__body">
              <p className="ticket-card__desc">{t.descripcion}</p>
              {t.nota_resolucion && (
                <div className="ticket-card__nota">
                  <span className="ticket-card__nota-label">Nota del equipo TI:</span>
                  <p>{t.nota_resolucion}</p>
                </div>
              )}
              <p className="ticket-card__updated">Última actualización: {formatDate(t.fecha_actualizacion)}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page root
// ---------------------------------------------------------------------------

export default function ProfilePage() {
  const [ticketRefresh, setTicketRefresh] = useState(0);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [defaultTipo, setDefaultTipo] = useState<TipoTicket | undefined>();
  const { refreshUser } = useAuth();

  const openTicketForm = (tipo?: TipoTicket) => {
    setDefaultTipo(tipo);
    setShowTicketForm(true);
    setTimeout(() => document.getElementById('ticket-tipo')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  };

  const handleTicketCreated = () => {
    setTicketRefresh(k => k + 1);
    setShowTicketForm(false);
  };

  return (
    <div className="profile-page">
      <div className="profile-page__hero">
        <h1 className="profile-page__title">Mi Perfil</h1>
        <p className="profile-page__subtitle">Gestiona tu información personal y solicitudes de soporte</p>
      </div>

      <div className="profile-page__grid">
        {/* LEFT COLUMN */}
        <div className="profile-page__col profile-page__col--main">
          <ProfileDataSection onUpdate={() => refreshUser?.() } />

          {/* Seguridad */}
          <section className="profile-section">
            <div className="profile-section__header">
              <div className="profile-icon-wrap profile-icon-wrap--security">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div>
                <h2 className="profile-section__title">Seguridad</h2>
                <p className="profile-section__sub">Para cambiar tu contraseña, abre un ticket al equipo TI</p>
              </div>
            </div>
            <button
              className="profile-btn profile-btn--outline"
              onClick={() => openTicketForm('CAMBIO_PASSWORD')}
              type="button"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              Solicitar cambio de contraseña
            </button>
          </section>
        </div>

        {/* RIGHT COLUMN — Tickets */}
        <div className="profile-page__col profile-page__col--tickets">
          <section className="profile-section">
            <div className="profile-section__header profile-section__header--between">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="profile-icon-wrap profile-icon-wrap--ticket">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 12V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8" />
                    <path d="M14 22h6M17 19l3 3-3 3" />
                    <line x1="8" y1="10" x2="16" y2="10" />
                    <line x1="8" y1="14" x2="12" y2="14" />
                  </svg>
                </div>
                <div>
                  <h2 className="profile-section__title">Mis Tickets</h2>
                  <p className="profile-section__sub">Solicitudes enviadas al equipo TI</p>
                </div>
              </div>
              <button
                className="profile-btn profile-btn--sm profile-btn--primary"
                onClick={() => { setDefaultTipo(undefined); setShowTicketForm(v => !v); }}
                type="button"
              >
                + Nuevo ticket
              </button>
            </div>

            {showTicketForm && (
              <div className="ticket-form-wrap">
                <TicketFormSection defaultTipo={defaultTipo} onCreated={handleTicketCreated} />
              </div>
            )}

            <MyTicketsSection refreshKey={ticketRefresh} />
          </section>
        </div>
      </div>
    </div>
  );
}
