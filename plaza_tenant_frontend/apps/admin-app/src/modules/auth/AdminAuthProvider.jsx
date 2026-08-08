import React, { createContext, useState, useCallback, useMemo, useRef } from 'react';
import { createAuthHttpClient, safeDecodeJwt, useAuthHydration } from '@bunsay/shared-core';

export const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children, apiBaseUrl }) {
  // Access Token stored strictly 100% in React memory state
  const [accessToken, setAccessToken] = useState(null);
  const [adminUser, setAdminUser] = useState(null);

  // Ref gives the request interceptor always-fresh token reads without
  // recreating the Axios instance on every 15-minute silent refresh (BUG-NEW-03).
  const accessTokenRef = useRef(null);

  /**
   * Single source of truth for all token mutations.
   * Keeps accessTokenRef (for interceptor), accessToken state (for context consumers),
   * and adminUser state in sync atomically.
   */
  const setTokenState = useCallback((newToken, userData = null) => {
    accessTokenRef.current = newToken;
    setAccessToken(newToken);
    if (newToken) {
      setAdminUser(userData ?? safeDecodeJwt(newToken) ?? null);
    } else {
      setAdminUser(null);
    }
  }, []);

  const handleLogout = useCallback(() => {
    accessTokenRef.current = null;
    setAccessToken(null);
    setAdminUser(null);
  }, []);

  // Initialize Admin Auth HTTP Client — stable across token refreshes (BUG-NEW-03)
  const httpClient = useMemo(() => {
    return createAuthHttpClient({
      baseURL: apiBaseUrl || import.meta.env.VITE_API_BASE_URL || '',
      refreshEndpoint: '/api/v1/admin/auth/refresh',
      getToken: () => accessTokenRef.current,   // always-fresh via ref, no stale closure
      setToken: (newToken) => setTokenState(newToken),
      onUnauthenticated: handleLogout,
    });
  }, [apiBaseUrl, handleLogout, setTokenState]); // accessToken removed from deps — client is now stable

  // Silent Refresh on App Hydration / F5 Refresh
  const { isHydrated } = useAuthHydration({
    onHydrate: async () => {
      try {
        const response = await httpClient.post('/api/v1/admin/auth/refresh', {});
        const { accessToken: token, user: userData } = response.data || {};
        if (token) {
          setTokenState(token, userData ?? null);
        }
      } catch (e) {
        handleLogout();
      }
    },
  });

  const loginAdmin = useCallback(async (username, password, mfaCode) => {
    let u = username;
    let p = password;
    let m = mfaCode;
    if (typeof username === 'object' && username !== null) {
      u = username.username;
      p = username.password;
      m = username.mfaCode;
    }
    const response = await httpClient.post('/api/v1/admin/auth/login', { username: u, password: p, mfaCode: m });
    const { accessToken: token, user: userData } = response.data;
    setTokenState(token, userData ?? null);
    return response.data;
  }, [httpClient, setTokenState]);

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
    // BUG-NEW-05: ?? null instead of || 'admin' — never default to a privileged role value.
    // AdminProtectedRoute guards against null role explicitly.
    role: adminUser?.role ?? null,
    user: adminUser,
    accessToken,
    httpClient,
    isHydrated,
    login: loginAdmin,
    loginAdmin,
    logout: logoutAdmin,
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
