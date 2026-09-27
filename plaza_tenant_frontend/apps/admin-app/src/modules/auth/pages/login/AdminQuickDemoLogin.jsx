import React from 'react';
import { Icon } from '@bunsay/shared-ui';

export const ADMIN_DEMO_ACCOUNTS = [
  {
    id: 'superadmin',
    title: 'Superadmin',
    subtitle: 'Patra (Akses Penuh)',
    username: 'sim_superadmin',
    fallbackUsernames: ['superadmin', 'admin'],
    password: 'admin123',
    icon: 'heroicons:shield-check-20-solid',
  },
  {
    id: 'kasir',
    title: 'Kasir Loket',
    subtitle: 'Arman (Setoran)',
    username: 'sim_admin_kasir',
    fallbackUsernames: ['admin_kasir'],
    password: 'admin123',
    icon: 'heroicons:banknotes-20-solid',
  },
  {
    id: 'kios',
    title: 'Verifikator',
    subtitle: 'Rifa (Cek Bukti)',
    username: 'sim_admin_kios',
    fallbackUsernames: ['admin_verif', 'admin_kios'],
    password: 'admin123',
    icon: 'heroicons:clipboard-document-check-20-solid',
  },
];

export function AdminQuickDemoLogin({ onQuickLogin, isSubmitting, activeLoadingId }) {
  return (
    <div data-slot="admin-quick-demo" className="mt-4 pt-3.5 border-t border-border">
      {/* Highlighted Header: Masuk Instan ke Dashboard */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-red-50/80 border border-red-200/70 mb-2.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="size-2 rounded-full bg-red animate-pulse shrink-0" />
          <span className="text-[11.5px] font-bold text-red tracking-tight truncate">
            Masuk Instan ke Dashboard
          </span>
        </div>
        <span className="text-[10px] font-medium text-text-2 bg-white/90 px-1.5 py-0.5 rounded border border-red-100 shrink-0">
          1-Klik Tanpa Sandi
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {ADMIN_DEMO_ACCOUNTS.map((role) => {
          const isLoading = activeLoadingId === role.id;
          const isPrimary = role.id === 'superadmin';

          return (
            <button
              key={role.id}
              type="button"
              id={`btn-quick-${role.id}`}
              onClick={() => onQuickLogin(role)}
              disabled={isSubmitting}
              className={`flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl border text-center transition-all duration-150 active:scale-95 cursor-pointer disabled:opacity-50 group ${
                isPrimary
                  ? 'bg-red-50/60 border-red/30 hover:bg-red-100/70 hover:border-red/50 shadow-xs'
                  : 'bg-warm-gray/35 border-border hover:bg-red-50/40 hover:border-red/30'
              }`}
            >
              <div
                className={`size-7 rounded-lg flex items-center justify-center mb-1 transition-colors ${
                  isPrimary
                    ? 'text-red bg-white/90 shadow-xs'
                    : 'text-text-2 bg-white/80 group-hover:text-red group-hover:bg-white'
                }`}
              >
                {isLoading ? (
                  <Icon icon="heroicons:arrow-path-20-solid" className="size-4 animate-spin text-red" />
                ) : (
                  <Icon icon={role.icon} className="size-4" />
                )}
              </div>

              <span className="text-xs font-bold text-text group-hover:text-red transition-colors truncate w-full">
                {isLoading ? 'Masuk...' : role.title}
              </span>
              <span className="text-[10px] text-text-3 group-hover:text-text-2 truncate w-full mt-0.5">
                {role.subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default AdminQuickDemoLogin;
