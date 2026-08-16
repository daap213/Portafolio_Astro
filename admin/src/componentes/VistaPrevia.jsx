import { useCallback, useEffect, useRef, useState } from 'react';
import { guardarAjuste, leerAjuste } from '../ajustes.js';
import { PUERTOS_WEB } from '../constantes.js';

// Vista previa acoplada, SIEMPRE montada.
//
// Antes era una pestaña más, así que al cambiar de pantalla el componente se
// desmontaba, el iframe se destruía y volver a la vista previa significaba
// esperar otra vez a que cargara el sitio entero. Ahora vive en el armazón de
// la aplicación, al lado del editor: se edita y se ve, sin ir y volver.
//
// Los JSON están en el grafo de módulos de Vite, así que en cuanto el
// administrador escribe un fichero `astro dev` recarga la página del iframe él
// solo. Por eso no se fuerza una recarga tras guardar: serían dos seguidas.

const ANCHO_MINIMO = 320;
const ANCHO_POR_DEFECTO = 560;
/** Lo que se le deja como mínimo al editor. */
const EDITOR_MINIMO = 420;

export function VistaPrevia({ estado, abierta, alAlternar }) {
  const idiomas = estado.locales.map((idioma) => idioma.codigo);
  const predeterminado = (estado.locales.find((i) => i.predeterminado) ?? estado.locales[0]).codigo;

  const [idioma, setIdioma] = useState(predeterminado);
  const [vista, setVista] = useState('');
  const [version, setVersion] = useState(0);
  const [ancho, setAncho] = useState(() => leerAjuste('anchoVista', ANCHO_POR_DEFECTO));
  // `activo` es la fuente de verdad del arrastre y `arrastrando` solo pinta
  // (el velo y el color del tirador). Leer el estado de React dentro de los
  // manejadores daba un valor viejo: los eventos que llegan en el mismo tick que
  // el pointerdown se descartaban y, peor, si el pointerup lo veía obsoleto el
  // iframe se quedaba congelado con su anchura fija para siempre.
  const activo = useRef(false);
  const [arrastrando, setArrastrando] = useState(false);

  const panel = useRef(null);
  const marco = useRef(null);
  const anchoVivo = useRef(ancho);
  const cuadro = useRef(null);

  const url = `${PUERTOS_WEB}/${idioma}/${vista}`;

  const limitar = (valor) =>
    Math.max(ANCHO_MINIMO, Math.min(valor, window.innerWidth - EDITOR_MINIMO));

  // Arrastre del borde izquierdo para repartir el espacio con el editor.
  //
  // Tres cosas que lo hacían ir a tirones, y las tres importan:
  //
  //   1. Con `mousemove` en window, en cuanto el cursor pasaba por encima del
  //      iframe los eventos se los quedaba él (es otro documento) y el arrastre
  //      se quedaba clavado. Con `setPointerCapture` el tirador sigue recibiendo
  //      TODO el movimiento, esté el puntero donde esté.
  //   2. Un `setState` por cada píxel redibujaba el panel entero decenas de
  //      veces por segundo. Durante el arrastre se escribe el ancho
  //      directamente en el nodo y no se re-renderiza nada; el estado se
  //      actualiza una sola vez, al soltar.
  //   3. Y lo más caro con diferencia: al cambiar el ancho del iframe se
  //      re-maqueta el SITIO ENTERO que lleva dentro, en cada fotograma. Aquí se
  //      le fija su anchura en píxeles mientras dura el arrastre, así el panel
  //      se mueve pegado al ratón (solo recorta o deja hueco, que es composición
  //      y no maquetación) y el sitio se recalcula UNA vez, al soltar.
  const alPulsar = useCallback((evento) => {
    evento.preventDefault();
    // Congelar el iframe con la anchura que tenga ahora mismo
    if (marco.current) marco.current.style.width = `${marco.current.getBoundingClientRect().width}px`;
    // La captura puede fallar (puntero ya liberado, eventos sintéticos). Si
    // falla se sigue arrastrando igual: sin ella se pierde el puntero al pasar
    // sobre el iframe, pero es mejor eso que no poder arrastrar en absoluto.
    try {
      evento.currentTarget.setPointerCapture(evento.pointerId);
    } catch {
      /* sin captura */
    }
    activo.current = true;
    setArrastrando(true);
  }, []);

  const alMover = useCallback((evento) => {
    if (!activo.current) return;
    anchoVivo.current = limitar(window.innerWidth - evento.clientX);
    if (cuadro.current !== null) return;
    cuadro.current = requestAnimationFrame(() => {
      cuadro.current = null;
      if (panel.current) panel.current.style.width = `${anchoVivo.current}px`;
    });
  }, []);

  const alSoltar = useCallback((evento) => {
    if (!activo.current) return;
    activo.current = false;
    try {
      evento.currentTarget.releasePointerCapture(evento.pointerId);
    } catch {
      /* no estaba capturado */
    }
    if (cuadro.current !== null) {
      cancelAnimationFrame(cuadro.current);
      cuadro.current = null;
    }
    // El panel se queda con la última medida aunque el fotograma no llegara a
    // correr, y el iframe recupera el 100%: aquí es donde el sitio embebido se
    // re-maqueta, una sola vez y ya con el ancho definitivo.
    if (panel.current) panel.current.style.width = `${anchoVivo.current}px`;
    if (marco.current) marco.current.style.width = '';
    setArrastrando(false);
    setAncho(anchoVivo.current);
    guardarAjuste('anchoVista', anchoVivo.current);
  }, []);

  useEffect(() => () => cuadro.current !== null && cancelAnimationFrame(cuadro.current), []);

  // Sin esto, arrastrar va seleccionando el texto del editor por el camino
  useEffect(() => {
    if (!arrastrando) return undefined;
    const previo = document.body.style.userSelect;
    document.body.style.userSelect = 'none';
    return () => {
      document.body.style.userSelect = previo;
    };
  }, [arrastrando]);

  if (!abierta) {
    return (
      <button
        className="fixed right-0 top-1/2 -translate-y-1/2 z-20 rounded-l bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 px-2 py-4 text-xs [writing-mode:vertical-rl]"
        onClick={() => alAlternar(true)}
        title="Mostrar la vista previa"
      >
        Vista previa
      </button>
    );
  }

  return (
    <aside
      ref={panel}
      className="relative shrink-0 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col"
      // Durante el arrastre manda el ref: si algo dispara un re-render a mitad
      // (por ejemplo un guardado en vivo), el ancho no da un salto hacia atrás
      style={{ width: arrastrando ? anchoVivo.current : ancho }}
    >
      {/* Tirador de ancho */}
      <div
        onPointerDown={alPulsar}
        onPointerMove={alMover}
        onPointerUp={alSoltar}
        onPointerCancel={alSoltar}
        // Zona de agarre ancha (12px a caballo del borde): con la mitad se
        // fallaba el tirador y se acababa arrastrando dentro del iframe
        className={`absolute left-0 top-0 h-full w-3 -ml-1.5 z-30 cursor-col-resize touch-none ${
          arrastrando ? 'bg-blue-400/60' : 'hover:bg-blue-400/40'
        }`}
        title="Arrastra para cambiar el ancho"
      />

      <div className="flex flex-wrap items-center gap-1.5 p-2 border-b border-gray-200 dark:border-gray-700">
        <select
          className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-1.5 py-0.5 text-xs"
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
            className={`px-2 py-0.5 rounded text-xs ${
              vista === opcion.valor
                ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                : 'border border-gray-300 dark:border-gray-600'
            }`}
          >
            {opcion.titulo}
          </button>
        ))}

        <button
          className="px-2 py-0.5 rounded text-xs border border-gray-300 dark:border-gray-600"
          onClick={() => setVersion((v) => v + 1)}
          title="Volver a cargar el iframe"
        >
          ↻
        </button>

        <a
          className="text-xs text-blue-600 hover:underline"
          href={url}
          target="_blank"
          rel="noreferrer"
          title="Abrir en una pestaña"
        >
          ↗
        </a>

        <button
          className="ml-auto px-2 py-0.5 rounded text-xs border border-gray-300 dark:border-gray-600"
          onClick={() => alAlternar(false)}
          title="Ocultar la vista previa"
        >
          ✕
        </button>
      </div>

      {/* `overflow-hidden`: mientras se arrastra el iframe lleva una anchura
          fija, así que sobra o falta sitio y no debe desbordar el panel. */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        <iframe
          ref={marco}
          key={`${url}-${version}`}
          src={url}
          title="Vista previa del portafolio"
          className="absolute left-0 top-0 w-full h-full bg-white"
        />
        {/* Velo mientras se arrastra: sin él el iframe recibe el puntero, se
            queda con el foco del ratón y además va marcando estados :hover del
            sitio mientras solo estás cambiando el ancho. */}
        {arrastrando && <div className="absolute inset-0 cursor-col-resize" />}
      </div>

      <p className="p-2 text-[11px] leading-tight text-gray-500 border-t border-gray-200 dark:border-gray-700">
        Si sale en blanco, comprueba que <code>astro dev</code> escuche en <code>{PUERTOS_WEB}</code>.
        Tras dar de alta un idioma hay que reiniciarlo.
      </p>
    </aside>
  );
}
