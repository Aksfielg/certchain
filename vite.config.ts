import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    open: false
  },
  optimizeDeps: {
    exclude: [],
    include: ['react', 'react-dom', 'ethers']
  },
  build: {
    sourcemap: false,
    minify: 'esbuild',
    target: 'esnext'
  }
})