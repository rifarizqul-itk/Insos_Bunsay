import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useTenantAuth } from '../modules/public/TenantAuthProvider';

export default function TenantProtectedRoute() {
  const { isLoggedIn, role, isHydrated } = useTenantAuth();

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

  return <Outlet />;
}
