// Validacion de los datos y de la configuracion de secciones.
//
// No hay comprobador de tipos en este repo (TypeScript 7 aun no expone una API
// estable para las plantillas de Astro), asi que este fichero es la red de
// seguridad principal. Lo usan dos sitios:
//   - tests/unit/esquema.test.js, donde un `error` tumba el build, y
//   - el administrador local, que ademas muestra los `avisos`.
//
// Escrito a mano y sin dependencias A PROPOSITO: cv.js lo acabaria arrastrando
// al bundle del sitio, cuyo runtime son cinco paquetes.
//
// No importa .astro: tiene que poder cargarse desde node puro.
import {
  TIPOS,
  admiteDestino,
  camposComunes,
  camposDeBloque,
  camposTraducibles,
  claveEnJson,
  enlaceQr,
  origenesQr,
} from "./tipos.js";
import { esIconoValido, NOMBRES_ICONO } from "./iconos.js";

/** Un id que acaba siendo nombre de fichero o ancla de URL. */
const ES_SLUG = /^[a-z0-9-]+$/;

/** Estructura de un problema encontrado. */
const problema = (codigo, ruta, mensaje) => ({ codigo, ruta, mensaje });

const esVacio = (valor) =>
  valor === undefined ||
  valor === null ||
  (typeof valor === "string" && valor.trim() === "") ||
  (Array.isArray(valor) && valor.length === 0);

/**
 * Valida un estado completo del contenido.
 *
 * @param {object} estado
 * @param {Array}  estado.locales        data/locales.json
 * @param {object} estado.comun          data/comun.json
 * @param {object} estado.contenidos     { <codigo>: contenido.<codigo>.json }
 * @param {object} estado.textos         { <codigo>: ui.<codigo>.json }
 * @param {object} estado.seccionesWeb   data/secciones.web.json
 * @param {object} estado.seccionesCv    data/secciones.cv.json
 * @returns {{errores: Array, avisos: Array}}
 */
