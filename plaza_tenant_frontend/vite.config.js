import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@bunsay/shared-ui': path.resolve(__dirname, './packages/shared-ui/src'),
      '@bunsay/shared-core': path.resolve(__dirname, './packages/shared-core/src'),
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router')) {
              return 'react-router';
            }
            if (id.includes('react-dom') || id.includes('/react/')) {
              return 'react-core';
            }
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
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/v1/transactions': {
        target: 'https://app.sandbox.midtrans.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/v1\/transactions/, '/snap/v1/transactions'),
      }
    }
  }
});