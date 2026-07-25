import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SkeletonCard, SkeletonText } from './ui/Skeleton';

const ProtectedRoute = ({ allowedRoles = ['tenant', 'admin'] }) => {
  const { isLoggedIn, role, isHydrated } = useAuth();

  if (!isHydrated) {
    return (
      <div className="page-fade-in flex flex-col gap-6 p-4 sm:p-6" role="status" aria-live="polite">
        <div className="space-y-2">
          <SkeletonText className="h-8 w-56" />
          <SkeletonText className="h-4 w-80 max-w-full" />
        </div>
        <SkeletonCard className="h-40 w-full" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/auth" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

