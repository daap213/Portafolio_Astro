import { useMemo, useState } from 'react';
import { aSlug, camposDeBloque, camposDeItem, claveEnJson } from '../../comun/secciones.js';
import { FormularioGenerado } from '../componentes/FormularioGenerado.jsx';

// Edición del contenido. Se elige un ámbito (el perfil o un bloque de datos) y
// se rellena el formulario que genera su tipo: los campos comunes una sola vez,
// los traducibles en columnas, un idioma al lado del otro.
//
// Dos cosas que costaron caro y conviene no volver a romper:
//
//   1. Todo se guarda con UNA sola llamada a PUT /api/estado. Con dos llamadas
//      (comun por un lado, contenidos por otro) dar de alta un ítem era
//      imposible: la primera petición se validaba contra el disco, donde el
//      ítem aún no tenía traducción, y saltaba ITEM_SIN_TRADUCCION; al revés,
//      ITEM_HUERFANO. Se rechazaban entre ellas.
//
//   2. El botón de guardar vive FUERA del bloque que pinta el ítem. Estando
//      dentro, al borrar el último elemento de un bloque desaparecía con él y
//      el borrado ya no se podía confirmar nunca.

const AMBITO_PERFIL = '@perfil';

const LISTAS = ['listaTexto', 'listaHtml', 'etiquetas'];
const valorVacio = (campo) => (LISTAS.includes(campo.tipo) ? [] : '');

export function Contenido({ estado, medios, borrador, guardarPendientes }) {
  const idiomas = estado.locales.map((idioma) => idioma.codigo);
  const predeterminado = (estado.locales.find((i) => i.predeterminado) ?? estado.locales[0]).codigo;

  const comun = borrador.leer('comun') ?? estado.comun;
  const contenidos = borrador.leer('contenidos') ?? estado.contenidos;
  const hayCambios = borrador.leer('comun') !== undefined || borrador.leer('contenidos') !== undefined;

  // Qué tipo usa cada bloque, mirando las dos listas de secciones. Se queda con
  // la ÚLTIMA, igual que validar.js: si discrepan, el formulario enseñaría unos
  // campos y la validación exigiría otros.
  const tipoPorBloque = useMemo(() => {
    const mapa = new Map();
    for (const configuracion of [estado.seccionesWeb, estado.seccionesCv]) {
      for (const seccion of configuracion?.secciones ?? []) mapa.set(seccion.bloque, seccion.tipo);
    }
    return mapa;
  }, [estado]);

  // Los bloques salen de comun.json Y de los contenidos: "sobremi" solo existe
  // traducido, y antes se quedaba sin editor por eso.
  const bloques = useMemo(() => {
    const claves = new Set(Object.keys(comun.bloques ?? {}));
    for (const contenido of Object.values(contenidos)) {
      for (const clave of Object.keys(contenido?.bloques ?? {})) claves.add(clave);
    }
    return [...claves].sort();
  }, [comun, contenidos]);

  const [ambito, setAmbito] = useState(AMBITO_PERFIL);
  const [seleccion, setSeleccion] = useState(0);

  const ponerComun = (valor) => borrador.poner('comun', valor);
  const ponerContenidos = (valor) => borrador.poner('contenidos', valor);

  // El guardado de verdad lo hace la cabecera de la aplicación, en una sola
  // transacción con el resto de borradores pendientes.
  const cabecera = (
    <button
      className="rounded bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 px-3 py-1 text-sm disabled:opacity-40"
      disabled={!hayCambios}
      onClick={guardarPendientes}
    >
      Guardar
    </button>
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
      <aside className="space-y-3">
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-gray-500">Qué editar</span>
          <select
            className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm"
            value={ambito}
            onChange={(e) => {
              setAmbito(e.target.value);
              setSeleccion(0);
            }}
          >
            <option value={AMBITO_PERFIL}>Perfil e identidad</option>
            {bloques.map((clave) => (
              <option key={clave} value={clave}>
                {clave} {tipoPorBloque.get(clave) ? `(${tipoPorBloque.get(clave)})` : '— sin sección'}
              </option>
            ))}
          </select>
        </label>

        {ambito !== AMBITO_PERFIL && (
          <ListaDeItems
            bloque={ambito}
            comun={comun}
            contenidos={contenidos}
            predeterminado={predeterminado}
            idiomas={idiomas}
            tipo={estado.tipos[tipoPorBloque.get(ambito)]}
            seleccion={seleccion}
            setSeleccion={setSeleccion}
            ponerComun={ponerComun}
            ponerContenidos={ponerContenidos}
          />
        )}
      </aside>

      <section className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-4">
        {ambito === AMBITO_PERFIL ? (
          <EditorPerfil
            estado={estado}
            comun={comun}
            contenidos={contenidos}
            idiomas={idiomas}
            predeterminado={predeterminado}
            medios={medios}
            ponerComun={ponerComun}
            ponerContenidos={ponerContenidos}
            cabecera={cabecera}
          />
        ) : (
          <EditorBloque
            estado={estado}
            bloque={ambito}
            comun={comun}
            contenidos={contenidos}
            idiomas={idiomas}
            predeterminado={predeterminado}
            medios={medios}
            nombreTipo={tipoPorBloque.get(ambito)}
            seleccion={seleccion}
            ponerComun={ponerComun}
            ponerContenidos={ponerContenidos}
            cabecera={cabecera}
          />
        )}
      </section>
    </div>
  );
}

