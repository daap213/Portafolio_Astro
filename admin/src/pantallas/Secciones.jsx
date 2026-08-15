import { useState } from 'react';
import { api } from '../api.js';

// Las dos listas de secciones, web y CV, son INDEPENDIENTES: cada una con su
// orden, sus secciones y sus opciones. Una sección puede estar en las dos, en
// una sola, o en ninguna (y entonces el panel avisa de que el dato no se ve).

const claseCampo =
  'w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm';

export function Secciones({ estado, guardar }) {
  const [lista, setLista] = useState('web');
  const [seleccion, setSeleccion] = useState(0);
  const [borrador, setBorrador] = useState(null);

  const idiomas = estado.locales.map((idioma) => idioma.codigo);
  const clave = lista === 'web' ? 'seccionesWeb' : 'seccionesCv';
  const configuracion = borrador ?? estado[clave];
  const secciones = configuracion?.secciones ?? [];
  const seccion = secciones[seleccion];
  const tipo = seccion ? estado.tipos[seccion.tipo] : null;

  const bloquesDisponibles = [
    ...Object.keys(estado.comun.bloques ?? {}),
    'sobremi',
    'perfil',
  ];

  const tiposCompatibles = Object.entries(estado.tipos).filter(([, t]) => t.alcance.includes(lista));

  const mutar = (cambiar) => {
    const copia = structuredClone(configuracion);
    cambiar(copia);
    setBorrador(copia);
  };

  const mover = (i, salto) => {
    const destino = i + salto;
    if (destino < 0 || destino >= secciones.length) return;
    mutar((c) => {
      [c.secciones[i], c.secciones[destino]] = [c.secciones[destino], c.secciones[i]];
    });
    setSeleccion(destino);
  };

  const anadir = () => {
    const [nombreTipo] = tiposCompatibles[0];
    const id = prompt('Identificador de la sección nueva (sirve de ancla):', 'seccion-nueva');
    if (!id) return;
    if (secciones.some((s) => s.id === id)) return alert('Ya hay una sección con ese id en esta lista.');

    mutar((c) => {
      c.secciones.push({
        id,
        tipo: nombreTipo,
        bloque: bloquesDisponibles[0],
        icono: null,
        enNav: lista === 'web',
        opciones: {},
        clases: lista === 'web'
          ? { seccion: '', titulo: secciones[1]?.clases?.titulo ?? '', icono: 'size-8' }
          : { titulo: secciones[1]?.clases?.titulo ?? '' },
        textos: Object.fromEntries(
          idiomas.map((codigo) => [codigo, lista === 'web' ? { titulo: id, nav: id, ancla: id } : { titulo: id }]),
        ),
      });
    });
    setSeleccion(secciones.length);
  };

  const borrar = () => {
    if (!seccion || !confirm(`¿Quitar "${seccion.id}" de la lista de ${lista}?`)) return;
    mutar((c) => {
      c.secciones = c.secciones.filter((s) => s.id !== seccion.id);
    });
    setSeleccion(0);
  };

  const guardarLista = () =>
    guardar(async () => {
      await api.guardarSecciones(lista, borrador);
      setBorrador(null);
    }, `Secciones de ${lista}`);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {['web', 'cv'].map((nombre) => (
          <button
            key={nombre}
            onClick={() => {
              setLista(nombre);
              setSeleccion(0);
              setBorrador(null);
            }}
            className={`px-3 py-1 rounded text-sm ${
              lista === nombre
                ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                : 'border border-gray-300 dark:border-gray-600'
            }`}
          >
            {nombre === 'web' ? 'Página web' : 'CV / PDF'}
          </button>
        ))}
        <button
          className="ml-auto rounded bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 px-3 py-1 text-sm disabled:opacity-40"
          disabled={!borrador}
          onClick={guardarLista}
        >
          Guardar
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
        <aside className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <ul className="text-sm">
            {secciones.map((s, i) => (
              <li key={s.id} className="flex items-center border-b border-gray-100 dark:border-gray-700 last:border-0">
                <button
                  className={`flex-1 text-left px-2 py-1.5 truncate ${
                    i === seleccion ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900' : ''
                  }`}
                  onClick={() => setSeleccion(i)}
                >
                  {s.textos?.[idiomas[0]]?.titulo || s.id}
                  <span className="ml-1 text-xs opacity-60">{s.tipo}</span>
                </button>
                <button className="px-1 text-xs" onClick={() => mover(i, -1)} title="subir">↑</button>
                <button className="px-1 text-xs mr-1" onClick={() => mover(i, 1)} title="bajar">↓</button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2 p-2 border-t border-gray-200 dark:border-gray-700">
            <button className="text-xs text-blue-600 hover:underline" onClick={anadir}>+ añadir sección</button>
            <button className="text-xs text-red-600 hover:underline" onClick={borrar}>quitar</button>
          </div>
        </aside>

        <section className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-4">
          {!seccion && <p className="text-sm text-gray-500">Esta lista no tiene secciones.</p>}

          {seccion && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs uppercase tracking-wide text-gray-500">Tipo</span>
                  <select
                    className={claseCampo}
                    value={seccion.tipo}
                    onChange={(e) => mutar((c) => { c.secciones[seleccion].tipo = e.target.value; })}
                  >
                    {tiposCompatibles.map(([nombre, t]) => (
                      <option key={nombre} value={nombre}>
                        {nombre} — {t.etiqueta[idiomas[0]] ?? nombre}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-gray-500">
                    Solo se listan los tipos que admite la lista de {lista}.
                  </span>
                </label>

                <label className="block">
                  <span className="text-xs uppercase tracking-wide text-gray-500">Bloque de datos</span>
                  <select
                    className={claseCampo}
                    value={seccion.bloque}
                    onChange={(e) => mutar((c) => { c.secciones[seleccion].bloque = e.target.value; })}
                  >
                    {bloquesDisponibles.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </label>

                {lista === 'web' && (
                  <>
                    <label className="block">
                      <span className="text-xs uppercase tracking-wide text-gray-500">Icono</span>
                      <input
                        className={claseCampo}
                        value={seccion.icono ?? ''}
                        placeholder="ProfileCheck, Code, Skill…"
                        onChange={(e) => mutar((c) => { c.secciones[seleccion].icono = e.target.value || null; })}
                      />
                    </label>
                    <label className="flex items-center gap-2 mt-5">
                      <input
                        type="checkbox"
                        checked={Boolean(seccion.enNav)}
                        onChange={(e) => mutar((c) => { c.secciones[seleccion].enNav = e.target.checked; })}
                      />
                      <span className="text-sm">Aparece en el menú</span>
                    </label>
                  </>
                )}
              </div>

              {tipo?.opciones?.length > 0 && (
                <div>
                  <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                    Opciones del tipo {seccion.tipo}
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {tipo.opciones.map((opcion) => (
                      <label key={opcion.clave} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={seccion.opciones?.[opcion.clave] ?? opcion.defecto}
                          onChange={(e) =>
                            mutar((c) => {
                              c.secciones[seleccion].opciones ??= {};
                              c.secciones[seleccion].opciones[opcion.clave] = e.target.checked;
                            })
                          }
                        />
                        {opcion.clave}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-1">Textos por idioma</h3>
                <div
                  className="grid gap-3"
                  style={{ gridTemplateColumns: `repeat(${idiomas.length}, minmax(0, 1fr))` }}
                >
                  {idiomas.map((codigo) => (
                    <div key={codigo} className="space-y-1">
                      <span className="text-xs font-mono text-gray-500">{codigo}</span>
                      {Object.keys(seccion.textos[idiomas[0]] ?? {}).map((campo) => (
                        <label key={campo} className="block">
                          <span className="text-xs text-gray-500">{campo}</span>
                          <input
                            className={claseCampo}
                            value={seccion.textos?.[codigo]?.[campo] ?? ''}
                            onChange={(e) =>
                              mutar((c) => {
                                c.secciones[seleccion].textos[codigo] ??= {};
                                c.secciones[seleccion].textos[codigo][campo] = e.target.value;
                              })
                            }
                          />
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
