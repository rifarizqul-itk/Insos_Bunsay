import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { cn } from '@bunsay/shared-ui';
import { useTenantAuth } from '../../public/useTenantAuth';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import BottomNav from './BottomNav';

const tenantTitles = {
  '/tenant/dashboard': 'Dashboard Tenant | Plaza Kebun Sayur',
  '/tenant/pembayaran': 'Bayar Sewa Kios | Portal Tenant Plaza Kebun Sayur',
  '/tenant/histori': 'Histori Pembayaran | Portal Tenant Plaza Kebun Sayur',
  '/tenant/tagihan': 'Daftar Tagihan Sewa | Portal Tenant Plaza Kebun Sayur',
  '/tenant/tunggakan': 'Daftar Tagihan Sewa | Portal Tenant Plaza Kebun Sayur',
  '/tenant/akun': 'Akun & Legalitas Kios | Portal Tenant Plaza Kebun Sayur',
};

function TenantLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('bunsay_sidebar_collapsed_tenant') === 'true';
    } catch {
      return false;
    }
  });

  const location = useLocation();
  const { user, logout } = useTenantAuth();

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('bunsay_sidebar_collapsed_tenant', String(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const title = tenantTitles[location.pathname] || 'Portal Tenant | Plaza Kebun Sayur';
    document.title = title;
  }, [location.pathname]);

  const userTitle = user?.nama ?? user?.name ?? user?.Username ?? 'Tenant Aktif';

  return (
    <div data-slot="tenant-layout" className="min-h-dvh bg-[#F3F4F7] relative overflow-x-hidden">
      {/* Background Atmosphere Glow (Bankoli-Inspired Soft Ambient Aura - Hardware Accelerated) */}
      <div 
        className="fixed top-0 inset-x-0 h-96 pointer-events-none z-0 transform-gpu" 
        style={{
          background: 'radial-gradient(ellipse 90% 70% at 50% -20%, rgba(139, 26, 26, 0.07) 0%, rgba(139, 26, 26, 0.02) 60%, transparent 100%)'
        }}
        aria-hidden="true" 
      />
      <div className="fixed -top-24 -right-24 size-96 rounded-full bg-red/4 blur-3xl pointer-events-none z-0 transform-gpu" aria-hidden="true" />
      <div className="fixed -top-24 -left-24 size-96 rounded-full bg-amber-500/3 blur-3xl pointer-events-none z-0 transform-gpu" aria-hidden="true" />

      {/* Skip Link for Keyboard Accessibility (WCAG 2.4.1 Level A) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-red focus:text-white focus:rounded-xl focus:font-extrabold focus:text-xs focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white"
      >
        Lewati ke Konten Utama
      </a>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={logout}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />

      {isSidebarOpen && (
        <div
          className="sidebar-mobile-overlay"
          aria-hidden="true"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={cn('main-layout relative z-10', isCollapsed && 'sidebar-collapsed')}>
        <Topbar
          userTitle={userTitle}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
          variant="tenant"
        />

        <main id="main-content" tabIndex={-1} className="main-content-inner focus:outline-none pb-24 md:pb-12">
          <Outlet />
        </main>
      </div>

      <BottomNav role="tenant" />
    </div>
  );
}

export default TenantLayout;
