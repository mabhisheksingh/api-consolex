import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// https://vite.dev/config/
const repoName = 'api-consolex'

export default defineConfig({
  base: `/${repoName}/`,
  plugins: [preact()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
