import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from './api.js';
import { guardarAjuste, leerAjuste } from './ajustes.js';
import { SelectorIdiomas } from './componentes/SelectorIdiomas.jsx';
import { VistaPrevia } from './componentes/VistaPrevia.jsx';
import { Panel } from './pantallas/Panel.jsx';
import { Contenido } from './pantallas/Contenido.jsx';
import { Secciones } from './pantallas/Secciones.jsx';
import { Disenos } from './pantallas/Disenos.jsx';
import { Textos } from './pantallas/Textos.jsx';
import { Medios } from './pantallas/Medios.jsx';
import { Idiomas } from './pantallas/Idiomas.jsx';

// `porIdioma` marca las pantallas que pintan una columna por idioma: son las
// que se quedan sin sitio en cuanto hay unos cuantos, y las que enseñan el
// selector de idiomas visibles.
const PANTALLAS = [
  { id: 'panel', titulo: 'Panel', componente: Panel },
  { id: 'contenido', titulo: 'Contenido', componente: Contenido, porIdioma: true },
  { id: 'secciones', titulo: 'Secciones', componente: Secciones, porIdioma: true },
  // Diseños no lleva `porIdioma`: un diseño no tiene nada traducido
  { id: 'disenos', titulo: 'Diseños', componente: Disenos },
  { id: 'textos', titulo: 'Textos', componente: Textos, porIdioma: true },
  { id: 'medios', titulo: 'Medios', componente: Medios },
  { id: 'idiomas', titulo: 'Idiomas', componente: Idiomas },
];

/** Claves de borrador que sabe guardar `PUT /api/estado`, en un solo viaje. */
const CLAVES_GUARDABLES = ['comun', 'contenidos', 'textos', 'seccionesWeb', 'seccionesCv', 'disenos'];

/** Espera tras la última tecla antes de escribir, con la vista en vivo puesta. */
const RETARDO_EN_VIVO = 900;

