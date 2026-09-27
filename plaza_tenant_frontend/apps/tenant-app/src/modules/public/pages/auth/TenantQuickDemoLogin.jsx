import React from 'react';
import { Icon } from '@bunsay/shared-ui';

export const TENANT_DEMO_ACCOUNTS = [
  {
    id: 'clara',
    name: 'Clara (Ketua Tim)',
    subtitle: 'Multi-Kios A1',
    username: 'tenant_clara',
    fallbackUsernames: ['clara', 'clara_uenike'],
    password: 'bunsay123',
    icon: 'heroicons:building-storefront-20-solid',
  },
  {
    id: 'dawwas',
    name: 'Dawwas',
    subtitle: 'Tagihan Lancar',
    username: 'tenant_dawwas',
    fallbackUsernames: ['dawwas', 'dawwas_eryansyah'],
    password: 'bunsay123',
    icon: 'heroicons:check-badge-20-solid',
  },
  {
    id: 'indri',
    name: 'Indriani',
    subtitle: 'Cicilan Parsial',
    username: 'tenant_indri',
    fallbackUsernames: ['indri', 'indriani'],
    password: 'bunsay123',
    icon: 'heroicons:banknotes-20-solid',
  },
  {
    id: 'yael',
    name: 'Yael',
    subtitle: 'Menunggu Verif',
    username: 'tenant_yael',
    fallbackUsernames: ['yael', 'yael_crisyella'],
    password: 'bunsay123',
    icon: 'heroicons:clock-20-solid',
  },
];

export function TenantQuickDemoLogin({ onQuickLogin, isLoading, activeLoadingId }) {
  return (
    <div data-slot="tenant-quick-demo" className="mt-3.5 pt-3 border-t border-border">
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

      <div className="grid grid-cols-2 gap-2">
        {TENANT_DEMO_ACCOUNTS.map((t) => {
          const isItemLoading = activeLoadingId === t.id;
          const isPrimary = t.id === 'clara';

          return (
            <button
              key={t.id}
              type="button"
              id={`btn-quick-${t.id}`}
              onClick={() => onQuickLogin(t)}
              disabled={isLoading}
              className={`flex items-center gap-2 p-2 sm:p-2.5 rounded-xl border text-left transition-all duration-150 active:scale-95 cursor-pointer disabled:opacity-50 group ${
                isPrimary
                  ? 'bg-red-50/60 border-red/30 hover:bg-red-100/70 hover:border-red/50 shadow-xs'
                  : 'bg-warm-gray/35 border-border hover:bg-red-50/40 hover:border-red/30'
              }`}
            >
              <div
                className={`size-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isPrimary
                    ? 'text-red bg-white/90 shadow-xs'
                    : 'text-text-2 bg-white/80 group-hover:text-red group-hover:bg-white'
                }`}
              >
                {isItemLoading ? (
                  <Icon icon="heroicons:arrow-path-20-solid" className="size-4 animate-spin text-red" />
                ) : (
                  <Icon icon={t.icon} className="size-4" />
                )}
              </div>

              <div className="min-w-0">
                <div className="text-xs font-bold text-text group-hover:text-red transition-colors truncate">
                  {isItemLoading ? 'Masuk...' : t.name}
                </div>
                <div className="text-[10px] text-text-3 group-hover:text-text-2 truncate mt-0.5">
                  {t.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default TenantQuickDemoLogin;
