import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './modules/auth/AdminAuthProvider';
import AdminProtectedRoute from './routes/AdminProtectedRoute';

// Admin Module Pages (Lazy Loaded)
const AdminLoginPage = lazy(() => import('./modules/auth/pages/login'));
const DashboardAdmin = lazy(() => import('./modules/dashboard/pages/dashboard'));
const VerifikasiBuktiTransfer = lazy(() => import('./modules/verification/pages/proofs'));
const SetoranTunai = lazy(() => import('./modules/cashier/pages/setoran'));
const RiwayatTransaksiAdmin = lazy(() => import('./modules/reports/pages/riwayat'));
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
  const adminApiUrl = import.meta.env.VITE_ADMIN_API_URL || 'https://admin.bunsayhub.id';

  return (
    <AdminAuthProvider apiBaseUrl={adminApiUrl}>
      <Suspense fallback={<AdminPageLoader />}>
        <Routes>
          {/* Public Admin Login Route */}
          <Route path="/login" element={<AdminLoginPage />} />

          {/* Protected Admin Console Routes */}
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin/dashboard" element={<DashboardAdmin />} />
            <Route path="/admin/verifikasi-bukti" element={<VerifikasiBuktiTransfer />} />
            <Route path="/admin/setoran-tunai" element={<SetoranTunai />} />
            <Route path="/admin/riwayat" element={<RiwayatTransaksiAdmin />} />
            <Route path="/admin/akun" element={<AkunAdmin />} />
          </Route>

          {/* Fallback Redirect */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </Suspense>
    </AdminAuthProvider>
  );
}

export default AdminAppRoutes;
