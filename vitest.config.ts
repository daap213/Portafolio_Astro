/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

// getViteConfig hereda los plugins y los alias (@/ y @cv/) de astro.config.mjs,
// por lo que los tests pueden importar .astro y usar los mismos imports que el sitio.
export default getViteConfig({
    test: {
        include: ['tests/**/*.test.js'],
        // La generación real de PDF con Puppeteer es lenta
        testTimeout: 120_000,
        hookTimeout: 120_000,
    },
});
