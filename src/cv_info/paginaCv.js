// Construye la vista imprimible del CV de un idioma.
//
// Es el gemelo de paginaWeb.js para la otra lista de secciones: la web y el CV
// tienen listas independientes (data/secciones.web.json y secciones.cv.json),
// con su propio orden, sus propias secciones y sus propias opciones.
import { DATOS } from "./cv.js";
import { TEXTOS } from "./data/indice.js";
import { COMPONENTES_CV } from "./registro.js";
import configuracion from "./data/secciones.cv.json" with { type: "json" };

/** Devuelve titulo, textos y secciones ya resueltas para /<idioma>/cv. */
export function construirCv(codigo) {
  const datos = DATOS[codigo];
  const ui = TEXTOS[codigo];
  if (!datos) throw new Error(`paginaCv: no hay datos del idioma "${codigo}"`);
  if (!ui) throw new Error(`paginaCv: falta data/ui.${codigo}.json`);

  // El bloque "perfil" no es una lista: se compone de identidad + meta
  const perfil = {
    nombre: datos.nombre,
    correo: datos.correo,
    git_user: datos.git_user,
    linkedin_user: datos.linkedin_user,
    mi_web: datos.mi_web,
    urlWeb: "https://" + datos.mi_web,
    foto: datos.foto,
    tituloUniversidad: datos.tituloUniversidad,
    cumpleaños: datos.cumpleaños,
    ubicacion: datos.ubicacion,
  };

  const bloqueDe = (clave) => (clave === "perfil" ? perfil : datos[clave]);

  const secciones = configuracion.secciones.map((entrada) => {
    const componente = COMPONENTES_CV[entrada.tipo];
    if (!componente) {
      throw new Error(`secciones.cv.json: el tipo "${entrada.tipo}" no tiene componente de CV`);
    }
    const textos = entrada.textos[codigo];
    if (!textos) {
      throw new Error(`secciones.cv.json: la sección "${entrada.id}" no tiene textos en ${codigo}`);
    }
    return {
      id: entrada.id,
      titulo: textos.titulo,
      claseTitulo: entrada.clases?.titulo ?? "",
      componente,
      datos: bloqueDe(entrada.bloque),
      opciones: entrada.opciones ?? {},
    };
  });

  return {
    titulo: ui.cv_titulo + datos.nombre,
    descripcion: datos.descriptionWeb,
    foto: datos.foto,
    ui,
    secciones,
  };
}
