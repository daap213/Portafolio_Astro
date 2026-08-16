import { useState } from 'react';
import { api } from '../api.js';

// Alta y baja de idiomas.
//
// Dar de alta un idioma es solo datos: se crean contenido.<codigo>.json y
// ui.<codigo>.json COPIANDO el idioma de origen, se registra en locales.json y
// se añaden los textos de cada sección en ambas listas. El módulo generado
// data/indice.js se regenera solo.
//
// Se copia en vez de dejar en blanco a propósito: con los campos obligatorios
// vacíos la validación rechazaría el alta, y el sitio no se podría publicar
// mientras dura la traducción. Lo que queda por traducir se mide comparando con
// el idioma de origen, no buscando huecos.
//
// Lo único manual es reiniciar `astro dev`: Astro lee su configuración al
// arrancar y no se entera de la ruta nueva hasta entonces.

/** Cuenta los textos que siguen siendo idénticos a los del idioma de referencia. */
function contarIguales(valor, referencia) {
  if (typeof valor === 'string') return valor.trim() !== '' && valor === referencia ? 1 : 0;
  if (Array.isArray(valor)) {
    return valor.reduce((suma, v, i) => suma + contarIguales(v, referencia?.[i]), 0);
  }
  if (valor && typeof valor === 'object') {
    return Object.entries(valor).reduce((suma, [clave, v]) => suma + contarIguales(v, referencia?.[clave]), 0);
  }
  return 0;
}

export function Idiomas({ estado, guardar }) {
  const [nuevo, setNuevo] = useState({ codigo: '', etiqueta: '', nombre: '', pdf: '', desde: '' });

  const idiomas = estado.locales;
  const predeterminado = idiomas.find((i) => i.predeterminado) ?? idiomas[0];

  // Textos que siguen palabra por palabra como en el idioma predeterminado.
  // Algunos lo estarán legítimamente (nombres propios, "GitHub"): es una lista
  // de repaso, no un error.
  const pendientes = {};
  for (const idioma of idiomas) {
    if (idioma.codigo === predeterminado.codigo) continue;
    pendientes[idioma.codigo] =
      contarIguales(estado.contenidos[idioma.codigo], estado.contenidos[predeterminado.codigo]) +
      contarIguales(estado.textos[idioma.codigo], estado.textos[predeterminado.codigo]);
  }

  const anadir = async (evento) => {
    evento.preventDefault();
    // `guardar` nunca rechaza: devuelve si ha ido bien. Encadenando un .then()
    // el formulario se vaciaba también cuando el alta había sido rechazada, y
    // había que volver a teclearlo todo.
    const correcto = await guardar(
      () => api.anadirIdioma({ ...nuevo, desde: nuevo.desde || predeterminado.codigo }),
      `Idioma ${nuevo.codigo}`,
    );
    if (correcto) setNuevo({ codigo: '', etiqueta: '', nombre: '', pdf: '', desde: '' });
  };

  const quitar = (codigo) => {
    if (!confirm(`¿Quitar el idioma "${codigo}"? Se borran su contenido y sus textos.`)) return;
    guardar(() => api.quitarIdioma(codigo), `Quitar ${codigo}`);
  };

  const clase = 'rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm';

  return (
    <div className="grid gap-4 @3xl:grid-cols-2">
      <section className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <h2 className="font-semibold mb-3">Idiomas del sitio</h2>
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-gray-500 text-left">
            <tr>
              <th className="py-1">Código</th>
              <th>Nombre</th>
              <th>PDF</th>
              <th>Igual al original</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {idiomas.map((idioma) => (
              <tr key={idioma.codigo} className="border-t border-gray-100 dark:border-gray-700">
                <td className="py-1.5 font-mono">
                  {idioma.codigo}
                  {idioma.predeterminado && (
                    <span className="ml-1 text-xs text-gray-500">(predeterminado)</span>
                  )}
                </td>
                <td>{idioma.nombre}</td>
                <td className="font-mono text-xs">{idioma.pdf}</td>
                <td>
                  {pendientes[idioma.codigo] ? (
                    <span className="text-amber-600">{pendientes[idioma.codigo]}</span>
                  ) : (
                    <span className="text-green-700">0</span>
                  )}
                </td>
                <td className="text-right">
                  {!idioma.predeterminado && (
                    <button className="text-xs text-red-600 hover:underline" onClick={() => quitar(idioma.codigo)}>
                      quitar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <h2 className="font-semibold mb-3">Añadir idioma</h2>
        <form className="space-y-3" onSubmit={anadir}>
          <div className="grid gap-3 @xl:grid-cols-2">
            <label className="block">
              <span className="text-xs uppercase tracking-wide text-gray-500">Código</span>
              <input
                className={clase + ' w-full'}
                placeholder="fr"
                required
                value={nuevo.codigo}
                onChange={(e) => setNuevo({ ...nuevo, codigo: e.target.value.toLowerCase() })}
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wide text-gray-500">Etiqueta del menú</span>
              <input
                className={clase + ' w-full'}
                placeholder="fr"
                value={nuevo.etiqueta}
                onChange={(e) => setNuevo({ ...nuevo, etiqueta: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wide text-gray-500">Nombre</span>
              <input
                className={clase + ' w-full'}
                placeholder="Français"
                value={nuevo.nombre}
                onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wide text-gray-500">Fichero del CV</span>
              <input
                className={clase + ' w-full'}
                placeholder="CV_FR.pdf"
                value={nuevo.pdf}
                onChange={(e) => setNuevo({ ...nuevo, pdf: e.target.value })}
              />
            </label>
            <label className="block @xl:col-span-2">
              <span className="text-xs uppercase tracking-wide text-gray-500">Sembrar desde</span>
              <select
                className={clase + ' w-full'}
                value={nuevo.desde}
                onChange={(e) => setNuevo({ ...nuevo, desde: e.target.value })}
              >
                <option value="">{predeterminado.codigo} (predeterminado)</option>
                {idiomas.map((idioma) => (
                  <option key={idioma.codigo} value={idioma.codigo}>
                    {idioma.codigo}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <p className="text-xs text-gray-500">
            Se copia el idioma de origen entero, así el sitio sigue siendo publicable desde el
            primer momento. La columna «igual al original» te dice cuánto queda por repasar.
            Después habrá que reiniciar <code>astro dev</code>.
          </p>

          <button className="rounded bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 px-3 py-1 text-sm">
            Añadir idioma
          </button>
        </form>
      </section>
    </div>
  );
}
