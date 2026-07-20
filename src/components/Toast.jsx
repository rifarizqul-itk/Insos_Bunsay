import React from 'react';
import { useUI } from '../context/UIContext';

const Toast = () => {
  const { toasts, removeToast } = useUI();

  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed z-[9999] flex flex-col gap-2 w-[calc(100%-32px)] md:w-auto md:max-w-[400px] left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px)+12px)] md:bottom-6"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-white border border-border rounded-lg p-3.5 px-4.5 shadow-[0_4px_16px_rgba(0,0,0,0.08)] flex justify-between items-center animate-fadeIn"
          style={{ animation: 'fadeIn 0.2s ease' }}
        >
          <span 
            className="text-sm font-semibold break-words flex-1 pr-2"
            style={{
              color: toast.type === 'error' ? 'var(--red)' : toast.type === 'success' ? 'var(--green)' : 'var(--text)'
            }}
          >
            {toast.message}
          </span>
          <button
            onClick={() => removeToast(toast.id)}
            aria-label="Tutup notifikasi"
            className="bg-transparent border-none text-lg cursor-pointer text-text-3 hover:text-text transition-colors flex items-center justify-center h-11 w-11 rounded-md active:scale-90"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
