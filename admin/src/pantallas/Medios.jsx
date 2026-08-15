import { useRef, useState } from 'react';
import { api } from '../api.js';
import { PUERTOS_WEB } from '../constantes.js';

// Gestión de las imágenes de public/img.
//
// Solo .webp: pnpm-workspace.yaml desactiva la compilación de sharp (y esa
// opción es global), así que convertir en el servidor obligaría a compilarlo en
// cada instalación, también en CI.

export function Medios({ medios, guardar, recargar }) {
  const [carpeta, setCarpeta] = useState('projects');
  const entrada = useRef(null);
  const [subiendo, setSubiendo] = useState(false);

  const carpetas = [...new Set(medios.map((m) => m.ruta.split('/').slice(1, -1).join('/')))].filter(Boolean);

  const subir = async (evento) => {
    const fichero = evento.target.files?.[0];
    if (!fichero) return;
    setSubiendo(true);
    try {
      await api.subirImagen(carpeta, fichero.name, fichero);
      await recargar();
    } catch (fallo) {
      alert(fallo.message);
    } finally {
      setSubiendo(false);
      if (entrada.current) entrada.current.value = '';
    }
  };

  const borrar = (ruta) =>
    guardar(async () => {
      await api.borrarImagen(ruta);
    }, `Borrar ${ruta}`);

  const huerfanas = medios.filter((m) => !m.usada);

  return (
    <div className="space-y-4">
      <section className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <h2 className="font-semibold mb-2">Subir imagen</h2>
        <div className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-gray-500">Carpeta</span>
            <input
              className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm"
              value={carpeta}
              onChange={(e) => setCarpeta(e.target.value)}
              list="carpetas"
            />
            <datalist id="carpetas">
              {carpetas.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <input ref={entrada} type="file" accept="image/webp" onChange={subir} disabled={subiendo} />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Solo <code>.webp</code>. El nombre se normaliza a minúsculas sin tildes.
        </p>
      </section>

      {huerfanas.length > 0 && (
        <section className="rounded border border-amber-300 bg-amber-50 dark:bg-amber-900/20 p-4">
          <h2 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
            {huerfanas.length} imagen(es) que no usa nadie
          </h2>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Ningún dato las referencia. Ocupan espacio en el repositorio, pero borrarlas es opcional.
          </p>
        </section>
      )}

      <section className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {medios.map((imagen) => (
          <figure
            key={imagen.ruta}
            className={`rounded border p-2 bg-white dark:bg-gray-800 ${
              imagen.usada ? 'border-gray-200 dark:border-gray-700' : 'border-amber-400'
            }`}
          >
            <img
              src={`${PUERTOS_WEB}/${imagen.ruta}`}
              alt={imagen.ruta}
              className="h-24 w-full object-cover rounded bg-gray-100 dark:bg-gray-700"
              loading="lazy"
            />
            <figcaption className="mt-1 text-xs break-all">{imagen.ruta}</figcaption>
            <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
              <span>{Math.round(imagen.bytes / 1024)} KB</span>
              {imagen.usada ? (
                <span className="text-green-700">en uso</span>
              ) : (
                <button className="text-red-600 hover:underline" onClick={() => borrar(imagen.ruta)}>
                  borrar
                </button>
              )}
            </div>
          </figure>
        ))}
      </section>
    </div>
  );
}
