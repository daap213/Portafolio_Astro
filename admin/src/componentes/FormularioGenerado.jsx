import { Campo } from './Campos.jsx';

// Formulario de un ítem, generado desde `campos[]` del tipo.
//
// Los campos traducibles se muestran en COLUMNAS, un idioma al lado del otro:
// cuesta lo mismo de programar que un selector y hace que una traducción que
// falta salte a la vista sin tener que ir buscándola.
//
// Los campos comunes (traducible: false) se muestran una sola vez, con candado:
// viven en comun.json y son iguales en todos los idiomas por construcción.

export function FormularioGenerado({
  campos,
  idiomas,
  predeterminado = idiomas[0],
  valorComun,
  valoresPorIdioma,
  alCambiar,
  medios,
  soloTraducibles = false,
}) {
  const comunes = soloTraducibles
    ? []
    : campos.filter((campo) => campo.traducible === false && !campo.generado);
  const traducibles = campos.filter((campo) => campo.traducible !== false && !campo.generado);

  return (
    <div className="space-y-5">
      {comunes.length > 0 && (
        <section>
          <h4 className="text-xs uppercase tracking-wide text-gray-500 mb-2">
            Igual en todos los idiomas
          </h4>
          <div className="space-y-3">
            {comunes.map((campo) => (
              <label key={campo.clave} className="block">
                <span className="text-sm font-medium">
                  {campo.clave}
                  {campo.requerido && <span className="text-red-500"> *</span>}
                  <span className="ml-1 text-gray-400" title="común a todos los idiomas">🔒</span>
                </span>
                <Campo
                  campo={campo}
                  valor={valorComun?.[campo.clave]}
                  medios={medios}
                  alCambiar={(v) => alCambiar({ ambito: 'comun', clave: campo.clave, valor: v })}
                />
              </label>
            ))}
          </div>
        </section>
      )}

      {traducibles.length > 0 && (
        <section>
          <h4 className="text-xs uppercase tracking-wide text-gray-500 mb-2">Por idioma</h4>
          <div className="space-y-4">
            {traducibles.map((campo) => (
              <div key={campo.clave}>
                <span className="text-sm font-medium">
                  {campo.clave}
                  {campo.requerido && <span className="text-red-500"> *</span>}
                </span>
                {/* auto-fit + minmax: las columnas se PARTEN en varias filas en
                    vez de encogerse. Con `repeat(N, 1fr)` y cinco idiomas cada
                    campo se quedaba en cien píxeles y no se leía nada. */}
                <div
                  className="grid gap-3 mt-1"
                  style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))' }}
                >
                  {idiomas.map((codigo) => {
                    const valor = valoresPorIdioma?.[codigo]?.[campo.clave];
                    const vacio =
                      valor === undefined || valor === '' || (Array.isArray(valor) && valor.length === 0);
                    const faltaTraduccion = vacio && codigo !== predeterminado;
                    return (
                      <div key={codigo}>
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="text-xs font-mono text-gray-500">{codigo}</span>
                          {faltaTraduccion && (
                            <span className="text-xs text-amber-600" title="vacío en este idioma">
                              sin traducir
                            </span>
                          )}
                        </div>
                        <div className={faltaTraduccion ? 'ring-1 ring-amber-400 rounded' : ''}>
                          <Campo
                            campo={campo}
                            valor={valor}
                            medios={medios}
                            alCambiar={(v) => alCambiar({ ambito: codigo, clave: campo.clave, valor: v })}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
