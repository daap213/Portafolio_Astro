// Unica fuente de verdad de los idiomas del sitio.
//
// La lista vive en data/locales.json (datos, no codigo) para que el
// administrador local pueda dar de alta un idioma sin editar ficheros fuente.
// Este modulo solo deriva ayudantes y valida lo minimo.
//
// Lo importan: astro.config.mjs, los scripts de node, los tests, las paginas y
// el administrador. No debe importar componentes .astro ni nada de Vite, o
// dejaria de poder cargarse desde node puro y desde Playwright.
import locales from "./data/locales.json" with { type: "json" };

/** @typedef {{codigo: string, etiqueta: string, nombre: string, pdf: string, predeterminado?: boolean}} Idioma */

/** Todos los idiomas, en el orden en que se muestran. @type {Idioma[]} */
export const IDIOMAS = locales;

/** Solo los codigos: ["es", "en"]. */
export const CODIGOS = IDIOMAS.map((idioma) => idioma.codigo);

/** El idioma que sirve la raiz del sitio. */
export const IDIOMA_PREDETERMINADO = IDIOMAS.find((idioma) => idioma.predeterminado) ?? IDIOMAS[0];

/** Busca un idioma por codigo. Devuelve undefined si no existe. */
export const buscarIdioma = (codigo) => IDIOMAS.find((idioma) => idioma.codigo === codigo);

/** Los demas idiomas, para el conmutador del menu: nunca "el otro" en singular. */
export const otrosIdiomas = (codigo) => IDIOMAS.filter((idioma) => idioma.codigo !== codigo);

/** Ruta publica de la portada de un idioma, con la base del sitio ya aplicada. */
export const rutaPortada = (raizApp, codigo) => `${raizApp}${codigo}/`;

/** Ruta publica del PDF del CV de un idioma. */
export const rutaPdf = (raizApp, codigo) => `${raizApp}docs/${buscarIdioma(codigo).pdf}`;
