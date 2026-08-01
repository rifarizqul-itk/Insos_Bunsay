/**
 * HTTP Transport Client Foundation
 * Digunakan sebagai port/adapter HTTP transport universal untuk terhubung ke REST API backend.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const DEFAULT_TIMEOUT = 10000; // 10 seconds

/**
 * Normalizer error terstandar (WCAG 3.3.1 & 3.3.3 & GEMINI.md)
 */
const normalizeError = (error, status) => {
  if (typeof error === 'object' && error !== null && error.message) {
    return {
      message: error.message,
      field: error.field || null,
      status: status || 500
    };
  }

  const defaultMessages = {
    400: 'Permintaan tidak valid. Periksa kembali isian form Anda.',
    401: 'Sesi login Anda telah berakhir. Silakan masuk kembali.',
    403: 'Anda tidak memiliki hak akses untuk melakukan aksi ini.',
    404: 'Sumber data yang diminta tidak ditemukan.',
    422: 'Validasi data gagal. Periksa kembali bidang input yang ditandai.',
    500: 'Terjadi kesalahan internal pada server. Silakan coba lagi nanti.'
  };

  return {
    message: defaultMessages[status] || 'Terjadi kesalahan pada jaringan. Pastikan koneksi internet Anda stabil.',
    field: null,
    status: status || 0
  };
};

/**
 * Core Request Fetcher Wrapper
 */
async function httpRequest(endpoint, options = {}) {
  const { method = 'GET', body, headers = {}, timeout = DEFAULT_TIMEOUT } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Auto-attach authorization token if present
  let authHeader = {};
  const storedAuth = localStorage.getItem('auth') || sessionStorage.getItem('auth');
  if (storedAuth) {
    try {
      const parsed = JSON.parse(storedAuth);
      if (parsed.token) {
        authHeader = { Authorization: `Bearer ${parsed.token}` };
      }
    } catch (_) {}
  }

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...authHeader,
      ...headers
    },
    signal: controller.signal
  };

  if (body) {
    config.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const normalized = normalizeError(data, response.status);
      return Promise.reject(normalized);
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return Promise.reject(normalizeError({ message: 'Waktu koneksi ke server telah habis (timeout).' }, 408));
    }
    return Promise.reject(normalizeError(err, 0));
  }
}

export const httpClient = {
  get: (endpoint, options) => httpRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => httpRequest(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options) => httpRequest(endpoint, { ...options, method: 'PUT', body }),
  delete: (endpoint, options) => httpRequest(endpoint, { ...options, method: 'DELETE' })
};

// Aliased Export for legacy compatibility
export const apiClient = httpClient;

// Helper delay untuk mock adapter
export const mockDelay = (data, ms = 300) => new Promise(resolve => setTimeout(() => resolve(data), ms));
