import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@bunsay/shared-ui';

function BottomNav() {
  const location = useLocation();

  const adminItems = [
    { label: 'Beranda', path: '/admin/dashboard', icon: 'material-symbols:dashboard-outline' },
    { label: 'Verifikasi', path: '/admin/verifikasi-bukti', icon: 'material-symbols:fact-check-outline' },
    { label: 'Setoran', path: '/admin/setoran-tunai', icon: 'material-symbols:payments-outline' },
    { label: 'Riwayat', path: '/admin/riwayat', icon: 'material-symbols:history' },
    { label: 'Profil', path: '/admin/akun', icon: 'material-symbols:person-outline' }
  ];

  const isActive = (path) => {
    if (path === '/admin/dashboard' && location.pathname === '/admin/dashboard') return true;
    return location.pathname.startsWith(path) && path !== '/admin/dashboard';
  };

  return (
    <nav 
      data-slot="bottom-nav-admin"
      className="md:hidden fixed bottom-2 left-2 right-2 z-30 bg-white/90 backdrop-blur-md border border-border/80 shadow-xl rounded-2xl overflow-hidden"
      style={{
        marginBottom: 'calc(env(safe-area-inset-bottom, 0px))',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}
    >
      <div 
        style={{
          display: 'flex',
          width: '100%',
          height: '64px',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
          padding: '0 6px',
          margin: 0
        }}
      >
        {adminItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              className="active:scale-95 transition-transform duration-100 ease-out cursor-pointer"
              style={{
                flex: '1 1 0%',
                width: '0',
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: active ? 'var(--red)' : 'var(--text-2)',
                fontWeight: active ? '700' : '600',
                textDecoration: 'none',
                boxSizing: 'border-box',
                padding: '4px 0'
              }}
            >
              <Icon 
                icon={item.icon} 
                className="size-6 mb-0.5 shrink-0"
              />
              <span className="text-2.5 xs:text-xs leading-none font-semibold tracking-tight truncate max-w-full text-center px-0.5">
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
