//   raizApp = "/" para local
//   raizApp = "/Portafolio_Astro/"  para servidor
//
// Este fichero ya no contiene datos: los carga de ./data/*.json y los recompone
// con la forma que consumen es.js / en.js, las paginas del CV y los scripts.
//
// El reparto de los JSON es:
//   comun.json          -> lo que NO se traduce (activos, URLs, contacto)
//   contenido.<idioma>  -> la prosa, enlazada con lo comun por el `id` del item
//
// Las rutas de activos se guardan relativas ("img/qr/x.png") porque raizApp
// depende del entorno (import.meta.env.PROD) y no puede vivir en un JSON.
import { config } from "./../../config.js";
import { CODIGOS } from "./locales.js";
import { TIPOS, enlaceQr } from "./tipos.js";
import { CONTENIDOS } from "./data/indice.js";
import comun from "./data/comun.json" with { type: "json" };

const isPROD = import.meta.env?.PROD ?? false;
export const raizApp = isPROD ? config.prod.RAIZAPP + "/" : config.dev.RAIZAPP;
export const rutaQR = raizApp + "img/qr/";

/**
 * Campos cuyo valor es una ruta de activo y hay que prefijar con la base.
 * Sale del catalogo de tipos en vez de estar escrito a mano: declarar un campo
 * `tipo: "imagen"` nuevo basta para que su ruta se prefije. Antes esta lista
 * vivia duplicada aqui, en validar.js y en el administrador, y las tres se
 * separaron: un campo imagen con otra clave se publicaba sin prefijo.
 */
export const CLAVES_IMAGEN = new Set(
  Object.values(TIPOS)
    .flatMap((tipo) => [...(tipo.campos ?? []), ...(tipo.camposItem ?? [])])
    .filter((campo) => campo.tipo === "imagen")
    .map((campo) => campo.clave),
);

// El `qr` no es un campo declarado: lo inyecta este fichero ya resuelto.
const RUTAS = new Set([...CLAVES_IMAGEN, "qr"]);

const conBase = (ruta) => (ruta ? raizApp + ruta : ruta);

const expandirRutas = (objeto) => {
  const salida = {};
  for (const [campo, valor] of Object.entries(objeto)) {
    salida[campo] = RUTAS.has(campo) ? conBase(valor) : valor;
  }
  return salida;
};

/**
 * Nombre de fichero del QR de un item. Se deriva del `id` (slug ASCII), NUNCA
 * del titulo: antes salia del titulo en espanol, asi que renombrar un proyecto
 * renombraba el PNG y dejaba colgados a los demas idiomas. Ademas los nombres
 * llevaban tildes, que viajan mal entre Windows y Linux.
 */
export const nombreQr = (bloque, id) => `qr_${bloque}${id ? "_" + id : ""}.png`;

/** Ruta publica del QR de un item, ya con la base del sitio. */
export const rutaQrDe = (bloque, id) => rutaQR + nombreQr(bloque, id);

// Une la parte comun de cada item (activos, URLs) con su parte traducida.
// El `id` es el pegamento entre ambos ficheros y no llega al resultado.
const fusionarItems = (bloque, itemsComunes, itemsTraducidos, qr) =>
  itemsComunes.map(({ id, ...comunes }) => {
    const item = { ...expandirRutas(comunes), ...(itemsTraducidos[id] ?? {}) };
    // El QR no se guarda en los datos: se deriva de que el campo de origen tenga valor
    if (qr?.porItem && enlaceQr(comunes, qr.desde)) item.qr = rutaQrDe(bloque, id);
    return item;
  });

/** Un bloque cuyo unico contenido son parrafos se expone como el array suelto:
 *  es lo que consumen los tipos de forma "parrafos" (el "sobre mi"). */
const soloParrafos = (objeto) => {
  const claves = Object.keys(objeto);
  return claves.length === 1 && claves[0] === "parrafos" && Array.isArray(objeto.parrafos);
};

/**
 * Compone TODOS los bloques declarados, sin lista escrita a mano: anadir un
 * bloque a comun.json (o solo a los contenidos, como "sobremi") basta para que
 * llegue a las paginas, que ya lo buscan por nombre (paginaWeb.js, paginaCv.js).
 *
 * La forma sale de los propios datos, no del tipo, porque este fichero no sabe
 * que seccion lo va a pintar:
 *   con `items` y nada mas          -> lista suelta
 *   con `items` y mas campos        -> objeto con `items` dentro (certificados)
 *   sin `items`                     -> objeto plano (o sus parrafos)
 */
const componerBloques = (bloques, traducidos) => {
  const salida = {};

  for (const clave of new Set([...Object.keys(bloques ?? {}), ...Object.keys(traducidos ?? {})])) {
    const { items, qr, ...comunes } = bloques?.[clave] ?? {};
    const { items: itemsTraducidos, ...traducciones } = traducidos?.[clave] ?? {};

    if (!items) {
      const objeto = { ...expandirRutas(comunes), ...traducciones };
      salida[clave] = soloParrafos(objeto) ? objeto.parrafos : objeto;
      continue;
    }

    const lista = fusionarItems(clave, items, itemsTraducidos ?? {}, qr);
    const envoltorio = { ...expandirRutas(comunes), ...traducciones };
    // El QR puede ser de cada item (lo pone fusionarItems) o del bloque entero
    if (qr && !qr.porItem && enlaceQr(comunes, qr.desde)) envoltorio.qr = rutaQrDe(clave);

    salida[clave] = Object.keys(envoltorio).length ? { ...envoltorio, items: lista } : lista;
  }

  return salida;
};

const componer = (codigo) => {
  const { identidad, bloques } = comun;
  const contenido = CONTENIDOS[codigo];
  if (!contenido) throw new Error(`cv.js: falta el contenido del idioma "${codigo}"`);
  const { meta, bloques: traducidos } = contenido;

  return {
    raizApp: raizApp,
    nombre: identidad.nombre,
    siglasNombre: identidad.siglas,
    mi_web: identidad.web,
    foto: conBase(identidad.foto),
    tituloUniversidad: meta.tituloUniversidad,
    nombreTitulo: meta.nombreTitulo,
    titleWeb: meta.titleWeb,
    descriptionWeb: meta.descriptionWeb,
    ubicacion: meta.ubicacion,
    cumpleaños: meta.cumpleaños,
    correo: identidad.correo,
    git_user: identidad.gitUser,
    linkedin_user: identidad.linkedinUser,
    work_state: meta.work_state,
    ...componerBloques(bloques, traducidos),
  };
};

/**
 * Nombres de todos los bloques de datos, vengan de comun.json o solo de los
 * contenidos traducidos (como "sobremi"). Lo usa paginaWeb.js para volcarlos
 * sin tener que enumerarlos.
 */
export const CLAVES_BLOQUE = [
  ...new Set([
    ...Object.keys(comun.bloques ?? {}),
    ...Object.values(CONTENIDOS).flatMap((contenido) => Object.keys(contenido?.bloques ?? {})),
  ]),
];

/**
 * Datos de todos los idiomas declarados, indexados por codigo.
 * Es la forma que deberia consumir el codigo nuevo: no supone cuantos idiomas hay.
 */
export const DATOS = Object.fromEntries(CODIGOS.map((codigo) => [codigo, componer(codigo)]));

//////////////////////////////////////////
//////////////// Español ////////////////
////////////////////////////////////////

export const es = DATOS.es;

/////////////////////////////////////////
//////////////// Ingles ////////////////
////////////////////////////////////////

export const en = DATOS.en;
