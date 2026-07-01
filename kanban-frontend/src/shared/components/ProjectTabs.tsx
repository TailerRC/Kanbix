import { NavLink } from 'react-router-dom';
import Icon, { type IconName } from './Icon';
import './ProjectTabs.css';

interface ProjectTabsProps {
  projectId: string;
}

const TABS: { key: string; label: string; icon: IconName }[] = [
  { key: 'resumen', label: 'Resumen', icon: 'dashboard' },
  { key: 'backlog', label: 'Backlog', icon: 'list' },
  { key: 'tablero', label: 'Tablero', icon: 'layout' },
  { key: 'calendario', label: 'Calendario', icon: 'calendar' },
  { key: 'cronograma', label: 'Cronograma', icon: 'clock' },
  { key: 'informes', label: 'Informes', icon: 'reports' },
];

/**
 * Barra de navegación de las vistas dentro de un proyecto (estilo Jira/ClickUp).
 * Se renderiza en la cabecera de cada página del ciclo de vida del proyecto.
 */
export default function ProjectTabs({ projectId }: ProjectTabsProps) {
  return (
    <nav className="project-tabs" aria-label="Vistas del proyecto">
      {TABS.map((tab) => (
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
