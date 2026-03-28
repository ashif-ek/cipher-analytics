import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ['react-hook-form', 'lucide-react', 'react-router-dom', 'axios', 'zod', '@hookform/resolvers/zod']
  },
  server: {
    watch: {
      usePolling: true
    }
  }
})
