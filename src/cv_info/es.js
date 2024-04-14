// Datos
import { es } from "./cv";

//iconos links
import LinkedInIcon from "@/components/icons/LinkedIn.astro";
import MailIcon from "@/components/icons/Mail.astro";
import CVIcon from "@/components/icons/CV.astro";
import GitHubIcon from "@/components/icons/GitHub.astro";

// icons sections
import Briefcase from "@/components/icons/Briefcase.astro";
import CodeIcon from "@/components/icons/Code.astro";
import ProfileCheck from "@/components/icons/ProfileCheck.astro";
import PublicationIcon from "@/components/icons/Publication.astro";
import EducationIcon from "@/components/icons/Education.astro";
import SkillIcon from "@/components/icons/Skill.astro";
import CertIcon from "@/components/icons/Certificado.astro";

// icons tags
import NextJS from "@/components/icons/NextJS.astro";
import Tailwind from "@/components/icons/Tailwind.astro";

//Componentes:
import Hero from "@/components/seccions/Hero.astro";
import Experience from "@/components/seccions/Experience.astro";
import Projects from "@/components/seccions/Projects.astro";
import Publications from "@/components/seccions/Publications.astro";
import Education from "@/components/seccions/Education.astro";
import AllSkills from "@/components/seccions/AllSkills.astro";
import Certificados from "@/components/seccions/Certificados.astro";
import PreviewFooter from "@/components/seccions/PreviewFooter.astro";

//Datos paginaweb
const titleWeb = es.titleWeb
const descriptionWeb = es.descriptionWeb
const raizApp = es.raizApp
//Datos generales
const nombre = es.nombre
const siglasNombre = es.siglasNombre
const nombreTitulo = es.nombreTitulo
const tituloUniversidad = es.tituloUniversidad

//Link
const urlCorreo = "mailto:" + es.correo;
const urlGithub = "https://github.com/" + es.git_user;
const urlLinkedIn = "https://www.linkedin.com/in/" + es.linkedin_user;
const urlCVEN = raizApp + "docs/CV_EN.pdf";
const urlCVESP = raizApp + "docs/CV_ESP.pdf";

// contacto
const contactObj = {
  title: "Contacto",
  label: "contacto",
  url: urlCorreo,
  id: "",
};

//Secciones id
const idsobreMi = "sobre-mi";
const idexperiencia = "experiencia";
const idproyecto = "misproyectos";
const idpublicaciones = "mispublicaciones";
const ideducacion = "educacion";
const idhabilidades = "mishabilidades";
const idcertificados = "miscertificados";

// Tags iconos de proyectos
const TAGS = {
  NEXT: {
    name: "Next.js",
    class: "bg-black text-white",
    icon: NextJS,
  },
  TAILWIND: {
    name: "Tailwind CSS",
    class: "bg-[#003159] text-white",
    icon: Tailwind,
  },
};

// Nav items de la pag
export const navItems = [
  {
    title: "Sobre_mí",
    label: idsobreMi,
    id: idsobreMi,
    url: "#" + idsobreMi,
  },
  {
    title: "Exp.",
    label: idexperiencia,
    id: idexperiencia,
    url: "#" + idexperiencia,
  },
  {
    title: "Proy.",
    label: idproyecto,
    id: idproyecto,
    url: "#" + idproyecto,
  },
  {
    title: "Publ.",
    label: idpublicaciones,
    url: "#" + idpublicaciones,
    id: idpublicaciones,
  },
  {
    title: "Educ.",
    label: ideducacion,
    url: "#" + ideducacion,
    id: ideducacion,
  },
  {
    title: "KSAO",
    label: idhabilidades,
    id: idhabilidades,
    url: "#" + idhabilidades,
  },
  {
    title: "Cert.",
    label: idcertificados,
    url: "#" + idcertificados,
    id: idcertificados,
  },
];

// Informacion de hero.astro (sobre mi)
export const sobreMi = {
  nombre: nombre,
  nombreTitulo: nombreTitulo,
  titulo: tituloUniversidad,
  estado: {
    est: es.work_state,
    url: urlLinkedIn,
  },
  imagenRuta: raizApp + "img/me.webp",
  contenido: es.sobremi,
  botones: [
    {
      title: "CV Esp",
      icon: CVIcon,
      url: urlCVESP,
    },
    {
      title: "CV En",
      icon: CVIcon,
      url: urlCVEN,
    },
    {
      title: "Contáctame",
      icon: MailIcon,
      url: urlCorreo,
    },
    {
      title: "LinkedIn",
      icon: LinkedInIcon,
      url: urlLinkedIn,
    },
    {
      title: "GitHub",
      icon: GitHubIcon,
      url: urlGithub,
    },
  ],
};

