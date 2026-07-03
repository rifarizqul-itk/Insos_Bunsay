import React from 'react';
import { useUI } from '../context/UIContext';

const Toast = () => {
  const { toasts, removeToast } = useUI();

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      zIndex: 9999,
      maxWidth: '400px',
      width: '100%'
    }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: toast.type === 'error' ? 'var(--red)' : toast.type === 'success' ? 'var(--green)' : 'var(--text)'
          }}>
            {toast.message}
          </span>
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: 'var(--text-3)',
              padding: '0 4px'
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
