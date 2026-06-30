import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import { getErrorMessage } from '../../../shared/api/api';
import type { Project } from '../../../shared/types';
import { createProject, listProjects } from '../api/projectsApi';
import './ProjectsPage.css';

const ROLE_COLORS: Record<string, string> = {
  Manager: '#6366F1',
  Developer: '#3B82F6',
  Viewer: '#94A3B8',
};

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');

  const load = () => {
    setLoading(true);
    listProjects()
      .then((res) => setProjects(res.data))
      .catch((err) => setError(getErrorMessage(err, 'No se pudieron cargar los proyectos')))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    setCreating(true);
    try {
      await createProject(name.trim(), description.trim() || undefined);
      setShowModal(false);
      setName('');
      setDescription('');
      load();
    } catch (err) {
      setFormError(getErrorMessage(err, 'No se pudo crear el proyecto'));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="projects">
      <header className="projects__header">
        <div>
          <h1 className="projects__title">Proyectos</h1>
          <p className="projects__subtitle">Tus proyectos y equipos de trabajo</p>
        </div>
        <button className="projects__new" onClick={() => setShowModal(true)}>
          <Icon name="plus" size={18} />
          Nuevo proyecto
        </button>
      </header>

      {loading && (
        <div className="projects__grid">
          {[0, 1, 2].map((i) => (
            <div key={i} className="project-card project-card--skeleton" />
          ))}
        </div>
      )}

      {!loading && error && <div className="projects__error">{error}</div>}

      {!loading && !error && projects.length === 0 && (
        <div className="projects__empty">
          <span className="projects__empty-icon">
            <Icon name="board" size={28} />
          </span>
          <h3>No tienes proyectos todavía</h3>
          <p>Crea tu primer proyecto para empezar a organizar tus tableros y sprints.</p>
          <button className="projects__new" onClick={() => setShowModal(true)}>
            <Icon name="plus" size={18} />
            Crear proyecto
          </button>
        </div>
      )}

      {!loading && !error && projects.length > 0 && (
        <div className="projects__grid">
          {projects.map((p) => (
            <button
              key={p.id}
              className="project-card"
              onClick={() => navigate(`/board?project=${p.id}`)}
            >
              <div className="project-card__top">
                <span className="project-card__icon">
                  <Icon name="board" size={20} />
                </span>
                {p.role && (
                  <span
                    className="project-card__role"
                    style={{ color: ROLE_COLORS[p.role], backgroundColor: `${ROLE_COLORS[p.role]}1a` }}
                  >
                    {p.role}
                  </span>
                )}
              </div>
              <h3 className="project-card__name">{p.name}</h3>
              <p className="project-card__desc">{p.description || 'Sin descripción'}</p>
              <div className="project-card__meta">
                <span>
                  <Icon name="dashboard" size={14} /> {p.member_count ?? 0} miembros
                </span>
                <span>{new Date(p.created_at).toLocaleDateString('es-PE')}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Modal crear proyecto */}
      {showModal && (
        <div className="projects__overlay" onClick={() => setShowModal(false)}>
          <form className="projects__modal" onClick={(e) => e.stopPropagation()} onSubmit={handleCreate}>
            <h2 className="projects__modal-title">Nuevo proyecto</h2>
            {formError && <div className="projects__error">{formError}</div>}
            <label className="projects__field">
              <span>Nombre</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Kanbix Backend"
                minLength={3}
                required
              />
            </label>
            <label className="projects__field">
              <span>Descripción (opcional)</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="¿De qué trata el proyecto?"
                rows={3}
              />
            </label>
            <div className="projects__modal-actions">
              <button type="button" className="btn btn--outline" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn--primary" disabled={creating}>
                {creating ? 'Creando…' : 'Crear proyecto'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
