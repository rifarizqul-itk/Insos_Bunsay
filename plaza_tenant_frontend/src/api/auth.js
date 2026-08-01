import { httpClient } from './client';

/**
 * Real API Adapter — memanggil backend Laravel via Sanctum token
 */
export const RealAuthAdapter = {
  async login({ username, password }) {
    try {
      const data = await httpClient.post('/login', { username, password });
      // Simpan token & user ke localStorage
      const role = data.user?.Id_roles === 1 ? 'admin' : 'tenant';
      const authPayload = { token: data.token, user: data.user, role };
      localStorage.setItem('auth', JSON.stringify(authPayload));
      return { success: true, message: 'Login berhasil.', ...authPayload };
    } catch (err) {
      return { success: false, message: err.message || 'Login gagal.' };
    }
  },

  async logout() {
    try {
      await httpClient.post('/logout');
    } catch (_) {}
    localStorage.removeItem('auth');
    sessionStorage.removeItem('auth');
    return { success: true, message: 'Logout berhasil.' };
  },

  async getSession() {
    const stored = localStorage.getItem('auth') || sessionStorage.getItem('auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return { isLoggedIn: true, role: parsed.role || 'tenant', user: parsed.user || null };
      } catch (_) {}
    }
    return { isLoggedIn: false, role: 'tenant', user: null };
  }
};

// Unified Port Seam Export
export const authPort = RealAuthAdapter;
