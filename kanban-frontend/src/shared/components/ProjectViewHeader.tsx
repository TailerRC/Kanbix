import type { ReactNode } from 'react';
import ProjectTabs from './ProjectTabs';
import './ProjectViewHeader.css';

interface ProjectViewHeaderProps {
  projectId: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

/** Cabecera común de las vistas dentro de un proyecto: título + acciones + tabs. */
export default function ProjectViewHeader({ projectId, title, subtitle, actions }: ProjectViewHeaderProps) {
  return (
    <header className="pv-header">
      <div className="pv-header__top">
        <div>
          <h1 className="pv-header__title">{title}</h1>
          {subtitle && <p className="pv-header__subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="pv-header__actions">{actions}</div>}
      </div>
      <ProjectTabs projectId={projectId} />
    </header>
  );
}