export default function App() {
  const [estado, setEstado] = useState(null);
  const [medios, setMedios] = useState([]);
  const [pantalla, setPantalla] = useState('contenido');
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const [vistaAbierta, setVistaAbierta] = useState(() => leerAjuste('vistaAbierta', true));
  const [idiomasOcultos, setIdiomasOcultos] = useState(() => leerAjuste('idiomasOcultos', []));
  // Con la vista en vivo, cada cambio que valide se escribe solo y `astro dev`
  // recarga el iframe. Es la única forma de ver algo "en tiempo real": la vista
  // previa renderiza los JSON del disco, no lo que hay en el formulario.
  const [enVivo, setEnVivo] = useState(true);

  // Los borradores viven AQUÍ, no en cada pantalla: al cambiar de pestaña el
  // componente se desmonta, y con su estado dentro se perdía todo lo editado.
  const [borradores, setBorradores] = useState({});

  const borrador = useMemo(
    () => ({
      leer: (clave) => borradores[clave],
      poner: (clave, valor) => setBorradores((previos) => ({ ...previos, [clave]: valor })),
      limpiar: (...claves) =>
        setBorradores((previos) => {
          const copia = { ...previos };
          for (const clave of claves) delete copia[clave];
          return copia;
        }),
      claves: Object.keys(borradores),
    }),
    [borradores],
  );

  const recargar = useCallback(async () => {
    try {
      const [nuevo, imagenes] = await Promise.all([api.estado(), api.medios()]);
      setEstado(nuevo);
      setMedios(imagenes);
      setError(null);
    } catch (fallo) {
      setError(fallo.message);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const hayPendientes = borrador.claves.length > 0;

  // Un refresco del navegador sí se lleva los borradores por delante
  useEffect(() => {
    if (!hayPendientes) return undefined;
    const avisar = (evento) => evento.preventDefault();
    window.addEventListener('beforeunload', avisar);
    return () => window.removeEventListener('beforeunload', avisar);
  }, [hayPendientes]);

  /**
   * Guarda y recarga. Si la validación rechaza, muestra los errores y no toca
   * disco. Devuelve true/false: quien llama necesita saberlo (el alta de idioma
   * limpiaba su formulario también cuando el alta había fallado).
   */
  const guardar = useCallback(
    async (accion, descripcion, { silencioso = false } = {}) => {
      setGuardando(true);
      if (!silencioso) setMensaje(null);
      try {
        const resultado = await accion();
        await recargar();
        if (!silencioso) {
          const avisos = resultado?.avisos?.length ? `\n${resultado.avisos.length} aviso(s) pendientes` : '';
          setMensaje({ tipo: 'ok', texto: (resultado?.nota ?? `${descripcion}: guardado`) + avisos });
        } else {
          setMensaje(null);
        }
        return true;
      } catch (fallo) {
        const detalle = fallo.errores?.length
          ? fallo.errores.map((e) => `${e.ruta}: ${e.mensaje}`).join('\n')
          : fallo.message;
        // Los fallos SÍ se enseñan siempre, también en modo silencioso: si no,
        // la vista en vivo dejaría de actualizarse sin decir por qué
        setMensaje({ tipo: 'error', texto: `${descripcion} rechazado (no se ha escrito nada):\n${detalle}` });
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [recargar],
  );

  /** Guarda TODOS los borradores pendientes en una sola transacción validada. */
  const guardarPendientes = useCallback(
    (opciones) =>
      guardar(
        async () => {
          const parcial = {};
          for (const clave of CLAVES_GUARDABLES) {
            if (borradores[clave] !== undefined) parcial[clave] = borradores[clave];
          }
          if (!Object.keys(parcial).length) return null;
          const resultado = await api.guardarEstado(parcial);
          setBorradores({});
          return resultado;
        },
        'Cambios',
        opciones,
      ),
    [borradores, guardar],
  );

  // Autoguardado de la vista en vivo. Si el estado no valida no se escribe nada
  // (el error se ve arriba) y se reintenta con la siguiente tecla.
  const guardarRef = useRef(guardarPendientes);
  guardarRef.current = guardarPendientes;

  useEffect(() => {
    if (!enVivo || !hayPendientes || guardando) return undefined;
    const temporizador = setTimeout(() => guardarRef.current({ silencioso: true }), RETARDO_EN_VIVO);
    return () => clearTimeout(temporizador);
    // `borradores` en las dependencias: cada tecla reinicia la cuenta atrás
  }, [enVivo, hayPendientes, guardando, borradores]);

  if (error) {
    return (
      <div className="p-8 text-red-600">
        <h1 className="text-lg font-semibold">No se pudo contactar con la API</h1>
        <p className="mt-2 text-sm">{error}</p>
        <p className="mt-4 text-sm text-gray-600">
          Arranca el administrador completo con <code>pnpm run admin</code>.
        </p>
        <button className="mt-4 px-3 py-1 rounded bg-gray-900 text-white text-sm" onClick={recargar}>
          Reintentar
        </button>
      </div>
    );
  }

  if (!estado) return <div className="p-8 text-gray-500">Cargando…</div>;

  const actual = PANTALLAS.find((p) => p.id === pantalla);
  const Actual = actual.componente;
  const nErrores = estado.diagnostico.errores.length;
  const nAvisos = estado.diagnostico.avisos.length;

  const codigos = estado.locales.map((idioma) => idioma.codigo);
  const predeterminado = (estado.locales.find((i) => i.predeterminado) ?? estado.locales[0]).codigo;
  // Un idioma dado de baja podría seguir en la preferencia guardada
  const visibles = codigos.filter((codigo) => !idiomasOcultos.includes(codigo));
  const idiomasVisibles = visibles.length ? visibles : codigos;

  const cambiarVisibles = (nuevos) => {
    const ocultos = codigos.filter((codigo) => !nuevos.includes(codigo));
    setIdiomasOcultos(ocultos);
    guardarAjuste('idiomasOcultos', ocultos);
  };

  const alternarVista = (abierta) => {
    setVistaAbierta(abierta);
    guardarAjuste('vistaAbierta', abierta);
  };

  // Cuántos avisos de traducción pendiente tiene cada idioma, para el selector
  const pendientesPorIdioma = {};
  for (const aviso of estado.diagnostico.avisos) {
    const encontrado = aviso.ruta.match(/^(?:contenido|ui)\.([a-z-]+)\.json/i);
    if (encontrado) pendientesPorIdioma[encontrado[1]] = (pendientesPorIdioma[encontrado[1]] ?? 0) + 1;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="px-4 py-2 flex items-center gap-4 flex-wrap">
          <h1 className="font-semibold">Administrador</h1>
          <nav className="flex gap-1">
            {PANTALLAS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPantalla(p.id)}
                className={`px-3 py-1 rounded text-sm ${
                  pantalla === p.id
                    ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {p.titulo}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3 text-xs">
            {nErrores > 0 && <span className="text-red-600 font-medium">{nErrores} error(es)</span>}
            {nAvisos > 0 && <span className="text-amber-600">{nAvisos} aviso(s)</span>}
            <span className="text-gray-500">
              rama {estado.git?.rama} {estado.git?.sucio ? '· con cambios sin commitear' : '· limpia'}
            </span>

            <label
              className="flex items-center gap-1 cursor-pointer"
              title="Escribe los cambios que validen en cuanto dejas de teclear, para que la vista previa los enseñe"
            >
              <input type="checkbox" checked={enVivo} onChange={(e) => setEnVivo(e.target.checked)} />
              vista en vivo
            </label>

            {guardando ? (
              <span className="text-blue-600">guardando…</span>
            ) : hayPendientes ? (
              <span className="text-amber-600 font-medium">sin guardar: {borrador.claves.join(', ')}</span>
            ) : (
              <span className="text-green-700">al día</span>
            )}

            {hayPendientes && (
              <button className="underline text-gray-500" onClick={() => borrador.limpiar(...borrador.claves)}>
                descartar
              </button>
            )}
            <button
              className="rounded bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 px-3 py-1 text-sm disabled:opacity-40"
              disabled={!hayPendientes || guardando}
              onClick={() => guardarPendientes()}
            >
              Guardar
            </button>
          </div>
        </div>
      </header>

      {mensaje && (
        <div
          className={`shrink-0 px-4 py-2 text-sm whitespace-pre-wrap ${
            mensaje.tipo === 'ok'
              ? 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-200'
              : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200'
          }`}
        >
          {mensaje.texto}
          <button className="ml-3 underline" onClick={() => setMensaje(null)}>
            cerrar
          </button>
        </div>
      )}

      {actual.porIdioma && (
        <div className="shrink-0 px-4 py-1.5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <SelectorIdiomas
            codigos={codigos}
            visibles={idiomasVisibles}
            predeterminado={predeterminado}
            alCambiar={cambiarVisibles}
            pendientesPorIdioma={pendientesPorIdioma}
          />
        </div>
      )}

      <div className="flex-1 flex min-h-0">
        {/* `@container`: dentro de las pantallas los cortes responsive miden ESTE
            panel, no la ventana. Con `sm:`/`lg:` normales, ensanchar la vista
            previa encogía el editor pero el viewport seguía siendo el mismo, así
            que se mantenían cinco columnas en cuatrocientos píxeles. */}
        {/* Con la vista previa plegada, su pestaña queda flotando sobre el borde
            derecho: se le deja hueco para que no tape la última tarjeta. */}
        <main className={`@container flex-1 overflow-auto p-4 min-w-0 ${vistaAbierta ? '' : 'pr-12'}`}>
          <Actual
            estado={estado}
            medios={medios}
            guardar={guardar}
            recargar={recargar}
            borrador={borrador}
            guardarPendientes={guardarPendientes}
            idiomasVisibles={idiomasVisibles}
          />
        </main>

        <VistaPrevia estado={estado} abierta={vistaAbierta} alAlternar={alternarVista} />
      </div>
    </div>
  );
}
