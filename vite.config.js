import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // .env files live in the project root (Vite's default envDir).
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    plugins: [
      vue(),
      vueDevTools(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@primeui/license-manager': fileURLToPath(new URL('./src/shared/license-mock.js', import.meta.url)),
        '@primevue/core/license/licenseBanner': fileURLToPath(new URL('./src/shared/license-mock.js', import.meta.url))
      },
    },
    server: {
      // Proxy /api to json-server so the browser stays on one origin.
      // The app therefore uses a relative VITE_API_BASE_URL ("/api/v1").
      proxy: {
        '/api': {
          target: env.VITE_DEV_PROXY_TARGET || 'http://localhost:3000',
          changeOrigin: true
        }
      }
    }
  }
})