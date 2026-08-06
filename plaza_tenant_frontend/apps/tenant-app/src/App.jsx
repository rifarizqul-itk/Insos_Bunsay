import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TenantAuthProvider } from './modules/public/TenantAuthProvider';
import TenantProtectedRoute from './routes/TenantProtectedRoute';

// Tenant Module Pages (Lazy Loaded)
const LandingPage = lazy(() => import('./modules/public/pages/landing'));
const AuthPage = lazy(() => import('./modules/public/pages/auth'));
const DashboardTenant = lazy(() => import('./modules/billing/pages/dashboard'));
const BayarSekarang = lazy(() => import('./modules/billing/pages/payment'));
const HistoriPembayaran = lazy(() => import('./modules/billing/pages/history'));
const TunggakanAR = lazy(() => import('./modules/billing/pages/tunggakan'));
const AkunTenant = lazy(() => import('./modules/profile/pages/account'));

function PageLoader() {
  return (
    <div className="flex flex-col gap-4 p-6 animate-pulse" role="status">
      <div className="h-8 w-48 bg-gray-200 rounded" />
      <div className="h-40 w-full bg-gray-200 rounded" />
    </div>
  );
}

function TenantAppRoutes() {
  const tenantApiUrl = import.meta.env.VITE_TENANT_API_URL || 'https://bunsayhub.id';

  return (
    <TenantAuthProvider apiBaseUrl={tenantApiUrl}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Tenant Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/lupa-sandi" element={<AuthPage />} />

          {/* Protected Tenant Routes */}
          <Route element={<TenantProtectedRoute />}>
            <Route path="/tenant/dashboard" element={<DashboardTenant />} />
            <Route path="/tenant/pembayaran" element={<BayarSekarang />} />
            <Route path="/tenant/histori" element={<HistoriPembayaran />} />
            <Route path="/tenant/tunggakan" element={<TunggakanAR />} />
            <Route path="/tenant/akun" element={<AkunTenant />} />
          </Route>

          {/* Fallback Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </TenantAuthProvider>
  );
}

export default TenantAppRoutes;
