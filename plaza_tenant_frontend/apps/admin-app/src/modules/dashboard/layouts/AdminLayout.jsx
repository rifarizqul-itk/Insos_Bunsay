import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAdminAuth } from '../../auth/useAdminAuth';
import SidebarAdmin from './SidebarAdmin';
import Topbar from './Topbar';
import BottomNav from './BottomNav';

function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logoutAdmin } = useAdminAuth();

  const userTitle = user?.Username 
    ? `${user.Username} (Admin)` 
    : 'Administrator Utama';

  return (
    <div className="min-h-dvh bg-[#FAF6F0] relative overflow-x-hidden">
      <SidebarAdmin
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={logoutAdmin}
      />

      <Topbar
        userTitle={userTitle}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        variant="admin"
      />

      {isSidebarOpen && (
        <div
          className="sidebar-mobile-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="main-layout">
        <div className="main-content-inner">
          <Outlet />
        </div>
      </main>

      <BottomNav role="admin" />
    </div>
  );
}

export default AdminLayout;
