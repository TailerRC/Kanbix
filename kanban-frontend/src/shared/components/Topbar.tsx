import Icon from './Icon';
import { useAuth } from '../auth/AuthContext';
import './Topbar.css';

interface TopbarProps {
  onMenuToggle?: () => void;
}

const ROLE_LABEL: Record<string, string> = {
  Admin: 'Administrador',
  Manager: 'Project Manager',
  Developer: 'Developer',
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Topbar({ onMenuToggle }: TopbarProps) {
  const { user } = useAuth();
  const name = user?.nombre_completo ?? 'Usuario';
  const role = user ? ROLE_LABEL[user.rol_global] ?? user.rol_global : '';

  return (
    <header className="topbar">
      {/* Hamburger for mobile */}
      <button className="topbar__hamburger" onClick={onMenuToggle} aria-label="Abrir menú">
        <Icon name="menu" size={22} />
      </button>

      {/* Search bar */}
      <div className="topbar__search">
        <input
          type="text"
          className="topbar__search-input"
          placeholder="Buscar tareas, sprints, miembros..."
          id="global-search"
        />
        <span className="topbar__search-icon">
          <Icon name="search" size={18} />
        </span>
      </div>

      {/* Action icons */}
      <div className="topbar__actions">
        <button className="topbar__action-btn" aria-label="Reportes" title="Reportes">
          <Icon name="report-doc" size={19} />
        </button>
        <button className="topbar__action-btn" aria-label="Notificaciones" title="Notificaciones">
          <Icon name="bell" size={19} />
          <span className="topbar__notification-dot" />
        </button>
      </div>

      {/* User profile */}
      <div className="topbar__user">
        <div className="topbar__user-info">
          <span className="topbar__user-name">{name}</span>
          <span className="topbar__user-role">{role}</span>
        </div>
        <div className="topbar__avatar">{initials(name)}</div>
      </div>
    </header>
  );
}
