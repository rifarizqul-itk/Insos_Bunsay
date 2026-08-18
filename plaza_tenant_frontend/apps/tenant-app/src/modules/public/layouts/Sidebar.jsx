import React, { startTransition } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon, cn } from '@bunsay/shared-ui';

function Sidebar({ isOpen, onClose, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/tenant/dashboard' },
    { id: 'pembayaran', label: 'Bayar Sekarang', path: '/tenant/pembayaran' },
    { id: 'histori', label: 'Histori Pembayaran', path: '/tenant/histori' },
    { id: 'tunggakan', label: 'Tunggakan Sewa', path: '/tenant/tunggakan' },
    { id: 'akun', label: 'Akun Tenant', path: '/tenant/akun' }
  ];

  const handleNavigate = (path) => {
    startTransition(() => {
      navigate(path);
    });
    onClose();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside 
      data-slot="sidebar"
      aria-label="Navigasi Utama Tenant"
      className={cn('sidebar-tenant-container flex flex-col justify-between h-dvh max-h-screen overflow-hidden', isOpen && 'mobile-open')}
      style={{
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{ 
        height: '64px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        paddingLeft: '24px', 
        paddingRight: '16px',
        borderBottom: '1px solid var(--border)',
        gap: '12px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <picture>
            <source srcSet="/assets/main_logo_transparent_for_light_bg.webp" type="image/webp" />
            <img
              src="/assets/main_logo_transparent_for_light_bg.png"
              alt="Logo Plaza Kebun Sayur"
              loading="lazy"
              decoding="async"
              width={144}
              height={36}
              style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
            />
          </picture>
          <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--red)', letterSpacing: '-0.5px' }}>
            Tenant
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Tutup menu navigasi"
          className="sidebar-close-btn block md:hidden p-2 text-2xl text-text-2 bg-transparent cursor-pointer active:scale-95 transition-transform size-11 flex items-center justify-center"
        >
          <Icon icon="ph:x-bold" className="size-5.5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto custom-scrollbar" style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.path)}
              aria-current={active ? 'page' : undefined}
              style={{
                width: '100%',
                backgroundColor: active ? 'var(--red-50)' : 'transparent',
                color: active ? 'var(--red)' : 'var(--text-2)',
                textAlign: 'start',
                padding: '12px 24px',
                borderRadius: '0',
                fontWeight: active ? '700' : '500',
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                border: 'none',
                borderInlineStart: active ? '4px solid var(--red)' : '4px solid transparent',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                if(!active) e.target.style.backgroundColor = 'var(--warm-gray)';
              }}
              onMouseLeave={(e) => {
                if(!active) e.target.style.backgroundColor = 'transparent';
              }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <div 
        className="p-5 sm:p-6 border-t border-border bg-white shrink-0"
        style={{ 
          paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' 
        }}
      >
        <button
          onClick={onLogout}
          className="w-full min-h-[44px] bg-warm-gray text-red hover:bg-red-100 active:scale-[0.98] transition-all p-2.5 text-sm font-bold text-center rounded-lg flex items-center justify-center gap-2 cursor-pointer border-none"
        >
          <Icon icon="material-symbols:logout" className="size-5" />
          <span>Keluar Aplikasi</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
export { Sidebar };
