const BASE_URL = import.meta.env?.VITE_API_BASE_URL || '/api';
const DEFAULT_TIMEOUT = 10000;

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

async function httpRequest(endpoint, options = {}) {
  const { method = 'GET', body, headers = {}, timeout = DEFAULT_TIMEOUT } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let authHeader = {};
  if (options.token) {
    authHeader = { Authorization: `Bearer ${options.token}` };
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

export const apiClient = httpClient;
export const mockDelay = (data, ms = 300) => new Promise(resolve => setTimeout(() => resolve(data), ms));
