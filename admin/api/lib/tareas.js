// Ejecución de las tareas largas del proyecto (QR, PDF, build, tests).
//
// COLA DE UNA: nunca se ejecutan dos a la vez. Dos Chrome simultáneos agotan la
// memoria, y `astro preview` es un demonio ÚNICO por máquina (no por puerto),
// así que dos tareas de PDF se pisarían entre ellas.
//
// Y por el mismo motivo, la tarea de PDF comprueba antes si ya hay un preview
// vivo: si lo hay, aborta en vez de robárselo. Podría ser el de `pnpm run
// test:e2e`, y pararlo dejaría la suite colgada sin explicación.
import { spawn } from 'node:child_process';
import { PUERTOS, RAIZ } from '../rutas.js';

let enCurso = null;
let contador = 0;
const historial = new Map();

const ahora = () => new Date().toISOString();

/** Lanza un comando y va emitiendo sus líneas de salida. */
function ejecutar(comando, argumentos, tarea, entorno = {}) {
  return new Promise((listo, fallo) => {
    tarea.registro.push(`$ ${comando} ${argumentos.join(' ')}`);
    tarea.emitir?.({ tipo: 'linea', texto: `$ ${comando} ${argumentos.join(' ')}` });

    const hijo = spawn(comando, argumentos, {
      cwd: RAIZ,
      shell: process.platform === 'win32',
      env: { ...process.env, ...entorno },
    });
    tarea.hijo = hijo;

    const anotar = (buffer) => {
      for (const linea of buffer.toString().split('\n')) {
        if (!linea.trim()) continue;
        tarea.registro.push(linea);
        tarea.emitir?.({ tipo: 'linea', texto: linea });
      }
    };
    hijo.stdout.on('data', anotar);
    hijo.stderr.on('data', anotar);

    hijo.on('error', fallo);
    hijo.on('close', (codigo) => {
      tarea.hijo = null;
      if (codigo === 0) listo(codigo);
      else fallo(new Error(`"${comando} ${argumentos.join(' ')}" terminó con código ${codigo}`));
    });
  });
}

// `astro preview status` sale siempre con código 0 y dice, literalmente:
//   vivo   -> Preview server running at http://127.0.0.1:4331 (pid 19128, ...)
//   parado -> No preview server is running.
// Las dos frases contienen "running", así que la comprobación antigua
// (/running|pid/i) daba SIEMPRE positivo y la tarea de PDF era imposible de
// lanzar: abortaba diciendo que ya había un preview en marcha.
const SIN_PREVIEW = /no preview server is running/i;
const CON_PREVIEW = /preview server running at|\(pid \d+/i;

/** ¿Hay un demonio de astro preview vivo ahora mismo? */
async function hayPreviewVivo(tarea) {
  const desde = tarea.registro.length;
  try {
    await ejecutar('pnpm', ['exec', 'astro', 'preview', 'status'], tarea);
  } catch {
    return false;
  }
  const salida = tarea.registro.slice(desde).join('\n');
  if (SIN_PREVIEW.test(salida)) return false;
  return CON_PREVIEW.test(salida);
}

const PASOS = {
  async qr(tarea) {
    await ejecutar('node', ['src/scripts/url_to_qr.js'], tarea);
  },

  async idiomas(tarea) {
    await ejecutar('node', ['src/scripts/sync_idiomas.js'], tarea);
  },

  async build(tarea) {
    await ejecutar('pnpm', ['run', 'build'], tarea);
  },

  async test(tarea) {
    await ejecutar('pnpm', ['run', 'test'], tarea);
  },

  async pdf(tarea) {
    if (await hayPreviewVivo(tarea)) {
      throw new Error(
        'ya hay un `astro preview` en marcha (probablemente de los tests). ' +
        'Es un demonio único por máquina: párala tú y vuelve a intentarlo.',
      );
    }

    // Sin build previo se imprimiría el dist/ anterior, no lo que acabas de guardar
    await ejecutar('pnpm', ['run', 'build'], tarea);
    await ejecutar(
      'pnpm',
      ['exec', 'astro', 'preview', '--background', '--host', '127.0.0.1', '--port', String(PUERTOS.preview)],
      tarea,
    );
    try {
      await ejecutar('node', ['src/scripts/pdf_cv.js'], tarea, {
        URL_BASE: `http://127.0.0.1:${PUERTOS.preview}/`,
      });
    } finally {
      await ejecutar('pnpm', ['exec', 'astro', 'preview', 'stop'], tarea).catch(() => {});
    }
  },
};

export const TIPOS_TAREA = Object.keys(PASOS);

/** Lanza una tarea. Devuelve su ficha, o lanza si ya hay otra en curso. */
export function lanzar(tipo) {
  if (!PASOS[tipo]) {
    const error = new Error(`tarea desconocida: ${tipo}. Disponibles: ${TIPOS_TAREA.join(', ')}`);
    error.estado = 400;
    throw error;
  }
  if (enCurso) {
    const error = new Error(`ya hay una tarea en curso (${enCurso.tipo}). Espera a que termine.`);
    error.estado = 409;
    throw error;
  }

  const tarea = {
    id: `t${++contador}`,
    tipo,
    estado: 'en curso',
    inicio: ahora(),
    fin: null,
    registro: [],
    oyentes: new Set(),
    hijo: null,
  };
  tarea.emitir = (evento) => {
    for (const oyente of tarea.oyentes) oyente(evento);
  };

  enCurso = tarea;
  historial.set(tarea.id, tarea);

  PASOS[tipo](tarea)
    .then(() => {
      tarea.estado = 'completada';
    })
    .catch((error) => {
      tarea.estado = 'fallida';
      tarea.registro.push(`ERROR: ${error.message}`);
      tarea.emitir({ tipo: 'linea', texto: `ERROR: ${error.message}` });
    })
    .finally(() => {
      tarea.fin = ahora();
      tarea.emitir({ tipo: 'fin', estado: tarea.estado });
      for (const oyente of tarea.oyentes) tarea.oyentes.delete(oyente);
      enCurso = null;
    });

  return ficha(tarea);
}

export const ficha = (tarea) => ({
  id: tarea.id,
  tipo: tarea.tipo,
  estado: tarea.estado,
  inicio: tarea.inicio,
  fin: tarea.fin,
  registro: tarea.registro,
});

export const buscar = (id) => historial.get(id);
export const tareaEnCurso = () => (enCurso ? ficha(enCurso) : null);

/** Corta la tarea en curso, si la hay. */
export function cancelar(id) {
  const tarea = historial.get(id);
  if (!tarea?.hijo) return false;
  if (process.platform === 'win32') {
    // En Windows kill() no se lleva el árbol de procesos hijos
    spawn('taskkill', ['/pid', String(tarea.hijo.pid), '/T', '/F']);
  } else {
    tarea.hijo.kill('SIGTERM');
  }
  return true;
}
