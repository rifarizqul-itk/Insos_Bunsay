import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../modules/auth/AdminAuthProvider';
import SidebarAdmin from '../modules/dashboard/layouts/SidebarAdmin';

const ALLOWED_ADMIN_ROLES = ['admin', 'superadmin', 'staff_loket'];

export default function AdminProtectedRoute() {
  const { isLoggedIn, role, isHydrated, user, logoutAdmin } = useAdminAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
        <p className="text-sm text-slate-400 font-medium animate-pulse">Verifikasi kredensial pengelola...</p>
      </div>
    );
  }

  if (!isLoggedIn || !ALLOWED_ADMIN_ROLES.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', backgroundColor: '#0f172a' }}>
      {/* Sidebar Admin */}
      <SidebarAdmin
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onToggle={() => setIsSidebarOpen(prev => !prev)}
        onLogout={logoutAdmin}
        user={user}
      />

      {/* Overlay mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 30,
          }}
          aria-hidden="true"
        />
      )}

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px', minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  );
}
