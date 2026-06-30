import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const name = user?.nombre_completo ?? 'Usuario';
  const role = user ? ROLE_LABEL[user.rol_global] ?? user.rol_global : '';

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const handleProfile = () => {
    setDropdownOpen(false);
    navigate('/profile');
  };

  return (
    <header className="topbar">
      {/* Hamburger for mobile */}
      <button className="topbar__hamburger" onClick={onMenuToggle} aria-label="Abrir menú">
        <Icon name="menu" size={22} />
      </button>

      {/* Search bar or admin status info */}
      {user?.rol_global !== 'Admin' ? (
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
      ) : (
        <div className="topbar__admin-title">
          <span className="topbar__admin-badge">Panel de TI</span>
          <span className="topbar__admin-status">
            <span className="topbar__status-dot" />
            Consola de Administración
          </span>
        </div>
      )}

      {/* Action icons */}
      {user?.rol_global !== 'Admin' && (
        <div className="topbar__actions">
          <button className="topbar__action-btn" aria-label="Reportes" title="Reportes">
            <Icon name="report-doc" size={19} />
          </button>
          <button className="topbar__action-btn" aria-label="Notificaciones" title="Notificaciones">
            <Icon name="bell" size={19} />
            <span className="topbar__notification-dot" />
          </button>
        </div>
      )}

      {/* User profile + dropdown */}
      <div className="topbar__user-wrap" ref={dropdownRef}>
        <button
          className="topbar__user"
          onClick={() => setDropdownOpen(v => !v)}
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
          type="button"
        >
          <div className="topbar__user-info">
            <span className="topbar__user-name">{name}</span>
            <span className="topbar__user-role">{role}</span>
          </div>
          <div className={`topbar__avatar ${dropdownOpen ? 'topbar__avatar--active' : ''}`}>
            {initials(name)}
          </div>
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="topbar__dropdown" role="menu">
            {/* User info header */}
            <div className="topbar__dropdown-header">
              <div className="topbar__dropdown-avatar">{initials(name)}</div>
              <div>
                <div className="topbar__dropdown-name">{name}</div>
                <div className="topbar__dropdown-email">{user?.email ?? ''}</div>
              </div>
            </div>

            <div className="topbar__dropdown-divider" />

            {/* Menu items */}
            <button className="topbar__dropdown-item" onClick={handleProfile} role="menuitem" type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Mi Perfil
            </button>

            <div className="topbar__dropdown-divider" />

            <button className="topbar__dropdown-item topbar__dropdown-item--danger" onClick={handleLogout} role="menuitem" type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
