import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const rootEnvDir = path.resolve(import.meta.dirname, '../../');
  const env = loadEnv(mode, rootEnvDir);
  const targetApi = env.VITE_API_URL || process.env.VITE_API_URL || 'https://bunsay-backend.ddev.site';

  return {
    plugins: [react(), tailwindcss()],
    envDir: rootEnvDir,
    publicDir: path.resolve(import.meta.dirname, '../../public'),
    resolve: {
      alias: {
        '@bunsay/shared-ui': path.resolve(import.meta.dirname, '../../packages/shared-ui/src'),
        '@bunsay/shared-core': path.resolve(import.meta.dirname, '../../packages/shared-core/src'),
        '@': path.resolve(import.meta.dirname, './src')
      }
    },
    server: {
      port: 3001,
      proxy: {
        '/api': {
          target: targetApi,
          changeOrigin: true,
          secure: false,
        },
        '/storage': {
          target: targetApi,
          changeOrigin: true,
          secure: false,
        }
      }
    },
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react/') || id.includes('react-dom/') || id.includes('react-router') || id.includes('@remix-run')) {
                return 'vendor-react';
              }
              if (id.includes('@iconify')) {
                return 'vendor-icons';
              }
              if (id.includes('axios')) {
                return 'vendor-http';
              }
              if (id.includes('qrcode.react')) {
                return 'vendor-qrcode';
              }
              if (id.includes('exceljs')) {
                return 'vendor-excel';
              }
              if (id.includes('pusher-js') || id.includes('laravel-echo')) {
                return 'vendor-echo';
              }
            }
          }
        }
      }
    }
  };
});
