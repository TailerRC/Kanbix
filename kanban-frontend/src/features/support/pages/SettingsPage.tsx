/**
 * SettingsPage — Configuración de usuario en Kanbix
 *
 * Secciones:
 * 1. Apariencia — toggle modo oscuro (funcional, persiste en localStorage)
 * 2. Notificaciones — preferencias de alertas
 * 3. Idioma — selector (placeholder v2)
 * 4. Privacidad — info de auditoría
 */
import { useState, useEffect } from 'react';
import api from '../../../shared/api/api';
import './SettingsPage.css';


interface UserPreferences {
  id_usuario: string;
  notif_asignacion: boolean;
  notif_comentarios: boolean;
  notif_email: boolean;
  notif_tickets: boolean;
}



// ---------------------------------------------------------------------------
// Dark mode hook — aplica data-theme al <html> y persiste en localStorage
// ---------------------------------------------------------------------------

function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('kanbix-theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('kanbix-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
      localStorage.setItem('kanbix-theme', 'light');
    }
  }, [isDark]);

  return { isDark, toggle: () => setIsDark(v => !v) };
}

// ---------------------------------------------------------------------------
// Componentes auxiliares
// ---------------------------------------------------------------------------

function Toggle({ checked, onChange, id, isThemeToggle }: { checked: boolean; onChange: () => void; id: string; isThemeToggle?: boolean }) {
  return (
    <label className="st-toggle" htmlFor={id}>
      <input id={id} type="checkbox" className="st-toggle__input" checked={checked} onChange={onChange} />
      <span className="st-toggle__track">
        <span className="st-toggle__thumb">
          {isThemeToggle && (
            <span className="st-theme-toggle-icon">
              {checked ? '🌙' : '☀️'}
            </span>
          )}
        </span>
      </span>
    </label>
  );
}

