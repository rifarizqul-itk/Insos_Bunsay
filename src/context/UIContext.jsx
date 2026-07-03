import React, { createContext, useContext, useState, useCallback } from 'react';

const UIContext = createContext(null);

export const UIProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [bayarProps, setBayarProps] = useState({ nominal: '', jenis: 'Service Charge' });

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const setBayar = useCallback((nominal, jenis) => {
    setBayarProps({ nominal, jenis });
  }, []);

  const value = {
    toasts,
    addToast,
    removeToast,
    bayarProps,
    setBayar,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
};
