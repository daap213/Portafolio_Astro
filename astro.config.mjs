import { defineConfig } from 'astro/config'
import tailwind from "@astrojs/tailwind"
import robotsTxt from "astro-robots-txt"
import { config } from "./config"

const isPROD = import.meta.env.PROD
const base = (isPROD) ? config.prod.RAIZAPP : config.dev.RAIZAPP

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), robotsTxt()],
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
