import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authPort } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState('tenant');
  const [user, setUser] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load auth state from authPort / storage
  useEffect(() => {
    authPort.getSession().then(session => {
      if (session && session.isLoggedIn) {
        setIsLoggedIn(true);
        setRole(session.role || 'tenant');
        setUser(session.user || null);
      }
    }).catch(() => {})
      .finally(() => {
        setIsHydrated(true);
      });
  }, []);

  const login = useCallback(async (roleParam, userData, rememberMe = true) => {
    // Jika dipanggil dari AuthPage dengan data dari backend (sudah ada token)
    // userData bisa berisi { token, user, role } dari RealAuthAdapter.login()
    const roleResolved = userData?.role || roleParam;
    const userResolved = userData?.user || userData;

    setIsLoggedIn(true);
    setRole(roleResolved);
    setUser(userResolved);
    setIsHydrated(true);

    // Simpan seluruh payload (termasuk token) ke storage
    const payload = JSON.stringify({ role: roleResolved, user: userResolved, token: userData?.token });
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
    setIsHydrated(true);
    localStorage.removeItem('auth');
    sessionStorage.removeItem('auth');
  }, []);

  const updateUser = useCallback((newUserData) => {
    setUser(prev => {
      const updated = { ...(prev || {}), ...newUserData };
      const existingStored = localStorage.getItem('auth') || sessionStorage.getItem('auth');
      let token = null;
      if (existingStored) {
        try { token = JSON.parse(existingStored).token; } catch (_) {}
      }
      const payload = JSON.stringify({ role, user: updated, token });
      if (sessionStorage.getItem('auth')) {
        sessionStorage.setItem('auth', payload);
      } else {
        localStorage.setItem('auth', payload);
      }
      return updated;
    });
  }, [role]);

  const value = {
    isLoggedIn,
    role,
    user,
    isHydrated,
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


