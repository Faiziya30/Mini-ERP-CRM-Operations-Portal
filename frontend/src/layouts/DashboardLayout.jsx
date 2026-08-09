import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)} />
      <main className="main-area">
        <Topbar onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)} />
        <div className="main-area-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
