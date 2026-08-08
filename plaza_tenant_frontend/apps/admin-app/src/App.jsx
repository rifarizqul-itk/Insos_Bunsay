import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '@bunsay/shared-ui';
import { AdminAuthProvider } from './modules/auth/AdminAuthProvider';
import AdminProtectedRoute from './routes/AdminProtectedRoute';

import AdminLayout from './modules/dashboard/layouts/AdminLayout';

// Admin Module Pages (Lazy Loaded)
const AdminLoginPage = lazy(() => import('./modules/auth/pages/login'));
const DashboardAdmin = lazy(() => import('./modules/dashboard/pages/dashboard'));
const VerifikasiBuktiTransfer = lazy(() => import('./modules/verification/pages/proofs'));
const SetoranTunai = lazy(() => import('./modules/cashier/pages/setoran'));
const RiwayatTransaksiAdmin = lazy(() => import('./modules/reports/pages/riwayat'));
const DetailKeuanganTenant = lazy(() => import('./modules/tenants/pages/detail-keuangan'));
const KetersediaanKios = lazy(() => import('./modules/kiosks/pages/ketersediaan'));
const RiwayatPemilikKios = lazy(() => import('./modules/kiosks/pages/riwayat-pemilik'));
const DetailAdministrasiKios = lazy(() => import('./modules/kiosks/pages/detail-administrasi'));
const EksporData = lazy(() => import('./modules/reports/pages/ekspor'));
const AuditLogPage = lazy(() => import('./modules/reports/pages/audit'));
const AkunAdmin = lazy(() => import('./modules/profile/pages/account'));

function AdminPageLoader() {
  return (
    <div className="flex flex-col gap-4 p-6 bg-slate-900 min-h-screen text-slate-200 animate-pulse" role="status">
      <div className="h-8 w-48 bg-slate-700 rounded" />
      <div className="h-40 w-full bg-slate-800 rounded" />
    </div>
  );
}

function AdminAppRoutes() {
  const adminApiUrl = import.meta.env.VITE_ADMIN_API_URL || (import.meta.env.DEV ? 'http://localhost:8000' : 'https://admin.bunsayhub.id');

  return (
    <ToastProvider>
      <AdminAuthProvider apiBaseUrl={adminApiUrl}>
        <Suspense fallback={<AdminPageLoader />}>
          <Routes>
            {/* Public Admin Login Route */}
            <Route path="/login" element={<AdminLoginPage />} />

            {/* Protected Admin Console Routes */}
            <Route element={<AdminProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<DashboardAdmin />} />
                <Route path="/admin/verifikasi-bukti" element={<VerifikasiBuktiTransfer />} />
                <Route path="/admin/setoran-tunai" element={<SetoranTunai />} />
                <Route path="/admin/riwayat" element={<RiwayatTransaksiAdmin />} />
                <Route path="/admin/detail-keuangan" element={<DetailKeuanganTenant />} />
                <Route path="/admin/keuangan/:id" element={<DetailKeuanganTenant />} />
                <Route path="/admin/kios" element={<KetersediaanKios />} />
                <Route path="/admin/kios/:id" element={<DetailAdministrasiKios />} />
                <Route path="/admin/riwayat-pemilik" element={<RiwayatPemilikKios />} />
                <Route path="/admin/riwayat/:id" element={<RiwayatPemilikKios />} />
                <Route path="/admin/detail-administrasi" element={<DetailAdministrasiKios />} />
                <Route path="/admin/ekspor" element={<EksporData />} />
                <Route path="/admin/audit-log" element={<AuditLogPage />} />
                <Route path="/admin/akun" element={<AkunAdmin />} />
              </Route>
            </Route>

            {/* Fallback Redirect */}
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </Suspense>
      </AdminAuthProvider>
    </ToastProvider>
  );
}

export default AdminAppRoutes;
