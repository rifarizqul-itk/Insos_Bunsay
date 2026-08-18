import React, { useEffect, useRef, useId } from 'react';
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
      if (modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length) focusable[0].focus();
      }
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

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-2xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/45 backdrop-blur-sm page-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
    >
      <div
        ref={modalRef}
        className={`
          bg-white rounded-2xl shadow-2xl border border-border w-full max-h-[90dvh] flex flex-col overflow-hidden
          page-fade-in ${sizeClasses[size]} ${className}
        `}
      >
        {title && (
          <div className="flex justify-between items-center border-b border-border px-6 py-4 bg-cream/20 flex-shrink-0">
            <h3 id={titleId} className="text-lg font-extrabold text-text tracking-tight text-balance">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-text-3 hover:text-text hover:bg-warm-gray/60 transition-colors flex items-center justify-center size-11 rounded-md -mr-2"
              aria-label="Tutup modal"
            >
              <Icon icon="heroicons:x-mark-20-solid" width="22" height="22" />
            </button>
          </div>
        )}

        <div className="px-6 py-5 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>

        {footer && (
          <div className="border-t border-border px-6 py-4 flex gap-3 justify-end flex-shrink-0 bg-cream/10">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
export { Modal };
