import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../modules/auth/AdminAuthProvider';

const ALLOWED_ADMIN_ROLES = ['admin', 'superadmin', 'staff_loket', 'auditor'];

export default function AdminProtectedRoute({ requiredPermission }) {
  const { isLoggedIn, role, user, isHydrated } = useAdminAuth();

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

  // Route-Level RBAC Permission Enforcement (if specified)
  if (requiredPermission) {
    const isSuperadmin = user?.sub_role === 'superadmin' || user?.Username === 'superadmin' || user?.Username === 'admin';
    const userPerms = Array.isArray(user?.permissions) ? user.permissions : [];

    if (!isSuperadmin && !userPerms.includes(requiredPermission)) {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return <Outlet />;
}

