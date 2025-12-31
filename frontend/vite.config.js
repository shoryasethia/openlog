import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/openlog/', 
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
})
