// Alta y baja de idiomas.
//
// Dar de alta un idioma toca cuatro sitios, y todos son datos:
//   locales.json, contenido.<codigo>.json, ui.<codigo>.json y los `textos` de
//   cada sección en ambas listas. El módulo generado data/indice.js se
//   regenera con el script sync_idiomas.js, que es lo único que enumera los
//   ficheros de idioma.
import { rm } from 'node:fs/promises';
import { FICHEROS } from '../rutas.js';
import { sembrarDesde } from '../../../src/scripts/sync_idiomas.js';

/**
 * Devuelve un estado nuevo con el idioma añadido, sembrado desde otro.
 * No escribe nada: el llamante lo pasa por guardarEstado().
 */
export function anadirIdioma(estado, { codigo, etiqueta, nombre, pdf, desde }) {
  if (!/^[a-z]{2}(-[a-z]{2})?$/i.test(codigo ?? '')) {
    const error = new Error('el código de idioma debe ser tipo "fr" o "pt-br"');
    error.estado = 400;
    throw error;
  }
  if (estado.locales.some((idioma) => idioma.codigo === codigo)) {
    const error = new Error(`el idioma "${codigo}" ya existe`);
    error.estado = 409;
    throw error;
  }

  const origen = desde ?? (estado.locales.find((i) => i.predeterminado) ?? estado.locales[0]).codigo;
  if (!estado.contenidos[origen]) {
    const error = new Error(`no existe el idioma de origen "${origen}"`);
    error.estado = 400;
    throw error;
  }

  const nuevo = structuredClone(estado);
  const nombrePdf = pdf || `CV_${codigo.toUpperCase()}.pdf`;

  // El botón de descarga de CADA idioma necesita su etiqueta en el idioma nuevo,
  // y el idioma nuevo necesita una etiqueta para cada CV existente
  for (const idioma of nuevo.locales) {
    idioma.botonCv = { ...idioma.botonCv, [codigo]: idioma.botonCv?.[origen] ?? `CV ${idioma.codigo.toUpperCase()}` };
  }
  const botonCv = Object.fromEntries(
    [...nuevo.locales.map((i) => i.codigo), codigo].map((c) => [c, `CV ${codigo.toUpperCase()}`]),
  );

  nuevo.locales.push({ codigo, etiqueta: etiqueta || codigo, nombre: nombre || codigo, pdf: nombrePdf, botonCv });

  // Contenido y textos: copia del idioma de origen, para que el sitio siga siendo
  // publicable mientras se traduce (en blanco, los campos obligatorios lo romperían)
  nuevo.contenidos[codigo] = sembrarDesde(estado.contenidos[origen]);
  nuevo.textos[codigo] = sembrarDesde(estado.textos[origen]);

  for (const configuracion of [nuevo.seccionesWeb, nuevo.seccionesCv]) {
    if (!configuracion) continue;
    if (configuracion.contacto?.textos) {
      configuracion.contacto.textos[codigo] = sembrarDesde(configuracion.contacto.textos[origen]);
    }
    if (configuracion.pie?.mencion) configuracion.pie.mencion[codigo] = configuracion.pie.mencion[origen];
    for (const seccion of configuracion.secciones ?? []) {
      seccion.textos[codigo] = sembrarDesde(seccion.textos[origen]);
    }
  }

  return nuevo;
}

/** Devuelve un estado nuevo sin ese idioma. Los ficheros sueltos se borran aparte. */
export function quitarIdioma(estado, codigo) {
  const idioma = estado.locales.find((i) => i.codigo === codigo);
  if (!idioma) {
    const error = new Error(`no existe el idioma "${codigo}"`);
    error.estado = 404;
    throw error;
  }
  if (idioma.predeterminado) {
    const error = new Error('no se puede quitar el idioma predeterminado');
    error.estado = 409;
    throw error;
  }

  const nuevo = structuredClone(estado);
  nuevo.locales = nuevo.locales.filter((i) => i.codigo !== codigo);
  for (const i of nuevo.locales) delete i.botonCv?.[codigo];
  delete nuevo.contenidos[codigo];
  delete nuevo.textos[codigo];

  for (const configuracion of [nuevo.seccionesWeb, nuevo.seccionesCv]) {
    if (!configuracion) continue;
    delete configuracion.contacto?.textos?.[codigo];
    delete configuracion.pie?.mencion?.[codigo];
    for (const seccion of configuracion.secciones ?? []) delete seccion.textos[codigo];
  }

  return nuevo;
}

/** Borra del disco los ficheros de un idioma ya retirado del estado. */
export async function borrarFicherosDeIdioma(codigo) {
  await rm(FICHEROS.contenido(codigo), { force: true });
  await rm(FICHEROS.ui(codigo), { force: true });
}
