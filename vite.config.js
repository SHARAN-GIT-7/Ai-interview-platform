import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss  from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/company/auth': {
        target: 'http://localhost:5118',
        changeOrigin: true,
        secure: false,
      },
      '/api/company-info': {
        target: 'http://localhost:5082',
        changeOrigin: true,
        secure: false,
      },
      '/api/billing': {
        target: 'http://localhost:5299',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
