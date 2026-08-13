import { defineConfig } from 'astro/config'
import robotsTxt from "astro-robots-txt"
import tailwindcss from "@tailwindcss/vite"
import { config } from "./config"

const isPROD = import.meta.env.PROD
const base = (isPROD) ? config.prod.RAIZAPP : config.dev.RAIZAPP

// https://astro.build/config
export default defineConfig({
  integrations: [robotsTxt()],
  // Tailwind v4 vía plugin de Vite: con Vite 8 el pipeline de PostCSS intenta
  // resolver `@import "tailwindcss"` como una ruta de fichero y falla
  vite: {
    plugins: [tailwindcss()]
  },
  site: 'https://portafolio.daaptech.org', // site: 'https://porfolio.dev/' for local
  base: base,
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false
    },
    fallback: {
      en: 'en'
    }
  }
})
