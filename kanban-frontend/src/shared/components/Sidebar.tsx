import { NavLink } from 'react-router-dom';
import Icon, { Logo, type IconName } from './Icon';
import { useAuth } from '../auth/AuthContext';
import './Sidebar.css';

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  end?: boolean;
  badge?: number;
  badgeType?: 'info' | 'muted';
}

const menuItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/projects', label: 'Proyectos', icon: 'backlog' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { user } = useAuth();

  const renderItem = (item: NavItem) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      onClick={() => onClose?.()}
      className={({ isActive }) =>
        `sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`
      }
    >
      <span className="sidebar__nav-icon">
        <Icon name={item.icon} size={20} />
      </span>
      <span className="sidebar__nav-label">{item.label}</span>
      {item.badge !== undefined && (
        <span className={`sidebar__nav-badge sidebar__nav-badge--${item.badgeType || 'muted'}`}>
          {item.badge}
        </span>
      )}
    </NavLink>
  );

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
      {/* Logo */}
      <NavLink to="/" className="sidebar__logo">
        <span className="sidebar__logo-icon">
          <Logo size={20} color="#FFFFFF" />
        </span>
        <span className="sidebar__logo-text">Kanbix</span>
      </NavLink>

      {/* Menu label (only for non-Admins) */}
      {user?.rol_global !== 'Admin' && (
        <>
          <div className="sidebar__section-label">Menú</div>
          <nav className="sidebar__nav">{menuItems.map(renderItem)}</nav>
          <div className="sidebar__divider" />
        </>
      )}

      {/* Administración (solo para Admin) */}
      {user?.rol_global === 'Admin' && (
        <>
          <div className="sidebar__section-label">Administración</div>
          <nav className="sidebar__nav">
            {renderItem({ to: '/admin/users', label: 'Usuarios', icon: 'users' })}
            {renderItem({ to: '/admin/projects', label: 'Proyectos Activos', icon: 'backlog' })}
            {renderItem({ to: '/admin/logs', label: 'Bitácora', icon: 'report-doc' })}
            {renderItem({ to: '/admin/tickets', label: 'Tickets', icon: 'help' })}
          </nav>
          <div className="sidebar__divider" />
        </>
      )}

      {/* Soporte */}
      <div className="sidebar__section-label">Soporte</div>
      <nav className="sidebar__nav">
        {user?.rol_global !== 'Admin' && renderItem({ to: '/help', label: 'Ayuda', icon: 'help' })}
        {renderItem({ to: '/settings', label: 'Configuración', icon: 'settings' })}
      </nav>
    </aside>
  );
}
