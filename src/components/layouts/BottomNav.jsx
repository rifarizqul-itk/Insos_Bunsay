import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';

function BottomNav({ role }) {
  const location = useLocation();

  const tenantItems = [
    { label: 'Dashboard', path: '/tenant/dashboard', icon: 'material-symbols:dashboard-outline' },
    { label: 'Bayar', path: '/tenant/pembayaran', icon: 'material-symbols:payments-outline' },
    { label: 'Tunggakan', path: '/tenant/tunggakan', icon: 'material-symbols:warning-outline' },
    { label: 'Histori', path: '/tenant/histori', icon: 'material-symbols:history' },
    { label: 'Akun', path: '/tenant/akun', icon: 'material-symbols:person-outline' }
  ];

  const adminItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'material-symbols:dashboard-outline' },
    { label: 'Verifikasi', path: '/admin/verifikasi-bukti', icon: 'material-symbols:fact-check-outline' },
    { label: 'Setoran', path: '/admin/setoran-tunai', icon: 'material-symbols:payments-outline' },
    { label: 'Riwayat', path: '/admin/riwayat', icon: 'material-symbols:history' },
    { label: 'Kios', path: '/admin/kios', icon: 'material-symbols:storefront-outline' }
  ];

  const menuItems = role === 'admin' ? adminItems : tenantItems;

  const isActive = (path) => {
    if (path === '/admin/dashboard' && location.pathname === '/admin/dashboard') return true;
    if (path === '/tenant/dashboard' && location.pathname === '/tenant/dashboard') return true;
    return location.pathname.startsWith(path) && path !== '/admin/dashboard' && path !== '/tenant/dashboard';
  };

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border shadow-[0_-4px_16px_rgba(0,0,0,0.04)]"
      style={{
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px))',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}
    >
      <div className="flex h-16 items-center justify-around px-2">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center justify-center flex-1 h-full py-2
                active:scale-95 transition-transform duration-100 ease-out cursor-pointer
                ${active ? 'text-red font-bold' : 'text-text-3 font-semibold'}
              `}
              style={{
                color: active ? 'var(--red)' : 'var(--text-3)',
                textDecoration: 'none',
                minWidth: '0'
              }}
            >
              <Icon 
                icon={item.icon} 
                width="24" 
                height="24" 
                className="mb-1"
              />
              <span className="text-[11px] leading-none truncate max-w-full px-1">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
