import React, { useEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../utils/cn';
import Icon from './Icon';

export function Sheet({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  children,
  footer,
  size = 'md',
  width = 'md',
  className = '',
}) {
  const sheetRef = useRef(null);
  const previousFocusRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      if (sheetRef.current) {
        const focusable = sheetRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length) focusable[0].focus();
      }

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  const resolvedSize = sizeClasses[width] || sizeClasses[size] || 'max-w-md';

  const sheetContent = (
    <div
      data-slot="sheet-overlay"
      style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 9000, display: 'flex', justifyContent: 'flex-end' }}
      className="fixed inset-0 z-[9000] flex justify-end bg-mono-900/40 backdrop-blur-xs transition-opacity page-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
    >
      <div
        ref={sheetRef}
        style={{ height: '100dvh', maxHeight: '100dvh' }}
        className={cn(
          'w-full bg-white h-full shadow-2xl flex flex-col border-s border-border/80 transition-transform duration-200 ease-out',
          resolvedSize,
          className
        )}
      >
        {/* Sticky Header */}
        {(title || badge) && (
          <div className="flex items-center justify-between border-b border-border/80 px-6 py-4 bg-mono-50/90 flex-shrink-0 gap-3">
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {title && (
                  <h3 id={titleId} className="text-base sm:text-lg font-extrabold text-text tracking-tight truncate">
                    {title}
                  </h3>
                )}
                {badge}
              </div>
              {subtitle && (
                <p className="text-xs text-text-3 font-medium truncate">
                  {subtitle}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-text-3 hover:text-text hover:bg-mono-100 transition-colors flex items-center justify-center size-9 rounded-md shrink-0 cursor-pointer -me-1.5"
              aria-label="Tutup panel"
            >
              <Icon icon="heroicons:x-mark-20-solid" className="size-5" />
            </button>
          </div>
        )}

        {/* Scrollable Body Container */}
        <div className="px-6 py-5 overflow-y-auto flex-1 custom-scrollbar flex flex-col">
          {children}
        </div>

        {/* Sticky Footer */}
        {footer && (
          <div className="border-t border-border/80 px-6 py-3.5 flex gap-3 justify-end flex-shrink-0 bg-mono-50/90">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(sheetContent, document.body);
}

export default Sheet;
