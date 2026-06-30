import { useEffect, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../../../shared/components/Icon';
import api, { getErrorMessage } from '../../../shared/api/api';
import type { Project } from '../../../shared/types';
import { createProject, listProjects } from '../api/projectsApi';
import ProjectCard from '../components/ProjectCard';
import { useAuth } from '../../../shared/auth/AuthContext';
import './ProjectsPage.css';

export default function ProjectsPage() {
  const { user } = useAuth();
  const isDeveloper = user?.rol_global === 'Developer';
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const [step, setStep] = useState(1);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchUser, setSearchUser] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<Record<string, 'Manager' | 'Developer' | 'Viewer' | 'Excluido'>>({});

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

    if (step === 1) {
      if (name.trim().length < 3) {
        setFormError('El nombre del proyecto debe tener al menos 3 caracteres.');
        return;
      }
      setStep(2);
      setLoadingUsers(true);
      api.get('/auth/users', { params: { page: 1, limit: 100 } })
        .then((res) => {
          setUsers(res.data.data);
        })
        .catch((err) => {
          setFormError(getErrorMessage(err, 'No se pudieron cargar los usuarios para asignación.'));
        })
        .finally(() => {
          setLoadingUsers(false);
        });
      return;
    }

    setCreating(true);
    try {
      const membersInput = Object.entries(selectedMembers)
        .filter(([_, rol]) => rol !== 'Excluido')
        .map(([user_id, rol]) => ({ user_id, rol: rol as 'Manager' | 'Developer' | 'Viewer' }));

      await createProject(name.trim(), description.trim() || undefined, membersInput);
      setShowModal(false);
      setName('');
      setDescription('');
      setSelectedMembers({});
      setStep(1);
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
        {!isDeveloper && (
          <button
            className="projects__new"
            onClick={() => {
              setShowModal(true);
              setStep(1);
              setSelectedMembers({});
              setName('');
              setDescription('');
              setFormError('');
            }}
          >
            <Icon name="plus" size={18} />
            Nuevo proyecto
          </button>
        )}
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
          {isDeveloper ? (
            <>
              <h3>No estás en ningún proyecto</h3>
              <p>Pídele a tu Manager que te asigne a un proyecto para comenzar a colaborar.</p>
            </>
          ) : (
            <>
              <h3>No tienes proyectos todavía</h3>
              <p>Crea tu primer proyecto para empezar a organizar tus tableros y sprints.</p>
              <button
                className="projects__new"
                onClick={() => {
                  setShowModal(true);
                  setStep(1);
                  setSelectedMembers({});
                  setName('');
                  setDescription('');
                  setFormError('');
                }}
              >
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
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}

      {/* Modal crear proyecto */}
      {showModal && createPortal(
        <div className="projects__overlay">
          <form
            className={`projects__modal ${step === 2 ? 'projects__modal--wide' : ''}`}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleCreate}
          >
            <h2 className="projects__modal-title">
              {step === 1 ? 'Nuevo proyecto (Paso 1 de 2)' : 'Asignar Miembros (Paso 2 de 2)'}
            </h2>
            {formError && <div className="projects__error">{formError}</div>}

            {step === 1 ? (
              <>
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
              </>
            ) : (
              <div className="projects__members-step">
                <div className="projects__members-search">
                  <Icon name="search" size={16} />
                  <input
                    type="text"
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    placeholder="Buscar usuarios por nombre, correo o ID..."
                  />
                </div>

                {loadingUsers ? (
                  <div className="projects__members-loading">Cargando usuarios...</div>
                ) : (
                  <div className="projects__table-wrapper">
                    <table className="projects__users-table">
                      <thead>
                        <tr>
                          <th style={{ width: '40px' }}>Seleccionar</th>
                          <th>Nombre completo</th>
                          <th>Email</th>
                          <th>Rol</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.filter(u => {
                          if (u.id === user?.id) return false;
                          const roleLower = (u.rol_global || '').toLowerCase();
                          const isAllowedRole = roleLower === 'manager' || roleLower === 'developer';
                          if (!isAllowedRole) return false;

                          return (
                            u.nombre_completo.toLowerCase().includes(searchUser.toLowerCase()) ||
                            u.email.toLowerCase().includes(searchUser.toLowerCase())
                          );
                        }).map((u) => {
                          const isSelected = selectedMembers[u.id] && selectedMembers[u.id] !== 'Excluido';
                          return (
                            <tr key={u.id} className={isSelected ? 'projects__users-row--selected' : ''}>
                              <td style={{ textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      const mappedRole = u.rol_global === 'Manager' ? 'Manager' : 'Developer';
                                      setSelectedMembers({
                                        ...selectedMembers,
                                        [u.id]: mappedRole
                                      });
                                    } else {
                                      setSelectedMembers({
                                        ...selectedMembers,
                                        [u.id]: 'Excluido'
                                      });
                                    }
                                  }}
                                />
                              </td>
                              <td className="font-bold">{u.nombre_completo}</td>
                              <td>{u.email}</td>
                              <td>
                                <span className="badge badge--info">
                                  {u.rol_global}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            <div className="projects__modal-actions">
              {step === 1 ? (
                <>
                  <button type="button" className="btn btn--outline" onClick={() => { setShowModal(false); setStep(1); }}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn--primary">
                    Siguiente: Miembros
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="btn btn--outline" onClick={() => setStep(1)}>
                    Atrás
                  </button>
                  <button type="submit" className="btn btn--primary" disabled={creating}>
                    {creating ? 'Creando…' : 'Crear proyecto'}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>,
        document.body
      )}
    </div>
  );
}
