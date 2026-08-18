import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import Icon from './Icon';

const ToastContext = createContext({
  toasts: [],
  addToast: () => {},
  removeToast: () => {}
});

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const contextValue = useMemo(() => ({
    toasts,
    addToast,
    removeToast
  }), [toasts, addToast, removeToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <Toast toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

const Toast = ({ toasts = [], removeToast }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div 
      data-slot="toast-container"
      className="fixed z-50 flex flex-col gap-2 w-[calc(100%-32px)] md:w-auto md:max-w-sm left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px)+12px)] md:bottom-6"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role={toast.type === 'error' ? 'alert' : 'status'}
          aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
          className="bg-white border border-border rounded-lg p-3.5 px-4 shadow-card-elevated flex justify-between items-center animate-fadeIn"
          style={{ animation: 'fadeIn 0.2s ease' }}
        >
          <span 
            className="text-sm font-semibold break-words flex-1 pe-2 text-pretty"
            style={{
              color: toast.type === 'error' ? 'var(--red)' : toast.type === 'success' ? 'var(--green)' : 'var(--text)'
            }}
          >
            {toast.message}
          </span>
          {removeToast && (
            <button
              onClick={() => removeToast(toast.id)}
              aria-label="Tutup notifikasi"
              className="bg-transparent border-none text-lg cursor-pointer text-text-3 hover:text-text transition-colors flex items-center justify-center size-11 rounded-md active:scale-90"
            >
              <Icon icon="heroicons:x-mark-20-solid" className="size-4.5" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default Toast;
export { Toast };
