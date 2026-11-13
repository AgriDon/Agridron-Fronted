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
      // Hybrid proxy: route Sprint 3 Bounded Contexts to real backend
      // and keep Sprint 4 Bounded Contexts (inventory, reports) routed to json-server.
      proxy: {
        '^/api/v1/(farms|parcels|crops|fumigation-areas|drones|missions|operations|incidents)': {
          target: env.VITE_DEV_PROXY_TARGET || 'http://localhost:5000',
          changeOrigin: true
        },
        '/api': {
          target: env.VITE_MOCK_PROXY_TARGET || 'http://localhost:3000',
          changeOrigin: true
        }
      }
    }
  }
})
