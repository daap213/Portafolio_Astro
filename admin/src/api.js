// Cliente de la API. Vite hace de proxy de /api al puerto del servidor.

async function peticion(ruta, opciones = {}) {
  let respuesta;
  try {
    respuesta = await fetch(ruta, {
      headers: opciones.body instanceof Blob ? {} : { 'Content-Type': 'application/json' },
      ...opciones,
    });
  } catch (fallo) {
    const error = new Error(`no se pudo contactar con la API (${fallo.message}). ¿Sigue en marcha \`pnpm run admin\`?`);
    error.estado = 0;
    throw error;
  }

  const texto = await respuesta.text();
  let cuerpo = null;
  try {
    cuerpo = texto ? JSON.parse(texto) : null;
  } catch {
    // Una respuesta que no es JSON casi siempre es una página de error de
    // Express o del proxy; sin este rescate salía un "Unexpected token '<'"
    // que no decía nada de lo que había pasado en realidad.
    const error = new Error(`respuesta no válida de ${ruta} (${respuesta.status}): ${texto.slice(0, 200)}`);
    error.estado = respuesta.status;
    throw error;
  }

  if (!respuesta.ok) {
    // 422 = la validación rechazó el estado propuesto y NO se tocó el disco
    const error = new Error(cuerpo?.error ?? `error ${respuesta.status}`);
    error.errores = cuerpo?.errores;
    error.avisos = cuerpo?.avisos;
    error.estado = respuesta.status;
    throw error;
  }
  return cuerpo;
}

export const api = {
  estado: () => peticion('/api/estado'),
  diagnostico: () => peticion('/api/diagnostico'),

  // Vía atómica: escribe varios ficheros en una sola transacción validada.
  // Es la única forma de dar de alta o de baja un ítem o un bloque, porque el
  // cambio cruza comun.json y todos los contenido.<idioma>.json a la vez.
  guardarEstado: (parcial) => peticion('/api/estado', { method: 'PUT', body: JSON.stringify(parcial) }),

  guardarComun: (comun) => peticion('/api/comun', { method: 'PUT', body: JSON.stringify(comun) }),
  guardarContenido: (contenidos) => peticion('/api/contenido', { method: 'PUT', body: JSON.stringify(contenidos) }),
  guardarUi: (textos) => peticion('/api/ui', { method: 'PUT', body: JSON.stringify(textos) }),
  guardarSecciones: (lista, valor) =>
    peticion(`/api/secciones/${lista}`, { method: 'PUT', body: JSON.stringify(valor) }),

  anadirIdioma: (datos) => peticion('/api/idiomas', { method: 'POST', body: JSON.stringify(datos) }),
  quitarIdioma: (codigo) => peticion(`/api/idiomas/${encodeURIComponent(codigo)}`, { method: 'DELETE' }),

  medios: () => peticion('/api/medios'),
  subirImagen: (carpeta, nombre, fichero) =>
    // Cada segmento se codifica por separado: sin esto, un nombre con # o %
    // rompía la URL y un carpeta con "/" no encajaba con la ruta y devolvía un
    // 404 en HTML.
    peticion(`/api/medios/${encodeURIComponent(carpeta || '-')}/${encodeURIComponent(nombre)}`, {
      method: 'PUT',
      headers: { 'Content-Type': fichero.type || 'image/webp' },
      body: fichero,
    }),
  borrarImagen: (ruta) => peticion(`/api/medios?ruta=${encodeURIComponent(ruta)}`, { method: 'DELETE' }),

  lanzarTarea: (tipo) => peticion('/api/tareas', { method: 'POST', body: JSON.stringify({ tipo }) }),
  git: () => peticion('/api/git'),
};

/**
 * Se suscribe al registro en vivo de una tarea (SSE).
 *
 * `alRecibir` recibe también un `{tipo:'fin', estado:'error'}` sintético si el
 * flujo se corta: antes el onerror solo cerraba la fuente en silencio y la
 * interfaz se quedaba con los botones deshabilitados para siempre.
 */
export function seguirTarea(id, alRecibir) {
  const fuente = new EventSource(`/api/tareas/${id}/eventos`);
  let terminada = false;

  const cerrar = () => {
    terminada = true;
    fuente.close();
  };

  fuente.onmessage = (evento) => {
    let dato;
    try {
      dato = JSON.parse(evento.data);
    } catch {
      return;
    }
    alRecibir(dato);
    if (dato.tipo === 'fin') cerrar();
  };

  fuente.onerror = () => {
    if (terminada) return;
    cerrar();
    alRecibir({ tipo: 'linea', texto: '[se perdió la conexión con el registro de la tarea]' });
    alRecibir({ tipo: 'fin', estado: 'error' });
  };

  return cerrar;
}
