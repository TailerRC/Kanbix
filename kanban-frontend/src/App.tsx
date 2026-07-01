import { useEffect, useRef, type ReactNode } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from './shared/layouts/DashboardLayout';
import { useAuth } from './shared/auth/AuthContext';
import LoginPage from './features/auth/pages/LoginPage';
import AdminUsersPage from './features/auth/pages/AdminUsersPage';
import SystemLogsPage from './features/auth/pages/SystemLogsPage';
import TicketsAdminPage from './features/auth/pages/TicketsAdminPage';
import ProfilePage from './features/auth/pages/ProfilePage';
import ChangePasswordPage from './features/auth/pages/ChangePasswordPage';
import ProjectResumenPage from './features/reports/pages/ProjectResumenPage';
import InformesPage from './features/reports/pages/InformesPage';
import ProjectsPage from './features/projects/pages/ProjectsPage';
import AdminProjectsPage from './features/projects/pages/AdminProjectsPage';
import BoardPage from './features/kanban/pages/BoardPage';
import BacklogPage from './features/kanban/pages/BacklogPage';
import CalendarPage from './features/kanban/pages/CalendarPage';
import TimelinePage from './features/kanban/pages/TimelinePage';
import HealthCheck from './components/HealthCheck';
import HelpPage from './features/support/pages/HelpPage';
import SettingsPage from './features/support/pages/SettingsPage';

// ---------------------------------------------------------------------------
// Guard de ruta: redirige a Developer que intente acceder a vistas restringidas
// ---------------------------------------------------------------------------
function RequireNotDeveloper({ children, redirectTo }: { children: ReactNode; redirectTo: string }) {
  const { user } = useAuth();
  if (user?.rol_global === 'Developer') {
    return <Navigate to={redirectTo} replace />;
  }
  return <>{children}</>;
}

// ---------------------------------------------------------------------------
// Hook de Atajos de Teclado Operativos
// Aplica SOLO para Manager y Developer (Admin tiene su propio panel)
// ---------------------------------------------------------------------------
function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();
  const lastKeyRef = useRef<string | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Solo activo para Manager y Developer
    const rol = user?.rol_global;
    if (!rol || rol === 'Admin') return;

    // Extrae el projectId de la URL actual si existe
    // e.g. /proyectos/abc123/tablero -> abc123
    const getProjectId = () => {
      const match = location.pathname.match(/\/proyectos\/([^/]+)/);
      return match ? match[1] : null;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isEditable =
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        (e.target as HTMLElement).isContentEditable;

      // ── Ctrl+K / "/" : Enfocar búsqueda global ──────────────────────────
      if ((e.key === '/' || (e.ctrlKey && e.key.toLowerCase() === 'k')) && !isEditable) {
        e.preventDefault();
        const searchInput = document.getElementById('global-search') as HTMLInputElement;
        if (searchInput) { searchInput.focus(); searchInput.select(); }
        return;
      }

      // ── Escape: salir de inputs / cerrar modales ─────────────────────────
      if (e.key === 'Escape') {
        if (isEditable) (e.target as HTMLElement).blur();
        return;
      }

      if (isEditable) return; // No procesar otros atajos dentro de campos

      const key = e.key.toLowerCase();

      // ── Atajos de secuencia G + X ────────────────────────────────────────
      // G+P → Mis Proyectos
      // G+R → Resumen del proyecto (si hay projectId)
      // G+T → Tablero
      // G+B → Backlog (solo Manager)
      // G+C → Calendario
      // G+L → Cronograma (solo Manager)
      // G+I → Informes (solo Manager)
      if (lastKeyRef.current === 'g') {
        const pid = getProjectId();
        e.preventDefault();
        lastKeyRef.current = null;
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);

        if (key === 'p') {
          navigate('/projects');
        } else if (key === 'r' && pid) {
          navigate(`/proyectos/${pid}/resumen`);
        } else if (key === 't' && pid) {
          navigate(`/proyectos/${pid}/tablero`);
        } else if (key === 'c' && pid) {
          navigate(`/proyectos/${pid}/calendario`);
        } else if (key === 'b' && pid && rol === 'Manager') {
          navigate(`/proyectos/${pid}/backlog`);
        } else if (key === 'l' && pid && rol === 'Manager') {
          navigate(`/proyectos/${pid}/cronograma`);
        } else if (key === 'i' && pid && rol === 'Manager') {
          navigate(`/proyectos/${pid}/informes`);
        }
        return;
      }

      // Registrar tecla G como inicio de secuencia
      if (key === 'g') {
        lastKeyRef.current = 'g';
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => {
          lastKeyRef.current = null;
        }, 1000);
        return;
      }

      // ── Atajos directos ──────────────────────────────────────────────────
      if (e.key === '?') {
        // ? → Ayuda
        e.preventDefault();
        navigate('/help');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [navigate, location.pathname, user?.rol_global]);
}

