import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../modules/auth/useAdminAuth';

const ALLOWED_ADMIN_ROLES = ['admin', 'superadmin', 'staff_loket', 'auditor'];

export default function AdminProtectedRoute({ requiredPermission }) {
  const { isLoggedIn, role, user, isHydrated } = useAdminAuth();

  if (!isHydrated) {
    return (
      <div data-slot="admin-protected-route" className="flex min-h-screen items-center justify-center bg-cream text-text">
        <p className="text-sm text-text-2 font-bold animate-pulse">Verifikasi kredensial pengelola...</p>
      </div>
    );
  }

  // BUG-NEW-05: explicitly check role !== null before ALLOWED_ADMIN_ROLES.includes()
  // role is ?? null in AdminAuthProvider — null must never pass this guard.
  if (!isLoggedIn || !role || !ALLOWED_ADMIN_ROLES.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  // Route-Level RBAC Permission Enforcement
  if (requiredPermission) {
    const isSuperadmin = user?.sub_role === 'superadmin' || user?.Username === 'superadmin' || user?.Username === 'admin';
    const userPerms = Array.isArray(user?.permissions) ? user.permissions : [];

    if (!isSuperadmin && !userPerms.includes(requiredPermission)) {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return (
    <div data-slot="admin-protected-route" className="contents">
      <Outlet />
    </div>
  );
}

