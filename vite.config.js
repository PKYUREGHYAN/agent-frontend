import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const proxy = {
  '/api': {
    target: 'http://127.0.0.1:5000',
    changeOrigin: true,
  },
  '/cleaned-photos': {
    target: 'http://127.0.0.1:5000',
    changeOrigin: true,
  },
}

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['framer-motion', 'lucide-react'],
  },
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    proxy,
  },
  preview: {
    host: true,
    port: 5173,
    proxy,
  },
})
