// Solo puede haber un demonio de `astro preview` a la vez (es global, no por
// puerto), así que las suites que lo necesitan se ejecutan por separado, cada
// una con su puerto. El administrador local usa `astro dev`, que sí convive.
export const PUERTO_E2E = 4321;
export const PUERTO_SCRIPTS = 4331;

// Administrador local (`pnpm run admin`). Nunca 4321: iniciarPreview() detiene
// cualquier preview vivo al arrancar y se llevaría por delante la vista previa.
export const PUERTO_ADMIN_WEB = 4322; // astro dev que alimenta el iframe
export const PUERTO_ADMIN_API = 4340; // API que lee y escribe los JSON
export const PUERTO_ADMIN_UI = 4341; // interfaz React
