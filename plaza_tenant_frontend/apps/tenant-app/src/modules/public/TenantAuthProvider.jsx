import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { createAuthHttpClient, safeDecodeJwt, useAuthHydration } from '@bunsay/shared-core';

const TenantAuthContext = createContext(null);

export function TenantAuthProvider({ children, apiBaseUrl }) {
  // Access Token stored strictly 100% in React memory state
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);

  const handleLogout = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  // Initialize Tenant Auth HTTP Client
  const httpClient = useMemo(() => {
    return createAuthHttpClient({
      baseURL: apiBaseUrl || 'https://bunsayhub.id',
      refreshEndpoint: '/api/v1/tenant/auth/refresh',
      getToken: () => accessToken,
      setToken: (newToken) => {
        setAccessToken(newToken);
        if (newToken) {
          setUser(safeDecodeJwt(newToken));
        } else {
          setUser(null);
        }
      },
      onUnauthenticated: handleLogout,
    });
  }, [accessToken, apiBaseUrl, handleLogout]);

  // Silent Refresh on App Hydration / F5 Refresh
  const { isHydrated } = useAuthHydration({
    onHydrate: async () => {
      try {
        const response = await httpClient.post('/api/v1/tenant/auth/refresh', {});
        const token = response.data?.accessToken;
        if (token) {
          setAccessToken(token);
          setUser(safeDecodeJwt(token));
        }
      } catch (e) {
        handleLogout();
      }
    },
  });

  const login = useCallback(async (phone, password) => {
    const response = await httpClient.post('/api/v1/tenant/auth/login', { phone, password });
    const { accessToken: token, user: userData } = response.data;
    
    setAccessToken(token);
    setUser(userData || safeDecodeJwt(token));
    return response.data;
  }, [httpClient]);

  const logout = useCallback(async () => {
    try {
      await httpClient.post('/api/v1/tenant/auth/logout', {});
    } catch (_) {
    } finally {
      handleLogout();
    }
  }, [httpClient, handleLogout]);

  const value = {
    isLoggedIn: !!accessToken,
    role: 'tenant',
    user,
    accessToken,
    httpClient,
    isHydrated,
    login,
    logout,
  };

  return (
    <TenantAuthContext.Provider value={value}>
      {!isHydrated ? (
        <div className="flex min-h-screen items-center justify-center bg-[#FBF7F2]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2563EB] border-t-transparent" />
            <p className="text-sm font-medium text-gray-600">Memuat Portal Tenant Bunsay...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </TenantAuthContext.Provider>
  );
}

export const useTenantAuth = () => {
  const context = useContext(TenantAuthContext);
  if (!context) throw new Error('useTenantAuth harus digunakan di dalam TenantAuthProvider');
  return context;
};
