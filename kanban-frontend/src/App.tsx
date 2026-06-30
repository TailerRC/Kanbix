import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import DashboardLayout from './shared/layouts/DashboardLayout';
import { useAuth } from './shared/auth/AuthContext';
import LoginPage from './features/auth/pages/LoginPage';
import AdminUsersPage from './features/auth/pages/AdminUsersPage';
import ChangePasswordPage from './features/auth/pages/ChangePasswordPage';
import DashboardPage from './features/reports/pages/DashboardPage';
import ProjectsPage from './features/projects/pages/ProjectsPage';
import BoardPage from './features/kanban/pages/BoardPage';
import HealthCheck from './components/HealthCheck';

// ---------------------------------------------------------------------------
// Layout protegido base — exige sesión activa
// ---------------------------------------------------------------------------

/** Si el usuario debe cambiar su contraseña (RN-31), lo interceptamos aquí
 *  y lo redirigimos a /change-password independientemente de la ruta. */
function ProtectedLayout() {
  const { isAuthenticated, loading, mustChangePassword } = useAuth();
  const location = useLocation();

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
        <Route path="/board" element={<BoardPage />} />
      </Route>

      {/* Rutas exclusivas para Admin (RN-05, matriz de permisos) */}
      <Route element={<AdminLayout />}>
        <Route path="/admin/users" element={<AdminUsersPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
