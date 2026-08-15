// API del administrador local.
//
// Escucha SOLO en 127.0.0.1: no hay autenticación porque no hay superficie
// expuesta. Si algún día hiciera falta abrirla, primero hay que añadir sesión.
//
// Escribe en el árbol de trabajo del repositorio y NO hace operaciones de git:
// los cambios se ven en `git status` y los commitea la persona, no la máquina.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import express from 'express';
import { PUERTOS, RAIZ } from './rutas.js';
import { guardarEstado, leerEstado, listarCopias, restaurarCopia } from './lib/almacen.js';
import { borrarImagen, guardarImagen, inventario } from './lib/medios.js';
import { anadirIdioma, borrarFicherosDeIdioma, quitarIdioma } from './lib/idiomas.js';
import { buscar, cancelar, ficha, lanzar, tareaEnCurso, TIPOS_TAREA } from './lib/tareas.js';
import { TIPOS } from '../../src/cv_info/tipos.js';
import { validar } from '../../src/cv_info/validar.js';

const ejecutar = promisify(execFile);
const aplicacion = express();

aplicacion.use(express.json({ limit: '4mb' }));
aplicacion.use('/api/medios', express.raw({ type: 'image/*', limit: '12mb' }));

// Vite sirve la interfaz en otro puerto: en local basta con permitir ese origen
aplicacion.use((peticion, respuesta, siguiente) => {
  respuesta.set('Access-Control-Allow-Origin', `http://127.0.0.1:${PUERTOS.ui}`);
  respuesta.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  respuesta.set('Access-Control-Allow-Headers', 'Content-Type');
  if (peticion.method === 'OPTIONS') return respuesta.sendStatus(204);
  siguiente();
});

/** Envuelve un manejador async y traduce los errores a JSON. */
const ruta = (manejador) => async (peticion, respuesta) => {
  try {
    await manejador(peticion, respuesta);
  } catch (error) {
    respuesta.status(error.estado ?? 500).json({ error: error.message });
  }
};

/** Guarda un estado ya modificado y responde con el diagnóstico. */
async function guardarYResponder(estado, respuesta) {
  const marca = new Date().toISOString().replaceAll(':', '-');
  const resultado = await guardarEstado(estado, { marca });
  if (!resultado.ok) return respuesta.status(422).json({ errores: resultado.errores, avisos: resultado.avisos });
  respuesta.json({ ok: true, escritos: resultado.escritos, avisos: resultado.avisos });
}

// ---- estado y catálogo ----------------------------------------------------

aplicacion.get('/api/estado', ruta(async (_peticion, respuesta) => {
  const estado = await leerEstado();
  const { errores, avisos } = validar(estado);
  respuesta.json({
    ...estado,
    tipos: TIPOS,
    diagnostico: { errores, avisos },
    tarea: tareaEnCurso(),
    git: await estadoGit(),
  });
}));

aplicacion.get('/api/tipos', ruta(async (_peticion, respuesta) => respuesta.json(TIPOS)));

aplicacion.get('/api/diagnostico', ruta(async (_peticion, respuesta) => {
  respuesta.json(validar(await leerEstado()));
}));

// ---- contenido -------------------------------------------------------------

// Se guarda el estado ENTERO: escribir un idioma sí y otro no dejaría el sitio
// desincronizado y la suite en rojo.
aplicacion.put('/api/estado', ruta(async (peticion, respuesta) => {
  const actual = await leerEstado();
  await guardarYResponder({ ...actual, ...peticion.body }, respuesta);
}));

aplicacion.put('/api/comun', ruta(async (peticion, respuesta) => {
  const estado = await leerEstado();
  await guardarYResponder({ ...estado, comun: peticion.body }, respuesta);
}));

aplicacion.put('/api/contenido', ruta(async (peticion, respuesta) => {
  const estado = await leerEstado();
  await guardarYResponder({ ...estado, contenidos: { ...estado.contenidos, ...peticion.body } }, respuesta);
}));

aplicacion.put('/api/ui', ruta(async (peticion, respuesta) => {
  const estado = await leerEstado();
  await guardarYResponder({ ...estado, textos: { ...estado.textos, ...peticion.body } }, respuesta);
}));

aplicacion.put('/api/secciones/:lista', ruta(async (peticion, respuesta) => {
  const clave = peticion.params.lista === 'cv' ? 'seccionesCv' : 'seccionesWeb';
  const estado = await leerEstado();
  await guardarYResponder({ ...estado, [clave]: peticion.body }, respuesta);
}));

// ---- idiomas ---------------------------------------------------------------

aplicacion.post('/api/idiomas', ruta(async (peticion, respuesta) => {
  const estado = await leerEstado();
  const nuevo = anadirIdioma(estado, peticion.body);
  const marca = new Date().toISOString().replaceAll(':', '-');
  const resultado = await guardarEstado(nuevo, { marca });
  if (!resultado.ok) return respuesta.status(422).json({ errores: resultado.errores, avisos: resultado.avisos });

  // Regenera data/indice.js, que es lo único que enumera los ficheros de idioma
  await ejecutar('node', ['src/scripts/sync_idiomas.js'], { cwd: RAIZ });
  respuesta.json({
    ok: true,
    avisos: resultado.avisos,
    nota: 'reinicia `astro dev` para que Astro registre la ruta del idioma nuevo',
  });
}));

