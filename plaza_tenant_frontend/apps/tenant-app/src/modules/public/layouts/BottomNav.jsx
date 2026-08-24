import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@bunsay/shared-ui';

function BottomNav({ role }) {
  const location = useLocation();

  const tenantItems = [
    { label: 'Beranda', path: '/tenant/dashboard', icon: 'material-symbols:dashboard-outline' },
    { label: 'Bayar', path: '/tenant/pembayaran', icon: 'material-symbols:payments-outline' },
    { label: 'Tagihan', path: '/tenant/tunggakan', icon: 'material-symbols:warning-outline' },
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
      className="md:hidden fixed bottom-2 inset-x-2.5 z-30 bg-white/95 backdrop-blur-md border border-border/80 shadow-xl rounded-2xl overflow-hidden"
      style={{
        marginBottom: 'calc(env(safe-area-inset-bottom, 0px))',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}
    >
      <div className="flex w-full h-16 items-center justify-between px-1.5 py-1">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={triggerHaptic}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              className="flex-1 flex flex-col items-center justify-center h-full px-0.5 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer select-none text-decoration-none min-w-0"
            >
              <div className={`flex flex-col items-center justify-center w-full py-1 px-1 rounded-xl transition-all ${
                active 
                  ? 'bg-red/10 border border-red/20 shadow-2xs text-red' 
                  : 'text-text-2 hover:text-text'
              }`}>
                <Icon 
                  icon={item.icon} 
                  className={`size-5 mb-0.5 shrink-0 transition-transform ${active ? 'scale-105 text-red font-bold' : 'text-text-2'}`}
                />
                <span className={`text-[11px] leading-tight tracking-tight truncate max-w-full text-center px-0.5 ${
                  active ? 'font-extrabold text-red' : 'font-bold text-text-2'
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
