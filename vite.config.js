import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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