import LinkedInIcon from "@/components/icons/LinkedIn.astro";
import MailIcon from "@/components/icons/Mail.astro";
import Hero from "@/components/Hero.astro";
import AboutMe from "@/components/AboutMe.astro";
import Briefcase from "@/components/icons/Briefcase.astro";
import CodeIcon from "@/components/icons/Code.astro";
import Experience from "@/components/Experience.astro";
import ProfileCheck from "@/components/icons/ProfileCheck.astro";
import Projects from "@/components/Projects.astro";

//Datos generales
const nombre = "Daniel Alvarado Peláez"
const nombreTitulo = "Ing. " + nombre
const tituloUniversidad = "Ingeniero Mecatrónico"

//Link 
const urlCorreo = "mailto:daap21.3@gmail.com"
const urlLinkedIn = "https://www.linkedin.com/in/daniel-alvarado-peláez/"

//Secciones id
const idsobreMi = "sobre-mi"
const idexperiencia = "experiencia"
const idproyecto = "proyectos"

export const pagIndex = {
  title: "Porfolio: Daniel Alvarado Peláez - Ingeniero Mecatrónico, Desarrollador y Programador",
  description: "Graduado de la carrera Mecatrónica en la universidad ESPOL, en Ecuador.",
  primeraSeccion: {
    id: idsobreMi,
    name: "Sobre mí",
    icon: ProfileCheck,
    classSeccion: "py-16 md:py-32",
    classTittle: "flex items-center mb-6 text-3xl font-semibold gap-x-8 text-black/80 dark:text-white",
    classIcon: "size-8",
    seccion: Hero
  },
  secciones: [
    {
      id: idexperiencia,
      name: "Experiencia laboral",
      icon: Briefcase,
      classSeccion: "",
      classTittle: "flex items-center mb-6 text-3xl font-semibold gap-x-3 text-black/80 dark:text-white",
      classIcon: "size-8",
      seccion: Experience
    },
    {
      id: idproyecto,
      name: "Proyectos",
      icon: CodeIcon,
      classSeccion: "",
      classTittle: "flex items-center mb-6 text-3xl font-semibold gap-x-3 text-black/80 dark:text-white",
      classIcon: "size-7",
      seccion: Projects
    },
    {
      id: '',
      name: '',
      icon: '',
      classSeccion: "",
      classTittle: "",
      classIcon: "",
      seccion: AboutMe
    },
  ]
}

export const sobreMi = {
  title: "Sobre_mí",
  label: idsobreMi,
  url: "/#" + idsobreMi,
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
  ]
}
export const experiencia = {
  title: "Experiencia",
  label: idexperiencia,
  url: "/#" + idexperiencia,
}
export const proyectos = {
  title: "Proyectos",
  label: idproyecto,
  url: "/#" + idproyecto,
}
export const contactos = {
  title: "Contacto",
  label: "contacto",
  url: urlCorreo,
}


