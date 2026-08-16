import { useMemo, useState } from 'react';
import {
  aSlug,
  conBloqueNuevo,
  nuevaSeccion,
  opcionesDeTipo,
  problemasDeAlta,
  tipoDelBloque,
} from '../../comun/secciones.js';
import { claseEntrada } from '../componentes/Campos.jsx';

// Las dos listas de secciones, web y CV, son INDEPENDIENTES: cada una con su
// orden, sus secciones y sus opciones. Una sección puede estar en las dos, en
// una sola, o en ninguna (y entonces el panel avisa de que el dato no se ve).
//
// El alta era el punto más roto del administrador:
//
//   - Proponía el primer tipo de la lista con el primer bloque de datos
//     (presentacion + experiencias), una pareja incoherente. validar.js resuelve
//     el tipo de un bloque quedándose con la ÚLTIMA sección que lo menciona, así
//     que la sección nueva hacía que "experiencias" se validara como
//     "presentacion" y salía un muro de CAMPO_REQUERIDO sobre ítems que nadie
//     había tocado. La lista entera dejaba de poder guardarse.
//   - No sabía crear bloques, y una sección que apunta a un bloque inexistente
//     es un error duro (BLOQUE_INEXISTENTE). Sin bloque nuevo no hay sección
//     nueva de verdad: solo se podía reaprovechar un bloque ya existente.

/** Bloques que no son datos de comun.json pero sí destinos válidos. */
const BLOQUES_VIRTUALES = ['perfil', 'sobremi'];

