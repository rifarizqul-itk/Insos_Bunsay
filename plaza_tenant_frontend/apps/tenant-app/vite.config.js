import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  envDir: path.resolve(import.meta.dirname, '../../'),
  publicDir: path.resolve(import.meta.dirname, '../../public'),
  resolve: {
    alias: {
      '@bunsay/shared-ui': path.resolve(import.meta.dirname, '../../packages/shared-ui/src'),
      '@bunsay/shared-core': path.resolve(import.meta.dirname, '../../packages/shared-core/src'),
      '@': path.resolve(import.meta.dirname, './src')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/storage': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
});
