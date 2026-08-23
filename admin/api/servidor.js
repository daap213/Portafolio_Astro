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
import { DIR_PUBLICO, PUERTOS, RAIZ } from './rutas.js';
import { guardarEstado, leerEstado, listarCopias, marcaDeTiempo, restaurarCopia } from './lib/almacen.js';
import { borrarImagen, guardarImagen, inventario } from './lib/medios.js';
import { anadirIdioma, borrarFicherosDeIdioma, quitarIdioma } from './lib/idiomas.js';
import { buscar, cancelar, ficha, lanzar, tareaEnCurso, TIPOS_TAREA } from './lib/tareas.js';
import { TIPOS } from '../../src/cv_info/tipos.js';
import { NOMBRES_ICONO } from '../../src/cv_info/iconos.js';
import { TOKENS, VARIANTES } from '../../src/cv_info/disenos.js';
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

// Los ficheros de public/ los sirve la propia API.
//
// Antes las miniaturas se pedían al `astro dev` del puerto 4322, que es un
// tercer proceso: si no estaba en marcha —o si escuchaba solo en ::1, que es
// lo que pasa en Windows cuando `localhost` resuelve primero a IPv6— no se
// veía ni una imagen. Por aquí van por el proxy de Vite, mismo origen.
aplicacion.use('/api/archivos', express.static(DIR_PUBLICO, { fallthrough: false }));

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
  const resultado = await guardarEstado(estado, { marca: marcaDeTiempo() });
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
    // El catálogo de iconos viaja al cliente porque registro.js (que los une a
    // su .astro) no se puede importar desde aquí: arrastra componentes
    iconos: NOMBRES_ICONO,
    // Y por lo mismo, el catálogo de tokens y los NOMBRES de variante: la
    // pantalla de diseños genera su formulario a partir de ellos, igual que la
    // de contenido lo genera a partir de `tipos`
    tokens: TOKENS,
    variantes: VARIANTES,
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
//
// Ésta es la vía para cualquier cambio que cruce ficheros (alta y baja de
// ítems, alta de bloques): comun.json y los contenidos se validan juntos. Por
// separado es imposible, porque un ítem nuevo sin traducción es un error
// (ITEM_SIN_TRADUCCION) y una traducción sin ítem también (ITEM_HUERFANO): se
// rechazaban mutuamente y no había forma de añadir nada.
aplicacion.put('/api/estado', ruta(async (peticion, respuesta) => {
  const actual = await leerEstado();
  const propuesto = { ...actual, ...peticion.body };

  // Los mapas por idioma se sustituyen enteros, no se fusionan: mandar solo un
  // idioma borraría los demás del mapa y el error saldría como un confuso
  // FALTA_CONTENIDO en vez de decir lo que pasa de verdad.
  const codigos = (propuesto.locales ?? []).map((idioma) => idioma.codigo);
  for (const [clave, etiqueta] of [['contenidos', 'contenido'], ['textos', 'ui']]) {
    if (!peticion.body?.[clave]) continue;
    const faltan = codigos.filter((codigo) => !peticion.body[clave][codigo]);
    if (faltan.length) {
      const error = new Error(`"${clave}" debe traer todos los idiomas; faltan: ${faltan.join(', ')} (${etiqueta}.<idioma>.json)`);
      error.estado = 400;
      throw error;
    }
  }

  await guardarYResponder(propuesto, respuesta);
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

const CLAVE_DE_LISTA = { web: 'seccionesWeb', cv: 'seccionesCv' };

aplicacion.put('/api/secciones/:lista', ruta(async (peticion, respuesta) => {
  // Cualquier valor que no fuera "cv" se tomaba como "web": una errata en la
  // URL sobrescribía la lista de la portada con la del CV.
  const clave = CLAVE_DE_LISTA[peticion.params.lista];
  if (!clave) {
    const error = new Error(`lista "${peticion.params.lista}" desconocida; usa "web" o "cv"`);
    error.estado = 400;
    throw error;
  }
  const estado = await leerEstado();
  await guardarYResponder({ ...estado, [clave]: peticion.body }, respuesta);
}));

// ---- idiomas ---------------------------------------------------------------

aplicacion.post('/api/idiomas', ruta(async (peticion, respuesta) => {
  const estado = await leerEstado();
  const nuevo = anadirIdioma(estado, peticion.body);
  const resultado = await guardarEstado(nuevo, { marca: marcaDeTiempo() });
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
  const resultado = await guardarEstado(nuevo, { marca: marcaDeTiempo() });
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
  try {
    servirEventos(peticion, respuesta);
  } catch (error) {
    // Sin este try la excepción quedaba como unhandled rejection y la interfaz
    // solo veía que el registro dejaba de llegar
    if (!respuesta.headersSent) respuesta.status(500).json({ error: error.message });
    else respuesta.end();
  }
});

function servirEventos(peticion, respuesta) {
  const tarea = buscar(peticion.params.id);
  if (!tarea) return respuesta.status(404).json({ error: 'no existe esa tarea' });

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
}

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

// ---- cierre ----------------------------------------------------------------

// Sin esto, una ruta inexistente devolvía la página HTML de Express y el cliente
// reventaba con "Unexpected token '<'" al intentar leerla como JSON, escondiendo
// cuál era el problema de verdad.
aplicacion.use((peticion, respuesta) => {
  respuesta.status(404).json({ error: `no existe ${peticion.method} ${peticion.originalUrl}` });
});

aplicacion.use((error, _peticion, respuesta, _siguiente) => {
  respuesta.status(error.estado ?? error.status ?? 500).json({ error: error.message });
});

// ---- arranque --------------------------------------------------------------

const servidor = aplicacion.listen(PUERTOS.api, '127.0.0.1', () => {
  console.log(`[api] administrador escuchando en http://127.0.0.1:${PUERTOS.api}`);
});

for (const senal of ['SIGINT', 'SIGTERM']) {
  process.on(senal, () => servidor.close(() => process.exit(0)));
}
