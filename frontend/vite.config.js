import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/openlog/',  // Update this to match your GitHub repo name
  build: {
    outDir: '../docs',  // Build to docs folder for GitHub Pages
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
})
