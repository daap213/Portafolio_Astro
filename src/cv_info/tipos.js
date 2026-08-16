// Catalogo de TIPOS de seccion.
//
// Un tipo describe una forma de mostrar informacion (una cronologia, unas
// tarjetas, unos grupos de etiquetas...). Las secciones concretas de la web y
// del CV se declaran en data/secciones.web.json y data/secciones.cv.json
// eligiendo un tipo y apuntando a un bloque de datos.
//
// `campos` cumple dos funciones a la vez:
//   1. genera el formulario de edicion del administrador local, y
//   2. alimenta la validacion de validar.js (que corre en los tests).
//
// REGLA IMPORTANTE: este fichero NO puede importar componentes .astro. Lo
// cargan el administrador, los tests y Playwright, y ninguno sabe parsearlos.
// El vinculo tipo -> componente vive en registro.js, que solo usan las paginas.

/**
 * Tipos de campo que entiende el formulario generado:
 *   texto       una linea
 *   textoLargo  varias lineas, sin HTML
 *   html        varias lineas con HTML permitido (se vuelca con set:html)
 *   listaTexto  lista de lineas sueltas
 *   listaHtml   lista de parrafos con HTML
 *   url         enlace absoluto (https://...)
 *   correo      direccion de correo
 *   telefono    telefono en texto libre
 *   imagen      ruta relativa dentro de public/ (ej. "img/projects/x.webp")
 *   etiquetas   lista de claves del catalogo de iconos
 *
 * `traducible: false` significa que el valor es el mismo en todos los idiomas
 * y por tanto vive en comun.json: el administrador lo muestra una sola vez.
 *
 * En `opciones`, `alcance` limita el interruptor a una de las dos listas. Sin
 * el, el administrador ofrecia opciones que la web no puede cumplir (el QR es
 * de impresion: ningun componente de seccions/ lo pinta) y quedaban como
 * casillas que no hacian nada.
 */

/** Campo comun a todos los items de lista: su identificador estable. */
const CAMPO_ID = { clave: "id", tipo: "texto", requerido: true, traducible: false, generado: true };

