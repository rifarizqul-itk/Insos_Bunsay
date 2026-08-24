import React, { useEffect, useRef, useId } from 'react';
import { cn } from '../utils/cn';
import Icon from './Icon';

function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
}) {
  const drawerRef = useRef(null);
  const previousFocusRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      if (drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll(
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
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
        return;
      }
      if (e.key === 'Tab' && isOpen && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const firstEl = focusable[0];
        const lastEl = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstEl || !drawerRef.current.contains(document.activeElement)) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl || !drawerRef.current.contains(document.activeElement)) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      data-slot="drawer"
      className="fixed inset-0 z-[9000] flex justify-end bg-mono-900/50 backdrop-blur-xs transition-opacity page-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
    >
      <div
        ref={drawerRef}
        className={cn(
          'w-full bg-white h-full shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-out border-s border-border',
          sizeClasses[size]
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5 bg-cream/30">
          <div>
            <h3 id={titleId} className="text-xl font-extrabold text-text tracking-tight text-balance">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-text-2 font-medium mt-0.5 text-pretty">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-text-3 hover:text-text hover:bg-warm-gray/60 transition-colors flex items-center justify-center size-11 rounded-md -me-1 cursor-pointer"
            aria-label="Tutup panel"
          >
            <Icon icon="heroicons:x-mark-20-solid" className="size-5.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {children}
        </div>

        {footer && (
          <div className="border-t border-border px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-cream/20 flex gap-3 justify-end items-center">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Drawer;
export { Drawer };
