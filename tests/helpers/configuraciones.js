// Configuracion de la portada de cada idioma, para los tests.
//
// Ya no hay un modulo por idioma: paginaWeb.js la construye a partir de
// data/secciones.web.json y data/contenido.<idioma>.json. Este ayudante solo
// existe para que los tests no repitan el bucle.
//
// Importa .astro (via registro.js), asi que solo lo pueden usar los tests de
// vitest, nunca Playwright.
import { construirPagina } from '@cv/paginaWeb.js';
import { CODIGOS } from '@cv/locales.js';

/** [codigo, configuracionDeLaPortada] para cada idioma declarado. */
export const IDIOMAS = CODIGOS.map((codigo) => [codigo, construirPagina(codigo)]);

/** Configuracion de un idioma concreto. */
export const configuracionDe = (codigo) => construirPagina(codigo);
