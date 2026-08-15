// Cliente de la API. Vite hace de proxy de /api al puerto del servidor.

async function peticion(ruta, opciones = {}) {
  const respuesta = await fetch(ruta, {
    headers: opciones.body instanceof Blob ? {} : { 'Content-Type': 'application/json' },
    ...opciones,
  });
  const texto = await respuesta.text();
  const cuerpo = texto ? JSON.parse(texto) : null;

  if (!respuesta.ok) {
    // 422 = la validación rechazó el estado propuesto y NO se tocó el disco
    const error = new Error(cuerpo?.error ?? `error ${respuesta.status}`);
    error.errores = cuerpo?.errores;
    error.estado = respuesta.status;
    throw error;
  }
  return cuerpo;
}

export const api = {
  estado: () => peticion('/api/estado'),
  diagnostico: () => peticion('/api/diagnostico'),

  guardarComun: (comun) => peticion('/api/comun', { method: 'PUT', body: JSON.stringify(comun) }),
  guardarContenido: (contenidos) => peticion('/api/contenido', { method: 'PUT', body: JSON.stringify(contenidos) }),
  guardarUi: (textos) => peticion('/api/ui', { method: 'PUT', body: JSON.stringify(textos) }),
  guardarSecciones: (lista, valor) =>
    peticion(`/api/secciones/${lista}`, { method: 'PUT', body: JSON.stringify(valor) }),

  anadirIdioma: (datos) => peticion('/api/idiomas', { method: 'POST', body: JSON.stringify(datos) }),
  quitarIdioma: (codigo) => peticion(`/api/idiomas/${codigo}`, { method: 'DELETE' }),

  medios: () => peticion('/api/medios'),
  subirImagen: (carpeta, nombre, fichero) =>
    peticion(`/api/medios/${carpeta || '-'}/${nombre}`, {
      method: 'PUT',
      headers: { 'Content-Type': fichero.type || 'image/webp' },
      body: fichero,
    }),
  borrarImagen: (ruta) => peticion(`/api/medios?ruta=${encodeURIComponent(ruta)}`, { method: 'DELETE' }),

  lanzarTarea: (tipo) => peticion('/api/tareas', { method: 'POST', body: JSON.stringify({ tipo }) }),
  git: () => peticion('/api/git'),
};

/** Se suscribe al registro en vivo de una tarea (SSE). */
export function seguirTarea(id, alRecibir) {
  const fuente = new EventSource(`/api/tareas/${id}/eventos`);
  fuente.onmessage = (evento) => {
    const dato = JSON.parse(evento.data);
    alRecibir(dato);
    if (dato.tipo === 'fin') fuente.close();
  };
  fuente.onerror = () => fuente.close();
  return () => fuente.close();
}
