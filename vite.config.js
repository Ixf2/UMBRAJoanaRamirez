
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      includeAssets: ['favicon.svg'],

      manifest: {
        name: 'UMBRA - Biblioteca de personajes',
        short_name: 'UMBRA',
        description: 'Crea y organiza tus personajes de rol.',
        lang: 'es',
        start_url: '/inicio',
        scope: '/',
        display: 'standalone',
        background_color: '#090f0f',
        theme_color: '#090f0f',

        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },


      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,webp,woff2}'
        ],

        globIgnores: [
          '**/images/*.png'
        ],

        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true
      }

    })
  ],

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    },
    preview: {
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true
        }
      }
    },

    watch: {
      ignored: ['**/public/fonts/**']
    }
  }
})
