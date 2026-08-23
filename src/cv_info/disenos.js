// Catalogo del eje de DISENO de la web.
//
// Un diseno es tres cosas a la vez:
//   1. `tokens`    -> custom properties CSS que gobiernan el aspecto compartido
//                     (fondo, tipografia, acento, superficie, borde...).
//   2. `variantes` -> que componente pinta cada TIPO de seccion.
//   3. `clases`    -> los presets Tailwind del contenedor, la seccion, el
//                     titulo y el icono.
//
// Las secciones concretas se declaran en data/secciones.web.json y los disenos
// en data/disenos.json; aqui solo vive el catalogo de lo que existe.
//
// REGLA IMPORTANTE, la misma que en tipos.js: este fichero NO puede importar
// componentes .astro. Lo cargan el administrador, validar.js, los tests de node
// y Playwright. El vinculo variante -> componente vive en registro.js.
//
// Los disenos son SOLO de la web. El CV se imprime desde paginas que no pasan
// por Layout.astro ni por Tailwind (ver src/styles/cv_impresion.css), asi que
// no tiene ni tokens ni variantes.
import { TIPOS } from "./tipos.js";

/** Variante que existe siempre y a la que se cae cuando no hay otra. */
export const VARIANTE_BASE = "clasico";

/**
 * Catalogo de TOKENS.
 *
 * Cumple las dos funciones de `campos` en tipos.js: genera el formulario del
 * administrador y alimenta la validacion. Un token fuera de esta lista es un
 * error, por la misma razon por la que lo es una opcion que nadie lee: seria un
 * campo en el panel que no cambia nada.
 *
 *   tipo      color | css | longitud | texto   (como pintarlo en el panel)
 *   porTema   el valor es {claro, oscuro} y se emite en :root y en :root.dark
 *   css       nombre de la propiedad CSS; por defecto "--dis-" + la clave
 *
 * `--nav-*` conserva su nombre historico a proposito: los @keyframes de
 * NavBar.astro ya lo referencian, y renombrarlos no aportaria nada.
 */
export const TOKENS = [
  // ---- superficie de la pagina -----------------------------------------
  { clave: "fondo", etiqueta: "Fondo", tipo: "color", porTema: true },
  {
    clave: "fondoDegradado",
    etiqueta: "Degradado del fondo",
    tipo: "css",
    porTema: true,
    ayuda: 'Valor de background-image; "none" para ninguno',
  },

  // ---- texto -------------------------------------------------------------
  { clave: "texto", etiqueta: "Texto principal", tipo: "color", porTema: true },
  { clave: "textoSuave", etiqueta: "Texto secundario", tipo: "color", porTema: true },
  { clave: "acento", etiqueta: "Acento", tipo: "color", porTema: true },
  { clave: "enlace", etiqueta: "Enlaces", tipo: "color", porTema: true },

  // ---- cajas -------------------------------------------------------------
  { clave: "superficie", etiqueta: "Superficie (tarjetas)", tipo: "color", porTema: true },
  { clave: "superficieSuave", etiqueta: "Superficie translúcida", tipo: "color", porTema: true },
  { clave: "superficieFuerte", etiqueta: "Superficie de contraste", tipo: "color", porTema: true },
  { clave: "borde", etiqueta: "Bordes", tipo: "color", porTema: true },

  // ---- forma -------------------------------------------------------------
  { clave: "fuente", etiqueta: "Tipografía", tipo: "texto" },
  { clave: "fuenteTitulos", etiqueta: "Tipografía de títulos", tipo: "texto" },
  { clave: "radio", etiqueta: "Radio de esquina", tipo: "longitud" },
  { clave: "sombra", etiqueta: "Sombra", tipo: "css" },

  // ---- barra de navegacion ----------------------------------------------
  { clave: "navFondo", etiqueta: "Fondo de la barra", tipo: "color", porTema: true, css: "--nav-fondo" },
  {
    clave: "navDesenfoqueFondo",
    etiqueta: "Fondo de la barra al desplazar",
    tipo: "css",
    porTema: true,
    css: "--nav-desenfoque-fondo",
  },
  { clave: "navSombra", etiqueta: "Sombra de la barra", tipo: "css", porTema: true, css: "--nav-sombra" },
];

/** Claves de token conocidas, para comprobar de un vistazo. */
export const CLAVES_TOKEN = TOKENS.map((token) => token.clave);

/** kebab-case: `fondoDegradado` -> `fondo-degradado`. */
const aGuiones = (clave) => clave.replace(/[A-Z]/g, (letra) => "-" + letra.toLowerCase());

/** Nombre de la propiedad CSS de un token. */
export const cssDeToken = (token) => token.css ?? `--dis-${aGuiones(token.clave)}`;

/** Descriptor de un token por su clave, o undefined. */
export const tokenDe = (clave) => TOKENS.find((token) => token.clave === clave);

