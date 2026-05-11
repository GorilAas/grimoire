import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('/react') || id.includes('\\react')) return 'react'
          if (id.includes('/recharts') || id.includes('\\recharts')) return 'graficos'
          if (id.includes('/lucide-react') || id.includes('\\lucide-react')) return 'icones'
          if (id.includes('/axios') || id.includes('\\axios')) return 'http'
          return 'vendor'
        },
      },
    },
  },
})
