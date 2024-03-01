import LinkedInIcon from "@/components/icons/LinkedIn.astro";
import MailIcon from "@/components/icons/Mail.astro";

const urlCorreo = "mailto:daap21.3@gmail.com"
const urlLinkedIn = "https://www.linkedin.com/in/daniel-alvarado-peláez/"
const nombre = "Daniel Alvarado Peláez"
const nombreTitulo = "Ing. " + nombre
const tituloUniversidad = "Ingeniero Mecatrónico"

export const sobreMi = {
  title: "Sobre mí",
  label: "sobre-mi",
  url: "/#sobre-mi",
  nombre: nombre,
  nombreTitulo: nombreTitulo,
  titulo: tituloUniversidad,
  estado: "Trabajo remoto",
  imagenRuta: "/img/logo_rimuru.png",
  contenido: [
    "Desde Ecuador un <strong>Ingeniero Mecatrónico</strong> apasionado por el mundo tecnológico y con ello la posibilidad de ser parte de él creando mis propios proyectos.",
    "Cuento con habilidades y experiencia relacionada a <strong>diseño 3D, programación web y aplicaciones, análisis y ciencia de datos, y desarrollo de sistemas embebidos</strong>, capaz de trabajar y aprender de forma autónoma, predispuesto a trabajar en equipos multidisciplinarios para compartir, mejorar o aprender conocimientos varios.",
  ],
  botones: [
    {
      title: "Contáctame",
      icon: MailIcon,
      url: urlCorreo
    },
    {
      title: "LinkedIn",
      icon: LinkedInIcon,
      url: urlLinkedIn
    },
  ],
}
export const experiencia = {
  title: "Experiencia",
  label: "experiencia",
  url: "/#experiencia",
}
export const proyectos = {
  title: "Proyectos",
  label: "proyectos",
  url: "/#proyectos",
}
export const contactos = {
  title: "Contacto",
  label: "contacto",
  url: urlCorreo,
}


