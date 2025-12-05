import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // REQUIRED for GitHub Pages deployment at https://user.github.io/The_Accused/
  base: '/The_Accused/',
  build: {
    outDir: 'dist',
    rollupOptions: {
        output: {
            manualChunks: undefined
        }
    }
  }
});