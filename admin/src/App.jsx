import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';
import { Panel } from './pantallas/Panel.jsx';
import { Contenido } from './pantallas/Contenido.jsx';
import { Secciones } from './pantallas/Secciones.jsx';
import { Medios } from './pantallas/Medios.jsx';
import { Idiomas } from './pantallas/Idiomas.jsx';
import { Vista } from './pantallas/Vista.jsx';

const PANTALLAS = [
  { id: 'panel', titulo: 'Panel', componente: Panel },
  { id: 'contenido', titulo: 'Contenido', componente: Contenido },
  { id: 'secciones', titulo: 'Secciones', componente: Secciones },
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

  /** Guarda y recarga. Si la validación rechaza, muestra los errores y no toca disco. */
  const guardar = useCallback(
    async (accion, descripcion) => {
      setGuardando(true);
      setMensaje(null);
      try {
        const resultado = await accion();
        await recargar();
        setMensaje({ tipo: 'ok', texto: resultado?.nota ?? `${descripcion}: guardado` });
      } catch (fallo) {
        const detalle = fallo.errores?.length
          ? fallo.errores.map((e) => `${e.ruta}: ${e.mensaje}`).join('\n')
          : fallo.message;
        setMensaje({ tipo: 'error', texto: `${descripcion} rechazado (no se ha escrito nada):\n${detalle}` });
      } finally {
        setGuardando(false);
      }
    },
    [recargar],
  );

  if (error) {
    return (
      <div className="p-8 text-red-600">
        <h1 className="text-lg font-semibold">No se pudo contactar con la API</h1>
        <p className="mt-2 text-sm">{error}</p>
        <p className="mt-4 text-sm text-gray-600">
          Arranca el administrador completo con <code>pnpm run admin</code>.
        </p>
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
        <Actual estado={estado} medios={medios} guardar={guardar} recargar={recargar} />
      </main>
    </div>
  );
}
