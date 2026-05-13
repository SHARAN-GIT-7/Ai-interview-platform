import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss  from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/user': {
        target: 'http://localhost:5280',
        changeOrigin: true,
        secure: false,
      },
      '/api/company': {
        target: 'http://localhost:5158',
        changeOrigin: true,
        secure: false,
      },
      '/api/send-verification': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/api/check-verification': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/api/verify': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
