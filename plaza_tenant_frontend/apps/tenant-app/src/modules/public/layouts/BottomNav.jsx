import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon, cn } from '@bunsay/shared-ui';

function BottomNav({ role = 'tenant' }) {
  const location = useLocation();

  const tenantItems = [
    { label: 'Beranda', path: '/tenant/dashboard', icon: 'heroicons:squares-2x2-20-solid', iconOutline: 'heroicons:squares-2x2' },
    { label: 'Bayar', path: '/tenant/pembayaran', icon: 'heroicons:credit-card-20-solid', iconOutline: 'heroicons:credit-card' },
    { label: 'Tagihan', path: '/tenant/tagihan', icon: 'heroicons:document-text-20-solid', iconOutline: 'heroicons:document-text' },
    { label: 'Histori', path: '/tenant/histori', icon: 'heroicons:clock-20-solid', iconOutline: 'heroicons:clock' },
    { label: 'Akun', path: '/tenant/akun', icon: 'heroicons:user-circle-20-solid', iconOutline: 'heroicons:user-circle' }
  ];

  const adminItems = [
    { label: 'Beranda', path: '/admin/dashboard', icon: 'heroicons:squares-2x2-20-solid', iconOutline: 'heroicons:squares-2x2' },
    { label: 'Verifikasi', path: '/admin/verifikasi-bukti', icon: 'heroicons:shield-check-20-solid', iconOutline: 'heroicons:shield-check' },
    { label: 'Setoran', path: '/admin/setoran-tunai', icon: 'heroicons:banknotes-20-solid', iconOutline: 'heroicons:banknotes' },
    { label: 'Riwayat', path: '/admin/riwayat', icon: 'heroicons:clock-20-solid', iconOutline: 'heroicons:clock' },
    { label: 'Akun', path: '/admin/akun', icon: 'heroicons:user-circle-20-solid', iconOutline: 'heroicons:user-circle' }
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
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-border/80 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="grid grid-cols-5 items-center h-15 max-w-lg mx-auto px-1">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={triggerHaptic}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center justify-center h-full py-1 transition-all active:scale-95 select-none relative group min-w-0',
                active ? 'text-red' : 'text-text-3 hover:text-text-2'
              )}
            >
              {/* Active top accent indicator line */}
              {active && (
                <span className="absolute top-0 inset-x-3.5 h-[2.5px] bg-red rounded-full shadow-xs animate-[fadeIn_0.15s_ease-out]" aria-hidden="true" />
              )}
              
              <div className="flex flex-col items-center justify-center gap-0.5">
                <Icon 
                  icon={active ? item.icon : (item.iconOutline || item.icon)} 
                  className={cn(
                    'size-5.5 transition-all duration-150',
                    active ? 'scale-105 text-red font-bold' : 'text-text-3 group-hover:text-text-2'
                  )}
                />
                <span className={cn(
                  'text-[10px] tracking-tight leading-tight truncate max-w-full text-center',
                  active ? 'font-extrabold text-red' : 'font-semibold text-text-3'
                )}>
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
