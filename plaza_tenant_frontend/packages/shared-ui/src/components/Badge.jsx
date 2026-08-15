import React from 'react';
import { cn } from '../utils/cn';
import Icon from './Icon';

const statusConfig = {
  // Functional Statuses
  'Lunas': { bg: 'bg-green-bg border-green/30', text: 'text-green', label: 'Lunas', icon: 'heroicons:check-circle-20-solid' },
  'Diterima': { bg: 'bg-green-bg border-green/30', text: 'text-green', label: 'Lunas', icon: 'heroicons:check-circle-20-solid' },
  'Dicicil': { bg: 'bg-orange-bg border-orange/30', text: 'text-orange', label: 'Dicicil', icon: 'heroicons:arrow-path-20-solid' },
  'Belum Bayar': { bg: 'bg-red-50 border-red/30', text: 'text-red', label: 'Belum Bayar', icon: 'heroicons:exclamation-triangle-20-solid' },
  'Ditolak': { bg: 'bg-red-50 border-red/30', text: 'text-red', label: 'Ditolak', icon: 'heroicons:x-circle-20-solid' },
  'Menunggu': { bg: 'bg-amber-50 border-amber-300', text: 'text-amber-800', label: 'Menunggu Verifikasi', icon: 'heroicons:clock-20-solid' },
  'Menunggu Verifikasi': { bg: 'bg-amber-50 border-amber-300', text: 'text-amber-800', label: 'Menunggu Verifikasi', icon: 'heroicons:clock-20-solid' },
  'Terisi': { bg: 'bg-green-bg border-green/30', text: 'text-green', label: 'Terisi', icon: 'heroicons:home-20-solid' },
  'Kosong': { bg: 'bg-red-50 border-red/30', text: 'text-red', label: 'Kosong', icon: 'heroicons:no-symbol-20-solid' },
};

const variantConfig = {
  'success': { bg: 'bg-green-bg border-green/30', text: 'text-green', icon: 'heroicons:check-circle-20-solid' },
  'warning': { bg: 'bg-amber-50 border-amber-300', text: 'text-amber-800', icon: 'heroicons:exclamation-triangle-20-solid' },
  'danger': { bg: 'bg-red-50 border-red/30', text: 'text-red', icon: 'heroicons:x-circle-20-solid' },
  'info': { bg: 'bg-mono-100 border-mono-300', text: 'text-mono-800', icon: 'heroicons:information-circle-20-solid' },
  'neutral': { bg: 'bg-mono-100 border-border', text: 'text-text-2', icon: null },
};

const Badge = React.memo(function Badge({
  status,
  variant,
  children,
  customText = null,
  icon: customIcon,
  className = '',
  clickable = false,
  onClick
}) {
  let resolvedConfig = null;

  if (status && statusConfig[status]) {
    resolvedConfig = statusConfig[status];
  } else if (variant && variantConfig[variant]) {
    resolvedConfig = variantConfig[variant];
  } else if (status) {
    resolvedConfig = {
      bg: 'bg-mono-100 border-border',
      text: 'text-text-2',
      label: status,
      icon: 'heroicons:information-circle-20-solid'
    };
  } else {
    resolvedConfig = variantConfig.neutral;
  }

  const displayText = children || customText || resolvedConfig.label || '';
  const iconToRender = customIcon !== undefined ? customIcon : resolvedConfig.icon;
  const isClickable = clickable && typeof onClick === 'function';

  return (
    <span
      data-slot="badge"
      onClick={isClickable ? onClick : undefined}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] font-bold text-xs border tracking-normal whitespace-nowrap leading-normal w-fit self-start shrink-0 transition-all select-none',
        resolvedConfig.bg,
        resolvedConfig.text,
        isClickable && 'cursor-pointer hover:shadow-xs active:scale-[0.97]',
        className
      )}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
    >
      {iconToRender && (
        typeof iconToRender === 'string' ? (
          <Icon icon={iconToRender} className="size-3.5 shrink-0" />
        ) : (
          iconToRender
        )
      )}
      <span className="leading-normal">{displayText}</span>
    </span>
  );
});

export default Badge;
export { Badge };
