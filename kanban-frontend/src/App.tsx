import { useEffect, useRef } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from './shared/layouts/DashboardLayout';
import { useAuth } from './shared/auth/AuthContext';
import LoginPage from './features/auth/pages/LoginPage';
import AdminUsersPage from './features/auth/pages/AdminUsersPage';
import SystemLogsPage from './features/auth/pages/SystemLogsPage';
import TicketsAdminPage from './features/auth/pages/TicketsAdminPage';
import ProfilePage from './features/auth/pages/ProfilePage';
import ChangePasswordPage from './features/auth/pages/ChangePasswordPage';
import DashboardPage from './features/reports/pages/DashboardPage';
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
// Hook de Atajos de Teclado Operativos
// ---------------------------------------------------------------------------
function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const lastKeyRef = useRef<string | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.rol_global === 'Admin') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar atajos si el usuario escribe en un campo de texto
      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

      // 1. Atajo Búsqueda global (funciona siempre)
      if ((e.key === '/' || (e.ctrlKey && e.key.toLowerCase() === 'k')) && !isInput) {
        e.preventDefault();
        const searchInput = document.getElementById('global-search') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      // 2. Escape para salir de inputs o cerrar modales/paneles
      if (e.key === 'Escape') {
        if (isInput) {
          (e.target as HTMLElement).blur();
        }
        // Cerrar modales (simulado por evento para que modales escuchen Escape)
        return;
      }

      if (isInput) return; // No procesar otros atajos si escribe en input

      // 3. Atajos de secuencia (ej: G + D)
      const key = e.key.toLowerCase();
      if (lastKeyRef.current === 'g') {
        if (key === 'd') {
          e.preventDefault();
          navigate('/');
        } else if (key === 'b') {
          e.preventDefault();
          navigate('/board');
        } else if (key === 'p') {
          e.preventDefault();
          navigate('/projects');
        }
        lastKeyRef.current = null;
        return;
      }

      if (key === 'g') {
        lastKeyRef.current = 'g';
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => {
          lastKeyRef.current = null;
        }, 1000);
        return;
      }

      // 4. Otros atajos directos
      if (e.key === '?') {
        e.preventDefault();
        navigate('/help');
      } else if (key === 'n') {
        // Nueva tarea: si está en /board abre el modal de añadir tarea enfocado
        if (window.location.pathname === '/board') {
          e.preventDefault();
          const newTaskBtn = document.getElementById('new-task-button') || document.querySelector('[class*="add-task"]') as HTMLElement;
          if (newTaskBtn) (newTaskBtn as HTMLElement).click();
        } else {
          e.preventDefault();
          navigate('/board');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [navigate]);
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
        <Route path="/" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/proyectos/:projectId" element={<Navigate to="resumen" replace />} />
        <Route path="/proyectos/:projectId/resumen" element={<ProjectResumenPage />} />
        <Route path="/proyectos/:projectId/tablero" element={<BoardPage />} />
        <Route path="/proyectos/:projectId/backlog" element={<BacklogPage />} />
        <Route path="/proyectos/:projectId/calendario" element={<CalendarPage />} />
        <Route path="/proyectos/:projectId/cronograma" element={<TimelinePage />} />
        <Route path="/proyectos/:projectId/informes" element={<InformesPage />} />
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
