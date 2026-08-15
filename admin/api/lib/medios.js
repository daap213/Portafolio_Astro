// Inventario y subida de imágenes de public/img.
//
// Solo se aceptan .webp: pnpm-workspace.yaml desactiva la compilación de sharp
// (y esa opción es global, no por paquete), así que convertir en el servidor
// obligaría a compilar sharp en cada instalación, también en CI. Se prefiere
// pedir el fichero ya convertido y decirlo con claridad en el error.
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { readdir, rm, writeFile } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';
import { DIR_IMAGENES, DIR_PUBLICO } from '../rutas.js';

export const EXTENSIONES = ['.webp'];

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

/** Todas las rutas de imagen que los datos referencian de verdad. */
export function imagenesUsadas(estado) {
  const usadas = new Set();
  const anotar = (valor) => {
    if (typeof valor === 'string' && valor.startsWith('img/')) usadas.add(valor);
  };

  anotar(estado.comun.identidad?.foto);
  for (const contenido of Object.values(estado.comun.bloques ?? {})) {
    for (const campo of ['image', 'logo']) anotar(contenido[campo]);
    for (const item of contenido.items ?? []) {
      for (const campo of ['image', 'logo']) anotar(item[campo]);
    }
  }
  return usadas;
}

/** Inventario con la marca de cuáles no las usa nadie. */
export async function inventario(estado) {
  const usadas = imagenesUsadas(estado);
  return (await listarImagenes()).map((imagen) => ({ ...imagen, usada: usadas.has(imagen.ruta) }));
}

/** Guarda una imagen subida. Devuelve la ruta relativa que va en los datos. */
export async function guardarImagen({ carpeta, nombre, contenido }) {
  const extension = extname(nombre).toLowerCase();
  if (!EXTENSIONES.includes(extension)) {
    const error = new Error(`solo se aceptan imágenes ${EXTENSIONES.join(', ')}: convierte "${nombre}" antes de subirla`);
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
  if (!destinoDirectorio.startsWith(DIR_IMAGENES)) {
    const error = new Error('carpeta fuera de public/img');
    error.estado = 400;
    throw error;
  }

  mkdirSync(destinoDirectorio, { recursive: true });
  const seguro = nombreSeguro(nombre);
  await writeFile(resolve(destinoDirectorio, seguro), contenido);

  return ['img', carpetaSegura, seguro].filter(Boolean).join('/');
}

/** Borra una imagen, salvo que los datos la estén usando. */
export async function borrarImagen(ruta, estado) {
  if (imagenesUsadas(estado).has(ruta)) {
    const error = new Error('la imagen está en uso: quítala de los datos antes de borrarla');
    error.estado = 409;
    throw error;
  }
  const completa = resolve(DIR_PUBLICO, ruta);
  if (!completa.startsWith(DIR_IMAGENES) || !existsSync(completa)) {
    const error = new Error('no existe esa imagen');
    error.estado = 404;
    throw error;
  }
  await rm(completa);
}
