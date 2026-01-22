import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// Docker Compose runs the API behind a service DNS name and needs explicit HMR settings.
// These defaults keep local (non-Docker) dev working while enabling hot reload in containers.
const apiProxyTarget = process.env.VITE_API_PROXY_TARGET || 'http://localhost:7071'
const hmrHost = process.env.VITE_HMR_HOST
const hmrPort = Number(process.env.VITE_HMR_PORT || 5173)
const hmrConfig = hmrHost ? { host: hmrHost, clientPort: hmrPort } : { clientPort: hmrPort }

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Our Grocery List',
        short_name: 'Grocery List',
        description: 'Simple shared grocery list that works on phones and desktops',
        theme_color: '#ffcc00',
        background_color: '#ffcc00',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icon-yellow-background-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-yellow-background-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    // Required for Docker Compose: bind to all interfaces and wire HMR to the host port.
    host: true,
    port: 5173,
    strictPort: true,
    hmr: hmrConfig,
    proxy: {
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  }
})
