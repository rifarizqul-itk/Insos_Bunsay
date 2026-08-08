import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTenantAuth } from '../../public/useTenantAuth';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import BottomNav from './BottomNav';

function TenantLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useTenantAuth();

  const userTitle = user?.name ?? user?.Username ?? 'Hj. Yuliana (Kios B-1001)';

  return (
    <div className="min-h-dvh bg-[#FAF6F0] relative overflow-x-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={logout}
      />

      <Topbar
        userTitle={userTitle}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        variant="tenant"
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

      <BottomNav role="tenant" />
    </div>
  );
}

export default TenantLayout;
