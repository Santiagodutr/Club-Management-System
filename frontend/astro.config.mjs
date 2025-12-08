import { defineConfig } from 'astro/config'
import node from '@astrojs/node'
import { fileURLToPath } from 'url'

export default defineConfig({
  output: 'hybrid',
  adapter: node({
    mode: 'standalone'
  }),
  vite: {
    resolve: {
      alias: {
        '@scripts': fileURLToPath(new URL('./src/lib/scripts', import.meta.url))
      }
    }
  }
})
