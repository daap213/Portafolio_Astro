// El `astro dev` que alimenta la vista previa.
// Deliberadamente NO es el 4321: ese es el puerto de las pruebas end-to-end, y
// `astro preview` es un demonio único por máquina que se pisaría con ellas.
//
// El número lo inyecta vite.config.js desde api/rutas.js (no se puede importar
// aquí: rutas.js usa node:path y esto se ejecuta en el navegador), así que solo
// hay un sitio donde cambiarlo.
export const PUERTOS_WEB = `http://127.0.0.1:${__PUERTO_WEB__}`;

// Las imágenes las sirve la API por el proxy de Vite, no el `astro dev`: así se
// ven aunque la vista previa no esté levantada, y sin depender de si el sistema
// resuelve "localhost" a IPv4 o a IPv6. Ruta relativa a propósito.
export const RUTA_ARCHIVOS = '/api/archivos';

/** URL para previsualizar una imagen del repositorio ("img/projects/x.webp"). */
export const urlDeImagen = (ruta) =>
  `${RUTA_ARCHIVOS}/${String(ruta ?? '').split('/').map(encodeURIComponent).join('/')}`;
