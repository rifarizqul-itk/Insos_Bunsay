import React, { createContext, useState, useCallback, useMemo, useRef } from 'react';
import { createAuthHttpClient, safeDecodeJwt, useAuthHydration } from '@bunsay/shared-core';

export const TenantAuthContext = createContext(null);
export { useTenantAuth } from './useTenantAuth';

export function TenantAuthProvider({ children, apiBaseUrl }) {
  // Access Token stored strictly 100% in React memory state
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);

  // Ref gives the request interceptor always-fresh token reads without
  // recreating the Axios instance on every 15-minute silent refresh (BUG-NEW-03).
  const accessTokenRef = useRef(null);

  /**
   * Single source of truth for all token mutations.
   * Keeps accessTokenRef (for interceptor), accessToken state (for context consumers),
   * and user state in sync atomically.
   */
  const setTokenState = useCallback((newToken, userData = null) => {
    accessTokenRef.current = newToken;
    setAccessToken(newToken);
    if (newToken) {
      setUser(userData ?? safeDecodeJwt(newToken) ?? null);
    } else {
      setUser(null);
    }
  }, []);

  const handleLogout = useCallback(() => {
    accessTokenRef.current = null;
    setAccessToken(null);
    setUser(null);
    try { localStorage.removeItem('bunsay_tenant_rt'); } catch (_) {}
  }, []);

  // Initialize Tenant Auth HTTP Client — stable across token refreshes (BUG-NEW-03)
  const httpClient = useMemo(() => {
    return createAuthHttpClient({
      baseURL: apiBaseUrl || import.meta.env.VITE_API_BASE_URL || '',
      refreshEndpoint: '/api/v1/tenant/auth/refresh',
      getToken: () => accessTokenRef.current,   // always-fresh via ref, no stale closure
      setToken: (newToken) => setTokenState(newToken),
      onUnauthenticated: handleLogout,
    });
  }, [apiBaseUrl, handleLogout, setTokenState]); // accessToken removed from deps — client is now stable

  // Ref to lock hydration and prevent React StrictMode double-execution race condition
  const hydrationPromiseRef = useRef(null);

  // Silent Refresh on App Hydration / F5 Refresh
  const { isHydrated } = useAuthHydration({
    onHydrate: async () => {
      if (hydrationPromiseRef.current) {
        return hydrationPromiseRef.current;
      }

      hydrationPromiseRef.current = (async () => {
        try {
          const storedRt = typeof window !== 'undefined' ? localStorage.getItem('bunsay_tenant_rt') : null;
          if (!storedRt) {
            return;
          }
          const response = await httpClient.post(
            '/api/v1/tenant/auth/refresh',
            { refresh_token: storedRt },
            { headers: { 'X-Refresh-Token': storedRt } }
          );
          const { accessToken: token, refreshToken: newRt, user: userData } = response.data || {};
          if (newRt) {
            try { localStorage.setItem('bunsay_tenant_rt', newRt); } catch (_) {}
          }
          if (token) {
            setTokenState(token, userData ?? null);
          }
        } catch (e) {
          handleLogout();
        }
      })();

      return hydrationPromiseRef.current;
    },
  });

  const login = useCallback(async (username, password) => {
    const response = await httpClient.post('/api/v1/tenant/auth/login', { username, password });
    const { accessToken: token, refreshToken: rt, user: userData } = response.data;
    if (rt) {
      try { localStorage.setItem('bunsay_tenant_rt', rt); } catch (_) {}
    }
    setTokenState(token, userData ?? null);
    return response.data;
  }, [httpClient, setTokenState]);

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
