import { useState } from 'react';
import {
  aSlug,
  conActivo,
  conDisenoNuevo,
  conToken,
  conVariante,
  leerToken,
  problemasDeAltaDiseno,
  problemasDeBorrado,
  sinDiseno,
} from '../../comun/disenos.js';
import { claseEntrada } from '../componentes/Campos.jsx';

// Catálogo de diseños de la WEB. El CV no tiene: se imprime desde páginas que no
// pasan por Layout.astro ni por Tailwind.
//
// Un diseño son tres cosas: los tokens (colores, tipografía, radio…), qué
// variante pinta cada tipo de sección, y los presets de clases. Todo se edita
// aquí y se guarda en el mismo viaje que el resto del estado, así que la vista
// en vivo lo enseña sola.
//
// El formulario se genera a partir del catálogo que manda la API (`tokens` y
// `variantes`), no de una lista escrita aquí: es la misma razón por la que la
// pantalla de contenido se genera a partir de `tipos`. Una copia local se
// separaría del catálogo en cuanto se añadiera un token.

/** Cuadrito con el color resuelto. Vale para cualquier valor CSS, no solo hex. */
function Muestra({ valor }) {
  return (
    <span
      className="inline-block size-6 shrink-0 rounded border border-gray-300 dark:border-gray-600"
      style={{ background: valor || 'transparent' }}
      title={valor}
    />
  );
}