export const TIPOS = {
  // ---- Perfil e introduccion -------------------------------------------

  perfil: {
    etiqueta: { es: "Datos personales", en: "Personal details" },
    alcance: ["cv"],
    forma: "objeto",
    origen: "perfil", // lee de identidad + meta, no de un bloque de items
    campos: [
      { clave: "nombre", tipo: "texto", requerido: true, traducible: false },
      { clave: "siglas", tipo: "texto", requerido: true, traducible: false },
      { clave: "correo", tipo: "correo", requerido: true, traducible: false },
      { clave: "git_user", tipo: "texto", requerido: true, traducible: false },
      { clave: "linkedin_user", tipo: "texto", requerido: true, traducible: false },
      { clave: "mi_web", tipo: "texto", requerido: true, traducible: false },
      { clave: "foto", tipo: "imagen", requerido: true, traducible: false },
      { clave: "tituloUniversidad", tipo: "texto", requerido: true },
      { clave: "cumpleaños", tipo: "texto", requerido: true },
      { clave: "ubicacion", tipo: "texto", requerido: true },
    ],
    opciones: [
      { clave: "mostrarFoto", tipo: "booleano", defecto: true },
      { clave: "mostrarRedes", tipo: "booleano", defecto: true },
    ],
  },

  presentacion: {
    etiqueta: { es: "Presentación", en: "Introduction" },
    alcance: ["web"],
    forma: "objeto",
    origen: "perfil",
    campos: [
      { clave: "parrafos", tipo: "listaHtml", requerido: true, deBloque: "sobremi" },
      { clave: "work_state", tipo: "texto" },
      { clave: "nombreTitulo", tipo: "texto", requerido: true },
      { clave: "foto", tipo: "imagen", requerido: true, traducible: false },
      // Cabecera de la portada. Estaban en meta pero no en ningun tipo, asi que
      // no habia forma de tocarlos desde el administrador.
      { clave: "titleWeb", tipo: "texto", requerido: true },
      { clave: "descriptionWeb", tipo: "textoLargo", requerido: true },
    ],
    opciones: [{ clave: "mostrarBotones", tipo: "booleano", defecto: true }],
  },

  texto: {
    etiqueta: { es: "Texto", en: "Text" },
    alcance: ["cv", "web"],
    forma: "parrafos",
    campos: [{ clave: "parrafos", tipo: "listaHtml", requerido: true }],
    opciones: [],
  },

  // ---- Listas -----------------------------------------------------------

  cronologia: {
    etiqueta: { es: "Cronología", en: "Timeline" },
    alcance: ["web", "cv"],
    forma: "lista",
    campos: [
      CAMPO_ID,
      { clave: "date", tipo: "texto", requerido: true },
      { clave: "title", tipo: "texto", requerido: true },
      { clave: "company", tipo: "texto", requerido: true },
      { clave: "description", tipo: "listaTexto", requerido: true },
      { clave: "link", tipo: "url", traducible: false },
    ],
    opciones: [
      { clave: "desplegable", tipo: "booleano", defecto: true },
      { clave: "mostrarEnlace", tipo: "booleano", defecto: true },
    ],
  },

  formacion: {
    etiqueta: { es: "Formación", en: "Education" },
    alcance: ["web", "cv"],
    forma: "lista",
    campos: [
      CAMPO_ID,
      { clave: "date", tipo: "texto", requerido: true },
      { clave: "title", tipo: "texto", requerido: true },
      { clave: "institution", tipo: "texto", requerido: true },
      { clave: "appreciation", tipo: "texto" },
      { clave: "description", tipo: "listaTexto" },
    ],
    opciones: [{ clave: "mostrarValoracion", tipo: "booleano", defecto: true }],
  },

  proyectos: {
    etiqueta: { es: "Proyectos", en: "Projects" },
    alcance: ["web", "cv"],
    forma: "lista",
    campos: [
      CAMPO_ID,
      { clave: "title", tipo: "texto", requerido: true },
      { clave: "description", tipo: "listaHtml", requerido: true },
      { clave: "image", tipo: "imagen", requerido: true, traducible: false, carpeta: "projects" },
      { clave: "link", tipo: "url", traducible: false },
      { clave: "github", tipo: "url", traducible: false, generaQr: true },
      { clave: "tags", tipo: "etiquetas", traducible: false },
    ],
    opciones: [
      { clave: "mostrarImagen", tipo: "booleano", defecto: true },
      { clave: "mostrarEnlace", tipo: "booleano", defecto: true },
      { clave: "mostrarQr", tipo: "booleano", defecto: false, alcance: ["cv"] },
      { clave: "mostrarEtiquetas", tipo: "booleano", defecto: true },
    ],
  },

  publicaciones: {
    etiqueta: { es: "Publicaciones", en: "Publications" },
    alcance: ["web", "cv"],
    forma: "lista",
    campos: [
      CAMPO_ID,
      { clave: "title", tipo: "texto", requerido: true },
      { clave: "authors", tipo: "texto", requerido: true },
      { clave: "description", tipo: "textoLargo" },
      { clave: "codigo", tipo: "texto" },
      { clave: "link", tipo: "url", requerido: true, traducible: false, generaQr: true },
      { clave: "image", tipo: "imagen", traducible: false },
    ],
    opciones: [{ clave: "mostrarQr", tipo: "booleano", defecto: false, alcance: ["cv"] }],
  },

  habilidades: {
    etiqueta: { es: "Habilidades", en: "Skills" },
    alcance: ["web", "cv"],
    forma: "lista",
    campos: [
      CAMPO_ID,
      { clave: "name", tipo: "texto", requerido: true },
      { clave: "skills", tipo: "listaTexto", requerido: true },
      { clave: "related", tipo: "listaTexto" },
    ],
    opciones: [{ clave: "mostrarRelacionadas", tipo: "booleano", defecto: true }],
  },

  referencias: {
    etiqueta: { es: "Referencias", en: "References" },
    alcance: ["cv"],
    forma: "lista",
    campos: [
      CAMPO_ID,
      { clave: "nombre", tipo: "texto", requerido: true, traducible: false },
      { clave: "cargo", tipo: "texto", requerido: true },
      { clave: "empresa", tipo: "texto", requerido: true },
      { clave: "telefono", tipo: "telefono", traducible: false },
      { clave: "correo", tipo: "correo", traducible: false },
    ],
    opciones: [
      { clave: "mostrarTelefono", tipo: "booleano", defecto: true },
      { clave: "mostrarCorreo", tipo: "booleano", defecto: true },
    ],
  },

  // ---- Objetos con lista dentro ----------------------------------------

  certificados: {
    etiqueta: { es: "Certificados", en: "Certificates" },
    alcance: ["web", "cv"],
    forma: "objeto-lista",
    campos: [
      { clave: "title", tipo: "texto", requerido: true },
      { clave: "titleLink", tipo: "texto", requerido: true },
      { clave: "link", tipo: "url", requerido: true, traducible: false, generaQr: true },
    ],
    camposItem: [
      CAMPO_ID,
      { clave: "date", tipo: "texto", requerido: true },
      { clave: "title", tipo: "texto", requerido: true },
    ],
    opciones: [
      { clave: "desplegable", tipo: "booleano", defecto: true },
      { clave: "mostrarQr", tipo: "booleano", defecto: false, alcance: ["cv"] },
    ],
  },

  cita: {
    etiqueta: { es: "Cita", en: "Quote" },
    alcance: ["web"],
    forma: "objeto",
    campos: [
      { clave: "frase", tipo: "textoLargo", requerido: true },
      { clave: "name", tipo: "texto", requerido: true, traducible: false },
      { clave: "logo", tipo: "imagen", requerido: true, traducible: false },
    ],
    opciones: [],
  },
};

/** Nombres de tipo disponibles. */
export const NOMBRES_TIPO = Object.keys(TIPOS);

/** Devuelve el descriptor de un tipo o lanza si no existe. */
export function tipoDe(nombre) {
  const tipo = TIPOS[nombre];
  if (!tipo) {
    throw new Error(`tipo de sección desconocido: "${nombre}". Disponibles: ${NOMBRES_TIPO.join(", ")}`);
  }
  return tipo;
}

/** true si el tipo puede usarse en esa lista ("web" o "cv"). */
export const admiteDestino = (nombre, destino) => tipoDe(nombre).alcance.includes(destino);

/** Campos que el administrador edita una sola vez (iguales en todos los idiomas). */
export const camposComunes = (campos) => campos.filter((campo) => campo.traducible === false);

/** Campos que el administrador edita idioma por idioma. */
export const camposTraducibles = (campos) => campos.filter((campo) => campo.traducible !== false);

/** Campos de los que se deriva un QR. */
export const camposConQr = (campos) => campos.filter((campo) => campo.generaQr);

/** Opciones que tienen sentido en esa lista ("web" o "cv"). */
export const opcionesDe = (nombre, destino) =>
  (tipoDe(nombre).opciones ?? []).filter((opcion) => !opcion.alcance || opcion.alcance.includes(destino));

/** Valores por defecto de las opciones de un tipo en esa lista. */
export const opcionesPorDefecto = (nombre, destino) =>
  Object.fromEntries(opcionesDe(nombre, destino).map((opcion) => [opcion.clave, opcion.defecto]));
