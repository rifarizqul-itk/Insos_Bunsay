import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { isMobile } from 'react-device-detect';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TransactionProvider } from './context/TransactionContext';
import { UIProvider } from './context/UIContext';

// Public
import LandingPage from './pages/public/LandingPage';
import AuthPage from './pages/public/AuthPage';
import ForgotPassword from './pages/public/ForgotPassword';

// Tenant
import DashboardTenant from './pages/tenant/DashboardTenant';
import BayarSekarang from './pages/tenant/BayarSekarang';
import HistoriPembayaran from './pages/tenant/HistoriPembayaran';
import TunggakanAR from './pages/tenant/TunggakanAR';
import AkunTenant from './pages/tenant/AkunTenant';

// Admin
import DashboardAdmin from './pages/admin/DashboardAdmin';
import VerifikasiBuktiTransfer from './pages/admin/VerifikasiBuktiTransfer';
import SetoranTunai from './pages/admin/SetoranTunai';
import RiwayatTransaksiAdmin from './pages/admin/RiwayatTransaksiAdmin';
import KetersediaanKios from './pages/admin/KetersediaanKios';
import DetailAdministrasiKios from './pages/admin/DetailAdministrasiKios';
import EksporData from './pages/admin/EksporData';

// Layout components
import Sidebar from './components/layouts/Sidebar';
import SidebarAdmin from './components/layouts/SidebarAdmin';
import Topbar from './components/layouts/Topbar';
import ProtectedRoute from './components/ProtectedRoute';
import Toast from './components/Toast';

function AppContent() {
  const { isLoggedIn, role, logout, user } = useAuth();

  // Gunakan deteksi perangkat untuk menentukan status awal sidebar
  // isMobile dari react-device-detect akan true di HP, false di desktop/tablet besar
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Jika belum login
  if (!isLoggedIn) {
    return (
      <>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/lupa-sandi" element={<ForgotPassword />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toast />
      </>
    );
  }

  // Jika sudah login
  const isAdmin = role === 'admin';
  const SidebarComponent = isAdmin ? SidebarAdmin : Sidebar;
  const variant = isAdmin ? 'admin' : 'tenant';
  const layoutClass = isAdmin ? 'main-layout-admin' : 'main-layout-tenant';
  const userTitle = isAdmin
    ? 'Administrator Utama'
    : `${user?.name || 'Tenant'} (${user?.kios || 'Kios'})`;

  return (
    <>
      <div
        className={layoutClass}
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--cream)',
          position: 'relative',
          overflowX: 'hidden',
        }}
      >
        <SidebarComponent
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          onLogout={logout}
        />
        <Topbar
          userTitle={userTitle}
          onToggleSidebar={toggleSidebar}
          variant={variant}
        />
        {isSidebarOpen && (
          <div className="sidebar-mobile-overlay" onClick={closeSidebar} />
        )}
        <main style={{ padding: '32px', paddingTop: '64px' }}>
          <div className="main-content-inner">
            <Routes>
              {/* Rute tenant */}
              <Route element={<ProtectedRoute allowedRoles={['tenant']} />}>
                <Route path="/tenant/dashboard" element={<DashboardTenant />} />
                <Route path="/tenant/pembayaran" element={<BayarSekarang />} />
                <Route path="/tenant/histori" element={<HistoriPembayaran />} />
                <Route path="/tenant/tunggakan" element={<TunggakanAR />} />
                <Route path="/tenant/akun" element={<AkunTenant />} />
              </Route>

              {/* Rute admin */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/dashboard" element={<DashboardAdmin />} />
                <Route path="/admin/verifikasi-bukti" element={<VerifikasiBuktiTransfer />} />
                <Route path="/admin/setoran-tunai" element={<SetoranTunai />} />
                <Route path="/admin/riwayat" element={<RiwayatTransaksiAdmin />} />
                <Route path="/admin/kios" element={<KetersediaanKios isAdmin={true} />} />
                <Route path="/admin/detail-administrasi" element={<DetailAdministrasiKios />} />
                <Route path="/admin/ekspor" element={<EksporData />} />
              </Route>

              {/* Redirect default */}
              <Route path="/" element={<Navigate to={isAdmin ? '/admin/dashboard' : '/tenant/dashboard'} replace />} />
              <Route path="*" element={<Navigate to={isAdmin ? '/admin/dashboard' : '/tenant/dashboard'} replace />} />
            </Routes>
          </div>
        </main>
      </div>
      <Toast />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <UIProvider>
          <AppContent />
        </UIProvider>
      </TransactionProvider>
    </AuthProvider>
  );
}

export default App;
