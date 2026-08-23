// Lectura y escritura de los JSON del portafolio.
//
// Tres garantías, en este orden:
//   1. VALIDAR primero: se comprueba el estado COMPLETO propuesto (todos los
//      idiomas y las dos listas) antes de tocar el disco. Si hay errores, no se
//      escribe nada y se devuelve 422.
//   2. COPIA de seguridad de cada fichero que se vaya a sobrescribir.
//   3. ESCRITURA atómica: fichero temporal + fsync + rename, y si algún rename
//      falla se restaura desde las copias.
//
// La escritura es siempre multi-fichero: guardar un idioma sí y otro no dejaría
// el sitio desincronizado y la suite de tests en rojo.
import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { copyFile, open, readFile, rename, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { DIR_COPIAS, DIR_DATOS, FICHEROS } from '../rutas.js';
// validar.js y tipos.js son JS puro sin dependencias: se importan tal cual
import { validar } from '../../../src/cv_info/validar.js';

/** Cuántas copias se conservan por fichero. */
const COPIAS_MAXIMAS = 20;

/**
 * Separador entre el nombre del fichero y la marca de tiempo de la copia.
 *
 * Antes se usaba un punto y la marca se troceaba con lastIndexOf('.'), pero la
 * marca ISO TAMBIÉN lleva un punto (los milisegundos), así que "comun.json"
 * salía como "comun.json.2026-08-15T18-47-11" y restaurar escribía un fichero
 * basura dentro de src/cv_info/data en vez de recuperar nada.
 */
const SEPARADOR_MARCA = '@';

/** Reconoce la marca al final del nombre, tanto la nueva como las antiguas. */
const SUFIJO_MARCA = /[.@](\d{4}-\d{2}-\d{2}T[\d.:-]+Z)$/;

/** Marca de tiempo válida como nombre de fichero (sin ':' ni '.'). */
export const marcaDeTiempo = () =>
  new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-');

export const leerJson = async (ruta) => JSON.parse(await readFile(ruta, 'utf8'));

/** Lee el estado completo del repositorio, siempre fresco (nunca cacheado). */
export async function leerEstado() {
  const locales = await leerJson(FICHEROS.locales);
  const codigos = locales.map((idioma) => idioma.codigo);

  const contenidos = {};
  const textos = {};
  for (const codigo of codigos) {
    contenidos[codigo] = await leerJson(FICHEROS.contenido(codigo));
    textos[codigo] = await leerJson(FICHEROS.ui(codigo));
  }

  return {
    locales,
    comun: await leerJson(FICHEROS.comun),
    contenidos,
    textos,
    seccionesWeb: await leerJson(FICHEROS.seccionesWeb),
    seccionesCv: existsSync(FICHEROS.seccionesCv) ? await leerJson(FICHEROS.seccionesCv) : null,
    disenos: await leerJson(FICHEROS.disenos),
  };
}

/** Traduce un estado en el conjunto de ficheros que le corresponde. */
export function ficherosDe(estado) {
  const salida = new Map([
    [FICHEROS.locales, estado.locales],
    [FICHEROS.comun, estado.comun],
    [FICHEROS.seccionesWeb, estado.seccionesWeb],
    [FICHEROS.disenos, estado.disenos],
  ]);
  if (estado.seccionesCv) salida.set(FICHEROS.seccionesCv, estado.seccionesCv);
  for (const [codigo, valor] of Object.entries(estado.contenidos)) {
    salida.set(FICHEROS.contenido(codigo), valor);
  }
  for (const [codigo, valor] of Object.entries(estado.textos)) {
    salida.set(FICHEROS.ui(codigo), valor);
  }
  return salida;
}

const serializar = (valor) => JSON.stringify(valor, null, 2) + '\n';

/** Copia previa de un fichero, con marca de tiempo, y poda de las antiguas. */
async function copiar(ruta, marca) {
  if (!existsSync(ruta)) return null;
  mkdirSync(DIR_COPIAS, { recursive: true });
  const nombre = `${basename(ruta)}${SEPARADOR_MARCA}${marca}`;
  const destino = resolve(DIR_COPIAS, nombre);
  await copyFile(ruta, destino);

  const previas = readdirSync(DIR_COPIAS)
    .filter((f) => f.replace(SUFIJO_MARCA, '') === basename(ruta))
    .sort();
  for (const sobrante of previas.slice(0, Math.max(0, previas.length - COPIAS_MAXIMAS))) {
    rmSync(resolve(DIR_COPIAS, sobrante), { force: true });
  }
  return destino;
}

/**
 * Barre los .tmp que hayan quedado de un guardado interrumpido. Viven junto al
 * fichero destino a propósito (el rename solo es atómico dentro del mismo
 * sistema de ficheros), pero ese directorio lo vigila `astro dev` y lo mira
 * git, así que no pueden quedarse ahí.
 */
export function limpiarTemporales() {
  if (!existsSync(DIR_DATOS)) return;
  for (const nombre of readdirSync(DIR_DATOS)) {
    if (nombre.endsWith('.tmp')) rmSync(resolve(DIR_DATOS, nombre), { force: true });
  }
}

/** Escribe con fsync para que el contenido esté en disco antes del rename. */
async function escribirTemporal(ruta, texto) {
  const temporal = ruta + '.tmp';
  await writeFile(temporal, texto, 'utf8');
  const descriptor = await open(temporal, 'r+');
  try {
    await descriptor.sync();
  } finally {
    await descriptor.close();
  }
  return temporal;
}

/**
 * En Windows un antivirus puede quedarse el fichero un instante y hacer fallar
 * el rename con EPERM. Tres intentos cortos resuelven prácticamente siempre.
 */
async function renombrarConReintento(origen, destino, intentos = 3) {
  for (let i = 1; i <= intentos; i++) {
    try {
      await rename(origen, destino);
      return;
    } catch (error) {
      if (i === intentos || (error.code !== 'EPERM' && error.code !== 'EBUSY')) throw error;
      await new Promise((listo) => setTimeout(listo, 50 * i));
    }
  }
}

/**
 * Guarda un estado completo. Devuelve { ok, errores, avisos, escritos }.
 * Si `ok` es false no se ha tocado el disco.
 */
export async function guardarEstado(estado, { marca = marcaDeTiempo() } = {}) {
  const { errores, avisos } = validar(estado);
  if (errores.length) return { ok: false, errores, avisos, escritos: [] };

  limpiarTemporales();

  const objetivos = ficherosDe(estado);
  const copias = new Map();
  const nuevos = new Set();
  const temporales = [];

  try {
    for (const ruta of objetivos.keys()) {
      const copia = await copiar(ruta, marca);
      copias.set(ruta, copia);
      // copiar() devuelve null cuando el fichero no existía: al deshacer no hay
      // nada que restaurar, hay que BORRARLO (antes se quedaba a medias)
      if (!copia) nuevos.add(ruta);
    }

    for (const [ruta, valor] of objetivos) {
      const texto = serializar(valor);
      // No reescribir lo que no ha cambiado: mantiene limpio `git status`
      if (existsSync(ruta) && (await readFile(ruta, 'utf8')) === texto) continue;
      temporales.push([await escribirTemporal(ruta, texto), ruta]);
    }

    for (const [temporal, ruta] of temporales) await renombrarConReintento(temporal, ruta);

    return { ok: true, errores: [], avisos, escritos: temporales.map(([, ruta]) => basename(ruta)) };
  } catch (error) {
    // Deshacer: limpiar temporales, restaurar lo que existía y borrar lo nuevo
    for (const [temporal] of temporales) rmSync(temporal, { force: true });
    for (const [ruta, copia] of copias) {
      if (copia && existsSync(copia)) await copyFile(copia, ruta);
      else if (nuevos.has(ruta)) rmSync(ruta, { force: true });
    }
    throw error;
  }
}

/** Trocea el nombre de una copia en {fichero, marca}, o null si no lo es. */
export function partirNombreDeCopia(nombre) {
  const encontrado = nombre.match(SUFIJO_MARCA);
  if (!encontrado) return null;
  return { fichero: nombre.replace(SUFIJO_MARCA, ''), marca: encontrado[1] };
}

/** Lista las copias disponibles, de la más reciente a la más antigua. */
export function listarCopias() {
  if (!existsSync(DIR_COPIAS)) return [];
  return readdirSync(DIR_COPIAS)
    .map((nombre) => {
      const partes = partirNombreDeCopia(nombre);
      return partes ? { nombre, ...partes } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.marca.localeCompare(a.marca));
}

/** Restaura una copia concreta sobre su fichero original. */
export async function restaurarCopia(nombre) {
  const origen = resolve(DIR_COPIAS, nombre);
  if (!existsSync(origen)) throw new Error(`no existe la copia ${nombre}`);

  const partes = partirNombreDeCopia(nombre);
  if (!partes) throw new Error(`"${nombre}" no parece una copia: falta la marca de tiempo`);

  // Solo se restaura sobre un fichero de datos que ya exista: así una copia con
  // el nombre manipulado no puede crear ficheros sueltos en src/cv_info/data
  const destino = resolve(DIR_DATOS, partes.fichero);
  if (basename(destino) !== partes.fichero || !existsSync(destino)) {
    throw new Error(`la copia "${nombre}" no corresponde a ningún fichero de datos`);
  }

  await copyFile(origen, destino);
  return destino;
}
