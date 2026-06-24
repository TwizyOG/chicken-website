import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' keeps every asset URL relative, so the same build works on
// GitHub Pages whether it's served from the domain root or /<repo>/.
export default defineConfig({
  base: './',
  plugins: [react()],
});
