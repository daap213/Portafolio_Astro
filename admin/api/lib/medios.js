// Inventario y subida de imágenes de public/img.
//
// No se convierte nada en el servidor: pnpm-workspace.yaml desactiva la
// compilación de sharp (y esa opción es global, no por paquete), así que
// convertir aquí obligaría a compilarlo en cada instalación, también en CI. Se
// pide el fichero ya convertido. Se aceptan los formatos que el repositorio ya
// contiene: antes solo entraba .webp, así que un .png se podía borrar desde la
// interfaz y luego no había forma de reponerlo.
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { extname, join, relative, resolve, sep } from 'node:path';
import { DIR_FUENTE, DIR_IMAGENES, DIR_PUBLICO } from '../rutas.js';
import { buildQrJobs } from '../../../src/scripts/url_to_qr.js';

export const EXTENSIONES = ['.webp', '.png', '.jpg', '.jpeg', '.svg', '.gif', '.avif'];

/** Formato preferido: el resto se acepta, pero se recomienda éste. */
export const EXTENSION_PREFERIDA = '.webp';

/** Ficheros de código donde puede aparecer una ruta de imagen escrita a mano. */
const EXTENSIONES_CODIGO = ['.astro', '.js', '.mjs', '.ts', '.css'];

/** Por qué una imagen cuenta como usada. */
export const MOTIVOS = {
  datos: 'datos',
  qr: 'QR generado',
  codigo: 'código',
};

/**
 * true si la ruta cae dentro de public/img. Se compara con el separador
 * incluido: un simple startsWith dejaba pasar hermanos como public/imgtemp.
 */
export const dentroDeImagenes = (completa) =>
  completa === DIR_IMAGENES || completa.startsWith(DIR_IMAGENES + sep);

/** Normaliza un nombre de fichero a slug ASCII, conservando la extensión. */
export function nombreSeguro(nombre) {
  const extension = extname(nombre).toLowerCase();
  const base = nombre
    .slice(0, nombre.length - extension.length)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return (base || 'imagen') + extension;
}

/** Recorre public/img y devuelve las rutas relativas a public/ (formato de los datos). */
export async function listarImagenes() {
  const encontradas = [];
  const recorrer = async (directorio) => {
    for (const entrada of await readdir(directorio, { withFileTypes: true })) {
      const completa = join(directorio, entrada.name);
      if (entrada.isDirectory()) {
        await recorrer(completa);
        continue;
      }
      encontradas.push({
        ruta: relative(DIR_PUBLICO, completa).replaceAll('\\', '/'),
        bytes: statSync(completa).size,
      });
    }
  };
  await recorrer(DIR_IMAGENES);
  return encontradas.sort((a, b) => a.ruta.localeCompare(b.ruta));
}

/** Recoge toda cadena "img/..." que haya dentro de un dato, a cualquier hondura. */
function rutasEnDatos(valor, encontradas = new Set()) {
  if (typeof valor === 'string') {
    if (valor.startsWith('img/')) encontradas.add(valor);
  } else if (Array.isArray(valor)) {
    for (const elemento of valor) rutasEnDatos(elemento, encontradas);
  } else if (valor && typeof valor === 'object') {
    for (const elemento of Object.values(valor)) rutasEnDatos(elemento, encontradas);
  }
  return encontradas;
}

const RUTA_EN_CODIGO = /img\/[A-Za-z0-9_./-]+\.[A-Za-z0-9]+/g;

/** Rutas de imagen escritas a mano en src/ (el favicon de Layout.astro, p.ej.). */
async function rutasEnCodigo(directorio = DIR_FUENTE, encontradas = new Set()) {
  if (!existsSync(directorio)) return encontradas;
  for (const entrada of await readdir(directorio, { withFileTypes: true })) {
    const completa = join(directorio, entrada.name);
    if (entrada.isDirectory()) {
      await rutasEnCodigo(completa, encontradas);
      continue;
    }
    if (!EXTENSIONES_CODIGO.includes(extname(entrada.name).toLowerCase())) continue;
    for (const encontrada of (await readFile(completa, 'utf8')).matchAll(RUTA_EN_CODIGO)) {
      encontradas.add(encontrada[0]);
    }
  }
  return encontradas;
}

