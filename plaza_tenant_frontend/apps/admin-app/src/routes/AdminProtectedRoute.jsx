import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../modules/auth/useAdminAuth';

const ALLOWED_ADMIN_ROLES = ['admin', 'superadmin', 'staff_loket'];

export default function AdminProtectedRoute() {
  const { isLoggedIn, role, isHydrated } = useAdminAuth();

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
        <p className="text-sm text-slate-400 font-medium animate-pulse">Verifikasi kredensial pengelola...</p>
      </div>
    );
  }

  // BUG-NEW-05: explicitly check role !== null before ALLOWED_ADMIN_ROLES.includes()
  // role is ?? null in AdminAuthProvider — null must never pass this guard.
  if (!isLoggedIn || !role || !ALLOWED_ADMIN_ROLES.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
