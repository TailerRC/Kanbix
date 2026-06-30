import { NavLink, useNavigate } from 'react-router-dom';
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
  { to: '/board', label: 'Tablero', icon: 'board', badge: 11, badgeType: 'muted' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

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

      {/* Menu label */}
      <div className="sidebar__section-label">Menú</div>

      {/* Main navigation */}
      <nav className="sidebar__nav">{menuItems.map(renderItem)}</nav>

      <div className="sidebar__divider" />

      {/* Administración (solo para Admin) */}
      {user?.rol_global === 'Admin' && (
        <>
          <div className="sidebar__section-label">Administración</div>
          <nav className="sidebar__nav">
            {renderItem({ to: '/admin/users', label: 'Usuarios', icon: 'users' })}
            {renderItem({ to: '/admin/logs', label: 'Bitácora', icon: 'report-doc' })}
          </nav>
          <div className="sidebar__divider" />
        </>
      )}

      {/* Support section */}
      <div className="sidebar__section-label">Soporte</div>
      <div className="sidebar__support">
        <button className="sidebar__nav-item" type="button">
          <span className="sidebar__nav-icon">
            <Icon name="help" size={20} />
          </span>
          <span className="sidebar__nav-label">Ayuda</span>
        </button>
        <button className="sidebar__nav-item" type="button">
          <span className="sidebar__nav-icon">
            <Icon name="settings" size={20} />
          </span>
          <span className="sidebar__nav-label">Configuración</span>
        </button>
      </div>

      {/* CTA card */}
      <div className="sidebar__cta">
        <span className="sidebar__cta-icon">
          <Icon name="sparkles" size={20} />
        </span>
        <p className="sidebar__cta-text">Optimiza tu próximo sprint con IA</p>
        <button className="sidebar__cta-btn">Probar ahora</button>
      </div>

      {/* Logout */}
      <div className="sidebar__logout">
        <button className="sidebar__logout-btn" onClick={handleLogout}>
          <span className="sidebar__nav-icon">
            <Icon name="logout" size={20} />
          </span>
          <span className="sidebar__nav-label">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