/**
 * Variantes que EXISTEN para cada tipo de seccion de la web.
 *
 * Solo los nombres: ponerles cara es cosa de registro.js, que importa .astro y
 * por tanto no puede cargarse desde aqui. Es el mismo reparto que iconos.js /
 * ICONOS, y components.test.js comprueba que las dos listas coincidan.
 *
 * Un diseno NO tiene que aparecer en todos los tipos: donde no tiene variante
 * propia se cae a "clasico", que esta tokenizado y adopta su paleta.
 *
 * Esta lista dice lo que EXISTE, no lo que se planea: el administrador la usa
 * para poblar sus desplegables, asi que anunciar aqui una variante sin
 * componente seria ofrecer una eleccion que rompe el build al guardarla.
 */
export const VARIANTES = {
  presentacion: ["clasico"],
  texto: ["clasico"],
  cronologia: ["clasico"],
  formacion: ["clasico"],
  proyectos: ["clasico"],
  publicaciones: ["clasico"],
  habilidades: ["clasico"],
  certificados: ["clasico"],
  cita: ["clasico"],
};

/** true si ese tipo admite esa variante. */
export const admiteVariante = (tipo, variante) => (VARIANTES[tipo] ?? []).includes(variante);

/** Tipos de seccion que se pueden usar en la web (los que pueden llevar variante). */
export const TIPOS_WEB = Object.entries(TIPOS)
  .filter(([, tipo]) => tipo.alcance.includes("web"))
  .map(([nombre]) => nombre);

/**
 * Diseno con el que se va a pintar.
 *
 * `pedido` solo lo usa la vista previa del administrador (?diseno=), y solo en
 * `astro dev`: en el build estatico no hay peticion de la que sacar el
 * parametro. Si no vale, se ignora en silencio y manda el activo.
 */
export function disenoActivo(configuracion, pedido) {
  const lista = configuracion?.disenos ?? [];
  if (!lista.length) throw new Error("disenos.json: no hay ningún diseño declarado");

  return (
    (pedido && lista.find((diseno) => diseno.id === pedido)) ??
    lista.find((diseno) => diseno.id === configuracion.activo) ??
    lista[0]
  );
}

/** Variante con la que un diseno pinta un tipo. */
export const varianteDe = (diseno, tipo) => diseno?.variantes?.[tipo] ?? VARIANTE_BASE;

const vacio = (valor) => valor === undefined || valor === null || String(valor).trim() === "";

/**
 * Clases de una seccion: manda la seccion si trae valor, si no el diseno.
 *
 * Es REEMPLAZO, no concatenacion. Con dos utilidades de Tailwind en conflicto
 * (text-3xl del diseno y text-5xl de la seccion) gana la que caiga mas tarde en
 * la hoja generada, no la que se escriba despues en el atributo: concatenar
 * daria un resultado impredecible.
 */
export const clasesDe = (diseno, seccion) => {
  const salida = {};
  for (const clave of ["seccion", "titulo", "icono"]) {
    const propia = seccion?.clases?.[clave];
    salida[clave] = vacio(propia) ? (diseno?.clases?.[clave] ?? "") : propia;
  }
  return salida;
};

/** Clases del contenedor de seccion; solo las pone el diseno. */
export const contenedorDe = (diseno) => diseno?.clases?.contenedor ?? "";

/** Valor de un token en un tema ("claro" | "oscuro"). */
const valorDeToken = (diseno, token, tema) => {
  const guardado = diseno?.tokens?.[token.clave];
  if (guardado === undefined || guardado === null) return null;
  if (!token.porTema) return guardado;
  // Un token por tema puede venir como cadena suelta: vale para los dos
  if (typeof guardado === "string") return guardado;
  return guardado[tema] ?? guardado.claro ?? null;
};

const bloque = (selector, declaraciones) =>
  declaraciones.length ? `${selector}{${declaraciones.join("")}}` : "";

/**
 * CSS de un diseno: un bloque para :root y otro para :root.dark.
 *
 * NUNCA @media (prefers-color-scheme): eso sigue al sistema operativo y
 * contradice el interruptor de tema. Hay una asercion de build que lo cuenta.
 */
export function cssDeTokens(diseno) {
  const claro = [];
  const oscuro = [];

  for (const token of TOKENS) {
    const nombre = cssDeToken(token);
    const enClaro = valorDeToken(diseno, token, "claro");
    if (enClaro !== null) claro.push(`${nombre}:${enClaro};`);
    if (!token.porTema) continue;
    const enOscuro = valorDeToken(diseno, token, "oscuro");
    if (enOscuro !== null && enOscuro !== enClaro) oscuro.push(`${nombre}:${enOscuro};`);
  }

  return bloque(":root", claro) + bloque(":root.dark", oscuro);
}
