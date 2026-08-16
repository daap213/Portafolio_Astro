// Alta de secciones y de bloques de datos.
//
// Vive fuera de api/ y de src/ porque lo usan los DOS lados: la interfaz de
// React al crear una sección y las pruebas de tests/unit. Por eso no importa
// nada de node ni ningún .astro: solo JavaScript.
//
// Que esta lógica estuviera escrita dentro del componente era parte del
// problema: no había forma de comprobar que lo que genera el formulario pasa la
// validación, y no pasaba.
import {
  camposDeBloque,
  camposDeItem,
  claveEnJson,
  opcionesDe,
  opcionesPorDefecto,
} from '../../src/cv_info/tipos.js';

// Se reexportan para que la interfaz tenga un único sitio del que tirar. Salen
// del catálogo de tipos, no de una copia: la tabla de nombres de `claveEnJson`
// estuvo duplicada aquí y el formulario del perfil escribía en claves que no
// leía nadie.
export { camposDeBloque, camposDeItem, claveEnJson, opcionesPorDefecto };
export const opcionesDeTipo = opcionesDe;

/** Slug ASCII: de él salen los anclas de la URL y los nombres de los QR. */
export const aSlug = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);

/** Texto de relleno de una sección recién creada. Se ve y se reemplaza. */
export const RELLENO = 'Contenido pendiente';

// Solo se rellenan los campos de PROSA. Un enlace o una imagen inventados son
// peores que un hueco: el enlace generaría un QR a ninguna parte y la imagen
// apuntaría a un fichero que no existe. Esos se dejan vacíos y la validación
// dice exactamente cuál falta.
const RELLENABLES = new Set(['texto', 'textoLargo', 'html', 'listaTexto', 'listaHtml']);

function sembrarObligatorios(campos) {
  const comun = {};
  const traducido = {};
  for (const campo of campos ?? []) {
    if (campo.generado || campo.deBloque || !campo.requerido) continue;
    if (!RELLENABLES.has(campo.tipo)) continue;
    const valor = campo.tipo.startsWith('lista') ? [RELLENO] : RELLENO;
    if (campo.traducible === false) comun[claveEnJson(campo)] = valor;
    else traducido[claveEnJson(campo)] = valor;
  }
  return { comun, traducido };
}

/**
 * Hueco de un bloque nuevo, según la forma del tipo que lo va a pintar.
 *
 * `comun: null` significa que el bloque NO va en comun.json: los tipos de prosa
 * solo tienen texto traducido, como el "sobre mí" de siempre.
 *
 * Los campos obligatorios de prosa nacen con texto de relleno para que la
 * sección se pueda guardar y se VEA en la vista previa desde el primer momento;
 * vacía, la validación la rechazaría y no habría nada que enseñar.
 */
export function huecoDeBloque(tipo) {
  const forma = typeof tipo === 'string' ? tipo : tipo?.forma;
  const sembrado = sembrarObligatorios(camposDeBloque(typeof tipo === 'string' ? {} : (tipo ?? {})));

  if (forma === 'lista' || forma === 'objeto-lista') {
    // Ojo con la asimetría, que es real: en comun.json los ítems son un ARRAY
    // con su `id` dentro, y en los contenidos un OBJETO indexado por ese id.
    return {
      comun: { ...sembrado.comun, items: [] },
      traducido: { ...sembrado.traducido, items: {} },
    };
  }
  if (forma === 'parrafos') {
    return {
      comun: Object.keys(sembrado.comun).length ? sembrado.comun : null,
      traducido: sembrado.traducido,
    };
  }
  return { comun: sembrado.comun, traducido: sembrado.traducido };
}

/**
 * Crea un bloque en comun.json y en TODOS los idiomas a la vez.
 * Devuelve copias nuevas: no toca lo que recibe.
 */
export function conBloqueNuevo({ comun, contenidos, clave, tipo }) {
  const hueco = huecoDeBloque(tipo);
  const nuevoComun = structuredClone(comun);
  const nuevosContenidos = structuredClone(contenidos);

  if (hueco.comun) {
    nuevoComun.bloques ??= {};
    nuevoComun.bloques[clave] = structuredClone(hueco.comun);
  }
  for (const codigo of Object.keys(nuevosContenidos)) {
    nuevosContenidos[codigo].bloques ??= {};
    nuevosContenidos[codigo].bloques[clave] = structuredClone(hueco.traducido);
  }

  return { comun: nuevoComun, contenidos: nuevosContenidos };
}

