import './Topbar.css';

interface TopbarProps {
  onMenuToggle?: () => void;
}

export default function Topbar({ onMenuToggle }: TopbarProps) {
  return (
    <header className="topbar">
      {/* Hamburger for mobile */}
      <button
        className="topbar__hamburger"
        onClick={onMenuToggle}
        aria-label="Abrir menú"
      >
        ☰
      </button>

      {/* Search bar */}
      <div className="topbar__search">
        <input
          type="text"
          className="topbar__search-input"
          placeholder="Buscar tareas, sprints, miembros..."
          id="global-search"
        />
        <span className="topbar__search-icon">🔍</span>
      </div>

      {/* Action icons */}
      <div className="topbar__actions">
        <button className="topbar__action-btn" aria-label="Mensajes" title="Mensajes">
          💬
        </button>
        <button className="topbar__action-btn" aria-label="Notificaciones" title="Notificaciones">
          🔔
          <span className="topbar__notification-dot" />
        </button>
      </div>

      {/* User profile */}
      <div className="topbar__user">
        <div className="topbar__user-info">
          <span className="topbar__user-name">Gianfranco C.</span>
          <span className="topbar__user-role">Project Manager</span>
        </div>
        <div className="topbar__avatar">GC</div>
      </div>
    </header>
  );
}
