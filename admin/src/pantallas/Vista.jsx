import { useState } from 'react';
import { PUERTOS_WEB } from '../constantes.js';

// Vista previa en vivo dentro de un iframe apuntando al `astro dev` del proyecto.
//
// Los JSON están en el grafo de módulos de Vite, así que al guardar salta el
// recambio en caliente y la vista se actualiza sola. El botón de recargar (y la
// `key` del iframe) cubren el caso de que no salte.

export function Vista({ estado }) {
  const idiomas = estado.locales.map((idioma) => idioma.codigo);
  const [idioma, setIdioma] = useState(idiomas[0]);
  const [vista, setVista] = useState('');
  const [version, setVersion] = useState(0);

  const url = `${PUERTOS_WEB}/${idioma}/${vista}`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm"
          value={idioma}
          onChange={(e) => setIdioma(e.target.value)}
        >
          {idiomas.map((codigo) => (
            <option key={codigo} value={codigo}>
              {codigo}
            </option>
          ))}
        </select>

        {[
          { valor: '', titulo: 'Portada' },
          { valor: 'cv', titulo: 'CV' },
        ].map((opcion) => (
          <button
            key={opcion.valor}
            onClick={() => setVista(opcion.valor)}
            className={`px-3 py-1 rounded text-sm ${
              vista === opcion.valor
                ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                : 'border border-gray-300 dark:border-gray-600'
            }`}
          >
            {opcion.titulo}
          </button>
        ))}

        <button
          className="px-3 py-1 rounded text-sm border border-gray-300 dark:border-gray-600"
          onClick={() => setVersion((v) => v + 1)}
        >
          Recargar
        </button>

        <a className="text-sm text-blue-600 hover:underline ml-auto" href={url} target="_blank" rel="noreferrer">
          abrir en una pestaña ↗
        </a>
      </div>

      <iframe
        key={`${url}-${version}`}
        src={url}
        title="Vista previa del portafolio"
        className="w-full h-[75vh] rounded border border-gray-200 dark:border-gray-700 bg-white"
      />

      <p className="text-xs text-gray-500">
        Si la vista sale en blanco, comprueba que <code>astro dev</code> esté escuchando en{' '}
        <code>{PUERTOS_WEB}</code>. Tras dar de alta un idioma hay que reiniciarlo.
      </p>
    </div>
  );
}
