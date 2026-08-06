import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { createAuthHttpClient, safeDecodeJwt, useAuthHydration } from '@bunsay/shared-core';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children, apiBaseUrl }) {
  // Access Token stored strictly 100% in React memory state
  const [accessToken, setAccessToken] = useState(null);
  const [adminUser, setAdminUser] = useState(null);

  const handleLogout = useCallback(() => {
    setAccessToken(null);
    setAdminUser(null);
  }, []);

  // Initialize Admin Auth HTTP Client
  const httpClient = useMemo(() => {
    return createAuthHttpClient({
      baseURL: apiBaseUrl || 'https://admin.bunsayhub.id',
      refreshEndpoint: '/api/v1/admin/auth/refresh',
      getToken: () => accessToken,
      setToken: (newToken) => {
        setAccessToken(newToken);
        if (newToken) {
          setAdminUser(safeDecodeJwt(newToken));
        } else {
          setAdminUser(null);
        }
      },
      onUnauthenticated: handleLogout,
    });
  }, [accessToken, apiBaseUrl, handleLogout]);

  // Silent Refresh on App Hydration / F5 Refresh
  const { isHydrated } = useAuthHydration({
    onHydrate: async () => {
      try {
        const response = await httpClient.post('/api/v1/admin/auth/refresh', {});
        const token = response.data?.accessToken;
        if (token) {
          setAccessToken(token);
          setAdminUser(safeDecodeJwt(token));
        }
      } catch (e) {
        handleLogout();
      }
    },
  });

  const loginAdmin = useCallback(async (username, password, mfaCode) => {
    const response = await httpClient.post('/api/v1/admin/auth/login', { username, password, mfaCode });
    const { accessToken: token, user: userData } = response.data;
    
    setAccessToken(token);
    setAdminUser(userData || safeDecodeJwt(token));
    return response.data;
  }, [httpClient]);

  const logoutAdmin = useCallback(async () => {
    try {
      await httpClient.post('/api/v1/admin/auth/logout', {});
    } catch (_) {
    } finally {
      handleLogout();
    }
  }, [httpClient, handleLogout]);

  const value = {
    isLoggedIn: !!accessToken,
    role: adminUser?.role || 'admin',
    user: adminUser,
    accessToken,
    httpClient,
    isHydrated,
    loginAdmin,
    logoutAdmin,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {!isHydrated ? (
        <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            <p className="text-sm font-medium text-slate-300">Verifikasi Konsol Pengelola Plaza...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth harus digunakan di dalam AdminAuthProvider');
  return context;
};
