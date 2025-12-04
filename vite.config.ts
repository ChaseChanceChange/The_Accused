import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // REQUIRED for GitHub Pages
  base: '/The_Accused/',

  // No env variables, GH Pages can't use them
  define: {},

  resolve: {
    alias: {}
  }
});