// ---- perfil e identidad -----------------------------------------------------

/**
 * comun.identidad + contenidos.<idioma>.meta. No es un bloque de items, así que
 * antes se quedaba fuera del desplegable y no había manera de cambiar el
 * nombre, el correo ni la foto desde aquí.
 */
function EditorPerfil({ estado, comun, contenidos, idiomas, predeterminado, medios, ponerComun, ponerContenidos, cabecera }) {
  // La unión de los tipos que leen del perfil, sin los campos que en realidad
  // viven en otro bloque (los párrafos del "sobre mí")
  const campos = [];
  const vistos = new Set();
  for (const tipo of Object.values(estado.tipos)) {
    if (tipo.origen !== 'perfil') continue;
    for (const campo of tipo.campos ?? []) {
      if (campo.deBloque || vistos.has(campo.clave)) continue;
      vistos.add(campo.clave);
      campos.push(campo);
    }
  }

  // Unos pocos campos del perfil se GUARDAN con otro nombre del que recibe la
  // plantilla (git_user -> gitUser). El de guardar lo declara `enJson` en
  // tipos.js, que es de donde tira `claveEnJson`: tenerlo apuntado aparte aquí
  // hacía que el formulario escribiera en claves que no lee nadie.
  const porClave = new Map(campos.map((campo) => [campo.clave, campo]));
  const enJson = (clave) => claveEnJson(porClave.get(clave) ?? { clave });

  const valorComun = Object.fromEntries(
    campos.filter((c) => c.traducible === false).map((c) => [c.clave, comun.identidad?.[claveEnJson(c)]]),
  );
  const valoresPorIdioma = Object.fromEntries(
    idiomas.map((codigo) => [
      codigo,
      Object.fromEntries(
        campos.filter((c) => c.traducible !== false).map((c) => [c.clave, contenidos[codigo]?.meta?.[claveEnJson(c)]]),
      ),
    ]),
  );

  const cambiar = ({ ambito, clave, valor }) => {
    if (ambito === 'comun') {
      const copia = structuredClone(comun);
      (copia.identidad ??= {})[enJson(clave)] = valor;
      ponerComun(copia);
      return;
    }
    const copia = structuredClone(contenidos);
    (copia[ambito].meta ??= {})[enJson(clave)] = valor;
    ponerContenidos(copia);
  };

  return (
    <>
      <header className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Perfil e identidad</h2>
          <p className="text-xs text-gray-500 font-mono">comun.json &gt; identidad · contenido.&lt;idioma&gt;.json &gt; meta</p>
        </div>
        {cabecera}
      </header>
      <FormularioGenerado
        campos={campos}
        idiomas={idiomas}
        predeterminado={predeterminado}
        medios={medios}
        valorComun={valorComun}
        valoresPorIdioma={valoresPorIdioma}
        alCambiar={cambiar}
      />
    </>
  );
}

// ---- bloques ----------------------------------------------------------------

function EditorBloque({
  estado, bloque, comun, contenidos, idiomas, predeterminado, medios,
  nombreTipo, seleccion, ponerComun, ponerContenidos, cabecera,
}) {
  const tipo = estado.tipos[nombreTipo];

  if (!tipo) {
    return (
      <>
        <header className="flex items-center justify-between">
          <h2 className="font-semibold">{bloque}</h2>
          {cabecera}
        </header>
        <p className="text-sm text-amber-600">
          El bloque <code>{bloque}</code> no lo muestra ninguna sección, así que no hay un tipo del
          que generar el formulario. Añádelo a una lista en la pestaña Secciones.
        </p>
      </>
    );
  }

  const deBloque = camposDeBloque(tipo);
  const deItem = camposDeItem(tipo);
  const items = comun.bloques?.[bloque]?.items ?? [];
  const item = items[seleccion];

  // Campos del bloque entero: comunes en comun.json, traducibles en cada idioma
  const cambiarBloque = ({ ambito, clave, valor }) => {
    if (ambito === 'comun') {
      const copia = structuredClone(comun);
      ((copia.bloques ??= {})[bloque] ??= {})[clave] = valor;
      ponerComun(copia);
      return;
    }
    const copia = structuredClone(contenidos);
    ((copia[ambito].bloques ??= {})[bloque] ??= {})[clave] = valor;
    ponerContenidos(copia);
  };

  const cambiarItem = ({ ambito, clave, valor }) => {
    if (ambito === 'comun') {
      const copia = structuredClone(comun);
      copia.bloques[bloque].items[seleccion][clave] = valor;
      ponerComun(copia);
      return;
    }
    const copia = structuredClone(contenidos);
    const bloqueIdioma = ((copia[ambito].bloques ??= {})[bloque] ??= {});
    ((bloqueIdioma.items ??= {})[item.id] ??= {})[clave] = valor;
    ponerContenidos(copia);
  };

  return (
    <>
      <header className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">{bloque}</h2>
          <p className="text-xs text-gray-500 font-mono">
            tipo {nombreTipo} · forma {tipo.forma}
          </p>
        </div>
        {cabecera}
      </header>

      {deBloque.length > 0 && (
        <div className="rounded border border-gray-200 dark:border-gray-700 p-3">
          <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-2">Datos del bloque</h3>
          <FormularioGenerado
            campos={deBloque}
            idiomas={idiomas}
            predeterminado={predeterminado}
            medios={medios}
            valorComun={comun.bloques?.[bloque] ?? {}}
            valoresPorIdioma={Object.fromEntries(
              idiomas.map((codigo) => [codigo, contenidos[codigo]?.bloques?.[bloque] ?? {}]),
            )}
            alCambiar={cambiarBloque}
          />
        </div>
      )}

      {deItem.length > 0 &&
        (item ? (
          <div className="rounded border border-gray-200 dark:border-gray-700 p-3">
            <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-2 font-mono">
              {bloque}.{item.id}
            </h3>
            <FormularioGenerado
              campos={deItem}
              idiomas={idiomas}
              predeterminado={predeterminado}
              medios={medios}
              valorComun={item}
              valoresPorIdioma={Object.fromEntries(
                idiomas.map((codigo) => [
                  codigo,
                  contenidos[codigo]?.bloques?.[bloque]?.items?.[item.id] ?? {},
                ]),
              )}
              alCambiar={cambiarItem}
            />
          </div>
        ) : (
          <p className="text-sm text-gray-500">Este bloque no tiene elementos. Añade uno desde la lista.</p>
        ))}
    </>
  );
}

