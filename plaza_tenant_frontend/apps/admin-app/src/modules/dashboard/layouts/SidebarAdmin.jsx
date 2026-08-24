import React, { startTransition } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon, cn } from '@bunsay/shared-ui';
import { useAdminAuth } from '../../auth/useAdminAuth';

function SidebarAdmin({ isOpen, onClose, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAdminAuth();

  const userPerms = user?.permissions || ['verifikasi_pembayaran', 'input_setoran', 'ekspor_laporan', 'kelola_kios', 'kelola_admin', 'lihat_audit_log'];
  const isSuperadmin = user?.sub_role === 'superadmin' || user?.username === 'admin' || user?.username === 'superadmin';

  const menuSections = [
    {
      title: 'MENU UTAMA',
      items: [
        { id: 'dashboard', label: 'Dashboard Admin', path: '/admin/dashboard', icon: 'heroicons:squares-2x2-20-solid' },
        { id: 'verifikasi-bukti', label: 'Verifikasi Transfer', path: '/admin/verifikasi-bukti', perm: 'verifikasi_pembayaran', icon: 'heroicons:clipboard-document-check-20-solid' },
        { id: 'setoran-tunai', label: 'Setoran Tunai Kasir', path: '/admin/setoran-tunai', perm: 'input_setoran', icon: 'heroicons:banknotes-20-solid' },
      ]
    },
    {
      title: 'DATA & AUDIT',
      items: [
        { id: 'riwayat', label: 'Riwayat Transaksi', path: '/admin/riwayat', icon: 'heroicons:clock-20-solid' },
        { id: 'kios', label: 'Manajemen Unit Kios', path: '/admin/kios', perm: 'kelola_kios', icon: 'heroicons:building-storefront-20-solid' },
        { id: 'ekspor', label: 'Ekspor Rekap Data', path: '/admin/ekspor', perm: 'ekspor_laporan', icon: 'heroicons:arrow-down-tray-20-solid' },
        { id: 'audit-log', label: 'Audit Trail Log', path: '/admin/audit-log', perm: 'lihat_audit_log', icon: 'heroicons:shield-check-20-solid' },
      ]
    },
    {
      title: 'PENGATURAN',
      items: [
        { id: 'akun', label: 'Akun Pengelola', path: '/admin/akun', icon: 'heroicons:user-group-20-solid' }
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

  const displayName = user?.nama_lengkap || user?.Username || 'Admin Pengelola';
  const displayRole = user?.sub_role ? user.sub_role.toUpperCase() : (isSuperadmin ? 'SUPERADMIN' : 'STAF ADMIN');
  const userInitials = displayName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'AD';

  return (
    <aside 
      data-slot="sidebar-admin"
      aria-label="Navigasi Utama Admin"
      className={cn('sidebar-admin-container flex flex-col justify-between h-dvh max-h-screen overflow-hidden font-sans', isOpen && 'mobile-open')}
    >
      {/* Header / Logo */}
      <div className="h-16 px-5 border-b border-border/80 flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center gap-2.5">
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
            ADMIN
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Tutup menu navigasi"
          className="sidebar-close-btn md:hidden p-1.5 text-text-2 hover:text-text hover:bg-mono-100 rounded-lg cursor-pointer active:scale-95 transition-all flex items-center justify-center"
        >
          <Icon icon="heroicons:x-mark-20-solid" className="size-5" />
        </button>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 flex flex-col gap-6">
        {menuSections.map((section) => {
          const visibleItems = section.items.filter(item => {
            if (!item.perm || isSuperadmin) return true;
            return userPerms.includes(item.perm);
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="flex flex-col gap-1.5">
              <span className="px-3.5 text-xs font-extrabold text-text-3 tracking-wider uppercase mb-1">
                {section.title}
              </span>

              {visibleItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.path)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-[14.5px] font-extrabold transition-all duration-150 cursor-pointer text-start relative group',
                      active
                        ? 'bg-red text-white shadow-xs'
                        : 'text-text-2 hover:text-text hover:bg-mono-100/80 active:scale-[0.99]'
                    )}
                  >
                    <Icon
                      icon={item.icon}
                      className={cn(
                        'size-5 shrink-0 transition-colors',
                        active ? 'text-white' : 'text-text-3 group-hover:text-red'
                      )}
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Bottom User Card */}
      <div className="p-3 border-t border-border/80 bg-mono-50/70 shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
        <div className="p-3 rounded-xl bg-white border border-border/80 shadow-2xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="size-10 rounded-full bg-red text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-2xs">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[13.5px] font-extrabold text-text block truncate leading-tight">
                {displayName}
              </span>
              <span className="text-[11px] font-bold text-text-3 block uppercase tracking-wide mt-0.5">
                {displayRole}
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Keluar dari Akun Admin"
            aria-label="Keluar dari Akun Admin"
            className="size-9 rounded-xl text-text-3 hover:text-red hover:bg-red-50 flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0"
          >
            <Icon icon="heroicons:arrow-right-on-rectangle-20-solid" className="size-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default SidebarAdmin;
export { SidebarAdmin };

