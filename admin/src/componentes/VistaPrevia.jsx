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

export function VistaPrevia({ estado, abierta, alAlternar }) {
  const idiomas = estado.locales.map((idioma) => idioma.codigo);
  const predeterminado = (estado.locales.find((i) => i.predeterminado) ?? estado.locales[0]).codigo;

  const [idioma, setIdioma] = useState(predeterminado);
  const [vista, setVista] = useState('');
  const [version, setVersion] = useState(0);
  const [ancho, setAncho] = useState(() => leerAjuste('anchoVista', ANCHO_POR_DEFECTO));
  const arrastrando = useRef(false);

  const url = `${PUERTOS_WEB}/${idioma}/${vista}`;

  // Arrastre del borde izquierdo para repartir el espacio con el editor
  const alPulsarBorde = useCallback((evento) => {
    evento.preventDefault();
    arrastrando.current = true;
  }, []);

  useEffect(() => {
    const mover = (evento) => {
      if (!arrastrando.current) return;
      const nuevo = window.innerWidth - evento.clientX;
      setAncho(Math.max(ANCHO_MINIMO, Math.min(nuevo, window.innerWidth - 420)));
    };
    const soltar = () => {
      if (!arrastrando.current) return;
      arrastrando.current = false;
      // Se guarda al soltar, no en cada píxel del arrastre
      setAncho((actual) => {
        guardarAjuste('anchoVista', actual);
        return actual;
      });
    };
    window.addEventListener('mousemove', mover);
    window.addEventListener('mouseup', soltar);
    return () => {
      window.removeEventListener('mousemove', mover);
      window.removeEventListener('mouseup', soltar);
    };
  }, []);

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
      className="relative shrink-0 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col"
      style={{ width: ancho }}
    >
      {/* Tirador de ancho */}
      <div
        onMouseDown={alPulsarBorde}
        className="absolute left-0 top-0 h-full w-1.5 -ml-0.5 cursor-col-resize hover:bg-blue-400/60"
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

      <iframe
        key={`${url}-${version}`}
        src={url}
        title="Vista previa del portafolio"
        className="flex-1 w-full bg-white"
      />

      <p className="p-2 text-[11px] leading-tight text-gray-500 border-t border-gray-200 dark:border-gray-700">
        Si sale en blanco, comprueba que <code>astro dev</code> escuche en <code>{PUERTOS_WEB}</code>.
        Tras dar de alta un idioma hay que reiniciarlo.
      </p>
    </aside>
  );
}
