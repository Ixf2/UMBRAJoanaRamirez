import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Evita EBUSY al vigilar fuentes estáticas bloqueadas en Windows.
      ignored: ['**/public/fonts/**'],
    },
  },
})