//Experiencia
export const experiencias = es.experiencias

//Educacion
export const gradosCompletados = es.gradosCompletados

//Certificados
export const certificados = es.certificados

//Publicaciones
export const publicaciones = es.publicaciones

// Herramientas y habilidades
export const habilidades = es.habilidades

// Proyectos
export const proyectos = es.proyectos

// Informacion de PreviewFooter.astro
export const previewFooter = es.previewFooter

// Informacion de Footer.astro
export const footerInfor = {
  itemInfo: navItems[0],
  itemcontact: contactObj,
  name: siglasNombre,
  url: urlLinkedIn,
  mencion: "Plantilla diseñada por Midudev.",
  urlMencion: "https://linkedin.com/in/midudev"
};

//Las secciones visibles en index.astro
const seccionItems = [
  {
    navitems: navItems[0],
    name: "Sobre mí",
    icon: ProfileCheck,
    classSeccion: "py-16 md:py-32",
    classTittle:
      "flex items-center mb-6 text-3xl font-semibold gap-x-8 text-black/80 dark:text-white",
    classIcon: "size-8",
    seccion: Hero,
    seccionInfo: sobreMi
  },
  {
    navitems: navItems[1],
    name: "Experiencia laboral",
    icon: Briefcase,
    classSeccion: "",
    classTittle:
      "flex items-center mb-6 text-3xl font-semibold gap-x-3 text-black/80 dark:text-white",
    classIcon: "size-8",
    seccion: Experience,
    seccionInfo: experiencias
  },
  {
    navitems: navItems[2],
    name: "Proyectos",
    icon: CodeIcon,
    classSeccion: "",
    classTittle:
      "flex items-center mb-6 text-3xl font-semibold gap-x-3 text-black/80 dark:text-white",
    classIcon: "size-7",
    seccion: Projects,
    seccionInfo: proyectos
  },
  {
    navitems: navItems[3],
    name: "Publicaciones",
    icon: PublicationIcon,
    classSeccion: "",
    classTittle:
      "flex items-center mb-6 text-3xl font-semibold gap-x-3 text-black/80 dark:text-white",
    classIcon: "size-8",
    seccion: Publications,
    seccionInfo: publicaciones
  },
  {
    navitems: navItems[4],
    name: "Educación",
    icon: EducationIcon,
    classSeccion: "",
    classTittle:
      "flex items-center mb-6 text-3xl font-semibold gap-x-3 text-black/80 dark:text-white",
    classIcon: "size-8",
    seccion: Education,
    seccionInfo: gradosCompletados
  },
  {
    navitems: navItems[5],
    name: "Habilidades y herramientas",
    icon: SkillIcon,
    classSeccion: "",
    classTittle:
      "flex items-center mb-6 text-3xl font-semibold gap-x-3 text-black/80 dark:text-white",
    classIcon: "size-8",
    seccion: AllSkills,
    seccionInfo: habilidades
  },
  {
    navitems: navItems[6],
    name: "Certificados",
    icon: CertIcon,
    classSeccion: "",
    classTittle:
      "flex items-center mb-6 text-3xl font-semibold gap-x-3 text-black/80 dark:text-white",
    classIcon: "size-7",
    seccion: Certificados,
    seccionInfo: certificados
  },
  {
    navitems: contactObj,
    name: "Frase de un ingeniero:",
    icon: "",
    classSeccion: "",
    classTittle:
      "flex items-center mb-6 text-3xl font-semibold gap-x-3 text-black/50 dark:text-white",
    classIcon: "",
    seccion: PreviewFooter,
    seccionInfo: previewFooter

  },
];

//Secciones y titulo de la pag index.astro
export const pagIndex = {
  title: titleWeb,
  description: descriptionWeb,
  primeraSeccion: seccionItems[0],
  secciones: seccionItems.slice(1),
};

export const ui = {
  project_dropdownText_title: 'Descripción:',
  experience_dropdownText_title: 'Responsabilidades y actividades:',
  ThemeToggle_span_title: 'Elige el tema'
}