/**
 * ChangePasswordPage — Flujo forzado de cambio de contraseña (RN-31).
 *
 * Se muestra automáticamente después del login cuando `cambiar_password=true`:
 *   - Primer inicio de sesión
 *   - Password expirada (>90 días sin cambiar)
 *
 * El endpoint PUT /api/v1/auth/me/change-password está formalizado,
 * esta página realiza el cambio y redirige al dashboard.
 */
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../shared/api/api';
import { getErrorMessage } from '../../../shared/api/api';
import Icon, { Logo } from '../../../shared/components/Icon';
import './ChangePasswordPage.css';

export default function ChangePasswordPage() {
  const navigate            = useNavigate();
  const [current, setCurrent]       = useState('');
  const [next, setNext]             = useState('');
  const [confirm, setConfirm]       = useState('');
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState(false);
  const [loading, setLoading]       = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext]     = useState(false);

  const validate = (): string => {
    if (!current)                       return 'Ingresa tu contraseña actual';
    if (next.length < 8)                return 'La nueva contraseña debe tener al menos 8 caracteres';
    if (!/[A-Z]/.test(next))            return 'La nueva contraseña debe incluir al menos 1 mayúscula';
    if (!/[a-z]/.test(next))            return 'La nueva contraseña debe incluir al menos 1 minúscula';
    if (!/\d/.test(next))               return 'La nueva contraseña debe incluir al menos 1 número';
    if (next === current)               return 'La nueva contraseña no puede ser igual a la actual';
    if (next !== confirm)               return 'Las contraseñas no coinciden';
    return '';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      await api.put('/auth/me/change-password', {
        current_password: current,
        new_password: next,
      });
      setSuccess(true);
      // Redirigir al dashboard tras 2 segundos
      setTimeout(() => navigate('/', { replace: true }), 2000);
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo cambiar la contraseña'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-pwd">
      <div className="change-pwd__card">
        {/* Logo */}
        <div className="change-pwd__logo">
          <span className="change-pwd__logo-mark">
            <Logo size={22} color="var(--color-brand, #6366F1)" />
          </span>
          <span className="change-pwd__logo-text">Kanbix</span>
        </div>

        {/* Cabecera */}
        <div className="change-pwd__header">
          <div className="change-pwd__icon">
            <Icon name="lock" size={28} />
          </div>
          <h1 className="change-pwd__title">Cambia tu contraseña</h1>
          <p className="change-pwd__subtitle">
            Por seguridad debes establecer una nueva contraseña antes de continuar.
          </p>
        </div>

        {success ? (
          <div className="change-pwd__success">
            <span className="change-pwd__success-icon">
              <Icon name="check-circle" size={32} />
            </span>
            <p>¡Contraseña actualizada! Redirigiendo al dashboard…</p>
          </div>
        ) : (
          <form className="change-pwd__form" onSubmit={handleSubmit}>
            {error && (
              <div className="change-pwd__error" role="alert">{error}</div>
            )}

            {/* Contraseña actual */}
            <label className="change-pwd__field">
              <span>Contraseña actual</span>
              <div className="change-pwd__input-wrap">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="change-pwd__toggle"
                  onClick={() => setShowCurrent((s) => !s)}
                  aria-label={showCurrent ? 'Ocultar' : 'Mostrar'}
                >
                  <Icon name={showCurrent ? 'eye-off' : 'eye'} size={18} />
                </button>
              </div>
            </label>

            {/* Nueva contraseña */}
            <label className="change-pwd__field">
              <span>Nueva contraseña</span>
              <div className="change-pwd__input-wrap">
                <input
                  type={showNext ? 'text' : 'password'}
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  placeholder="Mín. 8 car., mayúscula, minúscula y número"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="change-pwd__toggle"
                  onClick={() => setShowNext((s) => !s)}
                  aria-label={showNext ? 'Ocultar' : 'Mostrar'}
                >
                  <Icon name={showNext ? 'eye-off' : 'eye'} size={18} />
                </button>
              </div>
              {/* Indicador de fortaleza */}
              <PasswordStrength password={next} />
            </label>

            {/* Confirmar contraseña */}
            <label className="change-pwd__field">
              <span>Confirmar nueva contraseña</span>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
              {confirm && next !== confirm && (
                <small className="change-pwd__mismatch">Las contraseñas no coinciden</small>
              )}
            </label>

            <button
              type="submit"
              className="change-pwd__submit"
              disabled={loading}
            >
              {loading ? 'Cambiando…' : 'Cambiar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Sub-componente: indicador de fortaleza de contraseña
// --------------------------------------------------------------------------

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const checks = [
    { label: 'Mín. 8 caracteres',  ok: password.length >= 8 },
    { label: '1 mayúscula',         ok: /[A-Z]/.test(password) },
    { label: '1 minúscula',         ok: /[a-z]/.test(password) },
    { label: '1 número',            ok: /\d/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const levels = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Fuerte'];
  const colors = ['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#16a34a'];

  return (
    <div className="change-pwd__strength">
      <div className="change-pwd__strength-bars">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="change-pwd__strength-bar"
            style={{ background: i < score ? colors[score] : 'var(--color-border, #E5E7EB)' }}
          />
        ))}
      </div>
      <span className="change-pwd__strength-label" style={{ color: colors[score] }}>
        {levels[score]}
      </span>
      <ul className="change-pwd__strength-checks">
        {checks.map((c) => (
          <li key={c.label} className={c.ok ? 'ok' : ''}>
            <span className="change-pwd__strength-check-icon">
              <Icon name={c.ok ? 'check-circle' : 'square'} size={14} />
            </span>
            <span>{c.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
