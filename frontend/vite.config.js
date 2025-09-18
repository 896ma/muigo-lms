import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://muigo-farmers-lms.onrender.com',
        changeOrigin: true,
        secure: true,
      }
    }
  },
  build: {
    // Disable proxy in production builds
    rollupOptions: {
      external: []
    }
  }
})
