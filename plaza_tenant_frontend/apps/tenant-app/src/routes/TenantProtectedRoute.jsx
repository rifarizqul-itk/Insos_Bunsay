import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useTenantAuth } from '../modules/public/TenantAuthProvider';
import Sidebar from '../modules/public/layouts/Sidebar';
import Topbar from '../modules/public/layouts/Topbar';
import BottomNav from '../modules/public/layouts/BottomNav';

export default function TenantProtectedRoute() {
  const { isLoggedIn, role, isHydrated, user, logout } = useTenantAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FBF7F2]">
        <p className="text-sm text-gray-500 font-medium animate-pulse">Memuat sesi tenant...</p>
      </div>
    );
  }

  if (!isLoggedIn || role !== 'tenant') {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', backgroundColor: 'var(--cream, #FBF7F2)' }}>
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={logout}
      />

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 30,
          }}
          aria-hidden="true"
        />
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar
          userTitle={user?.Username || 'Tenant'}
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          variant="tenant"
        />
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
