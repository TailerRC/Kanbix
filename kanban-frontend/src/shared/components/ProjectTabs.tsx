import { NavLink } from 'react-router-dom';
import Icon, { type IconName } from './Icon';
import { useAuth } from '../auth/AuthContext';
import './ProjectTabs.css';

interface ProjectTabsProps {
  projectId: string;
}

const ALL_TABS: { key: string; label: string; icon: IconName }[] = [
  { key: 'resumen', label: 'Resumen', icon: 'dashboard' },
  { key: 'backlog', label: 'Backlog', icon: 'list' },
  { key: 'tablero', label: 'Tablero', icon: 'layout' },
  { key: 'calendario', label: 'Calendario', icon: 'calendar' },
  { key: 'cronograma', label: 'Cronograma', icon: 'clock' },
  { key: 'informes', label: 'Informes', icon: 'reports' },
];

/** Tabs visibles para el rol Developer (solo lectura de las vistas principales). */
const DEVELOPER_TABS = ALL_TABS.filter((t) =>
  ['resumen', 'tablero', 'calendario'].includes(t.key),
);

/**
 * Barra de navegación de las vistas dentro de un proyecto (estilo Jira/ClickUp).
 * Se renderiza en la cabecera de cada página del ciclo de vida del proyecto.
 *
 * Si el usuario tiene rol Developer, solo muestra las pestañas Resumen,
 * Tablero y Calendario. El resto de roles ven todas las pestañas.
 */
export default function ProjectTabs({ projectId }: ProjectTabsProps) {
  const { user } = useAuth();
  const isDeveloper = user?.rol_global === 'Developer';
  const tabs = isDeveloper ? DEVELOPER_TABS : ALL_TABS;

  return (
    <nav className="project-tabs" aria-label="Vistas del proyecto">
      {tabs.map((tab) => (
        <NavLink
          key={tab.key}
          to={`/proyectos/${projectId}/${tab.key}`}
          className={({ isActive }) =>
            `project-tabs__tab ${isActive ? 'project-tabs__tab--active' : ''}`
          }
        >
          <Icon name={tab.icon} size={15} />
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
