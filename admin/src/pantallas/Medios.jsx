import { useRef, useState } from 'react';
import { api } from '../api.js';
import { Miniatura } from '../componentes/Campos.jsx';

// Gestión de las imágenes de public/img.
//
// Las miniaturas se piden a la propia API (/api/archivos, por el proxy de
// Vite), no al `astro dev`: así se ven aunque la vista previa no esté levantada.
//
// El "en uso" ya no sale de mirar dos claves de comun.json: la API también
// cuenta los QR (que se derivan y no se guardan en ningún sitio) y las rutas
// escritas a mano en el código, como el favicon. Antes daba 29 falsos huérfanos
// y ofrecía borrarlos.

export function Medios({ medios, guardar, recargar }) {
  const [carpeta, setCarpeta] = useState('projects');
  const entrada = useRef(null);
  const [subiendo, setSubiendo] = useState(false);
  const [fallo, setFallo] = useState(null);

  const carpetas = [...new Set(medios.map((m) => m.ruta.split('/').slice(1, -1).join('/')))].filter(Boolean);

  // La ruta de subida es /api/medios/:carpeta/:nombre, un solo segmento para la
  // carpeta: con una anidada no encajaba ninguna ruta y llegaba un 404 en HTML
  const carpetaInvalida = carpeta.includes('/');

  const subir = async (evento) => {
    const fichero = evento.target.files?.[0];
    if (!fichero) return;
    setSubiendo(true);
    setFallo(null);
    try {
      await api.subirImagen(carpeta, fichero.name, fichero);
      await recargar();
    } catch (error) {
      setFallo(error.message);
    } finally {
      setSubiendo(false);
      if (entrada.current) entrada.current.value = '';
    }
  };

  const borrar = (imagen) => {
    if (!confirm(`¿Borrar ${imagen.ruta} del repositorio?`)) return;
    guardar(async () => api.borrarImagen(imagen.ruta), `Borrar ${imagen.ruta}`).then(recargar);
  };

  const huerfanas = medios.filter((m) => !m.usada);

  return (
    <div className="space-y-4">
      <section className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <h2 className="font-semibold mb-2">Subir imagen</h2>
        <div className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-gray-500">Carpeta</span>
            <input
              className={`rounded border bg-white dark:bg-gray-800 px-2 py-1 text-sm ${
                carpetaInvalida ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
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
          <input
            ref={entrada}
            type="file"
            accept="image/*"
            onChange={subir}
            disabled={subiendo || carpetaInvalida}
          />
        </div>
        {carpetaInvalida && (
          <p className="text-xs text-red-600 mt-2">
            La carpeta no puede llevar «/»: solo se admite un nivel dentro de <code>public/img</code>.
          </p>
        )}
        {fallo && <p className="text-xs text-red-600 mt-2 whitespace-pre-wrap">{fallo}</p>}
        <p className="text-xs text-gray-500 mt-2">
          Se recomienda <code>.webp</code>. El nombre se normaliza a minúsculas sin tildes.
        </p>
      </section>

      {huerfanas.length > 0 && (
        <section className="rounded border border-amber-300 bg-amber-50 dark:bg-amber-900/20 p-4">
          <h2 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
            {huerfanas.length} imagen(es) que no usa nadie
          </h2>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            No las referencia ningún dato, ningún QR y ningún fichero de <code>src/</code>. Ocupan
            espacio en el repositorio, pero borrarlas es opcional.
          </p>
        </section>
      )}

      {/* Rejilla intrínseca: las tarjetas caben las que quepan, sin cortes fijos.
          Con `sm:grid-cols-3 lg:grid-cols-5` seguían siendo cinco aunque el
          editor midiera cuatrocientos píxeles, porque esos cortes miran la
          ventana y no el panel. */}
      <section
        className="grid gap-3"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(11rem, 1fr))' }}
      >
        {medios.map((imagen) => (
          <figure
            key={imagen.ruta}
            className={`rounded border p-2 bg-white dark:bg-gray-800 ${
              imagen.usada ? 'border-gray-200 dark:border-gray-700' : 'border-amber-400'
            }`}
          >
            <Miniatura ruta={imagen.ruta} clase="h-24 w-full" />
            <figcaption className="mt-1 text-xs break-all">{imagen.ruta}</figcaption>
            <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
              <span>{Math.round(imagen.bytes / 1024)} KB</span>
              {imagen.usada ? (
                <span className="text-green-700" title={`en uso: ${imagen.motivos?.join(', ')}`}>
                  {imagen.motivos?.join(', ') || 'en uso'}
                </span>
              ) : (
                <button className="text-red-600 hover:underline" onClick={() => borrar(imagen)}>
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
