import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  base: '/estudio-cards/',
  plugins: [
    react({
      babel: {
        plugins: ['@emotion/babel-plugin']
      }
    }),
    viteStaticCopy({
      targets: [
        {
          src: 'public/404.html',
          dest: '.'
        }
      ]
    })
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
})