function SettingRow({
  icon, title, description, control,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  control: React.ReactNode;
}) {
  return (
    <div className="st-row">
      <div className="st-row__icon">{icon}</div>
      <div className="st-row__text">
        <div className="st-row__title">{title}</div>
        <div className="st-row__desc">{description}</div>
      </div>
      <div className="st-row__control">{control}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const { isDark, toggle: toggleDark } = useDarkMode();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Notificaciones persistidas
  const [notifAsignacion, setNotifAsignacion] = useState(true);
  const [notifComentario, setNotifComentario] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifTicket, setNotifTicket] = useState(true);

  // Idioma
  const [idioma] = useState('es');

  // Cargar de base de datos
  useEffect(() => {
    api.get<UserPreferences>('/auth/preferences')
      .then(res => {
        const data = res.data;
        setNotifAsignacion(data.notif_asignacion);
        setNotifComentario(data.notif_comentarios);
        setNotifEmail(data.notif_email);
        setNotifTicket(data.notif_tickets);
      })
      .catch(err => {
        console.error('Error cargando preferencias:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSavePreferences = async () => {
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await api.patch('/auth/preferences', {
        notif_asignacion: notifAsignacion,
        notif_comentarios: notifComentario,
        notif_email: notifEmail,
        notif_tickets: notifTicket,
      });
      setSuccessMsg('Preferencias guardadas exitosamente.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail ?? 'Error al guardar las preferencias.');
    } finally {
      setSaving(false);
    }
  };



  return (
    <div className="st-page">
      {/* Hero */}
      <div className="st-hero">
        <h1 className="st-title">Configuración</h1>
        <p className="st-subtitle">Personaliza tu experiencia en Kanbix</p>
      </div>

      <div className="st-grid">
        {/* LEFT */}
        <div className="st-col">

          {/* Apariencia */}
          <section className="st-card">
            <div className="st-card__header">
              <div className="st-card__icon st-card__icon--muted">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              </div>
              <div>
                <h2 className="st-card__title">Apariencia</h2>
                <p className="st-card__sub">Ajusta la apariencia visual de la interfaz</p>
              </div>
            </div>

            <div className="st-rows">
              <SettingRow
                icon={
                  isDark ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="st-icon-animate">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="st-icon-animate">
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                  )
                }
                title="Modo oscuro"
                description={isDark ? 'Interfaz en modo oscuro activada' : 'Interfaz en modo claro'}
                control={<Toggle id="toggle-dark" checked={isDark} onChange={toggleDark} isThemeToggle={true} />}
              />

              {/* Preview del tema actual */}
              <div className="st-theme-preview">
                <div className={`st-theme-preview__card st-theme-preview__card--${isDark ? 'dark' : 'light'}`}>
                  <div className="st-theme-preview__sidebar" />
                  <div className="st-theme-preview__content">
                    <div className="st-theme-preview__bar" />
                    <div className="st-theme-preview__bar st-theme-preview__bar--short" />
                    <div className="st-theme-preview__dot-row">
                      <div className="st-theme-preview__dot" />
                      <div className="st-theme-preview__dot" />
                      <div className="st-theme-preview__dot" />
                    </div>
                  </div>
                </div>
                <span className="st-theme-preview__label">
                  {isDark ? '🌙 Modo oscuro activo' : '☀️ Modo claro activo'}
                </span>
              </div>
            </div>
          </section>

          {/* Idioma */}
          <section className="st-card">
            <div className="st-card__header">
              <div className="st-card__icon st-card__icon--info">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <div>
                <h2 className="st-card__title">Idioma y Región</h2>
                <p className="st-card__sub">Zona horaria: América/Lima (UTC-5)</p>
              </div>
            </div>
            <div className="st-rows">
              <div className="st-row">
                <div className="st-row__icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6" />
                  </svg>
                </div>
                <div className="st-row__text">
                  <div className="st-row__title">Idioma de la interfaz</div>
                  <div className="st-row__desc">Próximamente disponible en inglés y portugués</div>
                </div>
                <div className="st-row__control">
                  <select className="st-select" value={idioma} disabled>
                    <option value="es">🇵🇪 Español</option>
                    <option value="en">🇺🇸 English</option>
                    <option value="pt">🇧🇷 Português</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* RIGHT */}
        <div className="st-col">

          {/* Notificaciones */}
          <section className="st-card">
            <div className="st-card__header">
              <div className="st-card__icon st-card__icon--warn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <div>
                <h2 className="st-card__title">Notificaciones</h2>
                <p className="st-card__sub">Elige qué eventos te alertan</p>
              </div>
            </div>
            <div className="st-rows">
              {loading ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  Cargando preferencias…
                </div>
              ) : (
                <>
                  <SettingRow
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
                    title="Asignación de tarea"
                    description="Recibir alerta cuando te asignen una tarea"
                    control={<Toggle id="toggle-asig" checked={notifAsignacion} onChange={() => setNotifAsignacion(v => !v)} />}
                  />
                  <SettingRow
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>}
                    title="Comentarios en tareas"
                    description="Notificar cuando alguien comenta en tus tareas"
                    control={<Toggle id="toggle-comment" checked={notifComentario} onChange={() => setNotifComentario(v => !v)} />}
                  />
                  <SettingRow
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>}
                    title="Notificaciones por correo"
                    description="Recibir emails para eventos importantes"
                    control={<Toggle id="toggle-email" checked={notifEmail} onChange={() => setNotifEmail(v => !v)} />}
                  />
                  <SettingRow
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 12V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8" /><path d="M14 22h6M17 19l3 3-3 3" /></svg>}
                    title="Actualización de tickets"
                    description="Alertar cuando el equipo TI responda tu ticket"
                    control={<Toggle id="toggle-ticket" checked={notifTicket} onChange={() => setNotifTicket(v => !v)} />}
                  />
                </>
              )}
            </div>

            {successMsg && (
              <p style={{
                fontSize: '0.83rem', padding: '0.5rem 0.75rem', margin: '1rem 0 0 0', borderRadius: '6px',
                background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0'
              }}>
                {successMsg}
              </p>
            )}
            {errorMsg && (
              <p style={{
                fontSize: '0.83rem', padding: '0.5rem 0.75rem', margin: '1rem 0 0 0', borderRadius: '6px',
                background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA'
              }}>
                {errorMsg}
              </p>
            )}

            <div className="st-save-row">
              <button
                className="st-btn st-btn--primary"
                type="button"
                onClick={handleSavePreferences}
                disabled={loading || saving}
              >
                {saving ? 'Guardando…' : 'Guardar preferencias'}
              </button>
            </div>
          </section>


          {/* Privacidad */}
          <section className="st-card">
            <div className="st-card__header">
              <div className="st-card__icon st-card__icon--muted">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <h2 className="st-card__title">Privacidad y Auditoría</h2>
                <p className="st-card__sub">Información sobre el registro de actividad</p>
              </div>
            </div>
            <div className="st-privacy-info">
              <div className="st-privacy-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Tus acciones en el sistema se registran en la bitácora de auditoría</span>
              </div>
              <div className="st-privacy-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Los logs incluyen fecha/hora en zona horaria Perú (UTC-5)</span>
              </div>
              <div className="st-privacy-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Solo los Administradores pueden consultar la bitácora completa</span>
              </div>
              <div className="st-privacy-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Las contraseñas se almacenan con hash bcrypt, nunca en texto plano</span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
