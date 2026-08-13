import { iniciarPreview } from './preview.js';
import { PUERTO_E2E } from './puertos.js';

// Playwright no puede usar `astro preview` como webServer: desde Astro 7 el
// comando se demoniza y el proceso en primer plano termina enseguida, lo que
// Playwright interpreta como "exited early".
export default async function globalSetup() {
    await iniciarPreview({ puerto: PUERTO_E2E });
}
