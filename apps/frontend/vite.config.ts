import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { fileURLToPath } from 'url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    basicSsl(), // 啟用 HTTPS（會自動設定 server.https）
    tanstackRouter({
      autoCodeSplitting: true
    }),
    react(),
    tailwindcss()
  ],
  server: {
    port: 3000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@repo/backend': fileURLToPath(new URL('../backend/src', import.meta.url))
    }
  }
})
