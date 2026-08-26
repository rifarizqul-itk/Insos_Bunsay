import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@bunsay/shared-ui';

function BottomNav({ role }) {
  const location = useLocation();

  const tenantItems = [
    { label: 'Beranda', path: '/tenant/dashboard', icon: 'material-symbols:dashboard-outline' },
    { label: 'Bayar', path: '/tenant/pembayaran', icon: 'material-symbols:payments-outline' },
    { label: 'Tagihan', path: '/tenant/tagihan', icon: 'material-symbols:receipt-long-outline' },
    { label: 'Riwayat', path: '/tenant/histori', icon: 'material-symbols:history' },
    { label: 'Profil', path: '/tenant/akun', icon: 'material-symbols:person-outline' }
  ];

  const adminItems = [
    { label: 'Beranda', path: '/admin/dashboard', icon: 'material-symbols:dashboard-outline' },
    { label: 'Verifikasi', path: '/admin/verifikasi-bukti', icon: 'material-symbols:fact-check-outline' },
    { label: 'Setoran', path: '/admin/setoran-tunai', icon: 'material-symbols:payments-outline' },
    { label: 'Riwayat', path: '/admin/riwayat', icon: 'material-symbols:history' },
    { label: 'Profil', path: '/admin/akun', icon: 'material-symbols:person-outline' }
  ];

  const menuItems = role === 'admin' ? adminItems : tenantItems;

  const isActive = (path) => {
    if (path === '/admin/dashboard' && location.pathname === '/admin/dashboard') return true;
    if (path === '/tenant/dashboard' && location.pathname === '/tenant/dashboard') return true;
    return location.pathname.startsWith(path) && path !== '/admin/dashboard' && path !== '/tenant/dashboard';
  };

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'navigator' in window && typeof window.navigator.vibrate === 'function') {
      try { window.navigator.vibrate(10); } catch {}
    }
  };

  return (
    <nav 
      data-slot="bottom-nav"
      aria-label="Navigasi Bawah Seluler"
      className="md:hidden fixed bottom-3 inset-x-3 z-40 bg-white/95 backdrop-blur-2xl border border-border/90 shadow-2xl rounded-3xl p-1.5 max-w-lg mx-auto"
      style={{
        marginBottom: 'calc(env(safe-area-inset-bottom, 0px))',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}
    >
      <div className="flex w-full h-14 items-center justify-between gap-1">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={triggerHaptic}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              className="flex-1 flex flex-col items-center justify-center h-full rounded-2xl transition-all duration-150 active:scale-95 cursor-pointer select-none text-decoration-none min-w-0"
            >
              <div className={`flex flex-col items-center justify-center w-full py-1 px-1 rounded-2xl transition-all duration-200 ${
                active 
                  ? 'bg-gradient-to-br from-[#6E1313] via-[#8B1A1A] to-[#4E0E0E] text-white shadow-md shadow-red/25' 
                  : 'text-text-2 hover:text-text hover:bg-mono-100/60'
              }`}>
                <Icon 
                  icon={item.icon} 
                  className={`size-5 mb-0.5 shrink-0 transition-transform ${active ? 'scale-105 text-white font-bold' : 'text-text-2'}`}
                />
                <span className={`text-[10px] sm:text-[11px] leading-tight tracking-tight truncate max-w-full text-center px-0.5 ${
                  active ? 'font-extrabold text-white' : 'font-bold text-text-2'
                }`}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
export { BottomNav };