/**
 * Entrada nueva para secciones.web.json o secciones.cv.json.
 *
 * Las dos listas tienen formas distintas: la web lleva icono, enNav y tres
 * clases, y sus textos incluyen nav y ancla; el CV solo lleva título.
 */
export function nuevaSeccion({ lista, id, tipoNombre, bloque, tipo, idiomas, modelo }) {
  const esWeb = lista === 'web';
  return {
    id,
    tipo: tipoNombre,
    bloque,
    ...(esWeb ? { icono: null, enNav: true } : {}),
    // Las opciones se siembran con los valores por defecto del tipo. Guardando
    // {} la casilla se pintaba marcada y el JSON no decía nada: lo que se veía
    // y lo que se guardaba no coincidían.
    opciones: opcionesPorDefecto(tipo, lista),
    clases: esWeb
      ? {
          seccion: modelo?.clases?.seccion ?? '',
          titulo: modelo?.clases?.titulo ?? '',
          icono: modelo?.clases?.icono ?? 'size-8',
        }
      : { titulo: modelo?.clases?.titulo ?? '' },
    textos: Object.fromEntries(
      idiomas.map((codigo) => [codigo, esWeb ? { titulo: id, nav: id, ancla: id } : { titulo: id }]),
    ),
  };
}

/**
 * Comprueba un alta ANTES de tocar nada. Devuelve la lista de problemas en
 * lenguaje llano (vacía si se puede crear).
 *
 * El caso que más daño hacía: reutilizar un bloque con un tipo distinto del que
 * ya lo muestra. validar.js resuelve el tipo de un bloque quedándose con la
 * última sección que lo menciona, así que la sección nueva cambiaba el tipo con
 * el que se validan los ítems de OTRO bloque y salía un muro de CAMPO_REQUERIDO
 * sobre datos que nadie había tocado.
 */
export function problemasDeAlta({ id, modo, claveBloque, idsUsados = [], bloquesExistentes = [], tipoNombre, tipoDelBloque }) {
  const problemas = [];

  if (!id) problemas.push('hace falta un identificador (letras o números).');
  else if (idsUsados.includes(id)) problemas.push(`ya hay una sección con el id "${id}" en esta lista.`);

  if (modo === 'nuevo') {
    if (!claveBloque) problemas.push('hace falta un nombre para el bloque nuevo.');
    else if (bloquesExistentes.includes(claveBloque)) {
      problemas.push(`el bloque "${claveBloque}" ya existe: elígelo en "reutilizar".`);
    }
  } else if (tipoDelBloque && tipoDelBloque !== tipoNombre) {
    problemas.push(
      `el bloque "${claveBloque}" ya se muestra con el tipo "${tipoDelBloque}". Usar dos tipos ` +
        'distintos sobre el mismo bloque hace que la validación exija campos que no existen.',
    );
  }

  return problemas;
}

/**
 * Rótulo de un tipo en el idioma que se pueda.
 *
 * `etiqueta` vive en tipos.js, que es código: `pnpm run idiomas` siembra los
 * ficheros de datos pero no puede traducir el catálogo. Al dar de alta un
 * idioma nuevo esas etiquetas se quedan sin traducir, así que se cae al
 * predeterminado y, si tampoco, al nombre del tipo.
 */
export function etiquetaDeTipo(tipo, nombre, idioma, predeterminado) {
  return (
    tipo?.etiqueta?.[idioma] ??
    tipo?.etiqueta?.[predeterminado] ??
    Object.values(tipo?.etiqueta ?? {})[0] ??
    nombre
  );
}

/** Tipo con el que ya se muestra un bloque, mirando las dos listas. */
export function tipoDelBloque(listas, bloque) {
  for (const configuracion of listas) {
    for (const seccion of configuracion?.secciones ?? []) {
      if (seccion.bloque === bloque) return seccion.tipo;
    }
  }
  return null;
}
