import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // If the frontend tries to call /api, /auth, etc. it will be proxied to the backend
      // But we will just proxy all common paths if needed. 
      // Bookish Bliss seems to use absolute URLs mostly via ENV, but just in case:
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'build', // CRA default output directory
  }
});
