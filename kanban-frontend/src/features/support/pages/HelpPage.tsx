/**
 * HelpPage — Centro de ayuda de Kanbix
 *
 * Secciones:
 * 1. FAQ (accordion)
 * 2. Abrir ticket de soporte rápido
 * 3. Estado del sistema (uptime badges)
 * 4. Atajos de teclado
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/auth/AuthContext';
import './HelpPage.css';


// ---------------------------------------------------------------------------
// FAQ Data
// ---------------------------------------------------------------------------

const FAQ_ITEMS = [
  {
    q: '¿Qué es un sistema Kanban y cómo ayuda al equipo?',
    a: 'Kanban es un método visual de gestión de proyectos que organiza el trabajo en columnas (como Backlog, Por hacer, En progreso y Completado). Permite al equipo ver el flujo de trabajo de un vistazo, identificar cuellos de botella y maximizar la eficiencia.',
  },
  {
    q: '¿Cómo genero o añado una nueva tarea en el tablero?',
    a: 'En la vista de "Tablero", presiona la tecla "N" o haz clic en el botón "+" de la columna correspondiente. Define el título, descripción, puntos de historia y asigna los responsables para que aparezca inmediatamente.',
  },
  {
    q: '¿Cómo se organiza y se actualiza el tablero en Kanbix?',
    a: 'El tablero se divide en columnas que representan las etapas del flujo de trabajo. Puedes mover cualquier tarea arrastrándola y soltándola (drag & drop) a la columna que corresponda según su avance.',
  },
  {
    q: '¿Qué significan los puntos de historia (story points)?',
    a: 'Son una medida del esfuerzo y complejidad de una tarea basada en la escala Fibonacci (1, 2, 3, 5, 8, etc.). Ayudan al equipo a estimar cuánto trabajo se puede asumir en un ciclo sin basarse únicamente en horas reloj.',
  },
  {
    q: '¿Cómo cambio mi contraseña de usuario?',
    a: 'Por políticas de seguridad de la organización, puedes solicitar un cambio de contraseña desde tu "Perfil de Usuario" abriendo un ticket de soporte para el equipo de administración.',
  },
  {
    q: '¿Cómo puedo configurar mis notificaciones para no perderme de nada?',
    a: 'Ve a la sección de "Configuración" en el menú lateral. Allí podrás activar o desactivar las alertas para cuando te asignen tareas, cuando comenten en tus tarjetas o cuando el equipo de soporte responda tus solicitudes.',
  },
];

// ---------------------------------------------------------------------------
// Sistema de estado
// ---------------------------------------------------------------------------

const SYSTEM_STATUS = [
  { name: 'API Backend', status: 'operational', latency: '42ms' },
  { name: 'Base de datos (MongoDB Atlas)', status: 'operational', latency: '18ms' },
  { name: 'Autenticación (JWT)', status: 'operational', latency: '< 5ms' },
  { name: 'Notificaciones (WebSocket)', status: 'operational', latency: '—' },
  { name: 'Correo transaccional (Resend)', status: 'operational', latency: '—' },
];

// ---------------------------------------------------------------------------
// Atajos de teclado
// ---------------------------------------------------------------------------

const SHORTCUTS = [
  { keys: ['/', 'Ctrl+K'], description: 'Búsqueda global' },
  { keys: ['N'], description: 'Nueva tarea (en el tablero)' },
  { keys: ['Esc'], description: 'Cerrar modal / panel' },
  { keys: ['G', 'D'], description: 'Ir al Dashboard' },
  { keys: ['G', 'B'], description: 'Ir al Tablero' },
  { keys: ['G', 'P'], description: 'Ir a Proyectos' },
  { keys: ['?'], description: 'Mostrar esta guía de atajos' },
];

// ---------------------------------------------------------------------------
// Componente FAQ Accordion
// ---------------------------------------------------------------------------

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`help-faq-item ${open ? 'help-faq-item--open' : ''}`}>
      <button className="help-faq-trigger" onClick={() => setOpen(v => !v)} type="button">
        <span className="help-faq-q">{q}</span>
        <svg
          className={`help-faq-chevron ${open ? 'help-faq-chevron--open' : ''}`}
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div className="help-faq-answer">{a}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function HelpPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const filtered = FAQ_ITEMS.filter(
    f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  );

  const isAdmin = user?.rol_global === 'Admin';


  return (
    <div className="help-page">
      {/* Hero */}
      <div className="help-hero">
        <h1 className="help-title">Centro de Ayuda</h1>
        <p className="help-subtitle">Encuentra respuestas rápidas o contacta al equipo TI</p>
        <div className="help-search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="help-search"
            type="text"
            placeholder="Buscar en preguntas frecuentes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="help-search-input"
          />
        </div>
      </div>

      <div className="help-grid">
        {/* LEFT — FAQ + Contacto */}
        <div className="help-col">
          {/* FAQ */}
          <section className="help-card">
            <div className="help-card__header">
              <div className="help-card__icon help-card__icon--info">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <h2 className="help-card__title">Preguntas Frecuentes</h2>
                <p className="help-card__sub">{FAQ_ITEMS.length} respuestas disponibles</p>
              </div>
            </div>
            <div className="help-faq-list">
              {filtered.length > 0
                ? filtered.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)
                : <p className="help-empty">No se encontraron resultados para "{search}"</p>
              }
            </div>
          </section>

          {/* Contacto */}
          <section className="help-card">
            <div className="help-card__header">
              <div className="help-card__icon help-card__icon--warn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="help-card__title">¿No encontraste tu respuesta?</h2>
                <p className="help-card__sub">Abre un ticket y el equipo TI te responderá</p>
              </div>
            </div>
            <div className="help-contact-grid">
              <button
                className="help-contact-card"
                onClick={() => navigate('/profile')}
                type="button"
              >
                <div className="help-contact-card__icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 12V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8" /><path d="M14 22h6M17 19l3 3-3 3" />
                  </svg>
                </div>
                <div>
                  <div className="help-contact-card__label">Abrir Ticket</div>
                  <div className="help-contact-card__desc">Soporte técnico, acceso bloqueado u otro</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </section>
        </div>

        {/* RIGHT — Estado del sistema + Atajos */}
        <div className="help-col">
          {/* Estado del sistema */}
          {isAdmin && (
            <section className="help-card">
              <div className="help-card__header">
                <div className="help-card__icon help-card__icon--success">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <div>
                  <h2 className="help-card__title">Estado del Sistema</h2>
                  <p className="help-card__sub">Todos los servicios operativos</p>
                </div>
              </div>
              <div className="help-status-list">
                {SYSTEM_STATUS.map(s => (
                  <div key={s.name} className="help-status-row">
                    <div className="help-status-info">
                      <span className={`help-status-dot help-status-dot--${s.status}`} />
                      <span className="help-status-name">{s.name}</span>
                    </div>
                    <div className="help-status-right">
                      {s.latency !== '—' && <span className="help-status-latency">{s.latency}</span>}
                      <span className={`help-status-badge help-status-badge--${s.status}`}>
                        {s.status === 'operational' ? 'Operativo' : s.status === 'degraded' ? 'Degradado' : 'Caído'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="help-status-uptime">
                <span className="help-status-uptime-label">Uptime últimos 30 días</span>
                <span className="help-status-uptime-value">99.9%</span>
              </div>
            </section>
          )}

          {/* Atajos de teclado */}

          <section className="help-card">
            <div className="help-card__header">
              <div className="help-card__icon help-card__icon--muted">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10" />
                </svg>
              </div>
              <div>
                <h2 className="help-card__title">Atajos de Teclado</h2>
                <p className="help-card__sub">Navega más rápido con shortcuts</p>
              </div>
            </div>
            <table className="help-shortcuts-table">
              <tbody>
                {SHORTCUTS.map((s, i) => (
                  <tr key={i} className="help-shortcut-row">
                    <td>
                      <div className="help-keys">
                        {s.keys.map(k => (
                          <kbd key={k} className="help-kbd">{k}</kbd>
                        ))}
                      </div>
                    </td>
                    <td className="help-shortcut-desc">{s.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </div>
  );
}
