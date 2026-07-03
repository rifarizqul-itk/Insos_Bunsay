import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import SidebarAdmin from '../components/layouts/SidebarAdmin';
import Topbar from '../components/layouts/Topbar';

function AdminLayout({ isSidebarOpen, setIsSidebarOpen, onLogout }) {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FBF7F2', position: 'relative', overflowX: 'hidden' }}>
      <SidebarAdmin
        activeMenu=""
        setActiveMenu={(menu) => navigate(`/admin/${menu}`)}
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <Topbar userTitle="Administrator Utama" onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      {isSidebarOpen && <div className="sidebar-mobile-overlay" onClick={() => setIsSidebarOpen(false)} />}

      <main className="main-layout">
        <div className="main-content-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
