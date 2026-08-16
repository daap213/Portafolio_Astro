import { useMemo, useState } from 'react';
import { claseEntrada } from '../componentes/Campos.jsx';

// Textos de interfaz: data/ui.<idioma>.json.
//
// No tenían pantalla. `api.guardarUi` y `PUT /api/ui` existían desde el primer
// día pero no los llamaba nadie, así que los avisos UI_SIN_TRADUCIR que enseña
// el Panel no se podían resolver desde la aplicación: había que abrir el JSON.
//
// Las claves las manda el idioma predeterminado: validar.js da error
// (UI_SOBRANTE) si un idioma tiene una clave que el predeterminado no tiene.

export function Textos({ estado, borrador, guardarPendientes }) {
  const idiomas = estado.locales.map((idioma) => idioma.codigo);
  const predeterminado = (estado.locales.find((i) => i.predeterminado) ?? estado.locales[0]).codigo;

  const textos = borrador.leer('textos') ?? estado.textos;
  const hayCambios = borrador.leer('textos') !== undefined;

  const [filtro, setFiltro] = useState('');
  const [soloPendientes, setSoloPendientes] = useState(false);

  const claves = useMemo(() => Object.keys(textos[predeterminado] ?? {}).sort(), [textos, predeterminado]);

  const vacio = (valor) => valor === undefined || String(valor).trim() === '';
  const pendiente = (clave) => idiomas.some((codigo) => vacio(textos[codigo]?.[clave]));

  const visibles = claves.filter(
    (clave) =>
      clave.toLowerCase().includes(filtro.toLowerCase().trim()) && (!soloPendientes || pendiente(clave)),
  );

  const cambiar = (codigo, clave, valor) => {
    const copia = structuredClone(textos);
    (copia[codigo] ??= {})[clave] = valor;
    borrador.poner('textos', copia);
  };

  const nPendientes = claves.filter(pendiente).length;

  return (
    <div className="space-y-3">
      <header className="flex items-center gap-3 flex-wrap">
        <div>
          <h2 className="font-semibold">Textos de interfaz</h2>
          <p className="text-xs text-gray-500 font-mono">
            data/ui.&lt;idioma&gt;.json · {claves.length} claves
            {nPendientes > 0 && ` · ${nPendientes} sin traducir`}
          </p>
        </div>
        <input
          className={claseEntrada + ' max-w-xs'}
          placeholder="filtrar por clave…"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
        <label className="flex items-center gap-1 text-sm">
          <input
            type="checkbox"
            checked={soloPendientes}
            onChange={(e) => setSoloPendientes(e.target.checked)}
          />
          solo sin traducir
        </label>
        <div className="ml-auto flex items-center gap-2">
          {hayCambios && (
            <button className="text-sm text-gray-500 hover:underline" onClick={() => borrador.limpiar('textos')}>
              descartar
            </button>
          )}
          <button
            className="rounded bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 px-3 py-1 text-sm disabled:opacity-40"
            disabled={!hayCambios}
            onClick={guardarPendientes}
          >
            Guardar
          </button>
        </div>
      </header>

      <div className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 text-left">
            <tr>
              <th className="px-2 py-1 font-medium w-64">clave</th>
              {idiomas.map((codigo) => (
                <th key={codigo} className="px-2 py-1 font-mono text-xs font-medium">
                  {codigo}
                  {codigo === predeterminado && <span className="ml-1 text-gray-400">(base)</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibles.map((clave) => (
              <tr key={clave} className="border-t border-gray-100 dark:border-gray-700 align-top">
                <td className="px-2 py-1 font-mono text-xs text-gray-600 dark:text-gray-400 break-all">{clave}</td>
                {idiomas.map((codigo) => {
                  const valor = textos[codigo]?.[clave] ?? '';
                  const falta = vacio(valor) && codigo !== predeterminado;
                  return (
                    <td key={codigo} className="px-2 py-1">
                      <input
                        className={claseEntrada + (falta ? ' ring-1 ring-amber-400' : '')}
                        value={valor}
                        placeholder={falta ? 'sin traducir' : ''}
                        onChange={(e) => cambiar(codigo, clave, e.target.value)}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {visibles.length === 0 && <p className="p-3 text-sm text-gray-500">Ninguna clave coincide.</p>}
      </div>
    </div>
  );
}
