import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider, VerifikasiResi, ErrorBoundary } from '@bunsay/shared-ui';
import { TenantAuthProvider } from './modules/public/TenantAuthProvider';
import TenantProtectedRoute from './routes/TenantProtectedRoute';

import TenantLayout from './modules/public/layouts/TenantLayout';

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
    <div data-slot="page-loader" className="flex flex-col gap-4 p-6 bg-cream min-h-screen animate-pulse" role="status">
      <div className="h-8 w-48 bg-warm-gray rounded" />
      <div className="h-40 w-full bg-warm-gray rounded" />
    </div>
  );
}

function TenantAppRoutes() {
  const tenantApiUrl = import.meta.env.VITE_TENANT_API_URL || (import.meta.env.DEV ? '' : 'https://bunsayhub.id');

  return (
    <div data-slot="tenant-app-root" className="contents">
      <ErrorBoundary>
        <ToastProvider>
          <TenantAuthProvider apiBaseUrl={tenantApiUrl}>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Tenant Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/auth/lupa-sandi" element={<AuthPage />} />
                <Route path="/verifikasi" element={<VerifikasiResi />} />

                {/* Protected Tenant Routes */}
                <Route element={<TenantProtectedRoute />}>
                  <Route element={<TenantLayout />}>
                    <Route path="/tenant/dashboard" element={<DashboardTenant />} />
                    <Route path="/tenant/pembayaran" element={<BayarSekarang />} />
                    <Route path="/tenant/histori" element={<HistoriPembayaran />} />
                    <Route path="/tenant/tagihan" element={<TunggakanAR />} />
                    <Route path="/tenant/tunggakan" element={<TunggakanAR />} />
                    <Route path="/tenant/akun" element={<AkunTenant />} />
                  </Route>
                </Route>

                {/* Fallback Redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </TenantAuthProvider>
        </ToastProvider>
      </ErrorBoundary>
    </div>
  );
}

export default TenantAppRoutes;
