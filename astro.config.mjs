import { defineConfig } from 'astro/config'
import robotsTxt from "astro-robots-txt"
import tailwindcss from "@tailwindcss/vite"
import { config } from "./config"
import { CODIGOS, IDIOMA_PREDETERMINADO } from "./src/cv_info/locales.js"

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
  // Los idiomas salen de src/cv_info/data/locales.json: anadir uno no exige
  // tocar este fichero (pero si reiniciar el servidor, que solo lo lee al arrancar)
  i18n: {
    defaultLocale: IDIOMA_PREDETERMINADO.codigo,
    locales: CODIGOS,
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false
    }
  }
})