// ---------------------------------------------------------------------------
// Layout protegido base — exige sesión activa
// ---------------------------------------------------------------------------

/** Si el usuario debe cambiar su contraseña (RN-31), lo interceptamos aquí
 *  y lo redirigimos a /change-password independientemente de la ruta. */
function ProtectedLayout() {
  const { isAuthenticated, loading, mustChangePassword, user } = useAuth();
  const location = useLocation();
  useKeyboardShortcuts(); // Activar atajos en vistas protegidas

  if (loading) {
    return <div className="app-loader">Cargando…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // RN-31: forzar cambio de contraseña antes de acceder a cualquier recurso
  if (mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  // RN-35: Redirigir al Admin fuera de las pantallas operativas ordinarias a su ruta por defecto
  if (user?.rol_global === 'Admin' && (location.pathname === '/' || location.pathname === '/projects')) {
    return <Navigate to="/admin/users" replace />;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

// ---------------------------------------------------------------------------
// Layout exclusivo para Admins — además de sesión, exige rol Admin (RN-05)
// ---------------------------------------------------------------------------

function AdminLayout() {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="app-loader">Cargando…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user?.rol_global !== 'Admin') {
    // 403 silencioso: redirige al dashboard sin revelar que la ruta existe
    return <Navigate to="/" replace />;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

// ---------------------------------------------------------------------------
// Árbol de rutas
// ---------------------------------------------------------------------------

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/health" element={<HealthCheck />} />

      {/* Flujo forzado de cambio de contraseña (RN-31) — semi-protegida */}
      <Route path="/change-password" element={<ChangePasswordPage />} />

      {/* Rutas protegidas — cualquier usuario autenticado */}
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/proyectos/:projectId" element={<Navigate to="resumen" replace />} />
        <Route path="/proyectos/:projectId/resumen" element={<ProjectResumenPage />} />
        <Route path="/proyectos/:projectId/tablero" element={<BoardPage />} />
        <Route path="/proyectos/:projectId/calendario" element={<CalendarPage />} />
        <Route path="/proyectos/:projectId/backlog" element={<RequireNotDeveloper redirectTo="../resumen"><BacklogPage /></RequireNotDeveloper>} />
        <Route path="/proyectos/:projectId/cronograma" element={<RequireNotDeveloper redirectTo="../resumen"><TimelinePage /></RequireNotDeveloper>} />
        <Route path="/proyectos/:projectId/informes" element={<RequireNotDeveloper redirectTo="../resumen"><InformesPage /></RequireNotDeveloper>} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/board" element={<Navigate to="/projects" replace />} />
      </Route>

      {/* Rutas exclusivas para Admin (RN-05, matriz de permisos) */}
      <Route element={<AdminLayout />}>
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/projects" element={<AdminProjectsPage />} />
        <Route path="/admin/logs" element={<SystemLogsPage />} />
        <Route path="/admin/tickets" element={<TicketsAdminPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
