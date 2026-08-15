// Campos del formulario, uno por tipo declarado en src/cv_info/tipos.js.
//
import { PUERTOS_WEB } from '../constantes.js';

// El formulario NO conoce las secciones: se genera enteramente desde `campos[]`
// del tipo. Añadir un tipo de campo nuevo es añadir una entrada a REGISTRO.

const claseEntrada =
  'w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm';

function Texto({ valor, alCambiar, multilinea }) {
  if (multilinea) {
    return (
      <textarea
        className={claseEntrada + ' min-h-24 font-mono'}
        value={valor ?? ''}
        onChange={(e) => alCambiar(e.target.value)}
      />
    );
  }
  return <input className={claseEntrada} value={valor ?? ''} onChange={(e) => alCambiar(e.target.value)} />;
}

/** Lista de líneas: una entrada por elemento, con añadir/quitar/mover. */
function Lista({ valor, alCambiar, multilinea }) {
  const elementos = Array.isArray(valor) ? valor : [];
  const cambiar = (i, nuevo) => alCambiar(elementos.map((v, j) => (j === i ? nuevo : v)));
  const mover = (i, salto) => {
    const destino = i + salto;
    if (destino < 0 || destino >= elementos.length) return;
    const copia = [...elementos];
    [copia[i], copia[destino]] = [copia[destino], copia[i]];
    alCambiar(copia);
  };

  return (
    <div className="space-y-1">
      {elementos.map((elemento, i) => (
        <div key={i} className="flex gap-1 items-start">
          <Texto valor={elemento} alCambiar={(v) => cambiar(i, v)} multilinea={multilinea} />
          <div className="flex flex-col">
            <button type="button" className="px-1 text-xs" title="subir" onClick={() => mover(i, -1)}>↑</button>
            <button type="button" className="px-1 text-xs" title="bajar" onClick={() => mover(i, 1)}>↓</button>
          </div>
          <button
            type="button"
            className="px-2 text-xs text-red-600"
            title="quitar"
            onClick={() => alCambiar(elementos.filter((_, j) => j !== i))}
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        className="text-xs text-blue-600 hover:underline"
        onClick={() => alCambiar([...elementos, ''])}
      >
        + añadir
      </button>
    </div>
  );
}

function Imagen({ valor, alCambiar, medios }) {
  return (
    <div className="space-y-1">
      <div className="flex gap-2 items-center">
        {valor && (
          <img
            src={`${PUERTOS_WEB}/${valor}`}
            alt=""
            className="h-12 w-12 object-cover rounded border border-gray-300"
          />
        )}
        <select className={claseEntrada} value={valor ?? ''} onChange={(e) => alCambiar(e.target.value)}>
          <option value="">(ninguna)</option>
          {medios.map((imagen) => (
            <option key={imagen.ruta} value={imagen.ruta}>
              {imagen.ruta}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-gray-500">Sube imágenes nuevas desde la pestaña Medios.</p>
    </div>
  );
}

function Booleano({ valor, alCambiar }) {
  return (
    <input type="checkbox" checked={Boolean(valor)} onChange={(e) => alCambiar(e.target.checked)} />
  );
}

const REGISTRO = {
  texto: (props) => <Texto {...props} />,
  textoLargo: (props) => <Texto {...props} multilinea />,
  html: (props) => <Texto {...props} multilinea />,
  listaTexto: (props) => <Lista {...props} />,
  listaHtml: (props) => <Lista {...props} multilinea />,
  url: (props) => <Texto {...props} />,
  correo: (props) => <Texto {...props} />,
  telefono: (props) => <Texto {...props} />,
  imagen: (props) => <Imagen {...props} />,
  etiquetas: (props) => <Lista {...props} />,
  booleano: (props) => <Booleano {...props} />,
};

/** Pinta un campo. Un tipo desconocido no rompe: cae a texto crudo con aviso. */
export function Campo({ campo, valor, alCambiar, medios = [] }) {
  const pintar = REGISTRO[campo.tipo];
  if (!pintar) {
    return (
      <div>
        <Texto valor={typeof valor === 'string' ? valor : JSON.stringify(valor)} alCambiar={alCambiar} multilinea />
        <p className="text-xs text-amber-600">tipo de campo desconocido: {campo.tipo}</p>
      </div>
    );
  }
  return pintar({ valor, alCambiar, medios });
}

export { claseEntrada };