// ---- lista lateral de ítems -------------------------------------------------

function ListaDeItems({
  bloque, comun, contenidos, predeterminado, idiomas, tipo,
  seleccion, setSeleccion, ponerComun, ponerContenidos,
}) {
  const items = comun.bloques?.[bloque]?.items ?? [];
  const campos = tipo ? camposDeItem(tipo) : [];
  if (!tipo || campos.length === 0) return null;

  const etiquetaDe = (elemento, i) => {
    const texto = contenidos[predeterminado]?.bloques?.[bloque]?.items?.[elemento.id];
    return texto?.title ?? texto?.name ?? texto?.nombre ?? elemento.id ?? `ítem ${i + 1}`;
  };

  const mover = (i, salto) => {
    const destino = i + salto;
    if (destino < 0 || destino >= items.length) return;
    const copia = structuredClone(comun);
    const lista = copia.bloques[bloque].items;
    [lista[i], lista[destino]] = [lista[destino], lista[i]];
    ponerComun(copia);
    setSeleccion(destino);
  };

  const anadirItem = () => {
    const titulo = prompt('Título del nuevo elemento (sirve para generar su identificador):');
    if (!titulo) return;
    const id = aSlug(titulo);
    if (!id) return alert('Ese título no da un identificador válido (hacen falta letras o números).');
    if (items.some((i) => i.id === id)) return alert(`Ya existe un elemento con el id "${id}".`);

    // El ítem se siembra con TODAS las claves que el tipo declara, vacías. Antes
    // se creaba con un `title` fijo, que para `habilidades` (cuyo campo se llama
    // `name`) ni siquiera existe en el tipo.
    const copiaComun = structuredClone(comun);
    const nuevo = { id };
    for (const campo of campos) {
      if (campo.traducible === false && !campo.generado) nuevo[campo.clave] = valorVacio(campo);
    }
    ((copiaComun.bloques ??= {})[bloque] ??= { items: [] }).items.push(nuevo);
    ponerComun(copiaComun);

    // Y en TODOS los idiomas a la vez: si faltara en uno, la validación lo
    // rechazaría entero al guardar
    const copiaContenidos = structuredClone(contenidos);
    const primerTexto = campos.find((c) => c.traducible !== false && ['title', 'name', 'nombre'].includes(c.clave));
    for (const codigo of idiomas) {
      const destino = (((copiaContenidos[codigo].bloques ??= {})[bloque] ??= {}).items ??= {});
      destino[id] = {};
      for (const campo of campos) {
        if (campo.traducible !== false && !campo.generado) destino[id][campo.clave] = valorVacio(campo);
      }
      if (primerTexto && codigo === predeterminado) destino[id][primerTexto.clave] = titulo;
    }
    ponerContenidos(copiaContenidos);
    setSeleccion(items.length);
  };

  const borrarItem = () => {
    const elemento = items[seleccion];
    if (!elemento || !confirm(`¿Borrar "${etiquetaDe(elemento, seleccion)}" de todos los idiomas?`)) return;

    const copiaComun = structuredClone(comun);
    copiaComun.bloques[bloque].items = copiaComun.bloques[bloque].items.filter((i) => i.id !== elemento.id);
    ponerComun(copiaComun);

    const copiaContenidos = structuredClone(contenidos);
    for (const codigo of idiomas) delete copiaContenidos[codigo]?.bloques?.[bloque]?.items?.[elemento.id];
    ponerContenidos(copiaContenidos);
    setSeleccion(0);
  };

  return (
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
  );
}
