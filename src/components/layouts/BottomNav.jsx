import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';

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
      className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-border shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      style={{
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px))',
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
          padding: '0 4px',
          margin: 0
        }}
      >
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
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
                color: active ? 'var(--red)' : 'var(--text-3)',
                fontWeight: active ? '700' : '600',
                textDecoration: 'none',
                boxSizing: 'border-box',
                padding: '4px 0'
              }}
            >
              <Icon 
                icon={item.icon} 
                width="24" 
                height="24" 
                style={{ marginBottom: '2px', flexShrink: 0 }}
              />
              <span 
                style={{
                  fontSize: '11px',
                  lineHeight: '1',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                  textAlign: 'center',
                  padding: '0 1px',
                  letterSpacing: '-0.01em'
                }}
              >
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
