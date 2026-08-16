// Preferencias de la interfaz (ancho de la vista previa, idiomas ocultos…).
//
// Viven en localStorage y NO en los datos del portafolio: son de quien edita,
// no del sitio. Si algo está corrupto se ignora y se sigue con el valor por
// defecto, que una preferencia rota no puede tumbar el administrador.

const PREFIJO = 'admin-portafolio:';

export function leerAjuste(clave, porDefecto) {
  try {
    const crudo = localStorage.getItem(PREFIJO + clave);
    return crudo === null ? porDefecto : JSON.parse(crudo);
  } catch {
    return porDefecto;
  }
}

export function guardarAjuste(clave, valor) {
  try {
    localStorage.setItem(PREFIJO + clave, JSON.stringify(valor));
  } catch {
    // Sin localStorage (modo privado) se sigue funcionando, solo que sin memoria
  }
}