export function Secciones({ estado, borrador, guardarPendientes }) {
  const [lista, setLista] = useState('web');
  const [seleccion, setSeleccion] = useState(0);
  const [alta, setAlta] = useState(null);

  const idiomas = estado.locales.map((idioma) => idioma.codigo);
  const predeterminado = (estado.locales.find((i) => i.predeterminado) ?? estado.locales[0]).codigo;
  const clave = lista === 'web' ? 'seccionesWeb' : 'seccionesCv';

  const comun = borrador.leer('comun') ?? estado.comun;
  const contenidos = borrador.leer('contenidos') ?? estado.contenidos;

  // Una lista que aún no existe en disco se arranca vacía en vez de reventar:
  // leerEstado devuelve null si falta secciones.cv.json, y structuredClone(null)
  // tiraba la pantalla entera al intentar añadir la primera sección.
  const configuracion = borrador.leer(clave) ?? estado[clave] ?? { version: 1, secciones: [] };
  const secciones = configuracion.secciones ?? [];
  const seccion = secciones[seleccion];
  const tipo = seccion ? estado.tipos[seccion.tipo] : null;

  const bloquesDisponibles = useMemo(() => {
    const claves = new Set([...Object.keys(comun.bloques ?? {}), ...BLOQUES_VIRTUALES]);
    // Los bloques que solo viven traducidos (prosa) también son destinos válidos
    for (const contenido of Object.values(contenidos)) {
      for (const clave of Object.keys(contenido?.bloques ?? {})) claves.add(clave);
    }
    return [...claves].sort();
  }, [comun, contenidos]);

  const tiposCompatibles = useMemo(
    () => Object.entries(estado.tipos).filter(([, t]) => t.alcance.includes(lista)),
    [estado.tipos, lista],
  );

  /** Opciones que tienen sentido en esta lista (el QR es solo de impresión). */
  const opcionesDelTipo = (t) => opcionesDeTipo(t, lista);

  const mutar = (cambiar) => {
    const copia = structuredClone(configuracion);
    copia.secciones ??= [];
    cambiar(copia);
    borrador.poner(clave, copia);
  };

  const mover = (i, salto) => {
    const destino = i + salto;
    if (destino < 0 || destino >= secciones.length) return;
    mutar((c) => {
      [c.secciones[i], c.secciones[destino]] = [c.secciones[destino], c.secciones[i]];
    });
    setSeleccion(destino);
  };

  const confirmarAlta = (datos) => {
    const { id, tipoNombre, bloque, bloqueNuevo } = datos;
    const claveBloque = bloqueNuevo ? bloqueNuevo : bloque;

    // Bloque nuevo: hay que crearlo en comun.json Y en todos los idiomas, o la
    // sección apuntaría al vacío y el guardado entero se rechazaría
    // (BLOQUE_INEXISTENTE). La forma del hueco depende del tipo elegido.
    if (bloqueNuevo) {
      const nuevos = conBloqueNuevo({
        comun,
        contenidos,
        clave: bloqueNuevo,
        tipo: estado.tipos[tipoNombre],
      });
      borrador.poner('comun', nuevos.comun);
      borrador.poner('contenidos', nuevos.contenidos);
    }

    mutar((c) => {
      c.secciones.push(
        nuevaSeccion({
          lista,
          id,
          tipoNombre,
          bloque: claveBloque,
          tipo: estado.tipos[tipoNombre],
          idiomas,
          modelo: secciones[secciones.length - 1],
        }),
      );
    });
    setSeleccion(secciones.length);
    setAlta(null);
  };

  const borrar = () => {
    if (!seccion || !confirm(`¿Quitar "${seccion.id}" de la lista de ${lista}?`)) return;
    mutar((c) => {
      c.secciones = c.secciones.filter((s) => s.id !== seccion.id);
    });
    setSeleccion(0);
  };

  const hayCambios = borrador.leer(clave) !== undefined;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {['web', 'cv'].map((nombre) => (
          <button
            key={nombre}
            onClick={() => {
              // Ya NO se descarta el borrador al cambiar de pestaña: vive en la
              // aplicación y sobrevive al cambio
              setLista(nombre);
              setSeleccion(0);
              setAlta(null);
            }}
            className={`px-3 py-1 rounded text-sm ${
              lista === nombre
                ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                : 'border border-gray-300 dark:border-gray-600'
            }`}
          >
            {nombre === 'web' ? 'Página web' : 'CV / PDF'}
            {borrador.leer(nombre === 'web' ? 'seccionesWeb' : 'seccionesCv') !== undefined && ' •'}
          </button>
        ))}
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
          idiomas={idiomas}
          predeterminado={predeterminado}
          tiposCompatibles={tiposCompatibles}
          bloquesDisponibles={bloquesDisponibles}
          idsUsados={secciones.map((s) => s.id)}
          seccionesTodas={[estado.seccionesWeb, estado.seccionesCv]}
          onCancelar={() => setAlta(null)}
          onConfirmar={confirmarAlta}
        />
      )}

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
                  {s.textos?.[predeterminado]?.titulo || s.id}
                  <span className="ml-1 text-xs opacity-60">{s.tipo}</span>
                </button>
                <button className="px-1 text-xs" onClick={() => mover(i, -1)} title="subir">↑</button>
                <button className="px-1 text-xs mr-1" onClick={() => mover(i, 1)} title="bajar">↓</button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2 p-2 border-t border-gray-200 dark:border-gray-700">
            <button className="text-xs text-blue-600 hover:underline" onClick={() => setAlta(true)}>
              + añadir sección
            </button>
            <button className="text-xs text-red-600 hover:underline" onClick={borrar}>quitar</button>
          </div>
        </aside>

        <section className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-4">
          {!seccion && <p className="text-sm text-gray-500">Esta lista no tiene secciones.</p>}

          {seccion && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs uppercase tracking-wide text-gray-500">Identificador</span>
                  <input
                    className={claseEntrada}
                    value={seccion.id}
                    onChange={(e) =>
                      mutar((c) => {
                        c.secciones[seleccion].id = aSlug(e.target.value);
                      })
                    }
                  />
                  <span className="text-xs text-gray-500">
                    Slug ASCII. En la web también se usa como ancla de la URL.
                  </span>
                </label>

                <label className="block">
                  <span className="text-xs uppercase tracking-wide text-gray-500">Tipo</span>
                  <select
                    className={claseEntrada}
                    value={seccion.tipo}
                    onChange={(e) => mutar((c) => { c.secciones[seleccion].tipo = e.target.value; })}
                  >
                    {tiposCompatibles.map(([nombre, t]) => (
                      <option key={nombre} value={nombre}>
                        {nombre} — {t.etiqueta?.[predeterminado] ?? nombre}
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
                    className={claseEntrada}
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
                      <select
                        className={claseEntrada}
                        value={seccion.icono ?? ''}
                        onChange={(e) => mutar((c) => { c.secciones[seleccion].icono = e.target.value || null; })}
                      >
                        <option value="">(sin icono)</option>
                        {(estado.iconos ?? []).map((nombre) => (
                          <option key={nombre} value={nombre}>{nombre}</option>
                        ))}
                      </select>
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

              <details className="rounded border border-gray-200 dark:border-gray-700 p-2">
                <summary className="text-xs uppercase tracking-wide text-gray-500 cursor-pointer">
                  Clases CSS
                </summary>
                <div className="grid gap-2 sm:grid-cols-3 mt-2">
                  {(lista === 'web' ? ['seccion', 'titulo', 'icono'] : ['titulo']).map((campo) => (
                    <label key={campo} className="block">
                      <span className="text-xs text-gray-500">{campo}</span>
                      <input
                        className={claseEntrada + ' font-mono text-xs'}
                        value={seccion.clases?.[campo] ?? ''}
                        onChange={(e) =>
                          mutar((c) => {
                            (c.secciones[seleccion].clases ??= {})[campo] = e.target.value;
                          })
                        }
                      />
                    </label>
                  ))}
                </div>
              </details>

              {opcionesDelTipo(tipo).length > 0 && (
                <div>
                  <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                    Opciones del tipo {seccion.tipo}
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {opcionesDelTipo(tipo).map((opcion) => (
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
                      {/* El `?? {}` protege el idioma, pero antes no protegía
                          `textos`: una sección sin ese objeto dejaba la pantalla
                          en blanco con un TypeError */}
                      {(lista === 'web' ? ['titulo', 'nav', 'ancla'] : ['titulo']).map((campo) => (
                        <label key={campo} className="block">
                          <span className="text-xs text-gray-500">{campo}</span>
                          <input
                            className={claseEntrada}
                            value={seccion.textos?.[codigo]?.[campo] ?? ''}
                            onChange={(e) =>
                              mutar((c) => {
                                const textos = (c.secciones[seleccion].textos ??= {});
                                (textos[codigo] ??= {})[campo] = e.target.value;
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

// ---- alta de sección --------------------------------------------------------

/**
 * Formulario de alta. Elige tipo y bloque a la vez y comprueba que casen ANTES
 * de tocar nada, que era justo lo que faltaba.
 */
function FormularioAlta({
  lista, idiomas, predeterminado, tiposCompatibles, bloquesDisponibles,
  idsUsados, seccionesTodas, onCancelar, onConfirmar,
}) {
  const primerTipo = tiposCompatibles[0]?.[0] ?? '';
  const [tipoNombre, setTipoNombre] = useState(primerTipo);
  const [modo, setModo] = useState('nuevo');
  const [bloque, setBloque] = useState(bloquesDisponibles[0] ?? '');
  const [nombreBloque, setNombreBloque] = useState('');
  const [id, setId] = useState('');

  if (!tiposCompatibles.length) {
    return (
      <div className="rounded border border-amber-300 bg-amber-50 dark:bg-amber-900/20 p-3 text-sm">
        No hay ningún tipo disponible para la lista de {lista}.
        <button className="ml-2 underline" onClick={onCancelar}>cerrar</button>
      </div>
    );
  }

  // Qué tipo tiene ya cada bloque: reutilizar uno con un tipo distinto es lo
  // que provocaba el error en cascada
  const tipoActualDe = (nombreBloqueBuscado) => tipoDelBloque(seccionesTodas, nombreBloqueBuscado);

  const claveBloque = modo === 'nuevo' ? aSlug(nombreBloque) : bloque;
  const idFinal = aSlug(id || nombreBloque || tipoNombre);

  const problemas = problemasDeAlta({
    id: idFinal,
    modo,
    claveBloque,
    idsUsados,
    bloquesExistentes: bloquesDisponibles,
    tipoNombre,
    tipoDelBloque: tipoActualDe(bloque),
  });

  return (
    <div className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-3 space-y-3">
      <h3 className="font-semibold text-sm">Nueva sección en {lista === 'web' ? 'la página web' : 'el CV'}</h3>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-gray-500">Tipo</span>
          <select className={claseEntrada} value={tipoNombre} onChange={(e) => setTipoNombre(e.target.value)}>
            {tiposCompatibles.map(([nombre, t]) => (
              <option key={nombre} value={nombre}>
                {nombre} — {t.etiqueta?.[predeterminado] ?? nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-wide text-gray-500">Datos</span>
          <select className={claseEntrada} value={modo} onChange={(e) => setModo(e.target.value)}>
            <option value="nuevo">crear un bloque nuevo</option>
            <option value="existente">reutilizar un bloque</option>
          </select>
        </label>

        {modo === 'nuevo' ? (
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-gray-500">Nombre del bloque</span>
            <input
              className={claseEntrada}
              value={nombreBloque}
              placeholder="p. ej. voluntariado"
              onChange={(e) => setNombreBloque(e.target.value)}
            />
          </label>
        ) : (
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-gray-500">Bloque</span>
            <select className={claseEntrada} value={bloque} onChange={(e) => setBloque(e.target.value)}>
              {bloquesDisponibles.map((b) => (
                <option key={b} value={b}>
                  {b}
                  {tipoActualDe(b) ? ` (${tipoActualDe(b)})` : ''}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <label className="block max-w-sm">
        <span className="text-xs uppercase tracking-wide text-gray-500">Identificador de la sección</span>
        <input
          className={claseEntrada}
          value={id}
          placeholder={aSlug(nombreBloque || tipoNombre)}
          onChange={(e) => setId(e.target.value)}
        />
        <span className="text-xs text-gray-500">
          Se guardará como <code>{idFinal || '—'}</code>
          {lista === 'web' && ' y será el ancla de la URL'}.
        </span>
      </label>

      {problemas.length > 0 && (
        <ul className="text-xs text-red-600 list-disc pl-5">
          {problemas.map((problema) => (
            <li key={problema}>{problema}</li>
          ))}
        </ul>
      )}

      {modo === 'nuevo' && claveBloque && problemas.length === 0 && (
        <p className="text-xs text-gray-500">
          Se creará el bloque <code>{claveBloque}</code> vacío en <code>comun.json</code> y en{' '}
          {idiomas.map((c) => `contenido.${c}.json`).join(', ')}. Después podrás rellenarlo desde Contenido.
        </p>
      )}

      <div className="flex gap-2">
        <button
          className="rounded bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 px-3 py-1 text-sm disabled:opacity-40"
          disabled={problemas.length > 0}
          onClick={() =>
            onConfirmar({
              id: idFinal,
              tipoNombre,
              bloque: claveBloque,
              bloqueNuevo: modo === 'nuevo' ? claveBloque : null,
            })
          }
        >
          Crear
        </button>
        <button className="text-sm text-gray-500 hover:underline" onClick={onCancelar}>
          cancelar
        </button>
      </div>
    </div>
  );
}
