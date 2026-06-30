import { useState, type ReactNode } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import './DashboardLayout.css';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Topbar onMenuToggle={() => setSidebarOpen((prev) => !prev)} />

      {/* Mobile overlay */}
      <div
        className={`dashboard-layout__overlay ${sidebarOpen ? 'dashboard-layout__overlay--visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <main className="dashboard-layout__content">
        {children}
      </main>
    </div>
  );
}