export function validar({ locales, comun, contenidos, textos, seccionesWeb, seccionesCv }) {
  const errores = [];
  const avisos = [];
  const codigos = (locales ?? []).map((idioma) => idioma.codigo);

  // ---- idiomas ------------------------------------------------------------

  // Sin idiomas no hay nada mas que comprobar, y todo lo de abajo da por hecho
  // que existe un predeterminado: se sale aqui en vez de reventar con un
  // TypeError, que el administrador convertiria en un 500 en vez de un 422.
  if (!codigos.length) {
    errores.push(problema("SIN_IDIOMAS", "locales.json", "no hay ningún idioma declarado"));
    return { errores, avisos };
  }

  const predeterminado = (locales.find((idioma) => idioma.predeterminado) ?? locales[0]).codigo;
  if (new Set(codigos).size !== codigos.length) {
    errores.push(problema("IDIOMA_DUPLICADO", "locales.json", `códigos repetidos: ${codigos.join(", ")}`));
  }
  if (locales.filter((idioma) => idioma.predeterminado).length > 1) {
    errores.push(problema("VARIOS_PREDETERMINADOS", "locales.json", "solo un idioma puede ser el predeterminado"));
  }
  const pdfs = locales.map((idioma) => idioma.pdf);
  if (new Set(pdfs).size !== pdfs.length) {
    errores.push(problema("PDF_DUPLICADO", "locales.json", `dos idiomas comparten nombre de PDF: ${pdfs.join(", ")}`));
  }
  for (const codigo of codigos) {
    if (!contenidos[codigo]) errores.push(problema("FALTA_CONTENIDO", `contenido.${codigo}.json`, "declarado en locales.json pero sin fichero de contenido"));
    if (!textos[codigo]) errores.push(problema("FALTA_UI", `ui.${codigo}.json`, "declarado en locales.json pero sin fichero de textos"));
  }

  // ---- textos de interfaz -------------------------------------------------

  const clavesUi = Object.keys(textos[predeterminado] ?? {});
  for (const codigo of codigos) {
    if (!textos[codigo]) continue;
    for (const clave of clavesUi) {
      if (esVacio(textos[codigo][clave])) {
        avisos.push(problema("UI_SIN_TRADUCIR", `ui.${codigo}.json > ${clave}`, "texto de interfaz vacío"));
      }
    }
    for (const clave of Object.keys(textos[codigo])) {
      if (!clavesUi.includes(clave)) {
        errores.push(problema("UI_SOBRANTE", `ui.${codigo}.json > ${clave}`, `no existe en ui.${predeterminado}.json`));
      }
    }
  }

  // ---- rutas de activos ---------------------------------------------------

  const revisarRuta = (ruta, donde) => {
    if (typeof ruta !== "string" || ruta === "") return;
    if (ruta.startsWith("/") || ruta.startsWith("http")) {
      errores.push(problema("RUTA_ABSOLUTA", donde, `las rutas de activos se guardan relativas ("img/..."), no "${ruta}"`));
    }
  };
  revisarRuta(comun.identidad?.foto, "comun.json > identidad.foto");
  for (const [clave, contenido] of Object.entries(comun.bloques ?? {})) {
    for (const campo of ["logo", "image"]) revisarRuta(contenido[campo], `comun.json > ${clave}.${campo}`);
    for (const item of contenido.items ?? []) {
      for (const campo of ["image", "logo"]) revisarRuta(item[campo], `comun.json > ${clave}.${item.id}.${campo}`);
    }
  }

  // ---- ids de los bloques -------------------------------------------------

  const idsPorBloque = {};
  for (const [clave, contenido] of Object.entries(comun.bloques ?? {})) {
    if (!contenido.items) continue;
    const ids = contenido.items.map((item) => item.id);
    idsPorBloque[clave] = ids;

    for (const [i, id] of ids.entries()) {
      if (!id) {
        errores.push(problema("ITEM_SIN_ID", `comun.json > ${clave}[${i}]`, "todo ítem necesita un id estable"));
      } else if (!ES_SLUG.test(id)) {
        errores.push(problema("ID_NO_PORTABLE", `comun.json > ${clave}.${id}`, "el id debe ser un slug ASCII (a-z, 0-9, guiones): de él salen los nombres de fichero"));
      }
    }
    if (new Set(ids).size !== ids.length) {
      errores.push(problema("ID_DUPLICADO", `comun.json > ${clave}`, "hay ids repetidos dentro del bloque"));
    }

    // Los mismos ids deben existir en todos los idiomas
    for (const codigo of codigos) {
      const traducidos = contenidos[codigo]?.bloques?.[clave]?.items;
      if (!traducidos) {
        errores.push(problema("BLOQUE_SIN_TRADUCCION", `contenido.${codigo}.json > ${clave}`, "el bloque existe en comun.json pero no en este idioma"));
        continue;
      }
      for (const id of ids) {
        if (!(id in traducidos)) {
          errores.push(problema("ITEM_SIN_TRADUCCION", `contenido.${codigo}.json > ${clave}.${id}`, "ítem sin entrada en este idioma"));
        }
      }
      for (const id of Object.keys(traducidos)) {
        if (!ids.includes(id)) {
          errores.push(problema("ITEM_HUERFANO", `contenido.${codigo}.json > ${clave}.${id}`, "no existe en comun.json: nadie lo va a mostrar"));
        }
      }
    }
  }

  // ---- declaraciones de QR ------------------------------------------------

  for (const [clave, contenido] of Object.entries(comun.bloques ?? {})) {
    const qr = contenido.qr;
    if (!qr) continue;
    // `desde` puede nombrar un campo o una lista de candidatos por orden de
    // preferencia, asi que se normaliza antes de mirar si trae alguno.
    const origenes = origenesQr(qr.desde);
    if (!origenes.length) {
      errores.push(problema("QR_SIN_ORIGEN", `comun.json > ${clave}.qr`, 'falta "desde": de qué campo sale el enlace'));
      continue;
    }
    if (!qr.porItem && esVacio(enlaceQr(contenido, qr.desde))) {
      errores.push(problema("QR_SIN_ENLACE", `comun.json > ${clave}.${origenes.join("/")}`, "declara QR de bloque pero el enlace está vacío"));
    }
  }

  // ---- listas de secciones ------------------------------------------------

  // Un bloque puede vivir solo en los contenidos traducidos (el "sobre mí" es
  // el caso de siempre, y cualquier seccion de prosa nueva lo sera tambien), asi
  // que se recogen de los dos sitios en vez de tener "sobremi" escrito a mano.
  const clavesDeDatos = new Set(Object.keys(comun.bloques ?? {}));
  for (const contenido of Object.values(contenidos ?? {})) {
    for (const clave of Object.keys(contenido?.bloques ?? {})) clavesDeDatos.add(clave);
  }
  clavesDeDatos.add("perfil");

  const usados = { web: new Set(), cv: new Set() };

  const revisarLista = (configuracion, destino, fichero) => {
    // `null` no es "no hay lista": es un fichero que se escribiria con el texto
    // literal `null` y dejaria la pagina sin secciones sin decir nada.
    if (configuracion === null) {
      errores.push(problema("LISTA_INVALIDA", fichero, "la lista de secciones es null"));
      return;
    }
    if (!configuracion) return;
    if (!Array.isArray(configuracion.secciones)) {
      errores.push(problema("LISTA_INVALIDA", fichero, 'falta el array "secciones"'));
      return;
    }
    const idsVistos = new Set();

    for (const entrada of configuracion.secciones) {
      const donde = `${fichero} > ${entrada.id}`;

      if (!entrada.id) {
        errores.push(problema("SECCION_SIN_ID", fichero, "toda sección necesita un id"));
      } else if (!ES_SLUG.test(entrada.id)) {
        // El id de seccion se usa como ancla en la URL de la portada
        errores.push(problema("ID_NO_PORTABLE", donde, "el id debe ser un slug ASCII (a-z, 0-9, guiones)"));
      }
      if (idsVistos.has(entrada.id)) {
        errores.push(problema("SECCION_DUPLICADA", donde, "id repetido dentro de la misma lista"));
      }
      idsVistos.add(entrada.id);

      if (!esIconoValido(entrada.icono)) {
        avisos.push(
          problema("ICONO_DESCONOCIDO", donde, `icono "${entrada.icono}"; disponibles: ${NOMBRES_ICONO.join(", ")}`),
        );
      }

      if (!TIPOS[entrada.tipo]) {
        errores.push(problema("TIPO_DESCONOCIDO", donde, `tipo "${entrada.tipo}"; disponibles: ${Object.keys(TIPOS).join(", ")}`));
      } else if (!admiteDestino(entrada.tipo, destino)) {
        errores.push(problema("TIPO_FUERA_DE_ALCANCE", donde, `el tipo "${entrada.tipo}" no se puede usar en la lista de ${destino}`));
      }

      if (!clavesDeDatos.has(entrada.bloque)) {
        errores.push(problema("BLOQUE_INEXISTENTE", donde, `apunta al bloque "${entrada.bloque}", que no existe en los datos`));
      } else {
        usados[destino].add(entrada.bloque);
      }

      for (const codigo of codigos) {
        if (!entrada.textos?.[codigo]) {
          errores.push(problema("SECCION_SIN_TEXTOS", `${donde} (${codigo})`, "falta el bloque de textos de este idioma"));
          continue;
        }
        if (esVacio(entrada.textos[codigo].titulo) && !esVacio(entrada.textos[predeterminado]?.titulo)) {
          avisos.push(problema("TITULO_SIN_TRADUCIR", `${donde} (${codigo})`, "título de sección vacío"));
        }
      }
    }

    // Anclas unicas por idioma (solo la web las usa)
    if (destino === "web") {
      for (const codigo of codigos) {
        const anclas = (configuracion.secciones ?? [])
          .filter((entrada) => entrada.enNav)
          .map((entrada) => entrada.textos?.[codigo]?.ancla)
          .filter(Boolean);
        if (new Set(anclas).size !== anclas.length) {
          errores.push(problema("ANCLA_DUPLICADA", `${fichero} (${codigo})`, `dos secciones comparten ancla: ${anclas.join(", ")}`));
        }
      }
    }
  };

  revisarLista(seccionesWeb, "web", "secciones.web.json");
  revisarLista(seccionesCv, "cv", "secciones.cv.json");

  // ---- coherencia entre las dos listas ------------------------------------

  for (const clave of clavesDeDatos) {
    const enWeb = usados.web.has(clave);
    const enCv = usados.cv.has(clave);

    if (!enWeb && !enCv) {
      avisos.push(problema("DATO_HUERFANO", `datos > ${clave}`, "ninguna lista de secciones lo muestra: es contenido invisible"));
      continue;
    }

    // Deriva: el tipo admite ambos destinos pero solo se usa en uno
    const entrada =
      (seccionesWeb?.secciones ?? []).find((s) => s.bloque === clave) ??
      (seccionesCv?.secciones ?? []).find((s) => s.bloque === clave);
    if (entrada && TIPOS[entrada.tipo]?.alcance.length > 1 && enWeb !== enCv) {
      avisos.push(problema("DERIVA_ENTRE_LISTAS", `datos > ${clave}`, `se muestra en ${enWeb ? "la web" : "el CV"} pero no en ${enWeb ? "el CV" : "la web"}`));
    }
  }

  // ---- campos requeridos y traducciones pendientes ------------------------

  const tipoDeBloque = new Map();
  // Ojo: `tipoDeBloque` se queda con el ÚLTIMO tipo de cada bloque, así que no
  // sirve para saber qué tipos están en uso. "sobremi" lo pintan `presentacion`
  // en la web y `texto` en el CV, y el segundo tapaba al primero: los campos de
  // `presentacion` (nombreTitulo, work_state…) se quedaban sin comprobar.
  const tiposUsados = new Set();
  for (const configuracion of [seccionesWeb, seccionesCv]) {
    for (const entrada of configuracion?.secciones ?? []) {
      if (!TIPOS[entrada.tipo]) continue;
      tipoDeBloque.set(entrada.bloque, entrada.tipo);
      tiposUsados.add(entrada.tipo);
    }
  }

  /**
   * Comprueba un campo suelto: obligatorio relleno, comun donde toca, y aviso
   * si esta traducido en el idioma base pero no en los demas.
   *
   * @param leerComun     () => valor guardado en comun.json
   * @param leerTraducido (codigo) => valor guardado en contenido.<codigo>.json
   */
  const revisarCampo = (campo, { leerComun, leerTraducido, dondeComun, dondeTraducido }) => {
    if (campo.generado) return;

    if (campo.traducible === false) {
      if (campo.requerido && esVacio(leerComun())) {
        errores.push(problema("CAMPO_REQUERIDO", dondeComun(campo), "campo obligatorio vacío"));
      }
      // Un campo comun nunca debe aparecer en el contenido traducido
      for (const codigo of codigos) {
        if (leerTraducido(codigo, true)) {
          errores.push(problema("CAMPO_MAL_UBICADO", dondeTraducido(campo, codigo), "es un campo común: debe vivir solo en comun.json"));
        }
      }
      return;
    }

    for (const codigo of codigos) {
      const valor = leerTraducido(codigo);
      if (!esVacio(valor)) continue;
      if (campo.requerido) {
        errores.push(problema("CAMPO_REQUERIDO", dondeTraducido(campo, codigo), "campo obligatorio vacío"));
      } else if (!esVacio(leerTraducido(predeterminado))) {
        avisos.push(problema("SIN_TRADUCIR", dondeTraducido(campo, codigo), "vacío en este idioma y relleno en el predeterminado"));
      }
    }
  };

  // ---- perfil: identidad + meta -------------------------------------------
  //
  // Estos campos no viven en ningun bloque de items, asi que se quedaban FUERA
  // de toda comprobacion: se podia dejar el nombre o la foto en blanco y el
  // validador no decia nada. Se notaba al editarlos desde el administrador.
  for (const [nombreTipo, tipo] of Object.entries(TIPOS)) {
    if (tipo.origen !== "perfil" || !tiposUsados.has(nombreTipo)) continue;
    for (const campo of tipo.campos ?? []) {
      if (campo.deBloque) continue; // ese vive en otro bloque, se revisa alli
      const clave = claveEnJson(campo);
      revisarCampo(campo, {
        leerComun: () => comun.identidad?.[clave],
        leerTraducido: (codigo, existe) =>
          existe ? clave in (contenidos[codigo]?.meta ?? {}) : contenidos[codigo]?.meta?.[clave],
        dondeComun: () => `comun.json > identidad.${clave}`,
        dondeTraducido: (_campo, codigo) => `contenido.${codigo}.json > meta.${clave}`,
      });
    }
  }

  // ---- campos de nivel de bloque ------------------------------------------
  //
  // Los de forma "objeto", "parrafos" y la cabecera de "objeto-lista": el
  // enlace del que sale el QR de los certificados, la frase de la cita o los
  // parrafos del "sobre mi" tampoco se comprobaban.
  for (const [clave, nombreTipo] of tipoDeBloque) {
    const tipo = TIPOS[nombreTipo];
    if (!tipo || tipo.origen === "perfil") continue;
    for (const campo of camposDeBloque(tipo)) {
      if (campo.deBloque) continue;
      const nombre = claveEnJson(campo);
      revisarCampo(campo, {
        leerComun: () => comun.bloques?.[clave]?.[nombre],
        leerTraducido: (codigo, existe) =>
          existe
            ? nombre in (contenidos[codigo]?.bloques?.[clave] ?? {})
            : contenidos[codigo]?.bloques?.[clave]?.[nombre],
        dondeComun: () => `comun.json > ${clave}.${nombre}`,
        dondeTraducido: (_campo, codigo) => `contenido.${codigo}.json > ${clave}.${nombre}`,
      });
    }
  }

  // ---- campos de cada item ------------------------------------------------

  for (const [clave, ids] of Object.entries(idsPorBloque)) {
    const nombreTipo = tipoDeBloque.get(clave);
    if (!nombreTipo) continue;
    const tipo = TIPOS[nombreTipo];
    const campos = tipo.forma === "objeto-lista" ? tipo.camposItem : tipo.campos;
    if (!campos) continue;

    for (const id of ids) {
      const itemComun = comun.bloques[clave].items.find((item) => item.id === id) ?? {};

      for (const campo of camposComunes(campos)) {
        if (campo.generado) continue;
        if (campo.requerido && esVacio(itemComun[campo.clave])) {
          errores.push(problema("CAMPO_REQUERIDO", `comun.json > ${clave}.${id}.${campo.clave}`, "campo obligatorio vacío"));
        }
        // Un campo comun nunca debe aparecer en el contenido traducido
        for (const codigo of codigos) {
          if (campo.clave in (contenidos[codigo]?.bloques?.[clave]?.items?.[id] ?? {})) {
            errores.push(problema("CAMPO_MAL_UBICADO", `contenido.${codigo}.json > ${clave}.${id}.${campo.clave}`, "es un campo común: debe vivir solo en comun.json"));
          }
        }
      }

      for (const campo of camposTraducibles(campos)) {
        if (campo.generado) continue;
        for (const codigo of codigos) {
          const valor = contenidos[codigo]?.bloques?.[clave]?.items?.[id]?.[campo.clave];
          if (!esVacio(valor)) continue;
          const referencia = contenidos[predeterminado]?.bloques?.[clave]?.items?.[id]?.[campo.clave];
          if (campo.requerido) {
            errores.push(problema("CAMPO_REQUERIDO", `contenido.${codigo}.json > ${clave}.${id}.${campo.clave}`, "campo obligatorio vacío"));
          } else if (!esVacio(referencia)) {
            avisos.push(problema("SIN_TRADUCIR", `contenido.${codigo}.json > ${clave}.${id}.${campo.clave}`, "vacío en este idioma y relleno en el predeterminado"));
          }
        }
      }
    }
  }

  return { errores, avisos };
}

/** Resumen legible, para el registro del administrador y los mensajes de test. */
export const resumir = ({ errores, avisos }) =>
  [
    ...errores.map((e) => `ERROR  [${e.codigo}] ${e.ruta}: ${e.mensaje}`),
    ...avisos.map((a) => `aviso  [${a.codigo}] ${a.ruta}: ${a.mensaje}`),
  ].join("\n");
