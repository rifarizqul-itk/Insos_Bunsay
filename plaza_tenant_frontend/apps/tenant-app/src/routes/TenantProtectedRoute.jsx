import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useTenantAuth } from '../modules/public/useTenantAuth';

export default function TenantProtectedRoute() {
  const { isLoggedIn, role } = useTenantAuth();

  if (!isLoggedIn || role !== 'tenant') {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div data-slot="tenant-protected-route" className="contents">
      <Outlet />
    </div>
  );
}
