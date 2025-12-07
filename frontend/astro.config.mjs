import { defineConfig } from 'astro/config'
import node from '@astrojs/node'

export default defineConfig({
  output: 'hybrid',
  adapter: node({
    mode: 'standalone'
  }),
  vite: {
    build: {
      rollupOptions: {
        external: []
      }
    }
  },
  // Exclude .client.ts files from being treated as pages
  experimental: {
    
  }
})
