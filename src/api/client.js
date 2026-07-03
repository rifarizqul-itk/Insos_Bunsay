// Simulasi axios client untuk mock API
// Nanti tinggal diganti dengan axios.create() saat backend ready

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const apiClient = {
  get: async (url) => {
    await delay(300);
    // Mock: akan diisi oleh fungsi spesifik
    throw new Error('Not implemented');
  },
  post: async (url, data) => {
    await delay(300);
    // Mock: akan diisi oleh fungsi spesifik
    throw new Error('Not implemented');
  },
  put: async (url, data) => {
    await delay(300);
    // Mock: akan diisi oleh fungsi spesifik
    throw new Error('Not implemented');
  },
  delete: async (url) => {
    await delay(300);
    // Mock: akan diisi oleh fungsi spesifik
    throw new Error('Not implemented');
  }
};

// Helper untuk mock delay
export const mockDelay = (data, ms = 400) => new Promise(resolve => setTimeout(() => resolve(data), ms));
