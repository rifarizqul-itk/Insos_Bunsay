import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import BottomNav from './components/layouts/BottomNav';

const routeTitles = {
  '/': 'Beranda Utama | Portal Bunsay Plaza Kebun Sayur',
  '/auth': 'Login Pengguna | Bunsay Plaza Kebun Sayur',
  '/auth/lupa-sandi': 'Lupa Kata Sandi | Bunsay Plaza Kebun Sayur',
  '/tenant/dashboard': 'Dashboard Tenant | Bunsay Plaza Kebun Sayur',
  '/tenant/pembayaran': 'Bayar Tagihan Kios | Bunsay Plaza Kebun Sayur',
  '/tenant/histori': 'Arsip Riwayat Pembayaran | Bunsay Plaza Kebun Sayur',
  '/tenant/tunggakan': 'Informasi Tunggakan AR | Bunsay Plaza Kebun Sayur',
  '/tenant/akun': 'Pengaturan Akun Tenant | Bunsay Plaza Kebun Sayur',
  '/admin/dashboard': 'Dashboard Admin | Bunsay Plaza Kebun Sayur',
  '/admin/verifikasi-bukti': 'Verifikasi Bukti Transfer | Bunsay Plaza Kebun Sayur',
  '/admin/setoran-tunai': 'Loket Setoran Tunai | Bunsay Plaza Kebun Sayur',
  '/admin/riwayat': 'Riwayat Transaksi Admin | Bunsay Plaza Kebun Sayur',
  '/admin/kios': 'Ketersediaan & Pemetaan Kios | Bunsay Plaza Kebun Sayur',
  '/admin/detail-administrasi': 'Detail Administrasi Kios | Bunsay Plaza Kebun Sayur',
  '/admin/ekspor': 'Ekspor Rekap Keuangan | Bunsay Plaza Kebun Sayur',
};

function AppContent() {
  const { isLoggedIn, role, logout, user } = useAuth();
  const location = useLocation();

  // Sidebar default tertutup di mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Dynamic Document Title (WCAG 2.4.2)
  useEffect(() => {
    const pageTitle = routeTitles[location.pathname] || 'Bunsay - Sistem Pembayaran Sewa Kios Plaza Kebun Sayur';
    document.title = pageTitle;
  }, [location.pathname]);

  // Reset sidebar state saat status login berubah
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [isLoggedIn]);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  if (!isLoggedIn) {
    return (
      <>
        <a
          href="#main-public"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2.5 focus:bg-red focus:text-white focus:font-bold focus:rounded-md focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>
        <main id="main-public" tabIndex="-1" className="outline-none">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/lupa-sandi" element={<ForgotPassword />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Toast />
      </>
    );
  }

  const isAdmin = role === 'admin';
  const SidebarComponent = isAdmin ? SidebarAdmin : Sidebar;
  const variant = isAdmin ? 'admin' : 'tenant';
  const userTitle = isAdmin
    ? 'Administrator Utama'
    : `${user?.name || 'Tenant'} (${user?.kios || 'Kios'})`;

  return (
    <>
      {/* Skip Link (WCAG 2.4.1) */}
      <a
        href="#main-app"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2.5 focus:bg-red focus:text-white focus:font-bold focus:rounded-md focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Sidebar – fixed di semua ukuran, di mobile tersembunyi dengan translate */}
      <div className={`
        fixed left-0 top-0 z-[100] h-screen w-[240px] bg-white border-r border-border
        transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <SidebarComponent
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          onLogout={logout}
        />
      </div>

      {/* Overlay mobile (WCAG 2.1.2 Accessible Keyboard Trap/Button) */}
      {isSidebarOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Tutup menu navigasi"
          className="md:hidden fixed inset-0 bg-black/40 z-[95] backdrop-blur-sm cursor-pointer"
          onClick={closeSidebar}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              closeSidebar();
            }
          }}
        />
      )}

      {/* Konten utama – diberi padding-left di desktop agar tidak tertutup sidebar */}
      <div className="pl-0 md:pl-[240px] min-h-dvh flex flex-col bg-[#FBF7F2]">
        <Topbar
          userTitle={userTitle}
          onToggleSidebar={toggleSidebar}
          variant={variant}
        />

        <main id="main-app" tabIndex="-1" className="flex-1 p-4 sm:p-6 md:p-8 main-content-wrapper outline-none">
          <div className="max-w-7xl mx-auto">
            <Routes>
              {/* Tenant */}
              <Route element={<ProtectedRoute allowedRoles={['tenant']} />}>
                <Route path="/tenant/dashboard" element={<DashboardTenant />} />
                <Route path="/tenant/pembayaran" element={<BayarSekarang />} />
                <Route path="/tenant/histori" element={<HistoriPembayaran />} />
                <Route path="/tenant/tunggakan" element={<TunggakanAR />} />
                <Route path="/tenant/akun" element={<AkunTenant />} />
              </Route>

              {/* Admin */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/dashboard" element={<DashboardAdmin />} />
                <Route path="/admin/verifikasi-bukti" element={<VerifikasiBuktiTransfer />} />
                <Route path="/admin/setoran-tunai" element={<SetoranTunai />} />
                <Route path="/admin/riwayat" element={<RiwayatTransaksiAdmin />} />
                <Route path="/admin/kios" element={<KetersediaanKios isAdmin={true} />} />
                <Route path="/admin/detail-administrasi" element={<DetailAdministrasiKios />} />
                <Route path="/admin/ekspor" element={<EksporData />} />
              </Route>

              <Route path="/" element={<Navigate to={isAdmin ? '/admin/dashboard' : '/tenant/dashboard'} replace />} />
              <Route path="*" element={<Navigate to={isAdmin ? '/admin/dashboard' : '/tenant/dashboard'} replace />} />
            </Routes>
          </div>
        </main>
      </div>

      <Toast />
      <BottomNav role={role} />
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
