import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import { getErrorMessage } from '../../../shared/api/api';
import { useAuth } from '../../../shared/auth/AuthContext';
import type { Project, User, RolProyecto } from '../../../shared/types';
import {
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  listUsers,
} from '../api/projectsApi';
import './ProjectDetailPage.css';

const ROLE_COLORS: Record<string, string> = {
  Manager: '#6366F1',
  Developer: '#3B82F6',
  Viewer: '#94A3B8',
};

type MemberModal = 'none' | 'edit' | 'delete' | 'add-member';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [modal, setModal] = useState<MemberModal>('none');

  // Edit modal fields
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editError, setEditError] = useState('');
  const [editing, setEditing] = useState(false);

  // Delete modal fields
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Add member modal fields
  const [usersList, setUsersList] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRol, setSelectedRol] = useState<RolProyecto>('Developer');
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);

  // Helpers
  const projectRole = project?.members?.find((m) => m.user_id === user?.id)?.rol;

  const canManage =
    user?.rol_global === 'Admin' || projectRole === 'Manager';

  const load = () => {
    if (!id) return;
    setLoading(true);
    getProject(id)
      .then(setProject)
      .catch((err) => setError(getErrorMessage(err, 'No se pudo cargar el proyecto')))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  // ---- Edit handlers ----
  const openEdit = () => {
    if (!project) return;
    setEditName(project.name);
    setEditDesc(project.description ?? '');
    setEditError('');
    setModal('edit');
  };

  const handleEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setEditError('');
    setEditing(true);
    try {
      const updated = await updateProject(id, {
        name: editName.trim(),
        description: editDesc.trim() || undefined,
      });
      setProject(updated);
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

  // ---- Add member handlers ----
  const openAddMember = async () => {
    setAddError('');
    setSelectedUserId('');
    setSelectedRol('Developer');
    setModal('add-member');

    setUsersLoading(true);
    setUsersError('');
    try {
      const users = await listUsers();
      setUsersList(users);
      if (users.length > 0) setSelectedUserId(users[0].id);
    } catch (err) {
      setUsersError(getErrorMessage(err, 'No se pudieron cargar los usuarios'));
    } finally {
      setUsersLoading(false);
    }
  };

  const handleAddMember = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !selectedUserId) return;
    setAddError('');
    setAdding(true);
    try {
      await addMember(id, selectedUserId, selectedRol);
      setModal('none');
      load();
    } catch (err) {
      setAddError(getErrorMessage(err, 'No se pudo agregar el miembro'));
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = (userId: string, name: string) => {
    if (!id) return;
    if (!window.confirm(`¿Eliminar a "${name}" del proyecto?`)) return;
    removeMember(id, userId)
      .then(() => load())
      .catch((err) => {
        alert(getErrorMessage(err, 'No se pudo eliminar al miembro'));
        load();
      });
  };

  // ---- Loading skeleton ----
  if (loading) {
    return (
      <div className="project-detail">
        <div className="project-detail__skeleton">
          <div className="project-detail__skeleton-row" style={{ width: '40%' }} />
          <div className="project-detail__skeleton-row" style={{ width: '70%' }} />
          <div className="project-detail__skeleton-row" style={{ width: '55%' }} />
        </div>
      </div>
    );
  }

  // ---- Error state ----
  if (error || !project) {
    return (
      <div className="project-detail">
        <div className="project-detail__error">{error || 'Proyecto no encontrado'}</div>
        <button className="btn btn--outline" onClick={() => navigate('/projects')}>
          Volver a proyectos
        </button>
      </div>
    );
  }

  const memberCount = project.members?.length ?? project.member_count ?? 0;

  return (
    <div className="project-detail">
      {/* Back button */}
      <button className="project-detail__back" onClick={() => navigate('/projects')}>
        <span aria-hidden="true" style={{ fontSize: '1.2em' }}>←</span>
        Volver a proyectos
      </button>

      {/* Header */}
      <div className="project-detail__header">
        <div className="project-detail__info">
          <h1 className="project-detail__title">
            {project.name}
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
            {project.description || 'Sin descripción'}
          </p>
          <div className="project-detail__meta">
            <span>
              <Icon name="board" size={14} /> Creado el {new Date(project.created_at).toLocaleDateString('es-PE')}
            </span>
            <span>
              <Icon name="users" size={14} /> {memberCount} miembro{memberCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

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
              Eliminar
            </button>
          </div>
        )}
      </div>

      {/* Members Section */}
      <div className="project-detail__members">
        <div className="project-detail__members-header">
          <h2>Miembros ({memberCount})</h2>
          {canManage && (
            <button className="btn btn--primary btn--small" onClick={openAddMember}>
              <Icon name="plus" size={15} /> Agregar miembro
            </button>
          )}
        </div>

        {!project.members || project.members.length === 0 ? (
          <div className="project-detail__empty-members">
            No hay miembros en este proyecto.
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
              {project.members.map((m) => (
                <tr key={m.user_id}>
                  <td className="project-detail__member-name">{m.nombre_completo}</td>
                  <td className="project-detail__member-email">{m.email}</td>
                  <td>
                    <span
                      className="project-detail__member-role"
                      style={{
                        color: ROLE_COLORS[m.rol],
                        backgroundColor: `${ROLE_COLORS[m.rol]}1a`,
                      }}
                    >
                      {m.rol}
                    </span>
                  </td>
                  {canManage && (
                    <td>
                      <button
                        className="project-detail__remove-btn"
                        title="Eliminar miembro"
                        onClick={() => handleRemoveMember(m.user_id, m.nombre_completo)}
                      >
                        ✕
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ============ MODAL: Edit Project ============ */}
      {modal === 'edit' && (
        <div className="project-detail__overlay" onClick={() => setModal('none')}>
          <form
            className="project-detail__modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleEdit}
          >
            <h2 className="project-detail__modal-title">Editar proyecto</h2>
            {editError && <div className="project-detail__error">{editError}</div>}

            <label className="project-detail__field">
              <span>Nombre</span>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nombre del proyecto"
                minLength={3}
                required
              />
            </label>

            <label className="project-detail__field">
              <span>Descripción (opcional)</span>
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="¿De qué trata el proyecto?"
                rows={3}
              />
            </label>

            <div className="project-detail__modal-actions">
              <button type="button" className="btn btn--outline" onClick={() => setModal('none')}>
                Cancelar
              </button>
              <button type="submit" className="btn btn--primary" disabled={editing}>
                {editing ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============ MODAL: Delete Project ============ */}
      {modal === 'delete' && (
        <div className="project-detail__overlay" onClick={() => { setModal('none'); setDeleteError(''); }}>
          <div
            className="project-detail__modal project-detail__modal--delete"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="project-detail__modal-title">Eliminar proyecto</h2>
            {deleteError && <div className="project-detail__error">{deleteError}</div>}

            <div className="project-detail__delete-warning">
              Esta acción eliminará el proyecto y todos sus tableros, tareas y sprints
              de forma permanente. No se puede deshacer.
            </div>

            <label className="project-detail__field">
              <span>
                Escribe <strong>ELIMINAR</strong> para confirmar
              </span>
              <input
                className="project-detail__delete-input"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="ELIMINAR"
              />
            </label>

            <div className="project-detail__modal-actions">
              <button
                type="button"
                className="btn btn--outline"
                onClick={() => { setModal('none'); setDeleteError(''); }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn"
                disabled={deleteConfirm !== 'ELIMINAR' || deleting}
                onClick={handleDelete}
                style={{
                  backgroundColor: 'var(--color-error)',
                  color: '#FFFFFF',
                  opacity: deleteConfirm !== 'ELIMINAR' ? 0.5 : 1,
                }}
              >
                {deleting ? 'Eliminando…' : 'Eliminar proyecto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ MODAL: Add Member ============ */}
      {modal === 'add-member' && (
        <div className="project-detail__overlay" onClick={() => setModal('none')}>
          <form
            className="project-detail__modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleAddMember}
          >
            <h2 className="project-detail__modal-title">Agregar miembro</h2>
            {addError && <div className="project-detail__error">{addError}</div>}

            <label className="project-detail__field">
              <span>Usuario</span>
              {usersLoading ? (
                <div className="project-detail__empty-users">Cargando usuarios…</div>
              ) : usersError ? (
                <div className="project-detail__error">{usersError}</div>
              ) : usersList.length === 0 ? (
                <div className="project-detail__empty-users">
                  No hay usuarios disponibles
                </div>
              ) : (
                <select
                  className="project-detail__select"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                >
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre_completo} ({u.email})
                    </option>
                  ))}
                </select>
              )}
            </label>

            <label className="project-detail__field">
              <span>Rol</span>
              <select
                className="project-detail__select"
                value={selectedRol}
                onChange={(e) => setSelectedRol(e.target.value as RolProyecto)}
                required
              >
                <option value="Manager">Manager</option>
                <option value="Developer">Developer</option>
                <option value="Viewer">Viewer</option>
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
                disabled={adding || usersLoading || !!usersError || usersList.length === 0}
              >
                {adding ? 'Agregando…' : 'Agregar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
