import React, { startTransition } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon, cn } from '@bunsay/shared-ui';
import { useTenantAuth } from '../useTenantAuth';

function Sidebar({ isOpen, onClose, onLogout, isCollapsed = false, onToggleCollapse }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useTenantAuth();

  const menuSections = [
    {
      title: 'UTAMA',
      items: [
        { id: 'dashboard', label: 'Dashboard', path: '/tenant/dashboard', icon: 'heroicons:squares-2x2-20-solid' },
        { id: 'pembayaran', label: 'Bayar Sewa', path: '/tenant/pembayaran', icon: 'heroicons:credit-card-20-solid' },
      ]
    },
    {
      title: 'TAGIHAN & RIWAYAT',
      items: [
        { id: 'tagihan', label: 'Tagihan', path: '/tenant/tagihan', icon: 'heroicons:document-duplicate-20-solid' },
        { id: 'histori', label: 'Riwayat Transaksi', path: '/tenant/histori', icon: 'heroicons:clock-20-solid' },
      ]
    },
    {
      title: 'PENGATURAN',
      items: [
        { id: 'akun', label: 'Akun', path: '/tenant/akun', icon: 'heroicons:user-circle-20-solid' }
      ]
    }
  ];

  const handleNavigate = (path) => {
    startTransition(() => {
      navigate(path);
    });
    onClose();
  };

  const isActive = (path) => location.pathname === path;

  const displayName = user?.nama || user?.name || user?.Username || 'Tenant Bunsay';
  const displayKios = user?.kios || user?.No_Kios || 'Unit Kios';
  const userInitials = displayName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'TN';

  return (
    <aside 
      data-slot="sidebar"
      aria-label="Navigasi Utama Tenant"
      className={cn(
        'sidebar-tenant-container flex flex-col justify-between h-dvh max-h-screen overflow-hidden font-sans',
        isOpen && 'mobile-open',
        isCollapsed && 'desktop-collapsed'
      )}
    >
      {/* Header / Logo */}
      <div className={cn(
        'h-16 border-b border-border/80 flex items-center shrink-0 bg-white',
        isCollapsed ? 'px-3 justify-center md:px-2' : 'px-5 justify-between'
      )}>
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <picture>
              <source srcSet="/assets/main_logo_transparent_for_light_bg.webp" type="image/webp" />
              <img
                src="/assets/main_logo_transparent_for_light_bg.png"
                alt="Logo Plaza Kebun Sayur"
                loading="lazy"
                decoding="async"
                width={130}
                height={32}
                className="h-8 w-auto object-contain"
              />
            </picture>
            <span className="text-xs font-extrabold text-red bg-red-50 border border-red/20 px-2 py-0.5 rounded-md tracking-wider">
              TENANT
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Buka menu samping navigasi (Ctrl+B)"
            title="Buka menu samping navigasi (Ctrl+B)"
            className="flex items-center justify-center p-1 rounded-xl hover:bg-mono-100 transition-colors cursor-pointer group relative"
          >
            <img
              src="/assets/bunsay_qr_logo_128.png"
              alt="Logo Plaza Kebun Sayur"
              className="size-9 rounded-xl object-contain shadow-xs bg-white p-0.5 border border-border/60 group-hover:scale-105 transition-transform"
            />
            <span className="hidden md:group-hover:flex items-center fixed left-[80px] px-3 py-1.5 bg-mono-900 text-white text-xs font-extrabold rounded-xl shadow-xl pointer-events-none whitespace-nowrap z-[100] animate-[fadeIn_0.15s_ease-out]">
              Buka Menu (Ctrl+B)
            </span>
          </button>
        )}

        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          aria-label="Tutup menu navigasi"
          className="sidebar-close-btn md:hidden p-1.5 text-text-2 hover:text-text hover:bg-mono-100 rounded-lg cursor-pointer active:scale-95 transition-colors flex items-center justify-center"
        >
          <Icon icon="heroicons:x-mark-20-solid" className="size-5" />
        </button>

        {/* Desktop Collapse Toggle Button in Header */}
        {!isCollapsed && onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Lipat menu samping (Ctrl+B)"
            title="Lipat menu samping (Ctrl+B)"
            className="hidden md:flex size-8 items-center justify-center rounded-lg text-text-3 hover:text-text hover:bg-mono-100 transition-colors cursor-pointer"
          >
            <Icon icon="heroicons:chevron-double-left-20-solid" className="size-4.5" />
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <nav className={cn(
        'flex-1 overflow-y-auto custom-scrollbar flex flex-col',
        isCollapsed ? 'px-2 py-4 gap-3' : 'px-3 py-4 gap-6'
      )}>
        {menuSections.map((section) => (
          <div key={section.title} className="flex flex-col gap-1.5">
            {!isCollapsed ? (
              <span className="px-3.5 text-xs font-extrabold text-text-3 tracking-wider uppercase mb-1">
                {section.title}
              </span>
            ) : (
              <div className="h-px bg-border/60 my-1 mx-2" aria-hidden="true" />
            )}

            {section.items.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.path)}
                  aria-current={active ? 'page' : undefined}
                  aria-label={item.label}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center rounded-xl font-extrabold transition-colors duration-100 cursor-pointer relative group text-start min-h-[44px]',
                    isCollapsed 
                      ? 'size-11 min-w-[44px] justify-center mx-auto' 
                      : 'w-full gap-3.5 px-3.5 py-3 text-[14.5px]',
                    active
                      ? 'bg-red text-white shadow-xs'
                      : 'text-text-2 hover:text-text hover:bg-mono-100/80 active:scale-[0.98]'
                  )}
                >
                  <Icon
                    icon={item.icon}
                    className={cn(
                      'size-5 shrink-0 transition-colors',
                      active ? 'text-white' : 'text-text-3 group-hover:text-red'
                    )}
                  />
                  {!isCollapsed && (
                    <span className="flex-1 truncate">{item.label}</span>
                  )}

                  {/* Accessible Desktop Tooltip in Collapsed Mode */}
                  {isCollapsed && (
                    <span className="hidden md:group-hover:flex items-center fixed left-[84px] px-3 py-1.5 bg-mono-900 text-white text-xs font-extrabold rounded-xl shadow-xl pointer-events-none whitespace-nowrap z-[100] animate-[fadeIn_0.15s_ease-out]">
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Tenant Profile Card */}
      <div className={cn(
        'border-t border-border/80 bg-mono-50/70 shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]',
        isCollapsed ? 'p-2' : 'p-3'
      )}>
        {!isCollapsed ? (
          <div className="p-3 rounded-xl bg-white border border-border/80 shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="size-10 rounded-full bg-red text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-2xs">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[13.5px] font-extrabold text-text block truncate leading-tight">
                  {displayName}
                </span>
                <span className="text-[11px] font-bold text-red block font-tabular-nums mt-0.5">
                  {displayKios}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Keluar dari Portal Tenant"
              aria-label="Keluar dari Portal Tenant"
              className="size-9 rounded-xl text-text-3 hover:text-red hover:bg-red-50 flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0"
            >
              <Icon icon="heroicons:arrow-right-on-rectangle-20-solid" className="size-5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 p-1.5 bg-white rounded-xl border border-border/80 shadow-2xs">
            <div 
              className="size-9 rounded-full bg-red text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-2xs cursor-default relative group"
              title={`${displayName} (${displayKios})`}
            >
              {userInitials}
              <span className="hidden md:group-hover:flex items-center fixed left-[84px] px-3 py-1.5 bg-mono-900 text-white text-xs font-extrabold rounded-xl shadow-xl pointer-events-none whitespace-nowrap z-[100] animate-[fadeIn_0.15s_ease-out]">
                {displayName} ({displayKios})
              </span>
            </div>

            <button
              onClick={onLogout}
              title="Keluar dari Portal Tenant"
              aria-label="Keluar dari Portal Tenant"
              className="size-9 rounded-xl text-text-3 hover:text-red hover:bg-red-50 flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0 relative group"
            >
              <Icon icon="heroicons:arrow-right-on-rectangle-20-solid" className="size-5" />
              <span className="hidden md:group-hover:flex items-center fixed left-[84px] px-3 py-1.5 bg-mono-900 text-white text-xs font-extrabold rounded-xl shadow-xl pointer-events-none whitespace-nowrap z-[100] animate-[fadeIn_0.15s_ease-out]">
                Keluar
              </span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
export { Sidebar };

