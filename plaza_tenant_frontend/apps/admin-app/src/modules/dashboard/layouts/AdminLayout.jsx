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
    <div data-slot="admin-layout" className="min-h-dvh bg-cream relative overflow-x-hidden">
      <SidebarAdmin
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={logoutAdmin}
      />

      {isSidebarOpen && (
        <div
          className="sidebar-mobile-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="main-layout">
        <Topbar
          userTitle={userTitle}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          variant="admin"
        />

        <main className="main-content-inner">
          <Outlet />
        </main>
      </div>

      <BottomNav role="admin" />
    </div>
  );
}

export default AdminLayout;
