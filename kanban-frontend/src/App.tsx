import { Routes, Route } from 'react-router-dom';
import DashboardLayout from './shared/layouts/DashboardLayout';
import DashboardPage from './features/reports/pages/DashboardPage';
import HealthCheck from './components/HealthCheck';

function App() {
  return (
    <Routes>
      {/* Dashboard with layout */}
      <Route
        path="/"
        element={
          <DashboardLayout>
            <DashboardPage />
          </DashboardLayout>
        }
      />
      {/* Health check (no layout) */}
      <Route path="/health" element={<HealthCheck />} />
    </Routes>
  );
}

export default App;