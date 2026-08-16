import { useEffect, useRef, useState } from 'react';
import { api, seguirTarea } from '../api.js';

// Panel: diagnóstico, tareas largas y estado de git.
//
// El administrador NO commitea ni despliega: enseña qué ha cambiado y lo
// commitea la persona. Es deliberado — así nada llega a producción por accidente.

const TAREAS = [
  { tipo: 'qr', titulo: 'Regenerar QR', ayuda: 'Rehace los PNG desde los enlaces de los datos.' },
  { tipo: 'pdf', titulo: 'Regenerar PDF', ayuda: 'Construye el sitio e imprime un CV por idioma. Tarda.' },
  { tipo: 'build', titulo: 'Construir sitio', ayuda: 'astro build, para comprobar que todo compila.' },
  { tipo: 'test', titulo: 'Pasar los tests', ayuda: 'La suite rápida: datos, esquema y componentes.' },
];

export function Panel({ estado, recargar }) {
  const [registro, setRegistro] = useState([]);
  const [tarea, setTarea] = useState(null);
  const cerrarFlujo = useRef(null);

  // Al salir del Panel con una tarea en marcha quedaba un EventSource abierto
  // llamando a setRegistro sobre un componente ya desmontado
  useEffect(() => () => cerrarFlujo.current?.(), []);

  const lanzar = async (tipo) => {
    setRegistro([]);
    cerrarFlujo.current?.();
    try {
      const ficha = await api.lanzarTarea(tipo);
      setTarea(ficha);
      cerrarFlujo.current = seguirTarea(ficha.id, (evento) => {
        if (evento.tipo === 'linea') setRegistro((previo) => [...previo, evento.texto]);
        if (evento.tipo === 'fin') {
          // Sin esto, si el flujo se cortaba la tarea se quedaba "en curso" para
          // siempre y los cuatro botones inhabilitados hasta recargar la página
          setTarea((previo) => ({ ...previo, estado: evento.estado }));
          recargar();
        }
      });
    } catch (fallo) {
      // Un 409 ("ya hay una tarea en curso") no se veía: el registro solo se
      // pinta dentro del bloque {tarea && …}, que en el primer fallo es null
      setTarea({ tipo, estado: 'error' });
      setRegistro([`No se pudo lanzar: ${fallo.message}`]);
    }
  };

  const { errores, avisos } = estado.diagnostico;

  return (
    <div className="grid gap-4 @3xl:grid-cols-2">
      <section className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <h2 className="font-semibold mb-2">Diagnóstico</h2>
        {errores.length === 0 && avisos.length === 0 && (
          <p className="text-sm text-green-700">Todo correcto: sin errores ni avisos.</p>
        )}
        {errores.length > 0 && (
          <>
            <h3 className="text-sm font-medium text-red-600 mt-2">Errores ({errores.length})</h3>
            <ul className="text-xs space-y-1 mt-1">
              {errores.map((e, i) => (
                <li key={i}>
                  <code className="text-red-700">{e.ruta}</code> — {e.mensaje}
                </li>
              ))}
            </ul>
          </>
        )}
        {avisos.length > 0 && (
          <>
            <h3 className="text-sm font-medium text-amber-600 mt-3">Avisos ({avisos.length})</h3>
            <ul className="text-xs space-y-1 mt-1 max-h-64 overflow-auto">
              {avisos.map((a, i) => (
                <li key={i}>
                  <code className="text-amber-700">{a.ruta}</code> — {a.mensaje}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <h2 className="font-semibold mb-2">Tareas</h2>
        <p className="text-xs text-gray-500 mb-3">
          Solo se ejecuta una a la vez: dos Chrome simultáneos agotan la memoria y el servidor de
          vista previa de Astro es único por máquina.
        </p>
        <div className="grid gap-2 @xl:grid-cols-2">
          {TAREAS.map((t) => (
            <button
              key={t.tipo}
              onClick={() => lanzar(t.tipo)}
              disabled={tarea?.estado === 'en curso'}
              className="text-left rounded border border-gray-300 dark:border-gray-600 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <div className="text-sm font-medium">{t.titulo}</div>
              <div className="text-xs text-gray-500">{t.ayuda}</div>
            </button>
          ))}
        </div>

        {tarea && (
          <div className="mt-3">
            <div className="text-xs mb-1">
              {tarea.tipo} — <span className="font-medium">{tarea.estado}</span>
            </div>
            <pre className="text-xs bg-gray-900 text-gray-100 rounded p-2 max-h-64 overflow-auto whitespace-pre-wrap">
              {registro.join('\n') || '…'}
            </pre>
          </div>
        )}
      </section>

      <section className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 @3xl:col-span-2">
        <h2 className="font-semibold mb-2">Cambios sin commitear</h2>
        {estado.git?.error && <p className="text-sm text-red-600">{estado.git.error}</p>}
        {estado.git && !estado.git.sucio && (
          <p className="text-sm text-gray-500">El árbol de trabajo está limpio.</p>
        )}
        {estado.git?.ficheros?.length > 0 && (
          <ul className="text-xs font-mono space-y-0.5">
            {estado.git.ficheros.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        )}
        <p className="text-xs text-gray-500 mt-3">
          El administrador escribe en el repositorio pero no hace commit ni push: revisa el diff y
          commitea tú desde tu editor o la terminal.
        </p>
      </section>
    </div>
  );
}
