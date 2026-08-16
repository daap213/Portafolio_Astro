// Construye la configuracion de la portada de un idioma.
//
// Sustituye a los ~300 renglones que es.js y en.js repetian palabra por palabra
// (mismas clases, mismos iconos, mismo orden): ahora eso vive una sola vez en
// data/secciones.web.json y aqui solo se ensambla.
//
// Anadir, quitar o reordenar una seccion de la portada = editar ese JSON.
import { CLAVES_BLOQUE, DATOS, raizApp } from "./cv.js";
import { IDIOMAS } from "./locales.js";
import { componenteWebDe, iconoDe, ICONOS } from "./registro.js";
import { TEXTOS } from "./data/indice.js";
import configuracion from "./data/secciones.web.json" with { type: "json" };

/**
 * Devuelve todo lo que la pagina index.astro necesita para un idioma:
 * navItems, sobreMi, footerInfor, pagIndex, ui y los bloques de datos sueltos.
 */
export function construirPagina(codigo) {
  const datos = DATOS[codigo];
  const ui = TEXTOS[codigo];
  if (!datos) throw new Error(`paginaWeb: no hay datos del idioma "${codigo}"`);
  if (!ui) throw new Error(`paginaWeb: falta data/ui.${codigo}.json`);

  const urlCorreo = "mailto:" + datos.correo;
  const urlGithub = "https://github.com/" + datos.git_user;
  const urlLinkedIn = "https://www.linkedin.com/in/" + datos.linkedin_user;

  const textosContacto = configuracion.contacto.textos[codigo];
  const contactObj = {
    title: textosContacto.titulo,
    label: textosContacto.ancla,
    url: urlCorreo,
    id: "",
  };

  const textosDe = (entrada) => {
    const textos = entrada.textos[codigo];
    if (!textos) throw new Error(`secciones.web.json: la sección "${entrada.id}" no tiene textos en ${codigo}`);
    return textos;
  };

  const navItemDe = (entrada) => {
    const { nav, ancla } = textosDe(entrada);
    return { title: nav, label: ancla, id: ancla, url: "#" + ancla };
  };

  const navItems = configuracion.secciones.filter((entrada) => entrada.enNav).map(navItemDe);

  // Un boton de descarga por idioma declarado, mas los de contacto y redes
  const sobreMi = {
    nombre: datos.nombre,
    nombreTitulo: datos.nombreTitulo,
    titulo: datos.tituloUniversidad,
    estado: { est: datos.work_state, url: urlLinkedIn },
    imagenRuta: datos.foto,
    contenido: datos.sobremi,
    botones: [
      ...IDIOMAS.map((idioma) => ({
        title: idioma.botonCv[codigo],
        icon: ICONOS.CV,
        url: raizApp + "docs/" + idioma.pdf,
      })),
      { title: textosContacto.boton, icon: ICONOS.Mail, url: urlCorreo },
      { title: "LinkedIn", icon: ICONOS.LinkedIn, url: urlLinkedIn },
      { title: "GitHub", icon: ICONOS.GitHub, url: urlGithub },
    ],
  };

  // Los datos que recibe cada seccion: la presentacion es un objeto compuesto,
  // el resto es directamente su bloque
  const datosDe = (entrada) => (entrada.tipo === "presentacion" ? sobreMi : datos[entrada.bloque]);

  const seccionItems = configuracion.secciones.map((entrada) => {
    const componente = componenteWebDe(entrada.tipo);
    if (!componente) {
      throw new Error(`secciones.web.json: el tipo "${entrada.tipo}" no tiene componente web`);
    }
    return {
      navitems: entrada.enNav ? navItemDe(entrada) : contactObj,
      name: textosDe(entrada).titulo,
      icon: iconoDe(entrada.icono),
      classSeccion: entrada.clases?.seccion ?? "",
      classTittle: entrada.clases?.titulo ?? "",
      classIcon: entrada.clases?.icono ?? "",
      seccion: componente,
      seccionInfo: datosDe(entrada),
      opciones: entrada.opciones,
    };
  });

  const footerInfor = {
    itemInfo: navItems[0],
    itemcontact: contactObj,
    name: datos.siglasNombre,
    url: urlLinkedIn,
    mencion: configuracion.pie.mencion[codigo],
    urlMencion: configuracion.pie.urlMencion,
  };

  return {
    navItems,
    sobreMi,
    footerInfor,
    ui,
    // Bloques sueltos, tal y como los exportaban es.js / en.js. Ya no se
    // enumeran: un bloque nuevo aparece aqui solo, sin tocar este fichero.
    ...Object.fromEntries(CLAVES_BLOQUE.map((clave) => [clave, datos[clave]])),
    pagIndex: {
      title: datos.titleWeb,
      description: datos.descriptionWeb,
      primeraSeccion: seccionItems[0],
      secciones: seccionItems.slice(1),
    },
  };
}
