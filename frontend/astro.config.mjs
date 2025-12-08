import { defineConfig } from 'astro/config'
import vercel from '@astrojs/vercel/serverless'
import { fileURLToPath } from 'url'

export default defineConfig({
  output: 'hybrid',
  adapter: vercel(),
  vite: {
    resolve: {
      alias: {
        '@scripts': fileURLToPath(new URL('./src/lib/scripts', import.meta.url))
      }
    }
  }
})
