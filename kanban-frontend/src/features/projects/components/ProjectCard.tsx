import { useNavigate } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import type { Project } from '../../../shared/types';

const ROLE_COLORS: Record<string, string> = {
  Manager: '#6366F1',
  Developer: '#3B82F6',
  Viewer: '#94A3B8',
};

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();

  return (
    <button
      className="project-card"
      onClick={() => navigate(`/proyectos/${project.id}/tablero`)}
    >
      <div className="project-card__top">
        <span className="project-card__icon">
          <Icon name="board" size={20} />
        </span>
        {project.role && (
          <span
            className="project-card__role"
            style={{
              color: ROLE_COLORS[project.role],
              backgroundColor: `${ROLE_COLORS[project.role]}1a`,
            }}
          >
            {project.role}
          </span>
        )}
      </div>
      <h3 className="project-card__name">{project.name}</h3>
      <p className="project-card__desc">{project.description || 'Sin descripción'}</p>
      <div className="project-card__meta">
        <span>
          <Icon name="dashboard" size={14} /> {project.member_count ?? 0} miembros
        </span>
        <span>{new Date(project.created_at).toLocaleDateString('es-PE')}</span>
      </div>
    </button>
  );
}
