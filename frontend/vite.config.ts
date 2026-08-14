import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    // Local: `/` · Docker root: `/admin/` · Prodexo: `/fi2t/admin/` (via VITE_BASE / .env.production)
    base: env.VITE_BASE || process.env.VITE_BASE || '/',
    plugins: [react(), tailwindcss()],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
        // Proxy uploaded files so images work from the dev server (port 3000 → 8000)
        '/storage': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
  }
})
