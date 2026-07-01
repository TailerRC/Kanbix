/**
 * AdminUsersPage — Gestión de usuarios del sistema (solo Admin).
 *
 * Funcionalidades:
 *   - Listar usuarios con paginación
 *   - Crear nuevo usuario (modal)
 *   - Desbloquear cuenta bloqueada por intentos (RN-32)
 *   - Cambiar rol global (RN-07)
 *
 * Accesible en: /admin/users (protegida por rol Admin en App.tsx)
 */
import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { getErrorMessage } from '../../../shared/api/api';
import { useAuth } from '../../../shared/auth/AuthContext';
import Icon from '../../../shared/components/Icon';
import type { RolGlobal } from '../../../shared/types';
import './AdminUsersPage.css';

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

const ROL_LABELS: Record<RolGlobal, { label: string; color: string }> = {
  Admin:     { label: 'Admin',     color: '#DC2626' },
  Manager:   { label: 'Manager',   color: '#D97706' },
  Developer: { label: 'Developer', color: '#6366F1' },
  Viewer:    { label: 'Viewer',    color: '#6B7280' },
};

function StatusDot({ activo, bloqueado }: { activo: boolean; bloqueado: boolean }) {
  const cls = !activo ? 'inactive' : bloqueado ? 'locked' : 'active';
  const title = !activo ? 'Desactivada' : bloqueado ? 'Bloqueada' : 'Activa';
  return <span className={`admin-users__dot admin-users__dot--${cls}`} title={title} />;
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// --------------------------------------------------------------------------
// Modal de creación
// --------------------------------------------------------------------------

interface CreateModalProps {
  onClose: () => void;
  onSubmit: (data: { email: string; password: string; nombre_completo: string; rol_global: RolGlobal }) => Promise<void>;
}

function CreateUserModal({ onClose, onSubmit }: CreateModalProps) {
  const [email, setEmail]           = useState('');
  const [nombre, setNombre]         = useState('');
  const [password, setPassword]     = useState('');
  const [rol, setRol]               = useState<RolGlobal>('Developer');
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [showPass, setShowPass]     = useState(false);
  const [emailError, setEmailError] = useState('');

  const nombreRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // H7: autoFocus en el primer input al abrir el modal
  useEffect(() => {
    nombreRef.current?.focus();
  }, []);

  // H4: focus trap + Escape key
  useEffect(() => {
    const modal = overlayRef.current;
    if (!modal) return;

    const FOCUSABLE = 'input:not([type="hidden"]), select, textarea, button, [tabindex]:not([tabindex="-1"])';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const focusable = modal.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Validaciones en tiempo real de contraseña (H5 - Prevención de Errores)
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber    = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  // Validación inline de email (H5)
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = email.length === 0 || EMAIL_RE.test(email);
  const showEmailError = email.length > 0 && !isEmailValid;

  const passwordRulesCount = [hasMinLength, hasUppercase, hasLowercase, hasNumber].filter(Boolean).length;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setEmailError('');

    if (!nombre.trim()) {
      setError('El nombre completo es obligatorio.');
      nombreRef.current?.focus();
      return;
    }
    if (!isEmailValid) {
      setError('Ingresá un correo electrónico válido.');
      return;
    }
    if (!isPasswordValid) {
      setError('La contraseña debe cumplir con todos los requisitos.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onSubmit({ email, password, nombre_completo: nombre, rol_global: rol });
      onClose();
    } catch (err) {
      const msg = getErrorMessage(err, 'No se pudo crear el usuario');
      // Parsear si el error es del email ya registrado → mostrarlo inline
      if (msg.toLowerCase().includes('email') && (msg.toLowerCase().includes('registr') || msg.toLowerCase().includes('exist'))) {
        setEmailError(msg);
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal__overlay" onClick={onClose} ref={overlayRef}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__header">
          <h2 className="admin-modal__title">Nuevo usuario</h2>
          <button className="admin-modal__close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {error && !emailError && <div className="admin-modal__error" role="alert">{error}</div>}

        <form className="admin-modal__form" onSubmit={handleSubmit} noValidate>
          <label className="admin-modal__field">
            <span>Nombre completo</span>
            <input
              ref={nombreRef}
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Juan Pérez"
              required
              minLength={1}
            />
          </label>

          <div className={`admin-modal__field ${showEmailError || emailError ? 'admin-modal__field--has-error' : ''}`}>
            <span>Correo electrónico</span>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
              placeholder="usuario@kanbix.com"
              required
              aria-invalid={showEmailError || !!emailError}
              aria-describedby={showEmailError ? 'email-error-hint' : undefined}
            />
            {showEmailError && (
              <small id="email-error-hint" className="admin-modal__field-error">
                Formato de correo inválido — ejemplo: usuario@kanbix.com
              </small>
            )}
            {emailError && !showEmailError && (
              <small className="admin-modal__field-error">{emailError}</small>
            )}
          </div>

          <div className="admin-modal__field">
            <span>Contraseña inicial</span>
            <div className="admin-modal__password-input-wrapper">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresar contraseña inicial"
                required
                minLength={8}
              />
              <button
                type="button"
                className="admin-modal__password-toggle"
                onClick={() => setShowPass(!showPass)}
                aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                tabIndex={0}
              >
                <Icon name={showPass ? 'eye-off' : 'eye'} size={16} />
              </button>
            </div>

            {/* H5 + H10: Retroalimentación visual de reglas con progreso */}
            <div className="admin-modal__password-strength">
              <div
                className="admin-modal__password-strength-bar"
                style={{ width: `${(passwordRulesCount / 4) * 100}%` }}
              />
            </div>
            <div className="admin-modal__password-rules">
              <div className={`admin-modal__rule ${hasMinLength ? 'admin-modal__rule--valid' : ''}`}>
                <span className="admin-modal__rule-icon">{hasMinLength ? '✓' : '○'}</span>
                <span>Mínimo 8 caracteres</span>
              </div>
              <div className={`admin-modal__rule ${hasUppercase ? 'admin-modal__rule--valid' : ''}`}>
                <span className="admin-modal__rule-icon">{hasUppercase ? '✓' : '○'}</span>
                <span>Al menos una mayúscula</span>
              </div>
              <div className={`admin-modal__rule ${hasLowercase ? 'admin-modal__rule--valid' : ''}`}>
                <span className="admin-modal__rule-icon">{hasLowercase ? '✓' : '○'}</span>
                <span>Al menos una minúscula</span>
              </div>
              <div className={`admin-modal__rule ${hasNumber ? 'admin-modal__rule--valid' : ''}`}>
                <span className="admin-modal__rule-icon">{hasNumber ? '✓' : '○'}</span>
                <span>Al menos un número</span>
              </div>
            </div>
            <small>El usuario deberá cambiarla en su primer inicio de sesión.</small>
          </div>

          <label className="admin-modal__field">
            <span>Rol global</span>
            <select value={rol} onChange={(e) => setRol(e.target.value as RolGlobal)}>
              <option value="Developer">Developer</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>
          </label>

          <div className="admin-modal__actions">
            <button type="button" className="admin-modal__btn--cancel" onClick={onClose}>
              Cancelar
            </button>
            <button 
              type="submit" 
              className="admin-modal__btn--submit" 
              disabled={loading || !isPasswordValid}
            >
              {loading ? 'Creando…' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Modal de edición
// --------------------------------------------------------------------------

import type { UserListItem as AuthUserListItem, AdminUpdateUserPayload } from '../api/authApi';

interface EditModalProps {
  user: AuthUserListItem;
  onClose: () => void;
  onSubmit: (userId: string, data: AdminUpdateUserPayload) => Promise<void>;
}

function EditUserModal({ user, onClose, onSubmit }: EditModalProps) {
  const { user: currentUser }       = useAuth();
  const [email, setEmail]           = useState(user.email);
  const [nombre, setNombre]         = useState(user.nombre_completo);
  const [password, setPassword]     = useState('');
  const [rol, setRol]               = useState<RolGlobal>(user.rol_global);
  const [activo, setActivo]         = useState(user.activo);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload: AdminUpdateUserPayload = {};
      if (nombre !== user.nombre_completo) payload.nombre_completo = nombre;
      if (email !== user.email) payload.email = email;
      if (password) payload.password = password;
      if (rol !== user.rol_global) payload.rol_global = rol;
      if (activo !== user.activo) payload.activo = activo;

      if (Object.keys(payload).length === 0) {
        onClose();
        return;
      }

      await onSubmit(user.id, payload);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo actualizar el usuario'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-modal__overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__header">
          <h2 className="admin-modal__title">Editar usuario</h2>
          <button className="admin-modal__close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {error && <div className="admin-modal__error">{error}</div>}

        <form className="admin-modal__form" onSubmit={handleSubmit}>
          <label className="admin-modal__field">
            <span>Nombre completo</span>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Juan Pérez"
              required
              minLength={1}
            />
          </label>

          <label className="admin-modal__field">
            <span>Correo electrónico</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@kanbix.com"
              required
            />
          </label>

          <label className="admin-modal__field">
            <span>Nueva contraseña (dejar en blanco para conservar)</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 car., mayúscula, minúscula y número"
            />
            {password && <small>El usuario deberá cambiarla en su primer inicio de sesión.</small>}
          </label>

          <label className="admin-modal__field">
            <span>Rol global</span>
            <select value={rol} onChange={(e) => setRol(e.target.value as RolGlobal)} disabled={user.id === currentUser?.id}>
              <option value="Viewer">Viewer</option>
              <option value="Developer">Developer</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>
          </label>

          <label className="admin-modal__field admin-modal__field--checkbox">
            <input
              type="checkbox"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
              disabled={user.id === currentUser?.id}
            />
            <span>Cuenta activa / habilitada</span>
          </label>

          <div className="admin-modal__actions">
            <button type="button" className="admin-modal__btn--cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="admin-modal__btn--submit" disabled={loading}>
              {loading ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Página principal
// --------------------------------------------------------------------------

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const {
    users, total, page, limit, loading, error,
    setPage, refresh, createUser, unlockUser, changeRole, updateUser,
  } = useAdminUsers(20);

  const [showModal, setShowModal]     = useState(false);
  const [userToEdit, setUserToEdit]   = useState<AuthUserListItem | null>(null);
  const [actionError, setActionError] = useState('');
  const totalPages = Math.ceil(total / limit) || 1;

  const handleUnlock = async (userId: string) => {
    setActionError('');
    try {
      await unlockUser(userId);
    } catch (err) {
      setActionError(getErrorMessage(err, 'No se pudo desbloquear la cuenta'));
    }
  };

  const handleRoleChange = async (userId: string, rol: RolGlobal) => {
    setActionError('');
    try {
      await changeRole(userId, rol);
    } catch (err) {
      setActionError(getErrorMessage(err, 'No se pudo cambiar el rol'));
    }
  };

  const handleToggleActive = async (userId: string, currentActivo: boolean) => {
    setActionError('');
    try {
      await updateUser(userId, { activo: !currentActivo });
    } catch (err) {
      setActionError(getErrorMessage(err, `No se pudo ${currentActivo ? 'desactivar' : 'activar'} al usuario`));
    }
  };

  const handleEditSubmit = async (userId: string, payload: AdminUpdateUserPayload) => {
    await updateUser(userId, payload);
  };

  return (
    <div className="admin-users">
      {/* Header */}
      <div className="admin-users__header">
        <div>
          <h1 className="admin-users__title">Gestión de Usuarios</h1>
          <p className="admin-users__subtitle">
            {total} {total === 1 ? 'usuario registrado' : 'usuarios registrados'}
          </p>
        </div>
        <div className="admin-users__header-actions">
          <button
            className="admin-users__btn-refresh"
            onClick={refresh}
            disabled={loading}
            aria-label="Actualizar lista"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10" /><polyline points="23 20 23 14 17 14" />
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
            </svg>
          </button>
          <button
            className="admin-users__btn-create"
            onClick={() => setShowModal(true)}
          >
            + Nuevo usuario
          </button>
        </div>
      </div>

      {/* Errores de acción */}
      {(error || actionError) && (
        <div className="admin-users__error" role="alert">
          {error || actionError}
        </div>
      )}

      {/* Leyenda de estado */}
      <div className="admin-users__legend">
        <span><span className="admin-users__dot admin-users__dot--active" /> Activa</span>
        <span><span className="admin-users__dot admin-users__dot--locked" /> Bloqueada</span>
        <span><span className="admin-users__dot admin-users__dot--inactive" /> Desactivada</span>
      </div>

      {/* Tabla */}
      <div className="admin-users__table-wrap">
        {loading && !users.length ? (
          <div className="admin-users__loading">
            <div className="admin-users__spinner" />
            Cargando usuarios…
          </div>
        ) : (
          <table className="admin-users__table">
            <thead>
              <tr>
                <th>Estado</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Creado</th>
                <th>Último acceso</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className={u.bloqueado ? 'admin-users__row--locked' : ''}>
                  <td>
                    <StatusDot activo={u.activo} bloqueado={u.bloqueado} />
                  </td>
                  <td className="admin-users__name">{u.nombre_completo}</td>
                  <td className="admin-users__email">{u.email}</td>
                  <td>
                    <select
                      className="admin-users__role-select"
                      value={u.rol_global}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as RolGlobal)}
                      style={{ '--badge-color': ROL_LABELS[u.rol_global]?.color } as React.CSSProperties}
                      disabled={u.id === currentUser?.id}
                    >
                      <option value="Viewer">Viewer</option>
                      <option value="Developer">Developer</option>
                      <option value="Manager">Manager</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </td>
                  <td className="admin-users__date">{formatDate(u.fecha_creacion)}</td>
                  <td className="admin-users__date">{formatDate(u.ultimo_acceso)}</td>
                  <td>
                    <div className="admin-users__actions-cell">
                      <button
                        className="admin-users__action-btn admin-users__action-btn--edit"
                        onClick={() => setUserToEdit(u)}
                        title="Editar usuario"
                      >
                        <Icon name="edit" size={14} />
                      </button>

                      <button
                        className={`admin-users__action-btn admin-users__action-btn--power admin-users__action-btn--power-${u.activo ? 'active' : 'inactive'}`}
                        onClick={() => handleToggleActive(u.id, u.activo)}
                        title={u.id === currentUser?.id ? "No podés desactivar tu propia cuenta" : (u.activo ? "Desactivar cuenta" : "Activar cuenta")}
                        disabled={u.id === currentUser?.id}
                      >
                        <Icon name="power" size={14} />
                      </button>

                      {u.bloqueado && (
                        <button
                          className="admin-users__action-btn admin-users__action-btn--unlock"
                          onClick={() => handleUnlock(u.id)}
                          title="Desbloquear cuenta (RN-32)"
                        >
                          <Icon name="unlock" size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && !users.length && (
                <tr>
                  <td colSpan={7} className="admin-users__empty">
                    No hay usuarios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="admin-users__pagination">
          <button
            className="admin-users__page-btn"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1 || loading}
          >
            ← Anterior
          </button>
          <span className="admin-users__page-info">
            Página {page} de {totalPages}
          </span>
          <button
            className="admin-users__page-btn"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages || loading}
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* Modal creación */}
      {showModal && (
        <CreateUserModal
          onClose={() => setShowModal(false)}
          onSubmit={createUser}
        />
      )}

      {/* Modal edición */}
      {userToEdit && (
        <EditUserModal
          user={userToEdit}
          onClose={() => setUserToEdit(null)}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  );
}
