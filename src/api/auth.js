import { mockDelay } from './client';

const mockDefaultUser = {
  name: 'Hj. Yuliana',
  email: 'yuliana.bunsay@email.com',
  kios: 'B-1001',
  statusPemilik: 'Aktif',
  role: 'tenant'
};

const mockAdminUser = {
  name: 'Pengelola Plaza (Admin)',
  email: 'info.plazabunsay@gmail.com',
  role: 'admin'
};

/**
 * Concrete Mock Adapter implementing AuthPort
 * Dipakai saat VITE_USE_MOCK=true (kategori 4: true external/mock)
 */
export const MockAuthAdapter = {
  async login({ username, email, password, role = 'tenant' }) {
    const inputUsername = username || email || '';
    if (!inputUsername || inputUsername.trim().length === 0) {
      return mockDelay({
        success: false,
        message: 'Username wajib diisi.',
        field: 'username'
      });
    }

    if (!password || password.length < 4) {
      return mockDelay({
        success: false,
        message: 'Kata sandi minimal 4 karakter.',
        field: 'password'
      });
    }

    const cleanUsername = inputUsername.trim();
    const userData = role === 'admin' 
      ? { ...mockAdminUser, username: cleanUsername, email: email || `${cleanUsername}@gmail.com` } 
      : { ...mockDefaultUser, username: cleanUsername, email: email || `${cleanUsername}@gmail.com` };

    return mockDelay({
      success: true,
      message: 'Login berhasil.',
      token: `mock-jwt-token-${Date.now()}`,
      role,
      user: userData
    });
  },

  async logout() {
    return mockDelay({
      success: true,
      message: 'Logout berhasil.'
    });
  },

  async getSession() {
    const stored = localStorage.getItem('auth') || sessionStorage.getItem('auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return mockDelay({
          isLoggedIn: true,
          role: parsed.role || 'tenant',
          user: parsed.user || null
        });
      } catch (_) {}
    }
    return mockDelay({
      isLoggedIn: false,
      role: 'tenant',
      user: null
    });
  }
};

// Unified Port Seam Export
export const authPort = MockAuthAdapter;
