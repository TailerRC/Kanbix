import { useEffect, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import { getErrorMessage } from '../../../shared/api/api';
import { useAuth } from '../../../shared/auth/AuthContext';
import type { Project, RolProyecto, Sprint, User, ProjectMember } from '../../../shared/types';
import {
  getProject,
  updateProject,
  deleteProject,
  inviteMember,
  removeMember,
  changeMemberRole,
  createSprint,
  listSprints,
  closeSprint,
  listUsers,
  listMembers,
} from '../api/projectsApi';
import './ProjectDetailPage.css';

const ROLE_COLORS: Record<string, string> = {
  scrum_master: '#6366F1', // Manager / Violeta Kanbix
  developer: '#3B82F6',    // Developer / Azul
  product_owner: '#D97706', // Viewer / Ámbar
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Estados del proyecto
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modales
  const [modal, setModal] = useState<'none' | 'edit' | 'delete' | 'add-member' | 'create-sprint'>('none');

  // Campos de edición de proyecto
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editColor, setEditColor] = useState('#1E3A5F');
  const [editEstado, setEditEstado] = useState('Activo');
  const [editError, setEditError] = useState('');
  const [editing, setEditing] = useState(false);

  // Campos de eliminación de proyecto
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Campos de invitación de miembro
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRol, setSelectedRol] = useState<RolProyecto>('developer');
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);

  // Dropdown de usuarios registrados (TI Enterprise)
  const [usersList, setUsersList] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');

  // Sprints
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [sprintsLoading, setSprintsLoading] = useState(false);
  const [sprintName, setSprintName] = useState('');
  const [sprintStart, setSprintStart] = useState('');
  const [sprintEnd, setSprintEnd] = useState('');
  const [sprintError, setSprintError] = useState('');
  const [sprintSaving, setSprintSaving] = useState(false);

  // Miembros del equipo
  const [members, setMembers] = useState<ProjectMember[]>([]);

  // Helpers
  const userGlobalRol = user?.rol_global;
  const projectRole = members.find((m) => m.id_usuario === user?.id)?.rol;
  const canManage = userGlobalRol === 'Admin' || projectRole === 'scrum_master';

  const load = () => {
    if (!id) return;
    setLoading(true);
    getProject(id)
      .then((data) => {
        setProject(data);
        // Cargar miembros del proyecto (Endpoint 9)
        return listMembers(id);
      })
      .then((res) => {
        setMembers(res.miembros);
        // Cargar sprints del proyecto
        loadSprintsList();
      })
      .catch((err) => setError(getErrorMessage(err, 'No se pudo cargar el proyecto')))
      .finally(() => setLoading(false));
  };

  const loadSprintsList = () => {
    if (!id) return;
    setSprintsLoading(true);
    listSprints(id)
      .then((res) => setSprints(res.sprints))
      .catch((err) => console.error('Error al cargar sprints:', err))
      .finally(() => setSprintsLoading(false));
  };

  useEffect(load, [id]);

  // ---- Edit handlers ----
  const openEdit = () => {
    if (!project) return;
    setEditName(project.nombre);
    setEditDesc(project.descripcion ?? '');
    setEditColor(project.color);
    setEditEstado(project.estado);
    setEditError('');
    setModal('edit');
  };

  const handleEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setEditError('');
    setEditing(true);
    try {
      const res = await updateProject(id, {
        nombre: editName.trim(),
        descripcion: editDesc.trim() || undefined,
        color: editColor,
        estado: editEstado,
      });
      setProject(res.proyecto);
      setModal('none');
    } catch (err) {
      setEditError(getErrorMessage(err, 'No se pudo actualizar el proyecto'));
    } finally {
      setEditing(false);
    }
  };

  // ---- Delete handlers ----
  const handleDelete = async () => {
    if (!id || deleteConfirm !== 'ELIMINAR') return;
    setDeleteError('');
    setDeleting(true);
    try {
      await deleteProject(id);
      navigate('/projects', { replace: true });
    } catch (err) {
      setDeleteError(getErrorMessage(err, 'No se pudo eliminar el proyecto'));
      setDeleting(false);
    }
  };

  // ---- Invitation handlers ----
  const openAddMember = async () => {
    setAddError('');
    setInviteEmail('');
    setSelectedRol('developer');
    setModal('add-member');

    setUsersLoading(true);
    setUsersError('');
    try {
      const users = await listUsers();
      setUsersList(users);
      if (users.length > 0) {
        setInviteEmail(users[0].email);
      }
    } catch (err) {
      setUsersError(getErrorMessage(err, 'No se pudieron cargar los usuarios registrados'));
    } finally {
      setUsersLoading(false);
    }
  };

  const handleAddMember = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !inviteEmail.trim()) return;
    setAddError('');
    setAdding(true);
    try {
      await inviteMember(id, inviteEmail.trim(), selectedRol);
      setModal('none');
      alert('¡Invitación enviada de forma exitosa por email!');
      load();
    } catch (err) {
      setAddError(getErrorMessage(err, 'No se pudo enviar la invitación'));
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = (memberId: string, name: string) => {
    if (!id) return;
    if (!window.confirm(`¿Eliminar a "${name}" del proyecto?`)) return;
    removeMember(id, memberId)
      .then(() => load())
      .catch((err) => {
        alert(getErrorMessage(err, 'No se pudo eliminar al miembro'));
        load();
      });
  };

  const handleChangeRole = async (memberId: string, rol: RolProyecto) => {
    if (!id) return;
    try {
      await changeMemberRole(id, memberId, rol);
      load();
    } catch (err) {
      alert(getErrorMessage(err, 'No se pudo actualizar el rol del miembro'));
    }
  };

  // ---- Sprint handlers ----
  const openCreateSprint = () => {
    setSprintError('');
    setSprintName('');
    const today = new Date().toISOString().split('T')[0];
    setSprintStart(today);
    // Por defecto una semana
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setSprintEnd(nextWeek.toISOString().split('T')[0]);
    setModal('create-sprint');
  };

  const handleCreateSprint = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !sprintName.trim()) return;
    setSprintError('');
    setSprintSaving(true);
    try {
      await createSprint(id, {
        nombre: sprintName.trim(),
        fecha_inicio: sprintStart,
        fecha_fin: sprintEnd,
      });
      setModal('none');
      loadSprintsList();
    } catch (err) {
      setSprintError(getErrorMessage(err, 'No se pudo crear el sprint'));
    } finally {
      setSprintSaving(false);
    }
  };

  const handleCloseSprint = async (sprintId: string, name: string) => {
    if (!id) return;
    if (!window.confirm(`¿Estás seguro de cerrar el "${name}"? Las tareas inconpletas volverán automáticamente al backlog.`)) return;
    try {
      const res = await closeSprint(id, sprintId);
      alert(`Sprint cerrado exitosamente.\n- Tareas completadas: ${res.tareas_completadas}\n- Tareas devueltas al backlog: ${res.tareas_al_backlog}`);
      loadSprintsList();
    } catch (err) {
      alert(getErrorMessage(err, 'No se pudo cerrar el sprint'));
    }
  };

  // ---- Loading skeleton ----
  if (loading) {
    return (
      <div className="project-detail project-detail--loading">
        <div className="project-detail__spinner"></div>
        <p>Cargando detalles del proyecto…</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="project-detail project-detail--error">
        <div className="project-detail__error-card">
          <Icon name="board" size={48} style={{ color: 'var(--color-error)' }} />
          <div className="project-detail__error-text">{error || 'Proyecto no encontrado'}</div>
          <button className="btn btn--outline" onClick={() => navigate('/projects')}>
            Volver a proyectos
          </button>
        </div>
      </div>
    );
  }

  const memberCount = members.length;

  return (
    <div className="project-detail">
      {/* Back button */}
      <button className="project-detail__back" onClick={() => navigate('/projects')}>
        <span aria-hidden="true" style={{ fontSize: '1.2em' }}>←</span>
        Volver a proyectos
      </button>

      {/* Header */}
      <div className="project-detail__header" style={{ borderLeft: `8px solid ${project.color}` }}>
        <div className="project-detail__info">
          <h1 className="project-detail__title">
            <span className="project-detail__avatar" style={{ backgroundColor: project.color }}>
              {project.iniciales}
            </span>
            {project.nombre}
            {projectRole && (
              <span
                className="project-detail__role-badge"
                style={{
                  color: ROLE_COLORS[projectRole],
                  backgroundColor: `${ROLE_COLORS[projectRole]}1a`,
                }}
              >
                {projectRole}
              </span>
            )}
          </h1>
          <p className="project-detail__desc">
            {project.descripcion || 'Sin descripción'}
          </p>
          <div className="project-detail__meta">
            <span>
              <Icon name="board" size={14} /> Fecha inicio: {project.fecha_inicio}
            </span>
            {project.fecha_fin && (
              <span>
                <Icon name="board" size={14} /> Fecha fin: {project.fecha_fin}
              </span>
            )}
            <span>
              <Icon name="users" size={14} /> {memberCount} miembro{memberCount !== 1 ? 's' : ''}
            </span>
            <span>
              Estado: <strong style={{ color: project.estado === 'Activo' ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>{project.estado}</strong>
            </span>
          </div>
        </div>

        <div className="project-detail__actions-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
          <button className="btn btn--primary" onClick={() => navigate(`/board?project=${project.id}`)}>
            <Icon name="board" size={16} /> Ver Tablero Kanban
          </button>
          {canManage && (
            <div className="project-detail__actions">
              <button className="btn btn--outline" onClick={openEdit}>
                <Icon name="settings" size={16} /> Editar
              </button>
              <button
                className="btn btn--outline"
                onClick={() => { setDeleteConfirm(''); setModal('delete'); }}
                style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
              >
                Archivar
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="project-detail__sections-grid">
        {/* Members Section */}
        <div className="project-detail__card project-detail__members">
          <div className="project-detail__card-header">
            <h2>Miembros del Equipo ({memberCount})</h2>
            {canManage && (
              <button className="btn btn--primary btn--small" onClick={openAddMember}>
                <Icon name="plus" size={15} /> Invitar miembro
              </button>
            )}
          </div>

          {!members || members.length === 0 ? (
            <div className="project-detail__empty">
              No hay miembros asignados a este proyecto.
            </div>
          ) : (
            <table className="project-detail__table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  {canManage && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id_usuario}>
                    <td className="project-detail__member-name">{m.nombre}</td>
                    <td className="project-detail__member-email">{m.email}</td>
                    <td>
                      {canManage && m.id_usuario !== project.id_creador ? (
                        <select
                          className="project-detail__member-select-role"
                          value={m.rol}
                          onChange={(e) => handleChangeRole(m.id_usuario, e.target.value as RolProyecto)}
                          style={{
                            color: ROLE_COLORS[m.rol],
                            backgroundColor: `${ROLE_COLORS[m.rol]}1a`,
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-pill)',
                            padding: '2px 8px',
                            fontWeight: 'var(--fw-semibold)',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="scrum_master">scrum_master</option>
                          <option value="product_owner">product_owner</option>
                          <option value="developer">developer</option>
                        </select>
                      ) : (
                        <span
                          className="project-detail__member-role"
                          style={{
                            color: ROLE_COLORS[m.rol],
                            backgroundColor: `${ROLE_COLORS[m.rol]}1a`,
                          }}
                        >
                          {m.rol}
                        </span>
                      )}
                    </td>
                    {canManage && (
                      <td>
                        {m.id_usuario !== project.id_creador ? (
                          <button
                            className="project-detail__remove-btn"
                            title="Eliminar miembro"
                            onClick={() => handleRemoveMember(m.id_usuario, m.nombre)}
                          >
                            ✕
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.85em', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>Creador</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Sprints Section */}
        <div className="project-detail__card project-detail__sprints">
          <div className="project-detail__card-header">
            <h2>Sprints del Proyecto</h2>
            {canManage && (
              <button className="btn btn--primary btn--small" onClick={openCreateSprint}>
                <Icon name="plus" size={15} /> Iniciar Sprint
              </button>
            )}
          </div>

          {sprintsLoading ? (
            <div className="project-detail__empty">Cargando sprints…</div>
          ) : sprints.length === 0 ? (
            <div className="project-detail__empty">
              No hay sprints creados en este proyecto.
            </div>
          ) : (
            <div className="project-detail__sprints-list">
              {sprints.map((s) => (
                <div key={s.id} className="project-detail__sprint-item">
                  <div className="project-detail__sprint-info">
                    <h3 className="project-detail__sprint-title">
                      {s.nombre}
                      <span
                        className={`project-detail__sprint-status project-detail__sprint-status--${s.estado.toLowerCase()}`}
                      >
                        {s.estado}
                      </span>
                    </h3>
                    <p className="project-detail__sprint-dates">
                      <Icon name="board" size={12} /> {s.fecha_inicio} al {s.fecha_fin}
                    </p>
                  </div>
                  {canManage && s.estado === 'Activo' && (
                    <button
                      className="btn btn--outline btn--small"
                      style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                      onClick={() => handleCloseSprint(s.id, s.nombre)}
                    >
                      Cerrar Sprint
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ============ MODAL: Edit Project ============ */}
      {modal === 'edit' && createPortal(
        <div className="project-detail__overlay" onClick={() => setModal('none')}>
          <form
            className="project-detail__modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleEdit}
          >
            <h2 className="project-detail__modal-title">Editar Proyecto</h2>
            {editError && <div className="project-detail__error">{editError}</div>}

            <label className="project-detail__field">
              <span>Nombre del Proyecto</span>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </label>

            <label className="project-detail__field">
              <span>Descripción</span>
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={3}
              />
            </label>

            <label className="project-detail__field">
              <span>Color Identificador</span>
              <input
                type="color"
                value={editColor}
                onChange={(e) => setEditColor(e.target.value)}
                style={{ padding: '0px', height: '40px', cursor: 'pointer' }}
              />
            </label>

            <label className="project-detail__field">
              <span>Estado</span>
              <select value={editEstado} onChange={(e) => setEditEstado(e.target.value)}>
                <option value="Activo">Activo</option>
                <option value="Pausado">Pausado</option>
              </select>
            </label>

            <div className="project-detail__modal-actions">
              <button
                type="button"
                className="btn btn--outline"
                onClick={() => setModal('none')}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn--primary" disabled={editing}>
                {editing ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* ============ MODAL: Archivar/Eliminar Project ============ */}
      {modal === 'delete' && createPortal(
        <div className="project-detail__overlay" onClick={() => setModal('none')}>
          <div
            className="project-detail__modal project-detail__modal--danger"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="project-detail__modal-title" style={{ color: 'var(--color-error)' }}>
              Archivar Proyecto
            </h2>
            <p>
              Esta acción marcará el proyecto <strong>{project.nombre}</strong> como{' '}
              <strong>Archivado</strong>. Dejará de listarse en la plataforma.
            </p>
            <p>
              Por favor escribe <strong>ELIMINAR</strong> para confirmar.
            </p>

            {deleteError && <div className="project-detail__error">{deleteError}</div>}

            <input
              type="text"
              className="project-detail__confirm-input"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="Escribe ELIMINAR"
            />

            <div className="project-detail__modal-actions">
              <button
                type="button"
                className="btn btn--outline"
                onClick={() => setModal('none')}
              >
                Cancelar
              </button>
              <button
                className="btn btn--primary"
                style={{ backgroundColor: 'var(--color-error)', color: '#fff' }}
                disabled={deleteConfirm !== 'ELIMINAR' || deleting}
                onClick={handleDelete}
              >
                {deleting ? 'Archivando…' : 'Archivar proyecto'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ============ MODAL: Invitar Miembro ============ */}
      {modal === 'add-member' && createPortal(
        <div className="project-detail__overlay" onClick={() => setModal('none')}>
          <form
            className="project-detail__modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleAddMember}
          >
            <h2 className="project-detail__modal-title">Invitar Miembro al Equipo</h2>
            {addError && <div className="project-detail__error">{addError}</div>}

            <label className="project-detail__field">
              <span>Colaborador a invitar</span>
              {usersLoading ? (
                <div className="project-detail__empty-users">Cargando colaboradores…</div>
              ) : usersError ? (
                <div className="project-detail__error">{usersError}</div>
              ) : usersList.length === 0 ? (
                <div className="project-detail__empty-users">
                  No hay usuarios pre-registrados en el sistema
                </div>
              ) : (
                <select
                  className="project-detail__select"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                >
                  <option value="">Selecciona un colaborador</option>
                  {usersList.map((u) => (
                    <option key={u.id} value={u.email}>
                      {u.nombre_completo} ({u.email})
                    </option>
                  ))}
                </select>
              )}
            </label>

            <label className="project-detail__field">
              <span>Rol en el Proyecto</span>
              <select
                className="project-detail__select"
                value={selectedRol}
                onChange={(e) => setSelectedRol(e.target.value as RolProyecto)}
                required
              >
                <option value="developer">developer</option>
                <option value="product_owner">product_owner</option>
                <option value="scrum_master">scrum_master</option>
              </select>
            </label>

            <div className="project-detail__modal-actions">
              <button
                type="button"
                className="btn btn--outline"
                onClick={() => setModal('none')}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={adding || usersLoading || !!usersError || usersList.length === 0 || !inviteEmail}
              >
                {adding ? 'Enviando invitación…' : 'Enviar Invitación'}
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* ============ MODAL: Iniciar Sprint ============ */}
      {modal === 'create-sprint' && createPortal(
        <div className="project-detail__overlay" onClick={() => setModal('none')}>
          <form
            className="project-detail__modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleCreateSprint}
          >
            <h2 className="project-detail__modal-title">Iniciar Nuevo Sprint</h2>
            {sprintError && <div className="project-detail__error">{sprintError}</div>}

            <label className="project-detail__field">
              <span>Nombre del Sprint</span>
              <input
                type="text"
                value={sprintName}
                onChange={(e) => setSprintName(e.target.value)}
                placeholder="ej. Sprint 1 - Core MVP"
                required
              />
            </label>

            <label className="project-detail__field">
              <span>Fecha de Inicio</span>
              <input
                type="date"
                value={sprintStart}
                onChange={(e) => setSprintStart(e.target.value)}
                required
              />
            </label>

            <label className="project-detail__field">
              <span>Fecha de Fin</span>
              <input
                type="date"
                value={sprintEnd}
                onChange={(e) => setSprintEnd(e.target.value)}
                required
              />
            </label>

            <div className="project-detail__modal-actions">
              <button
                type="button"
                className="btn btn--outline"
                onClick={() => setModal('none')}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={sprintSaving || !sprintName.trim()}
              >
                {sprintSaving ? 'Iniciando…' : 'Iniciar Sprint'}
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}
    </div>
  );
}
