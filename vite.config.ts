import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@api': path.resolve(import.meta.dirname, './src/api'),
      '@hooks': path.resolve(import.meta.dirname, './src/hooks'),
      '@lib': path.resolve(import.meta.dirname, './src/lib'),
      '@pages': path.resolve(import.meta.dirname, './src/pages'),
      '@routes': path.resolve(import.meta.dirname, './src/routes'),
      '@stores': path.resolve(import.meta.dirname, './src/stores'),
      '@/types': path.resolve(import.meta.dirname, './src/types'),
      '@validations': path.resolve(import.meta.dirname, './src/validations'),
    },
  }
});
