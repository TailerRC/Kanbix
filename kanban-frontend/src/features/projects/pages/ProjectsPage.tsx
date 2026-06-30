import { useEffect, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import { getErrorMessage } from '../../../shared/api/api';
import type { Project, Invitation } from '../../../shared/types';
import { createProject, listProjects, searchProjects, listMyInvitations, respondInvitation } from '../api/projectsApi';
import './ProjectsPage.css';

const ROLE_COLORS: Record<string, string> = {
  scrum_master: '#6366F1', // Scrum Master / Violeta
  developer: '#3B82F6',    // Developer / Azul
  product_owner: '#D97706', // Product Owner / Ámbar
};

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Búsqueda
  const [searchQuery, setSearchQuery] = useState('');

  // Invitaciones del usuario
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  // Modal crear proyecto
  const [showModal, setShowModal] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [color, setColor] = useState('#1E3A5F');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    
    // Cargar proyectos y cargar invitaciones en paralelo
    Promise.all([
      searchQuery.trim() ? searchProjects(searchQuery.trim()) : listProjects(),
      listMyInvitations().catch(() => [] as Invitation[]) // Tolera fallos en invitaciones
    ])
      .then(([projRes, invs]) => {
        setProjects(projRes.proyectos);
        setInvitations(invs);
      })
      .catch((err) => setError(getErrorMessage(err, 'No se pudieron cargar los proyectos')))
      .finally(() => setLoading(false));
  };

  useEffect(load, [searchQuery]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    setCreating(true);
    try {
      await createProject({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        fecha_inicio: fechaInicio || new Date().toISOString().split('T')[0],
        fecha_fin: fechaFin || undefined,
        color: color,
      });
      setShowModal(false);
      setNombre('');
      setDescripcion('');
      setFechaInicio('');
      setFechaFin('');
      setColor('#1E3A5F');
      load();
    } catch (err) {
      setFormError(getErrorMessage(err, 'No se pudo crear el proyecto'));
    } finally {
      setCreating(false);
    }
  };

  const handleRespondInvitation = async (invitationId: string, action: 'aceptar' | 'rechazar') => {
    try {
      await respondInvitation(invitationId, action);
      alert(`Invitación ${action}ada exitosamente.`);
      load();
    } catch (err) {
      alert(getErrorMessage(err, `No se pudo ${action}ar la invitación`));
    }
  };

  const openNewProject = () => {
    setFormError('');
    setNombre('');
    setDescripcion('');
    setFechaInicio(new Date().toISOString().split('T')[0]);
    setFechaFin('');
    setColor('#1E3A5F');
    setShowModal(true);
  };

  return (
    <div className="projects">
      {/* Invitaciones Pendientes Banner */}
      {invitations.length > 0 && (
        <div className="projects__invitations-banner">
          <div className="projects__invitations-header">
            <Icon name="users" size={16} />
            <h3>Tienes invitaciones de equipo pendientes</h3>
          </div>
          <div className="projects__invitations-list">
            {invitations.map((inv) => (
              <div key={inv.id} className="projects__invitation-card">
                <div className="projects__invitation-info">
                  <p>
                    Fuiste invitado a colaborar en un proyecto con el rol de{' '}
                    <strong style={{ color: ROLE_COLORS[inv.rol] }}>{inv.rol}</strong>.
                  </p>
                  <span className="projects__invitation-exp">Expira el: {new Date(inv.expira_en).toLocaleDateString()}</span>
                </div>
                <div className="projects__invitation-actions">
                  <button
                    className="btn btn--primary btn--small"
                    onClick={() => handleRespondInvitation(inv.id, 'aceptar')}
                  >
                    Aceptar
                  </button>
                  <button
                    className="btn btn--outline btn--small"
                    style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                    onClick={() => handleRespondInvitation(inv.id, 'rechazar')}
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <header className="projects__header">
        <div>
          <h1 className="projects__title">Proyectos</h1>
          <p className="projects__subtitle">Tus proyectos y equipos de trabajo</p>
        </div>
        
        {/* Barra de búsqueda interactiva */}
        <div className="projects__search-wrapper">
          <input
            type="text"
            className="projects__search-input"
            placeholder="Buscar proyecto por nombre…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Icon name="board" size={16} className="projects__search-icon" />
        </div>

        <button className="projects__new" onClick={openNewProject}>
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
          <h3>No se encontraron proyectos</h3>
          {searchQuery ? (
            <p>No hay coincidencias para "{searchQuery}". Intenta con otro término.</p>
          ) : (
            <>
              <p>Crea tu primer proyecto para empezar a organizar tus tableros y sprints.</p>
              <button className="projects__new" onClick={openNewProject}>
                <Icon name="plus" size={18} />
                Crear proyecto
              </button>
            </>
          )}
        </div>
      )}

      {!loading && !error && projects.length > 0 && (
        <div className="projects__grid">
          {projects.map((p) => (
            <button
              key={p.id}
              className="project-card"
              onClick={() => navigate(`/projects/${p.id}`)}
              style={{ borderTop: `4px solid ${p.color}` }}
            >
              <div className="project-card__top">
                <span className="project-card__avatar" style={{ backgroundColor: p.color }}>
                  {p.iniciales}
                </span>
                {p.mi_rol && (
                  <span
                    className="project-card__role"
                    style={{ color: ROLE_COLORS[p.mi_rol], backgroundColor: `${ROLE_COLORS[p.mi_rol]}1a` }}
                  >
                    {p.mi_rol}
                  </span>
                )}
              </div>
              <h3 className="project-card__name">{p.nombre}</h3>
              <p className="project-card__desc">{p.descripcion || 'Sin descripción'}</p>
              <div className="project-card__meta">
                <span>
                  Estado: <strong style={{ color: p.estado === 'Activo' ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>{p.estado}</strong>
                </span>
                <span>Inicio: {p.fecha_inicio}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Modal crear proyecto */}
      {showModal && createPortal(
        <div className="projects__overlay" onClick={() => setShowModal(false)}>
          <form className="projects__modal" onClick={(e) => e.stopPropagation()} onSubmit={handleCreate}>
            <h2 className="projects__modal-title">Nuevo Proyecto</h2>
            {formError && <div className="projects__error">{formError}</div>}
            
            <label className="projects__field">
              <span>Nombre del Proyecto</span>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Kanban Grupo 5"
                minLength={3}
                required
              />
            </label>
            
            <label className="projects__field">
              <span>Descripción (opcional)</span>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="¿De qué trata este proyecto?"
                rows={3}
              />
            </label>

            <div className="projects__modal-row">
              <label className="projects__field">
                <span>Fecha de Inicio</span>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  required
                />
              </label>
              <label className="projects__field">
                <span>Fecha Fin (opcional)</span>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </label>
            </div>

            <label className="projects__field">
              <span>Color Identificador</span>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ padding: '0px', height: '40px', cursor: 'pointer' }}
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
        </div>,
        document.body
      )}
    </div>
  );
}
