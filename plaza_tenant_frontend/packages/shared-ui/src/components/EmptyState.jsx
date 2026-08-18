import React from 'react';
import { cn } from '../utils/cn';
import Icon from './Icon';
import Button from './Button';

function EmptyState({
  icon = 'heroicons:inbox-20-solid',
  title = 'Tidak Ada Data Terkait',
  description = 'Saat ini belum ada catatan data yang dapat ditampilkan di tabel ini.',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white/60 rounded-xl border border-dashed border-border/80',
        className
      )}
    >
      <div className="size-14 rounded-2xl bg-warm-gray/60 flex items-center justify-center text-red/80 mb-4 shadow-sm">
        <Icon icon={icon} className="size-7.5" />
      </div>
      <h4 className="text-lg font-bold text-text tracking-tight text-balance mb-1">
        {title}
      </h4>
      <p className="text-sm text-text-2 font-medium max-w-md leading-relaxed text-pretty mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
export { EmptyState };
