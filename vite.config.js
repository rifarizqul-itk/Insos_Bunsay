import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // React Router — updates independently; separate chunk so upgrading
            // router doesn't bust the larger react-core cache.
            if (id.includes('react-router')) {
              return 'react-router';
            }
            // React core — highly stable, long-lived browser cache.
            if (id.includes('react-dom') || id.includes('/react/')) {
              return 'react-core';
            }
            // Iconify icon sets — can be large; isolate for caching.
            if (id.includes('@iconify')) {
              return 'iconify';
            }
          }
        }
      }
    }
  },
  server: {
    proxy: {
      // Mengintercept request lokal dari /v1/transactions
      '/v1/transactions': {
        target: 'https://app.sandbox.midtrans.com', // Cukup arahkan ke domain utama
        changeOrigin: true,
        secure: false,
        // Ubah jalur lokal /v1/transactions menjadi /snap/v1/transactions saat dikirim ke Midtrans
        rewrite: (path) => path.replace(/^\/v1\/transactions/, '/snap/v1/transactions'),
      }
    }
  }
});