export function Disenos({ estado, borrador, guardarPendientes }) {
  const [seleccion, setSeleccion] = useState(0);
  const [alta, setAlta] = useState(null);

  const configuracion = borrador.leer('disenos') ?? estado.disenos ?? { version: 1, activo: '', disenos: [] };
  const lista = configuracion.disenos ?? [];
  const diseno = lista[seleccion];

  const catalogoTokens = estado.tokens ?? [];
  const catalogoVariantes = estado.variantes ?? {};

  const mutar = (siguiente) => borrador.poner('disenos', siguiente);

  /** Cambia algo del diseño seleccionado sin tocar la configuración recibida. */
  const cambiar = (aplicar) => {
    const copia = structuredClone(configuracion);
    aplicar(copia.disenos[seleccion]);
    mutar(copia);
  };

  const borrar = () => {
    const problemas = problemasDeBorrado({ id: diseno.id, configuracion });
    if (problemas.length) {
      alert(`No se puede borrar "${diseno.id}":\n\n· ${problemas.join('\n· ')}`);
      return;
    }
    if (!confirm(`¿Borrar el diseño "${diseno.nombre || diseno.id}"?`)) return;
    mutar(sinDiseno(configuracion, diseno.id));
    setSeleccion(0);
  };

  const hayCambios = borrador.leer('disenos') !== undefined;

  // Solo los tipos que de verdad tienen más de una variante: ofrecer un
  // desplegable con una sola opción es ruido.
  const tiposConVariantes = Object.entries(catalogoVariantes).filter(([, v]) => v.length > 1);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="font-semibold">Diseños de la web</h2>
        <span className="text-xs text-gray-500">
          El activo es el que se compila. El CV no usa diseños.
        </span>
        <button
          className="ml-auto rounded bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 px-3 py-1 text-sm disabled:opacity-40"
          disabled={!hayCambios}
          onClick={guardarPendientes}
        >
          Guardar
        </button>
      </div>

      {alta && (
        <FormularioAlta
          lista={lista}
          onCancelar={() => setAlta(null)}
          onConfirmar={({ id, nombre, desdeId }) => {
            const desde = lista.find((d) => d.id === desdeId) ?? lista[0];
            mutar(conDisenoNuevo(configuracion, { desde, id, nombre }));
            setSeleccion(lista.length);
            setAlta(null);
          }}
        />
      )}

      <div className="grid gap-4 @2xl:grid-cols-[minmax(12rem,16rem)_1fr]">
        <aside className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <ul className="text-sm">
            {lista.map((d, i) => (
              <li
                key={d.id}
                className="flex items-center border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <button
                  className={`flex-1 text-left px-2 py-1.5 truncate ${
                    i === seleccion ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900' : ''
                  }`}
                  onClick={() => setSeleccion(i)}
                >
                  {d.nombre || d.id}
                  {configuracion.activo === d.id && (
                    <span className="ml-1 text-xs opacity-60">· activo</span>
                  )}
                </button>
                {configuracion.activo !== d.id && (
                  <button
                    className="px-2 text-xs text-blue-600 hover:underline"
                    onClick={() => mutar(conActivo(configuracion, d.id))}
                    title="Compilar el sitio con este diseño"
                  >
                    activar
                  </button>
                )}
              </li>
            ))}
          </ul>
          <div className="flex gap-2 p-2 border-t border-gray-200 dark:border-gray-700">
            <button className="text-xs text-blue-600 hover:underline" onClick={() => setAlta(true)}>
              + duplicar
            </button>
            <button className="text-xs text-red-600 hover:underline" onClick={borrar}>
              borrar
            </button>
          </div>
        </aside>

        <section className="@container min-w-0 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-4">
          {!diseno && <p className="text-sm text-gray-500">No hay ningún diseño.</p>}

          {diseno && (
            <>
              <div className="grid gap-3 @xl:grid-cols-2">
                <label className="block">
                  <span className="text-xs uppercase tracking-wide text-gray-500">Identificador</span>
                  <input className={claseEntrada + ' opacity-60'} value={diseno.id} readOnly />
                  <span className="text-xs text-gray-500">
                    No se puede cambiar: duplica el diseño si quieres otro id.
                  </span>
                </label>
                <label className="block">
                  <span className="text-xs uppercase tracking-wide text-gray-500">Nombre</span>
                  <input
                    className={claseEntrada}
                    value={diseno.nombre ?? ''}
                    onChange={(e) => cambiar((d) => { d.nombre = e.target.value; })}
                  />
                  <span className="text-xs text-gray-500">Solo es el rótulo de este panel.</span>
                </label>
              </div>

              {/* ---- variantes ---- */}
              <div>
                <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                  Componente de cada sección
                </h3>
                <p className="text-xs text-gray-500 mb-2">
                  Lo que no fijes aquí se pinta con «clasico», que toma los colores de este
                  diseño. Solo aparecen los tipos que tienen más de un componente.
                </p>
                <div
                  className="grid gap-3"
                  style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(13rem, 1fr))' }}
                >
                  {tiposConVariantes.map(([tipo, nombres]) => (
                    <label key={tipo} className="block">
                      <span className="text-xs text-gray-500">{tipo}</span>
                      <select
                        className={claseEntrada}
                        value={diseno.variantes?.[tipo] ?? ''}
                        onChange={(e) =>
                          mutar(conVariante(configuracion, diseno.id, tipo, e.target.value))
                        }
                      >
                        <option value="">(el de por defecto)</option>
                        {nombres.map((nombre) => (
                          <option key={nombre} value={nombre}>{nombre}</option>
                        ))}
                      </select>
                    </label>
                  ))}
                  {!tiposConVariantes.length && (
                    <p className="text-sm text-gray-500">
                      Todavía no hay ningún tipo con más de un componente.
                    </p>
                  )}
                </div>
              </div>

              {/* ---- tokens ---- */}
              <div>
                <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-1">Tokens</h3>
                <p className="text-xs text-gray-500 mb-2">
                  Vale cualquier color CSS: <code>#rrggbb</code>, <code>rgb()</code>,{' '}
                  <code>oklch()</code>. Los que tienen dos columnas cambian con el tema.
                </p>
                <div className="space-y-2">
                  {catalogoTokens.map((token) => (
                    <div key={token.clave} className="grid gap-2 @xl:grid-cols-[12rem_1fr]">
                      <div className="text-sm pt-1">
                        {token.etiqueta}
                        <span className="ml-1 text-xs text-gray-400 font-mono">{token.clave}</span>
                      </div>
                      <div
                        className="grid gap-2"
                        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))' }}
                      >
                        {(token.porTema ? ['claro', 'oscuro'] : [null]).map((tema) => (
                          <label key={tema ?? 'unico'} className="flex items-center gap-2">
                            {token.tipo === 'color' && (
                              <Muestra valor={leerToken(diseno, token, tema ?? 'claro')} />
                            )}
                            <span className="text-xs text-gray-500 w-12 shrink-0">
                              {tema ?? ''}
                            </span>
                            <input
                              className={claseEntrada + ' font-mono text-xs'}
                              value={leerToken(diseno, token, tema ?? 'claro')}
                              onChange={(e) =>
                                mutar(
                                  conToken(
                                    configuracion,
                                    diseno.id,
                                    token.clave,
                                    tema ?? 'claro',
                                    e.target.value,
                                  ),
                                )
                              }
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ---- clases ---- */}
              <details className="rounded border border-gray-200 dark:border-gray-700 p-2">
                <summary className="text-xs uppercase tracking-wide text-gray-500 cursor-pointer">
                  Clases CSS por defecto
                </summary>
                <p className="text-xs text-gray-500 mt-2">
                  Las usa toda sección que no traiga las suyas. Si una sección las trae, gana
                  entera: no se suman.
                </p>
                <div className="grid gap-2 @xl:grid-cols-2 mt-2">
                  {['contenedor', 'seccion', 'titulo', 'icono'].map((campo) => (
                    <label key={campo} className="block">
                      <span className="text-xs text-gray-500">{campo}</span>
                      <input
                        className={claseEntrada + ' font-mono text-xs'}
                        value={diseno.clases?.[campo] ?? ''}
                        onChange={(e) =>
                          cambiar((d) => { (d.clases ??= {})[campo] = e.target.value; })
                        }
                      />
                    </label>
                  ))}
                </div>
              </details>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

// ---- alta de diseño ---------------------------------------------------------

/**
 * Duplicar es la única vía de alta: un diseño en blanco no tendría ni un token y
 * la web se pintaría con todas las variables sin resolver.
 */
function FormularioAlta({ lista, onCancelar, onConfirmar }) {
  const [nombre, setNombre] = useState('');
  const [id, setId] = useState('');
  const [desdeId, setDesdeId] = useState(lista[0]?.id ?? '');

  const idFinal = aSlug(id || nombre);
  const problemas = problemasDeAltaDiseno({ id: idFinal, idsUsados: lista.map((d) => d.id) });

  return (
    <div className="rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-3 space-y-2">
      <div className="grid gap-2 @xl:grid-cols-3">
        <label className="block">
          <span className="text-xs text-gray-500">Nombre</span>
          <input className={claseEntrada} value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-xs text-gray-500">Identificador</span>
          <input
            className={claseEntrada}
            value={id}
            placeholder={idFinal}
            onChange={(e) => setId(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-xs text-gray-500">Copiar de</span>
          <select className={claseEntrada} value={desdeId} onChange={(e) => setDesdeId(e.target.value)}>
            {lista.map((d) => (
              <option key={d.id} value={d.id}>{d.nombre || d.id}</option>
            ))}
          </select>
        </label>
      </div>

      {problemas.length > 0 && (
        <ul className="text-xs text-red-600 list-disc pl-4">
          {problemas.map((p) => <li key={p}>{p}</li>)}
        </ul>
      )}

      <div className="flex gap-2">
        <button
          className="rounded bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 px-3 py-1 text-sm disabled:opacity-40"
          disabled={problemas.length > 0}
          onClick={() => onConfirmar({ id: idFinal, nombre, desdeId })}
        >
          Crear
        </button>
        <button className="text-sm underline text-gray-500" onClick={onCancelar}>
          cancelar
        </button>
      </div>
    </div>
  );
}
