// El `astro dev` que alimenta la vista previa y sirve las imágenes.
// Deliberadamente NO es el 4321: ese es el puerto de las pruebas end-to-end, y
// `astro preview` es un demonio único por máquina que se pisaría con ellas.
export const PUERTOS_WEB = 'http://127.0.0.1:4322';
