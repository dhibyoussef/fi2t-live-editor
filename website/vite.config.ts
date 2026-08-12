import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Local: `/` · Prodexo preprod: `/fi2t/` (via VITE_BASE)
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  server: {
    port: 3002,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/storage': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
