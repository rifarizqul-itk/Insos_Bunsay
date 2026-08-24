import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTenantAuth } from '../../public/useTenantAuth';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import BottomNav from './BottomNav';

const tenantTitles = {
  '/tenant/dashboard': 'Dashboard Tenant | Plaza Kebun Sayur',
  '/tenant/pembayaran': 'Bayar Sewa Kios | Portal Tenant Plaza Kebun Sayur',
  '/tenant/histori': 'Histori Pembayaran | Portal Tenant Plaza Kebun Sayur',
  '/tenant/tunggakan': 'Rincian Tunggakan Sewa | Portal Tenant Plaza Kebun Sayur',
  '/tenant/akun': 'Akun & Legalitas Kios | Portal Tenant Plaza Kebun Sayur',
};

function TenantLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useTenantAuth();

  useEffect(() => {
    const title = tenantTitles[location.pathname] || 'Portal Tenant | Plaza Kebun Sayur';
    document.title = title;
  }, [location.pathname]);

  const userTitle = user?.nama ?? user?.name ?? user?.Username ?? 'Tenant Aktif';

  return (
    <div data-slot="tenant-layout" className="min-h-dvh bg-cream relative overflow-x-hidden">
      {/* Skip Link for Keyboard Accessibility (WCAG 2.4.1 Level A) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[99999] focus:px-4 focus:py-2.5 focus:bg-red focus:text-white focus:rounded-xl focus:font-extrabold focus:text-xs focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white"
      >
        Lewati ke Konten Utama
      </a>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={logout}
      />

      {isSidebarOpen && (
        <div
          className="sidebar-mobile-overlay"
          aria-hidden="true"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="main-layout">
        <Topbar
          userTitle={userTitle}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          variant="tenant"
        />

        <main id="main-content" tabIndex={-1} className="main-content-inner focus:outline-none">
          <Outlet />
        </main>
      </div>

      <BottomNav role="tenant" />
    </div>
  );
}

export default TenantLayout;
