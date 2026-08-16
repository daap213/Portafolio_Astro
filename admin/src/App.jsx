import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from './api.js';
import { Panel } from './pantallas/Panel.jsx';
import { Contenido } from './pantallas/Contenido.jsx';
import { Secciones } from './pantallas/Secciones.jsx';
import { Textos } from './pantallas/Textos.jsx';
import { Medios } from './pantallas/Medios.jsx';
import { Idiomas } from './pantallas/Idiomas.jsx';
import { Vista } from './pantallas/Vista.jsx';

const PANTALLAS = [
  { id: 'panel', titulo: 'Panel', componente: Panel },
  { id: 'contenido', titulo: 'Contenido', componente: Contenido },
  { id: 'secciones', titulo: 'Secciones', componente: Secciones },
  { id: 'textos', titulo: 'Textos', componente: Textos },
  { id: 'medios', titulo: 'Medios', componente: Medios },
  { id: 'idiomas', titulo: 'Idiomas', componente: Idiomas },
  { id: 'vista', titulo: 'Vista previa', componente: Vista },
];

export default function App() {
  const [estado, setEstado] = useState(null);
  const [medios, setMedios] = useState([]);
  const [pantalla, setPantalla] = useState('panel');
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  // Los borradores viven AQUÍ, no en cada pantalla: al cambiar de pestaña el
  // componente se desmonta, y con su estado dentro se perdía todo lo editado
  // sin avisar de nada.
  const [borradores, setBorradores] = useState({});

  const borrador = useMemo(
    () => ({
      leer: (clave) => borradores[clave],
      poner: (clave, valor) => setBorradores((previos) => ({ ...previos, [clave]: valor })),
      limpiar: (...claves) =>
        setBorradores((previos) => {
          const copia = { ...previos };
          for (const clave of claves) delete copia[clave];
          return copia;
        }),
      claves: Object.keys(borradores),
    }),
    [borradores],
  );

  const recargar = useCallback(async () => {
    try {
      const [nuevo, imagenes] = await Promise.all([api.estado(), api.medios()]);
      setEstado(nuevo);
      setMedios(imagenes);
      setError(null);
    } catch (fallo) {
      setError(fallo.message);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  // Un refresco del navegador sí se lleva los borradores por delante
  useEffect(() => {
    if (!borrador.claves.length) return undefined;
    const avisar = (evento) => evento.preventDefault();
    window.addEventListener('beforeunload', avisar);
    return () => window.removeEventListener('beforeunload', avisar);
  }, [borrador.claves.length]);

  /**
   * Guarda y recarga. Si la validación rechaza, muestra los errores y no toca
   * disco. Devuelve true/false: quien llama necesita saberlo (el alta de idioma
   * limpiaba su formulario también cuando el alta había fallado).
   */
  const guardar = useCallback(
    async (accion, descripcion) => {
      setGuardando(true);
      setMensaje(null);
      try {
        const resultado = await accion();
        await recargar();
        const avisos = resultado?.avisos?.length ? `\n${resultado.avisos.length} aviso(s) pendientes` : '';
        setMensaje({ tipo: 'ok', texto: (resultado?.nota ?? `${descripcion}: guardado`) + avisos });
        return true;
      } catch (fallo) {
        const detalle = fallo.errores?.length
          ? fallo.errores.map((e) => `${e.ruta}: ${e.mensaje}`).join('\n')
          : fallo.message;
        setMensaje({ tipo: 'error', texto: `${descripcion} rechazado (no se ha escrito nada):\n${detalle}` });
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [recargar],
  );

  /**
   * Guarda TODOS los borradores pendientes en una sola transacción validada.
   *
   * Es un único botón, y vive en la cabecera a propósito. Antes cada pantalla
   * tenía el suyo dentro del bloque que pintaba el elemento seleccionado: al
   * borrar el último ítem de un bloque el botón desaparecía con él y el borrado
   * no había forma de confirmarlo.
   */
  const guardarPendientes = useCallback(
    () =>
      guardar(async () => {
        const parcial = {};
        for (const clave of ['comun', 'contenidos', 'textos', 'seccionesWeb', 'seccionesCv']) {
          if (borradores[clave] !== undefined) parcial[clave] = borradores[clave];
        }
        if (!Object.keys(parcial).length) return null;
        const resultado = await api.guardarEstado(parcial);
        setBorradores({});
        return resultado;
      }, 'Cambios'),
    [borradores, guardar],
  );

  if (error) {
    return (
      <div className="p-8 text-red-600">
        <h1 className="text-lg font-semibold">No se pudo contactar con la API</h1>
        <p className="mt-2 text-sm">{error}</p>
        <p className="mt-4 text-sm text-gray-600">
          Arranca el administrador completo con <code>pnpm run admin</code>.
        </p>
        <button className="mt-4 px-3 py-1 rounded bg-gray-900 text-white text-sm" onClick={recargar}>
          Reintentar
        </button>
      </div>
    );
  }

  if (!estado) return <div className="p-8 text-gray-500">Cargando…</div>;

  const Actual = PANTALLAS.find((p) => p.id === pantalla).componente;
  const nErrores = estado.diagnostico.errores.length;
  const nAvisos = estado.diagnostico.avisos.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="px-4 py-2 flex items-center gap-4 flex-wrap">
          <h1 className="font-semibold">Administrador del portafolio</h1>
          <nav className="flex gap-1">
            {PANTALLAS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPantalla(p.id)}
                className={`px-3 py-1 rounded text-sm ${
                  pantalla === p.id
                    ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {p.titulo}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-xs">
            {nErrores > 0 && <span className="text-red-600 font-medium">{nErrores} error(es)</span>}
            {nAvisos > 0 && <span className="text-amber-600">{nAvisos} aviso(s)</span>}
            <span className="text-gray-500">
              rama {estado.git?.rama} {estado.git?.sucio ? '· con cambios sin commitear' : '· limpia'}
            </span>
            {guardando && <span className="text-blue-600">guardando…</span>}

            {borrador.claves.length > 0 && (
              <>
                <span className="text-amber-600 font-medium">sin guardar: {borrador.claves.join(', ')}</span>
                <button
                  className="underline text-gray-500"
                  onClick={() => borrador.limpiar(...borrador.claves)}
                >
                  descartar
                </button>
              </>
            )}
            <button
              className="rounded bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 px-3 py-1 text-sm disabled:opacity-40"
              disabled={!borrador.claves.length || guardando}
              onClick={guardarPendientes}
            >
              Guardar
            </button>
          </div>
        </div>
      </header>

      {mensaje && (
        <div
          className={`px-4 py-2 text-sm whitespace-pre-wrap ${
            mensaje.tipo === 'ok'
              ? 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-200'
              : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200'
          }`}
        >
          {mensaje.texto}
          <button className="ml-3 underline" onClick={() => setMensaje(null)}>
            cerrar
          </button>
        </div>
      )}

      <main className="p-4">
        <Actual
          estado={estado}
          medios={medios}
          guardar={guardar}
          recargar={recargar}
          borrador={borrador}
          guardarPendientes={guardarPendientes}
        />
      </main>
    </div>
  );
}
