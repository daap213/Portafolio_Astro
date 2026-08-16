// Nombres de los iconos disponibles, SIN los componentes.
//
// registro.js es quien vincula cada nombre con su .astro, pero ese fichero no
// lo puede cargar ni el administrador ni validar.js ni Playwright (importa
// .astro, y ninguno sabe parsearlo; ver la nota de tipos.js). Antes de existir
// este catalogo, `icono` en secciones.*.json era texto libre: un nombre mal
// escrito no daba error en ninguna parte y la seccion salia sin icono.
//
// registro.js comprueba contra esta lista que no falte ni sobre ninguno.

/** Iconos pensados para encabezar una seccion. */
export const ICONOS_SECCION = [
  "ProfileCheck",
  "Briefcase",
  "Code",
  "Publication",
  "Education",
  "Skill",
  "Certificado",
];

/** Iconos de los enlaces del hero (CV, contacto, redes). */
export const ICONOS_ENLACE = ["CV", "Mail", "LinkedIn", "GitHub"];

/** Iconos de las etiquetas de proyecto. */
export const ICONOS_ETIQUETA = ["NextJS", "Tailwind"];

/** Todos los nombres validos para el campo `icono`. */
export const NOMBRES_ICONO = [...ICONOS_SECCION, ...ICONOS_ENLACE, ...ICONOS_ETIQUETA];

/** true si el nombre existe en el catalogo (una seccion sin icono es valida). */
export const esIconoValido = (nombre) => !nombre || NOMBRES_ICONO.includes(nombre);
