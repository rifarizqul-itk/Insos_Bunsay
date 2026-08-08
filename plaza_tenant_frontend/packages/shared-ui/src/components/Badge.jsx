import React from 'react';
import Icon from './Icon';

const statusConfig = {
  'Lunas': { bg: 'bg-green-bg border-green/30', text: 'text-green', label: 'Lunas', icon: 'heroicons:check-circle-20-solid' },
  'Diterima': { bg: 'bg-green-bg border-green/30', text: 'text-green', label: 'Diterima (Lunas)', icon: 'heroicons:check-circle-20-solid' },
  'Dicicil': { bg: 'bg-orange-bg border-orange/30', text: 'text-orange', label: 'Dicicil', icon: 'heroicons:arrow-path-20-solid' },
  'Belum Bayar': { bg: 'bg-red-100 border-red/30', text: 'text-red', label: 'Belum Bayar', icon: 'heroicons:exclamation-triangle-20-solid' },
  'Ditolak': { bg: 'bg-red-100 border-red/30', text: 'text-red', label: 'Ditolak', icon: 'heroicons:x-circle-20-solid' },
  'Menunggu': { bg: 'bg-amber-50 border-amber-300', text: 'text-amber-800', label: 'Menunggu Verifikasi', icon: 'heroicons:clock-20-solid' },
  'Menunggu Verifikasi': { bg: 'bg-amber-50 border-amber-300', text: 'text-amber-800', label: 'Menunggu Verifikasi', icon: 'heroicons:clock-20-solid' },
  'Terisi': { bg: 'bg-green-bg border-green/30', text: 'text-green', label: 'Terisi', icon: 'heroicons:home-20-solid' },
  'Kosong': { bg: 'bg-red-100 border-red/30', text: 'text-red', label: 'Kosong', icon: 'heroicons:no-symbol-20-solid' },
};

const Badge = React.memo(function Badge({ status, customText = null, className = '', clickable = false, onClick }) {
  const config = statusConfig[status] || { bg: 'bg-red-100 border-red/30', text: 'text-red', label: status || 'Belum Bayar', icon: 'heroicons:exclamation-triangle-20-solid' };
  const isClickable = clickable && typeof onClick === 'function';

  return (
    <span
      onClick={isClickable ? onClick : undefined}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs border
        ${config.bg} ${config.text}
        ${isClickable ? 'cursor-pointer border-2 border-orange hover:shadow-[0_2px_8px_rgba(192,92,0,0.3)] transition-shadow' : ''}
        ${className}
      `}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
    >
      <Icon icon={config.icon} width="14" height="14" />
      {customText || config.label}
    </span>
  );
});

export default Badge;
export { Badge };
