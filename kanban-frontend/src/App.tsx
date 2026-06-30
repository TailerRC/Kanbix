import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import DashboardLayout from './shared/layouts/DashboardLayout';
import { useAuth } from './shared/auth/AuthContext';
import LoginPage from './features/auth/pages/LoginPage';
import DashboardPage from './features/reports/pages/DashboardPage';
import ProjectsPage from './features/projects/pages/ProjectsPage';
import BoardPage from './features/kanban/pages/BoardPage';
import HealthCheck from './components/HealthCheck';

/** Layout protegido: exige sesión; si no, redirige a /login. */
function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="app-loader">Cargando…</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/health" element={<HealthCheck />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/board" element={<BoardPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
