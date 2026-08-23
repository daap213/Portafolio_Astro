// Alta, duplicado, borrado y edición de diseños.
//
// Vive fuera de api/ y de src/ por lo mismo que secciones.js: lo usan la
// interfaz de React y las pruebas de tests/unit. No importa nada de node ni
// ningún .astro.
//
// Todas las funciones son PURAS: devuelven una configuración nueva y no tocan la
// que reciben. Quien escribe en disco es la API, y solo después de validar.
import { TOKENS, valorDeToken } from '../../src/cv_info/disenos.js';
import { aSlug } from './secciones.js';

export { aSlug };

/**
 * Diseño nuevo a partir de otro.
 *
 * Duplicar es la ÚNICA vía de alta, y a propósito: un diseño en blanco no
 * tendría ni un token, así que la web se pintaría con todas las custom
 * properties sin resolver (fondo transparente, texto heredado) y parecería que
 * el administrador lo ha roto. Partiendo de uno existente, el diseño nuevo se ve
 * bien desde el primer momento y se va cambiando de uno en uno.
 */
export function nuevoDiseno({ desde, id, nombre }) {
  const copia = structuredClone(desde);
  copia.id = id;
  copia.nombre = nombre || id;
  return copia;
}

/** Comprueba un alta ANTES de tocar nada. Devuelve los problemas en lenguaje llano. */
export function problemasDeAltaDiseno({ id, idsUsados = [] }) {
  const problemas = [];
  if (!id) problemas.push('hace falta un identificador (letras o números).');
  else if (idsUsados.includes(id)) problemas.push(`ya hay un diseño con el id "${id}".`);
  return problemas;
}

/**
 * Comprueba un borrado. Se explica el motivo en vez de deshabilitar el botón a
 * secas: un botón apagado sin explicación es la forma más rápida de que alguien
 * piense que el panel está roto.
 */
export function problemasDeBorrado({ id, configuracion }) {
  const problemas = [];
  const lista = configuracion?.disenos ?? [];

  if (lista.length <= 1) {
    problemas.push('es el único diseño que queda: sin ninguno la web no se puede pintar.');
  }
  if (configuracion?.activo === id) {
    problemas.push('es el diseño activo: activa otro antes de borrarlo.');
  }
  return problemas;
}

/** Configuración con un diseño más. */
export function conDisenoNuevo(configuracion, { desde, id, nombre }) {
  const copia = structuredClone(configuracion);
  copia.disenos ??= [];
  copia.disenos.push(nuevoDiseno({ desde, id, nombre }));
  return copia;
}

/** Configuración sin ese diseño. No comprueba nada: eso es `problemasDeBorrado`. */
export function sinDiseno(configuracion, id) {
  const copia = structuredClone(configuracion);
  copia.disenos = (copia.disenos ?? []).filter((diseno) => diseno.id !== id);
  return copia;
}

/** Configuración con otro diseño activo. */
export function conActivo(configuracion, id) {
  const copia = structuredClone(configuracion);
  copia.activo = id;
  return copia;
}

/**
 * Configuración con un token cambiado.
 *
 * Un token `porTema` se guarda como {claro, oscuro} y los demás como una cadena.
 * Escribir la forma equivocada no rompe nada visible en el panel pero deja el
 * tema oscuro sin valor, así que la forma la decide el catálogo y no quien
 * llama.
 */
export function conToken(configuracion, idDiseno, clave, tema, valor) {
  const token = TOKENS.find((t) => t.clave === clave);
  if (!token) throw new Error(`token desconocido: "${clave}"`);

  const copia = structuredClone(configuracion);
  const diseno = (copia.disenos ?? []).find((d) => d.id === idDiseno);
  if (!diseno) throw new Error(`diseño desconocido: "${idDiseno}"`);
  diseno.tokens ??= {};

  if (!token.porTema) {
    diseno.tokens[clave] = valor;
    return copia;
  }

  const actual = diseno.tokens[clave];
  const base =
    typeof actual === 'object' && actual !== null
      ? { ...actual }
      : { claro: actual ?? '', oscuro: actual ?? '' };
  base[tema] = valor;
  diseno.tokens[clave] = base;
  return copia;
}

/** Configuración con una variante cambiada. Vacío = quitar (cae a "clasico"). */
export function conVariante(configuracion, idDiseno, tipo, variante) {
  const copia = structuredClone(configuracion);
  const diseno = (copia.disenos ?? []).find((d) => d.id === idDiseno);
  if (!diseno) throw new Error(`diseño desconocido: "${idDiseno}"`);
  diseno.variantes ??= {};

  if (!variante) delete diseno.variantes[tipo];
  else diseno.variantes[tipo] = variante;
  return copia;
}

/** Lo que hay que enseñar en el campo de un token, ya resuelto. */
export const leerToken = (diseno, token, tema) => valorDeToken(diseno, token, tema) ?? '';
