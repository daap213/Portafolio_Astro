// Qué idiomas se muestran en las columnas de edición.
//
// Los campos traducibles se pintan uno al lado de otro a propósito: así una
// traducción que falta salta a la vista sin ir a buscarla. Pero con cuatro o
// cinco idiomas, y con la vista previa ocupando su parte, cada columna se
// quedaba en cien píxeles y no se leía nada.
//
// La solución NO es volver a un selector de un idioma cada vez (se perdería lo
// que hace útil la comparación), sino poder apagar los que ahora mismo no estás
// tocando. Los datos siguen escribiéndose en TODOS los idiomas: esto solo
// decide qué se enseña.

export function SelectorIdiomas({ codigos, visibles, predeterminado, alCambiar, pendientesPorIdioma }) {
  if (codigos.length < 2) return null;

  const alternar = (codigo) => {
    const siguiente = visibles.includes(codigo)
      ? visibles.filter((c) => c !== codigo)
      : codigos.filter((c) => visibles.includes(c) || c === codigo);
    // Nunca dejar la vista sin ninguna columna
    if (siguiente.length) alCambiar(siguiente);
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap text-xs">
      <span className="uppercase tracking-wide text-gray-500">Idiomas</span>
      {codigos.map((codigo) => {
        const activo = visibles.includes(codigo);
        const pendientes = pendientesPorIdioma?.[codigo] ?? 0;
        return (
          <button
            key={codigo}
            onClick={() => alternar(codigo)}
            title={
              activo
                ? `Ocultar la columna de ${codigo}`
                : `Mostrar la columna de ${codigo}`
            }
            className={`px-2 py-0.5 rounded border font-mono ${
              activo
                ? 'bg-gray-900 text-white border-gray-900 dark:bg-gray-100 dark:text-gray-900 dark:border-gray-100'
                : 'border-gray-300 dark:border-gray-600 text-gray-500'
            }`}
          >
            {codigo}
            {codigo === predeterminado && <span className="opacity-60"> ·base</span>}
            {pendientes > 0 && (
              <span className={activo ? 'ml-1 text-amber-400' : 'ml-1 text-amber-600'}>{pendientes}</span>
            )}
          </button>
        );
      })}
      {visibles.length < codigos.length && (
        <button className="underline text-gray-500" onClick={() => alCambiar(codigos)}>
          ver todos
        </button>
      )}
    </div>
  );
}