/**
 * Todas las rutas de imagen que están en uso, y por qué.
 *
 * Hay tres fuentes, y durante un tiempo solo se miraba la primera con una lista
 * de claves escrita a mano ('image' y 'logo'): el favicon y los once QR salían
 * como huérfanos, y como el borrado se autoriza justo con esta marca, la
 * interfaz ofrecía borrar ficheros que el sitio necesita.
 *
 * @returns {Promise<Map<string, string[]>>} ruta -> motivos
 */
export async function imagenesUsadas(estado) {
  const usadas = new Map();
  const anotar = (ruta, motivo) => {
    if (!ruta) return;
    if (!usadas.has(ruta)) usadas.set(ruta, []);
    if (!usadas.get(ruta).includes(motivo)) usadas.get(ruta).push(motivo);
  };

  // 1. Los datos, recorridos enteros: no hay lista de claves que mantener
  for (const ruta of rutasEnDatos(estado.comun)) anotar(ruta, MOTIVOS.datos);
  for (const ruta of rutasEnDatos(estado.contenidos)) anotar(ruta, MOTIVOS.datos);

  // 2. Los QR, cuyo nombre se deriva y no se guarda en ninguna parte
  for (const trabajo of buildQrJobs(estado.comun)) anotar(`img/qr/${trabajo.nombre}`, MOTIVOS.qr);

  // 3. Las rutas escritas a mano en el código
  for (const ruta of await rutasEnCodigo()) anotar(ruta, MOTIVOS.codigo);

  return usadas;
}

/** Inventario con la marca de cuáles no las usa nadie y por qué. */
export async function inventario(estado) {
  const usadas = await imagenesUsadas(estado);
  return (await listarImagenes()).map((imagen) => ({
    ...imagen,
    usada: usadas.has(imagen.ruta),
    motivos: usadas.get(imagen.ruta) ?? [],
  }));
}

/** Guarda una imagen subida. Devuelve la ruta relativa que va en los datos. */
export async function guardarImagen({ carpeta, nombre, contenido }) {
  const extension = extname(nombre).toLowerCase();
  if (!EXTENSIONES.includes(extension)) {
    const error = new Error(
      `formato no admitido (${extension || 'sin extensión'}). Se aceptan ${EXTENSIONES.join(', ')}, y se recomienda ${EXTENSION_PREFERIDA}`,
    );
    error.estado = 415;
    throw error;
  }
  if (!contenido?.length) {
    const error = new Error('el fichero llegó vacío');
    error.estado = 400;
    throw error;
  }

  const carpetaSegura = (carpeta ?? '').replace(/[^a-z0-9/-]/gi, '');
  const destinoDirectorio = resolve(DIR_IMAGENES, carpetaSegura);
  if (!dentroDeImagenes(destinoDirectorio)) {
    const error = new Error('carpeta fuera de public/img');
    error.estado = 400;
    throw error;
  }

  mkdirSync(destinoDirectorio, { recursive: true });
  const seguro = nombreSeguro(nombre);
  await writeFile(resolve(destinoDirectorio, seguro), contenido);

  return ['img', carpetaSegura, seguro].filter(Boolean).join('/');
}

/** Borra una imagen, salvo que algo la esté usando. */
export async function borrarImagen(ruta, estado) {
  const motivos = (await imagenesUsadas(estado)).get(ruta);
  if (motivos) {
    const error = new Error(`la imagen está en uso (${motivos.join(', ')}): quítala de ahí antes de borrarla`);
    error.estado = 409;
    throw error;
  }
  const completa = resolve(DIR_PUBLICO, ruta ?? '');
  if (!dentroDeImagenes(completa) || !existsSync(completa)) {
    const error = new Error('no existe esa imagen');
    error.estado = 404;
    throw error;
  }
  await rm(completa);
}
