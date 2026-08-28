import React, { useEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../utils/cn';
import Icon from './Icon';

function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  children,
  footer,
  size = 'md',
  className = '',
  disableBackdropClick = false,
  disableEscapeKey = false,
}) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      if (modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
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
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !disableEscapeKey) {
        onClose();
        return;
      }
      if (e.key === 'Tab' && isOpen && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const firstEl = focusable[0];
        const lastEl = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstEl || !modalRef.current.contains(document.activeElement)) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl || !modalRef.current.contains(document.activeElement)) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, disableEscapeKey]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-3xl',
  };

  const modalContent = (
    <div
      data-slot="modal"
      style={{ position: 'fixed', inset: 0, zIndex: 10050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      className="fixed inset-0 z-[10050] flex items-center justify-center p-3 sm:p-6 bg-mono-900/60 page-fade-in overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget && !disableBackdropClick) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
    >
      <div
        ref={modalRef}
        className={cn(
          'bg-white rounded-2xl shadow-modal border border-border/80 w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden my-auto transform-gpu',
          sizeClasses[size] || sizeClasses.md,
          className
        )}
      >
        {(title || subtitle || badge) && (
          <div className="flex justify-between items-center border-b border-border/80 px-5 sm:px-6 py-3.5 sm:py-4 bg-mono-50/70 flex-shrink-0 gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {title && (
                    <h3 id={titleId} className="text-base sm:text-lg font-extrabold text-text tracking-tight truncate">
                      {title}
                    </h3>
                  )}
                  {badge}
                </div>
                {subtitle && (
                  <p className="text-xs text-text-3 font-semibold mt-0.5 truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-text-3 hover:text-text hover:bg-mono-100 active:scale-95 transition-all flex items-center justify-center min-w-[44px] min-h-[44px] size-11 rounded-lg -me-2 cursor-pointer shrink-0"
              aria-label="Tutup modal"
            >
              <Icon icon="heroicons:x-mark-20-solid" className="size-5.5" />
            </button>
          </div>
        )}

        <div className="px-5 sm:px-6 py-4 sm:py-5 overflow-y-auto flex-1 overscroll-contain transform-gpu [will-change:scroll-position] custom-scrollbar">
          {children}
        </div>

        {footer && (
          <div className="border-t border-border/80 px-5 sm:px-6 py-3.5 sm:py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] flex gap-3 justify-end flex-shrink-0 bg-mono-50/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default Modal;
export { Modal };
