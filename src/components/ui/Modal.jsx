// Modal reusable - untuk verifikasi, konfirmasi, dll.
import React, { useEffect, useRef } from 'react';
import Button from './Button';

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

  // Focus trap sederhana
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length) focusable[0].focus();
    }
  }, [isOpen]);

  // Escape key untuk close
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
      className="fixed inset-0 z-[9999] flex items-center justify-center p-5 bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={`
          bg-white rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto
          page-fade-in ${sizeClasses[size]} ${className}
        `}
      >
        {/* Header */}
        {title && (
          <div className="flex justify-between items-center border-b border-border px-6 py-4">
            <h3 id="modal-title" className="text-lg font-bold text-text">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-text-3 hover:text-text transition-colors flex items-center justify-center h-11 w-11 rounded-md -mr-2"
              aria-label="Tutup modal"
            >
              ✕
            </button>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-border px-6 py-4 flex gap-3 justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
