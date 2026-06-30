import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon, { Logo } from '../../../shared/components/Icon';
import { useAuth } from '../../../shared/auth/AuthContext';
import { getErrorMessage } from '../../../shared/api/api';
import './LoginPage.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('admin@kanbix.com');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string })?.from ?? '/';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo iniciar sesión'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      {/* Panel de marca */}
      <aside className="login__brand">
        <div className="login__brand-logo">
          <span className="login__brand-mark">
            <Logo size={26} color="#FFFFFF" />
          </span>
          Kanbix
        </div>
        <div className="login__brand-copy">
          <h1 className="login__brand-title">Gestiona tus sprints con claridad.</h1>
          <p className="login__brand-sub">
            Tableros Kanban colaborativos, planificación y métricas en tiempo real.
          </p>
        </div>
        <div className="login__brand-cols" aria-hidden="true">
          <span style={{ height: '40%' }} />
          <span style={{ height: '75%' }} />
          <span style={{ height: '55%' }} />
          <span style={{ height: '90%' }} />
        </div>
      </aside>

      {/* Formulario */}
      <main className="login__panel">
        <form className="login__form" onSubmit={handleSubmit}>
          <h2 className="login__title">Iniciar sesión</h2>
          <p className="login__subtitle">Ingresa tus credenciales para continuar</p>

          {error && (
            <div className="login__error" role="alert">
              {error}
            </div>
          )}

          <label className="login__field">
            <span className="login__label">Correo electrónico</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@kanbix.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="login__field">
            <span className="login__label">Contraseña</span>
            <div className="login__password">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="login__toggle"
                onClick={() => setShowPass((s) => !s)}
                aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <Icon name="eye" size={18} />
              </button>
            </div>
          </label>

          <button type="submit" className="login__submit" disabled={loading}>
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>

          <p className="login__hint">
            Cuenta de prueba: <strong>admin@kanbix.com</strong> / <strong>AdminNew123</strong>
          </p>
        </form>
      </main>
    </div>
  );
}
