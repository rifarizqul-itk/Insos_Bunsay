import React, { useEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../utils/cn';
import Icon from './Icon';

function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  className = '',
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
    full: 'max-w-2xl',
  };

  const modalContent = (
    <div
      data-slot="modal"
      style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 10000 }}
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 bg-mono-900/50 backdrop-blur-xs page-fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
    >
      <div
        ref={modalRef}
        className={cn(
          'bg-white rounded-2xl shadow-modal border border-border/80 w-full max-h-[88vh] flex flex-col overflow-hidden my-auto',
          sizeClasses[size],
          className
        )}
      >
        {title && (
          <div className="flex justify-between items-center border-b border-border/80 px-6 py-4 bg-mono-50/70 flex-shrink-0">
            <h3 id={titleId} className="text-lg font-extrabold text-text tracking-tight text-balance">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-text-3 hover:text-text hover:bg-mono-100 transition-colors flex items-center justify-center size-9 rounded-md -me-1.5 cursor-pointer"
              aria-label="Tutup modal"
            >
              <Icon icon="heroicons:x-mark-20-solid" className="size-5" />
            </button>
          </div>
        )}

        <div className="px-6 py-5 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>

        {footer && (
          <div className="border-t border-border/80 px-6 py-4 flex gap-3 justify-end flex-shrink-0 bg-mono-50/50">
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
