import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/layouts/Sidebar';
import Topbar from '../components/layouts/Topbar';

function TenantLayout({ isSidebarOpen, setIsSidebarOpen, onLogout }) {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FBF7F2', position: 'relative', overflowX: 'hidden' }}>
      <Sidebar
        activeMenu=""
        setActiveMenu={(menu) => navigate(`/tenant/${menu}`)}
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <Topbar userTitle="Hj. Yuliana (Kios B-1001)" onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      {isSidebarOpen && <div className="sidebar-mobile-overlay" onClick={() => setIsSidebarOpen(false)} />}

      <main className="main-layout">
        <div className="main-content-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default TenantLayout;
