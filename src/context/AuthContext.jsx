import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authPort } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState('tenant');
  const [user, setUser] = useState(null);

  // Load auth state from authPort / storage
  useEffect(() => {
    authPort.getSession().then(session => {
      if (session && session.isLoggedIn) {
        setIsLoggedIn(true);
        setRole(session.role || 'tenant');
        setUser(session.user || null);
      }
    }).catch(() => {});
  }, []);

  const login = useCallback(async (roleParam, userData, rememberMe = true) => {
    setIsLoggedIn(true);
    setRole(roleParam);
    setUser(userData);

    const payload = JSON.stringify({ role: roleParam, user: userData });
    if (rememberMe) {
      localStorage.setItem('auth', payload);
      sessionStorage.removeItem('auth');
    } else {
      sessionStorage.setItem('auth', payload);
      localStorage.removeItem('auth');
    }
  }, []);

  const logout = useCallback(async () => {
    await authPort.logout();
    setIsLoggedIn(false);
    setRole('tenant');
    setUser(null);
    localStorage.removeItem('auth');
    sessionStorage.removeItem('auth');
  }, []);

  const updateUser = useCallback((newUserData) => {
    setUser(prev => {
      const updated = { ...(prev || {}), ...newUserData };
      const payload = JSON.stringify({ role, user: updated });
      if (localStorage.getItem('auth')) {
        localStorage.setItem('auth', payload);
      } else if (sessionStorage.getItem('auth')) {
        sessionStorage.setItem('auth', payload);
      }
      return updated;
    });
  }, [role]);

  const value = {
    isLoggedIn,
    role,
    user,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

