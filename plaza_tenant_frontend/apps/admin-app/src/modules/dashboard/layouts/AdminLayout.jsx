import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../auth/useAdminAuth';
import SidebarAdmin from './SidebarAdmin';
import Topbar from './Topbar';
import BottomNav from './BottomNav';

const adminTitles = {
  '/admin/dashboard': 'Dashboard Pengelola | Plaza Kebun Sayur',
  '/admin/verifikasi-bukti': 'Verifikasi Bukti Transfer | Admin Plaza Kebun Sayur',
  '/admin/setoran-tunai': 'Setoran Tunai Kasir | Admin Plaza Kebun Sayur',
  '/admin/riwayat': 'Riwayat Transaksi | Admin Plaza Kebun Sayur',
  '/admin/kios': 'Manajemen Unit Kios | Admin Plaza Kebun Sayur',
  '/admin/ekspor': 'Ekspor Rekap Data | Admin Plaza Kebun Sayur',
  '/admin/audit-log': 'Audit Trail Log | Admin Plaza Kebun Sayur',
  '/admin/akun': 'Akun Pengelola | Admin Plaza Kebun Sayur',
  '/admin/detail-keuangan': 'Detail Keuangan Kios | Admin Plaza Kebun Sayur',
};

function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logoutAdmin } = useAdminAuth();

  useEffect(() => {
    const title = adminTitles[location.pathname] || 'Konsol Admin | Plaza Kebun Sayur';
    document.title = title;
  }, [location.pathname]);

  const userTitle = user?.Username 
    ? `${user.Username} (Admin)` 
    : 'Administrator Utama';

  return (
    <div data-slot="admin-layout" className="min-h-dvh bg-[#F3F4F7] relative overflow-x-hidden">
      {/* Background Atmosphere Glow (Bankoli-Inspired Soft Ambient Aura) */}
      <div 
        className="absolute top-0 inset-x-0 h-96 pointer-events-none z-0" 
        style={{
          background: 'radial-gradient(ellipse 90% 70% at 50% -20%, rgba(139, 26, 26, 0.07) 0%, rgba(139, 26, 26, 0.02) 60%, transparent 100%)'
        }}
        aria-hidden="true" 
      />
      <div className="absolute -top-24 -right-24 size-96 rounded-full bg-red/4 blur-3xl pointer-events-none z-0" aria-hidden="true" />
      <div className="absolute -top-24 -left-24 size-96 rounded-full bg-amber-500/3 blur-3xl pointer-events-none z-0" aria-hidden="true" />

      {/* Skip Link for Keyboard Accessibility (WCAG 2.4.1 Level A) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-red focus:text-white focus:rounded-xl focus:font-extrabold focus:text-xs focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white"
      >
        Lewati ke Konten Utama
      </a>

      <SidebarAdmin
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={logoutAdmin}
      />

      {isSidebarOpen && (
        <div
          className="sidebar-mobile-overlay"
          aria-hidden="true"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="main-layout relative z-10">
        <Topbar
          userTitle={userTitle}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          variant="admin"
        />

        <main id="main-content" tabIndex={-1} className="main-content-inner focus:outline-none">
          <Outlet />
        </main>
      </div>

      <BottomNav role="admin" />
    </div>
  );
}

export default AdminLayout;
