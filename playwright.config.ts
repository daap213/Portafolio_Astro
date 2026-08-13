import { defineConfig, devices } from '@playwright/test';
import { PUERTO_E2E } from './tests/helpers/puertos.js';

// Se fuerza 127.0.0.1: `astro preview` escucha en ::1 por defecto y la
// comprobación de arranque puede no resolver localhost a IPv6.
const BASE_URL = `http://127.0.0.1:${PUERTO_E2E}/`;

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    // Cada worker abre un Chromium: con el valor por defecto (mitad de los núcleos)
    // se agota la memoria y los contextos tardan más de 30 s en crearse
    workers: 2,
    reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',

    // El servidor se arranca aquí y no con `webServer`: desde Astro 7 el preview
    // se demoniza, el proceso en primer plano termina y Playwright aborta.
    globalSetup: './tests/helpers/global-setup.js',
    globalTeardown: './tests/helpers/global-teardown.js',

    use: {
        baseURL: BASE_URL,
        trace: 'on-first-retry',
    },

    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ],
});
