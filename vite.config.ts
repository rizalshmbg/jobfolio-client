import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      '@api': path.resolve(import.meta.dirname, './src/api'),
      '@components': path.resolve(import.meta.dirname, './src/components'),
      '@hooks': path.resolve(import.meta.dirname, './src/hooks'),
      '@layouts': path.resolve(import.meta.dirname, './src/layouts'),
      '@lib': path.resolve(import.meta.dirname, './src/lib'),
      '@pages': path.resolve(import.meta.dirname, './src/pages'),
      '@routes': path.resolve(import.meta.dirname, './src/routes'),
      '@stores': path.resolve(import.meta.dirname, './src/stores'),
      '@/types': path.resolve(import.meta.dirname, './src/types'),
      '@utils': path.resolve(import.meta.dirname, './src/utils'),
      '@validations': path.resolve(import.meta.dirname, './src/validations'),
    },
  }
});
