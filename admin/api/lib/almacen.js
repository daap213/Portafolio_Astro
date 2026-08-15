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
  };
}

/** Traduce un estado en el conjunto de ficheros que le corresponde. */
export function ficherosDe(estado) {
  const salida = new Map([
    [FICHEROS.locales, estado.locales],
    [FICHEROS.comun, estado.comun],
    [FICHEROS.seccionesWeb, estado.seccionesWeb],
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
  const nombre = `${basename(ruta)}.${marca}`;
  const destino = resolve(DIR_COPIAS, nombre);
  await copyFile(ruta, destino);

  const previas = readdirSync(DIR_COPIAS)
    .filter((f) => f.startsWith(basename(ruta) + '.'))
    .sort();
  for (const sobrante of previas.slice(0, Math.max(0, previas.length - COPIAS_MAXIMAS))) {
    rmSync(resolve(DIR_COPIAS, sobrante), { force: true });
  }
  return destino;
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
export async function guardarEstado(estado, { marca }) {
  const { errores, avisos } = validar(estado);
  if (errores.length) return { ok: false, errores, avisos, escritos: [] };

  const objetivos = ficherosDe(estado);
  const copias = new Map();
  const temporales = [];

  try {
    for (const ruta of objetivos.keys()) copias.set(ruta, await copiar(ruta, marca));

    for (const [ruta, valor] of objetivos) {
      const texto = serializar(valor);
      // No reescribir lo que no ha cambiado: mantiene limpio `git status`
      if (existsSync(ruta) && (await readFile(ruta, 'utf8')) === texto) continue;
      temporales.push([await escribirTemporal(ruta, texto), ruta]);
    }

    for (const [temporal, ruta] of temporales) await renombrarConReintento(temporal, ruta);

    return { ok: true, errores: [], avisos, escritos: temporales.map(([, ruta]) => basename(ruta)) };
  } catch (error) {
    // Deshacer: restaurar desde las copias y limpiar los temporales
    for (const [temporal] of temporales) rmSync(temporal, { force: true });
    for (const [ruta, copia] of copias) {
      if (copia && existsSync(copia)) await copyFile(copia, ruta);
    }
    throw error;
  }
}

/** Lista las copias disponibles, de la más reciente a la más antigua. */
export function listarCopias() {
  if (!existsSync(DIR_COPIAS)) return [];
  return readdirSync(DIR_COPIAS)
    .map((nombre) => {
      const corte = nombre.lastIndexOf('.');
      return { nombre, fichero: nombre.slice(0, corte), marca: nombre.slice(corte + 1) };
    })
    .sort((a, b) => b.marca.localeCompare(a.marca));
}

/** Restaura una copia concreta sobre su fichero original. */
export async function restaurarCopia(nombre) {
  const origen = resolve(DIR_COPIAS, nombre);
  if (!existsSync(origen)) throw new Error(`no existe la copia ${nombre}`);
  const destino = resolve(DIR_DATOS, nombre.slice(0, nombre.lastIndexOf('.')));
  await copyFile(origen, destino);
  return destino;
}
