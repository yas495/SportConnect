import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  // Relatieve paden, zodat de site ook werkt op GitHub Pages (in een submap)
  base: './',
  build: {
    // Elk scherm is een eigen HTML-pagina (zie hoofdstuk 9 van het ontwerp)
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, 'index.html'),
        activiteiten: resolve(import.meta.dirname, 'activiteiten.html'),
        activiteit: resolve(import.meta.dirname, 'activiteit.html'),
        nieuw: resolve(import.meta.dirname, 'nieuw.html'),
        profiel: resolve(import.meta.dirname, 'profiel.html'),
      },
    },
  },
})
