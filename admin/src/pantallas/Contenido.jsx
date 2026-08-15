import { useMemo, useState } from 'react';
import { api } from '../api.js';
import { FormularioGenerado } from '../componentes/FormularioGenerado.jsx';

// Edición del contenido: se elige un bloque, se ordenan sus ítems y se rellena
// el formulario que genera el tipo. Los campos comunes se editan una vez y los
// traducibles en columnas, un idioma al lado del otro.

/** Slug ASCII: de él salen los nombres de los QR, así que nada de tildes. */
const aSlug = (texto) =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);

export function Contenido({ estado, medios, guardar }) {
  const idiomas = estado.locales.map((idioma) => idioma.codigo);

  // Qué tipo usa cada bloque, mirando las dos listas de secciones
  const tipoPorBloque = useMemo(() => {
    const mapa = new Map();
    for (const configuracion of [estado.seccionesWeb, estado.seccionesCv]) {
      for (const seccion of configuracion?.secciones ?? []) {
        if (!mapa.has(seccion.bloque)) mapa.set(seccion.bloque, seccion.tipo);
      }
    }
    return mapa;
  }, [estado]);

  const bloques = Object.keys(estado.comun.bloques ?? {}).filter(
    (clave) => estado.comun.bloques[clave].items,
  );
  const [bloque, setBloque] = useState(bloques[0]);
  const [seleccion, setSeleccion] = useState(0);

  const [borradorComun, setBorradorComun] = useState(null);
  const [borradorContenidos, setBorradorContenidos] = useState(null);

  const comun = borradorComun ?? estado.comun;
  const contenidos = borradorContenidos ?? estado.contenidos;

  const items = comun.bloques[bloque]?.items ?? [];
  const item = items[seleccion];
  const nombreTipo = tipoPorBloque.get(bloque);
  const tipo = estado.tipos[nombreTipo];
  const campos = tipo ? (tipo.forma === 'objeto-lista' ? tipo.camposItem : tipo.campos) : null;

  const etiquetaDe = (item, i) => {
    const texto = contenidos[idiomas[0]]?.bloques?.[bloque]?.items?.[item.id];
    return texto?.title ?? texto?.name ?? texto?.nombre ?? item.id ?? `ítem ${i + 1}`;
  };

  const cambiar = ({ ambito, clave, valor }) => {
    if (ambito === 'comun') {
      const copia = structuredClone(comun);
      copia.bloques[bloque].items[seleccion][clave] = valor;
      setBorradorComun(copia);
      return;
    }
    const copia = structuredClone(contenidos);
    const destino = (copia[ambito].bloques[bloque].items[item.id] ??= {});
    destino[clave] = valor;
    setBorradorContenidos(copia);
  };

  const mover = (i, salto) => {
    const destino = i + salto;
    if (destino < 0 || destino >= items.length) return;
    const copia = structuredClone(comun);
    const lista = copia.bloques[bloque].items;
    [lista[i], lista[destino]] = [lista[destino], lista[i]];
    setBorradorComun(copia);
    setSeleccion(destino);
  };

  const anadirItem = () => {
    const titulo = prompt('Título del nuevo elemento (sirve para generar su identificador):');
    if (!titulo) return;
    const id = aSlug(titulo);
    if (!id) return alert('Ese título no da un identificador válido.');
    if (items.some((i) => i.id === id)) return alert(`Ya existe un elemento con el id "${id}".`);

    const copiaComun = structuredClone(comun);
    copiaComun.bloques[bloque].items.push({ id });
    setBorradorComun(copiaComun);

    // El ítem se crea en TODOS los idiomas a la vez: si faltara en uno, la
    // validación lo rechazaría al guardar
    const copiaContenidos = structuredClone(contenidos);
    for (const codigo of idiomas) {
      copiaContenidos[codigo].bloques[bloque].items[id] = codigo === idiomas[0] ? { title: titulo } : {};
    }
    setBorradorContenidos(copiaContenidos);
    setSeleccion(items.length);
  };

  const borrarItem = () => {
    if (!item || !confirm(`¿Borrar "${etiquetaDe(item, seleccion)}" de todos los idiomas?`)) return;
    const copiaComun = structuredClone(comun);
    copiaComun.bloques[bloque].items = copiaComun.bloques[bloque].items.filter((i) => i.id !== item.id);
    setBorradorComun(copiaComun);

    const copiaContenidos = structuredClone(contenidos);
    for (const codigo of idiomas) delete copiaContenidos[codigo].bloques[bloque].items[item.id];
    setBorradorContenidos(copiaContenidos);
    setSeleccion(0);
  };

  const hayCambios = borradorComun !== null || borradorContenidos !== null;

  const guardarTodo = () =>
    guardar(async () => {
      if (borradorComun) await api.guardarComun(borradorComun);
      if (borradorContenidos) await api.guardarContenido(borradorContenidos);
      setBorradorComun(null);
      setBorradorContenidos(null);
    }, 'Contenido');

  return (
    <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
      <aside className="space-y-3">
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-gray-500">Bloque</span>
          <select
            className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm"
            value={bloque}
            onChange={(e) => {
              setBloque(e.target.value);
              setSeleccion(0);
            }}
          >
            {bloques.map((clave) => (
              <option key={clave} value={clave}>
                {clave} {tipoPorBloque.get(clave) ? `(${tipoPorBloque.get(clave)})` : '— sin sección'}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <ul className="max-h-[28rem] overflow-auto text-sm">
            {items.map((elemento, i) => (
              <li key={elemento.id} className="flex items-center border-b border-gray-100 dark:border-gray-700 last:border-0">
                <button
                  className={`flex-1 text-left px-2 py-1.5 truncate ${
                    i === seleccion ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900' : ''
                  }`}
                  onClick={() => setSeleccion(i)}
                  title={elemento.id}
                >
                  {etiquetaDe(elemento, i)}
                </button>
                <button className="px-1 text-xs" title="subir" onClick={() => mover(i, -1)}>↑</button>
                <button className="px-1 text-xs mr-1" title="bajar" onClick={() => mover(i, 1)}>↓</button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2 p-2 border-t border-gray-200 dark:border-gray-700">
            <button className="text-xs text-blue-600 hover:underline" onClick={anadirItem}>
              + añadir
            </button>
            <button className="text-xs text-red-600 hover:underline" onClick={borrarItem}>
              borrar
            </button>
          </div>
        </div>
      </aside>

      <section className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        {!tipo && (
          <p className="text-sm text-amber-600">
            El bloque <code>{bloque}</code> no lo muestra ninguna sección, así que no hay un tipo del
            que generar el formulario. Añádelo a una lista en la pestaña Secciones.
          </p>
        )}

        {tipo && !item && <p className="text-sm text-gray-500">Este bloque no tiene elementos.</p>}

        {tipo && item && (
          <>
            <header className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold">{etiquetaDe(item, seleccion)}</h2>
                <p className="text-xs text-gray-500 font-mono">
                  {bloque}.{item.id} · tipo {nombreTipo}
                </p>
              </div>
              <button
                className="rounded bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 px-3 py-1 text-sm disabled:opacity-40"
                disabled={!hayCambios}
                onClick={guardarTodo}
              >
                Guardar
              </button>
            </header>

            <FormularioGenerado
              campos={campos}
              idiomas={idiomas}
              medios={medios}
              valorComun={item}
              valoresPorIdioma={Object.fromEntries(
                idiomas.map((codigo) => [codigo, contenidos[codigo]?.bloques?.[bloque]?.items?.[item.id] ?? {}]),
              )}
              alCambiar={cambiar}
            />
          </>
        )}
      </section>
    </div>
  );
}
