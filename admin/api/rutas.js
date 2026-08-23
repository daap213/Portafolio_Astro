// Rutas absolutas del repositorio, resueltas una sola vez.
//
// El administrador vive fuera de src/ y nunca se publica: solo lee y escribe
// los JSON de src/cv_info/data y las imágenes de public/img.
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));

export const RAIZ = resolve(AQUI, '../..');
export const DIR_FUENTE = resolve(RAIZ, 'src');
export const DIR_DATOS = resolve(RAIZ, 'src/cv_info/data');
export const DIR_PUBLICO = resolve(RAIZ, 'public');
export const DIR_IMAGENES = resolve(DIR_PUBLICO, 'img');
export const DIR_COPIAS = resolve(AQUI, '../.copias');

export const FICHEROS = {
  locales: resolve(DIR_DATOS, 'locales.json'),
  comun: resolve(DIR_DATOS, 'comun.json'),
  seccionesWeb: resolve(DIR_DATOS, 'secciones.web.json'),
  seccionesCv: resolve(DIR_DATOS, 'secciones.cv.json'),
  disenos: resolve(DIR_DATOS, 'disenos.json'),
  contenido: (codigo) => resolve(DIR_DATOS, `contenido.${codigo}.json`),
  ui: (codigo) => resolve(DIR_DATOS, `ui.${codigo}.json`),
};

/** Puertos. El 4321 es de las pruebas end-to-end: el admin no lo toca nunca. */
export const PUERTOS = {
  web: 4322, // astro dev que alimenta la vista previa
  api: 4340,
  ui: 4341,
  preview: 4331, // astro preview efímero para imprimir los PDF
};
