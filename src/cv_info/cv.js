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
import { CONTENIDOS } from "./data/indice.js";
import comun from "./data/comun.json" with { type: "json" };

const isPROD = import.meta.env?.PROD ?? false;
export const raizApp = isPROD ? config.prod.RAIZAPP + "/" : config.dev.RAIZAPP;
export const rutaQR = raizApp + "img/qr/";

// Campos cuyo valor es una ruta de activo y hay que prefijar con la base
const RUTAS = new Set(["image", "qr", "logo"]);

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
    if (qr?.porItem && comunes[qr.desde]) item.qr = rutaQrDe(bloque, id);
    return item;
  });

const componer = (codigo) => {
  const { identidad, bloques } = comun;
  const contenido = CONTENIDOS[codigo];
  if (!contenido) throw new Error(`cv.js: falta el contenido del idioma "${codigo}"`);
  const { meta, bloques: traducidos } = contenido;

  const { items: certificadosComunes, qr: qrCertificados, ...certificadosBase } = bloques.certificados;
  const { items: certificadosTraducidos, ...certificadosTextos } = traducidos.certificados;

  // Atajo: cada bloque se fusiona con su declaracion de QR (si la tiene)
  const bloque = (clave) =>
    fusionarItems(clave, bloques[clave].items, traducidos[clave].items, bloques[clave].qr);

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
    sobremi: traducidos.sobremi.parrafos,
    experiencias: bloque("experiencias"),
    gradosCompletados: bloque("gradosCompletados"),
    certificados: {
      ...expandirRutas(certificadosBase),
      ...certificadosTextos,
      // El QR de los certificados es del bloque entero, no de cada curso
      ...(qrCertificados && certificadosBase[qrCertificados.desde]
        ? { qr: rutaQrDe("certificados") }
        : {}),
      items: fusionarItems("certificados", certificadosComunes, certificadosTraducidos),
    },
    publicaciones: bloque("publicaciones"),
    habilidades: bloque("habilidades"),
    proyectos: bloque("proyectos"),
    referencias: bloque("referencias"),
    previewFooter: {
      ...expandirRutas(bloques.previewFooter),
      ...traducidos.previewFooter,
    },
  };
};

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
