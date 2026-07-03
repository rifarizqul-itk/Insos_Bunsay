import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState('tenant');
  const [user, setUser] = useState(null);

  // Load auth state from storage (localStorage or sessionStorage)
  useEffect(() => {
    const loadFromStorage = (storage) => {
      const stored = storage.getItem('auth');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setIsLoggedIn(true);
          setRole(parsed.role || 'tenant');
          setUser(parsed.user || null);
          return true;
        } catch (_) {}
      }
      return false;
    };

    // Priority: localStorage first (remember me), then sessionStorage
    if (!loadFromStorage(localStorage)) {
      loadFromStorage(sessionStorage);
    }
  }, []);

  const login = useCallback((role, userData, rememberMe = true) => {
    setIsLoggedIn(true);
    setRole(role);
    setUser(userData);

    const payload = JSON.stringify({ role, user: userData });
    if (rememberMe) {
      localStorage.setItem('auth', payload);
      sessionStorage.removeItem('auth');
    } else {
      sessionStorage.setItem('auth', payload);
      localStorage.removeItem('auth');
    }
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setRole('tenant');
    setUser(null);
    localStorage.removeItem('auth');
    sessionStorage.removeItem('auth');
  }, []);

  const value = {
    isLoggedIn,
    role,
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