aplicacion.delete('/api/idiomas/:codigo', ruta(async (peticion, respuesta) => {
  const estado = await leerEstado();
  const nuevo = quitarIdioma(estado, peticion.params.codigo);
  const marca = new Date().toISOString().replaceAll(':', '-');
  const resultado = await guardarEstado(nuevo, { marca });
  if (!resultado.ok) return respuesta.status(422).json({ errores: resultado.errores, avisos: resultado.avisos });

  await borrarFicherosDeIdioma(peticion.params.codigo);
  await ejecutar('node', ['src/scripts/sync_idiomas.js'], { cwd: RAIZ });
  respuesta.json({ ok: true, avisos: resultado.avisos });
}));

// ---- imágenes --------------------------------------------------------------

aplicacion.get('/api/medios', ruta(async (_peticion, respuesta) => {
  respuesta.json(await inventario(await leerEstado()));
}));

aplicacion.put('/api/medios/:carpeta/:nombre', ruta(async (peticion, respuesta) => {
  const ruta = await guardarImagen({
    carpeta: peticion.params.carpeta === '-' ? '' : peticion.params.carpeta,
    nombre: peticion.params.nombre,
    contenido: peticion.body,
  });
  respuesta.json({ ok: true, ruta });
}));

aplicacion.delete('/api/medios', ruta(async (peticion, respuesta) => {
  await borrarImagen(peticion.query.ruta, await leerEstado());
  respuesta.json({ ok: true });
}));

// ---- tareas ----------------------------------------------------------------

aplicacion.get('/api/tareas', ruta(async (_peticion, respuesta) => {
  respuesta.json({ disponibles: TIPOS_TAREA, enCurso: tareaEnCurso() });
}));

aplicacion.post('/api/tareas', ruta(async (peticion, respuesta) => {
  respuesta.status(202).json(lanzar(peticion.body?.tipo));
}));

aplicacion.get('/api/tareas/:id', ruta(async (peticion, respuesta) => {
  const tarea = buscar(peticion.params.id);
  if (!tarea) return respuesta.status(404).json({ error: 'no existe esa tarea' });
  respuesta.json(ficha(tarea));
}));

aplicacion.delete('/api/tareas/:id', ruta(async (peticion, respuesta) => {
  respuesta.json({ cancelada: cancelar(peticion.params.id) });
}));

// Registro en vivo por SSE: la interfaz lo muestra como una terminal
aplicacion.get('/api/tareas/:id/eventos', (peticion, respuesta) => {
  const tarea = buscar(peticion.params.id);
  if (!tarea) return respuesta.status(404).end();

  respuesta.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  respuesta.flushHeaders();

  for (const linea of tarea.registro) respuesta.write(`data: ${JSON.stringify({ tipo: 'linea', texto: linea })}\n\n`);
  if (tarea.estado !== 'en curso') {
    respuesta.write(`data: ${JSON.stringify({ tipo: 'fin', estado: tarea.estado })}\n\n`);
    return respuesta.end();
  }

  const oyente = (evento) => {
    respuesta.write(`data: ${JSON.stringify(evento)}\n\n`);
    if (evento.tipo === 'fin') respuesta.end();
  };
  tarea.oyentes.add(oyente);
  peticion.on('close', () => tarea.oyentes.delete(oyente));
});

// ---- copias de seguridad y git ---------------------------------------------

aplicacion.get('/api/copias', ruta(async (_peticion, respuesta) => respuesta.json(listarCopias())));

aplicacion.post('/api/copias/:nombre/restaurar', ruta(async (peticion, respuesta) => {
  respuesta.json({ ok: true, restaurado: await restaurarCopia(peticion.params.nombre) });
}));

/** Solo lectura: el administrador enseña el estado de git, nunca commitea. */
async function estadoGit() {
  try {
    const { stdout: rama } = await ejecutar('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: RAIZ });
    const { stdout: estado } = await ejecutar('git', ['status', '--porcelain'], { cwd: RAIZ });
    const ficheros = estado.split('\n').filter(Boolean).map((linea) => linea.trim());
    return { rama: rama.trim(), sucio: ficheros.length > 0, ficheros };
  } catch (error) {
    return { error: error.message };
  }
}

aplicacion.get('/api/git', ruta(async (_peticion, respuesta) => respuesta.json(await estadoGit())));

aplicacion.get('/api/git/diff', ruta(async (_peticion, respuesta) => {
  const { stdout } = await ejecutar('git', ['diff', '--stat'], { cwd: RAIZ, maxBuffer: 8 * 1024 * 1024 });
  respuesta.type('text/plain').send(stdout);
}));

// ---- arranque --------------------------------------------------------------

const servidor = aplicacion.listen(PUERTOS.api, '127.0.0.1', () => {
  console.log(`[api] administrador escuchando en http://127.0.0.1:${PUERTOS.api}`);
});

for (const senal of ['SIGINT', 'SIGTERM']) {
  process.on(senal, () => servidor.close(() => process.exit(0)));
}
