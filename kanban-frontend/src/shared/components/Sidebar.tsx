import { useState } from 'react';
import './Sidebar.css';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: number;
  badgeType?: 'info' | 'muted';
}

const menuItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '▣' },
  { id: 'board', label: 'Tablero', icon: '◫' },
  { id: 'backlog', label: 'Backlog', icon: '☰', badge: 24, badgeType: 'muted' },
  { id: 'sprint', label: 'Sprint actual', icon: '⟳' },
  { id: 'reports', label: 'Reportes', icon: '◔' },
];

const supportItems: NavItem[] = [
  { id: 'help', label: 'Ayuda', icon: '?' },
  { id: 'settings', label: 'Configuración', icon: '⚙' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const [activeItem, setActiveItem] = useState('dashboard');

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
      {/* Logo */}
      <a href="/" className="sidebar__logo">
        <div className="sidebar__logo-icon">K</div>
        <span className="sidebar__logo-text">Kanbix</span>
      </a>

      {/* Menu label */}
      <div className="sidebar__section-label">Menú</div>

      {/* Main navigation */}
      <nav className="sidebar__nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar__nav-item ${activeItem === item.id ? 'sidebar__nav-item--active' : ''}`}
            onClick={() => {
              setActiveItem(item.id);
              onClose?.();
            }}
          >
            <span className="sidebar__nav-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge !== undefined && (
              <span className={`sidebar__nav-badge sidebar__nav-badge--${item.badgeType || 'muted'}`}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar__divider" />

      {/* Support section */}
      <div className="sidebar__section-label">Soporte</div>
      <div className="sidebar__support">
        {supportItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar__nav-item ${activeItem === item.id ? 'sidebar__nav-item--active' : ''}`}
            onClick={() => {
              setActiveItem(item.id);
              onClose?.();
            }}
          >
            <span className="sidebar__nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* CTA card */}
      <div className="sidebar__cta">
        <span className="sidebar__cta-icon">💡</span>
        <p className="sidebar__cta-text">
          Optimiza tu próximo sprint con IA
        </p>
        <button className="sidebar__cta-btn">Probar ahora</button>
      </div>

      <div className="sidebar__divider" />

      {/* Logout */}
      <div className="sidebar__logout">
        <button className="sidebar__logout-btn">
          <span className="sidebar__nav-icon">⏻</span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
