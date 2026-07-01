import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import { useAuth } from '../../../shared/auth/AuthContext';
import { getErrorMessage } from '../../../shared/api/api';
import kanbixLogo from '../../../assets/kanbix-logo.png';
import loginHero from '../../../assets/login-hero.png';
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
        <div className="login__brand-overlay" />
        <img src={loginHero} alt="" className="login__brand-bg" aria-hidden="true" />

        {/* Logo en la esquina superior izquierda */}
        <div className="login__brand-header">
          <img src={kanbixLogo} alt="Kanbix" className="login__brand-logo-img" />
        </div>

        {/* Copy central */}
        <div className="login__brand-copy">
          <div className="login__brand-badge">
            <Icon name="check-square" size={14} />
            Gestión ágil de proyectos
          </div>
          <h1 className="login__brand-title">Lleva tus sprints<br />al siguiente nivel.</h1>
          <p className="login__brand-sub">
            Tableros Kanban colaborativos, planificación visual y métricas en tiempo real para equipos que quieren moverse más rápido.
          </p>

          {/* Feature bullets */}
          <ul className="login__brand-features">
            <li><Icon name="check-square" size={15} /> Tableros Kanban arrastrables</li>
            <li><Icon name="check-square" size={15} /> Planificación de sprints</li>
            <li><Icon name="check-square" size={15} /> Reportes y métricas en tiempo real</li>
          </ul>
        </div>

        {/* Decoración de columnas en la parte inferior */}
        <div className="login__brand-cols" aria-hidden="true">
          <div className="login__brand-col" style={{ height: '45%' }}>
            <span className="login__brand-col-label">To Do</span>
            <span className="login__brand-col-bar" />
          </div>
          <div className="login__brand-col" style={{ height: '70%' }}>
            <span className="login__brand-col-label">In Progress</span>
            <span className="login__brand-col-bar login__brand-col-bar--blue" />
          </div>
          <div className="login__brand-col" style={{ height: '55%' }}>
            <span className="login__brand-col-label">In Review</span>
            <span className="login__brand-col-bar login__brand-col-bar--orange" />
          </div>
          <div className="login__brand-col" style={{ height: '88%' }}>
            <span className="login__brand-col-label">Done</span>
            <span className="login__brand-col-bar login__brand-col-bar--green" />
          </div>
        </div>
      </aside>

      {/* Panel del formulario */}
      <main className="login__panel">
        <form className="login__form" onSubmit={handleSubmit} noValidate>
          <div className="login__form-logo">
            <img src={kanbixLogo} alt="Kanbix" className="login__form-logo-img" />
          </div>

          <h2 className="login__title">Bienvenido de vuelta</h2>
          <p className="login__subtitle">Ingresa tus credenciales para continuar</p>

          {error && (
            <div className="login__error" role="alert">
              <Icon name="alert-triangle" size={16} />
              {error}
            </div>
          )}

          <label className="login__field">
            <span className="login__label">Correo electrónico</span>
            <div className="login__input-wrap">
              <span className="login__input-icon"><Icon name="user" size={16} /></span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@kanbix.com"
                autoComplete="email"
                required
              />
            </div>
          </label>

          <label className="login__field">
            <span className="login__label">Contraseña</span>
            <div className="login__password">
              <span className="login__input-icon"><Icon name="eye" size={16} /></span>
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
            {loading ? (
              <>
                <span className="login__spinner" />
                Ingresando…
              </>
            ) : (
              <>
                Ingresar
                <Icon name="arrow-right" size={18} />
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
