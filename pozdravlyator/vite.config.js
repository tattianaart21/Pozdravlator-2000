import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_BENCH_API_PROXY_TARGET?.replace(/\/$/, '')
  const serverProxy = proxyTarget
    ? {
        '/bench-service': {
          target: proxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/bench-service/, ''),
        },
      }
    : undefined

  return {
    plugins: [react()],
    server: proxyTarget ? { proxy: serverProxy } : {},
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          benchmarks: resolve(__dirname, 'benchmarks.html'),
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.js'],
    },
  }
})
