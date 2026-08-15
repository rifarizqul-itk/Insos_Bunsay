import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTenantAuth } from '../../public/useTenantAuth';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import BottomNav from './BottomNav';

function TenantLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useTenantAuth();

  const userTitle = user?.nama ?? user?.name ?? user?.Username ?? 'Tenant Aktif';

  return (
    <div data-slot="tenant-layout" className="min-h-dvh bg-cream relative overflow-x-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={logout}
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
          variant="tenant"
        />

        <main className="main-content-inner">
          <Outlet />
        </main>
      </div>

      <BottomNav role="tenant" />
    </div>
  );
}

export default TenantLayout;
