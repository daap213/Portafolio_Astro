import LinkedInIcon from "@/components/icons/LinkedIn.astro";
import MailIcon from "@/components/icons/Mail.astro";
import Hero from "@/components/Hero.astro";
import PreviewFooter from "@/components/PreviewFooter.astro";
import Briefcase from "@/components/icons/Briefcase.astro";
import CodeIcon from "@/components/icons/Code.astro";
import Experience from "@/components/Experience.astro";
import ProfileCheck from "@/components/icons/ProfileCheck.astro";
import Projects from "@/components/Projects.astro";

//Datos generales
const nombre = "Daniel Alvarado Peláez"
const siglasNombre = "DAAP"
const nombreTitulo = "Ing. " + nombre
const tituloUniversidad = "Ingeniero Mecatrónico"

//Link 
const urlCorreo = "mailto:daap21.3@gmail.com"
const urlLinkedIn = "https://www.linkedin.com/in/daniel-alvarado-peláez/"

//Secciones id
const idsobreMi = "sobre-mi"
const idexperiencia = "experiencia"
const idproyecto = "proyectos"

// Nav items de la pag
export const navItems = [
  {
    title: "Sobre_mí",
    label: idsobreMi,
    id: idsobreMi,
    url: "/#" + idsobreMi,
  },
  {
    title: "Experiencia",
    label: idexperiencia,
    id: idexperiencia,
    url: "/#" + idexperiencia,
  },
  {
    title: "Proyectos",
    label: idproyecto,
    id: idproyecto,
    url: "/#" + idproyecto,
  },
  {
    title: "Contacto",
    label: "contacto",
    url: urlCorreo,
    id: ''
  }
];

//Las secciones visibles en index.astro
const seccionItems = [
  {
    navitems: navItems[0],
    name: "Sobre mí",
    icon: ProfileCheck,
    classSeccion: "py-16 md:py-32",
    classTittle: "flex items-center mb-6 text-3xl font-semibold gap-x-8 text-black/80 dark:text-white",
    classIcon: "size-8",
    seccion: Hero
  },
  {
    navitems: navItems[1],
    name: "Experiencia laboral",
    icon: Briefcase,
    classSeccion: "",
    classTittle: "flex items-center mb-6 text-3xl font-semibold gap-x-3 text-black/80 dark:text-white",
    classIcon: "size-8",
    seccion: Experience
  },
  {
    navitems: navItems[2],
    name: "Proyectos",
    icon: CodeIcon,
    classSeccion: "",
    classTittle: "flex items-center mb-6 text-3xl font-semibold gap-x-3 text-black/80 dark:text-white",
    classIcon: "size-7",
    seccion: Projects
  },
  {
    navitems: navItems[3],
    name: 'Frase de un ingeniero:',
    icon: '',
    classSeccion: "",
    classTittle: "flex items-center mb-6 text-3xl font-semibold gap-x-3 text-black/50 dark:text-white",
    classIcon: "",
    seccion: PreviewFooter
  }
];

//Secciones y titulo de la pag index.astro
export const pagIndex = {
  title: "Porfolio: Daniel Alvarado Peláez - Ingeniero Mecatrónico, Desarrollador y Programador",
  description: "Graduado de la carrera Mecatrónica en la universidad ESPOL, en Ecuador.",
  primeraSeccion: seccionItems[0],
  secciones: [
    seccionItems[1],
    seccionItems[2],
    seccionItems[3],
  ]
}

// Informacion de hero.astro (sobre mi)
export const sobreMi = {
  nombre: nombre,
  nombreTitulo: nombreTitulo,
  titulo: tituloUniversidad,
  estado: {
    est: "Trabajo remoto",
    url: urlLinkedIn
  },
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

//Experiencia
export const experiencias = [
  {
    date: "MAY 2023 - Actualidad",
    title: "Especialista general",
    company: "Information Tecnology XOA S. A.",
    description: [
      "Programación 'frontend' y 'backend' para añadir o mejorar nuevas funcionalidades a los servicios que ofrece la empresa.",
      "Resolución de problemas, inquietudes y bugs, para los clientes, relacionados con los servicios ofrecidos.",
      "Chequeo de servicios, servidores, para su óptimo funcionamiento.",
      "Desarrollo de servicios locales para uso propio de la compañía.",
      "Actualización de versiones de los servicios ofrecidos a diferentes clientes.",
      "Ensamblar y realizar pruebas de funcionamiento de sistemas embebidos de la empresa."
    ]
  },
  /*   {
      date: "OCT 2022 - FEB 2023",
      title: "Diseñador/Programador de dron con módulo térmico  ",
      company: "ESPOL - Curso de titulación",
      description: [
        "Diseño de un chasis y sistema de un dron a control remoto de bajo costo y tamaño mediano.",
        "Diseño de un sistema embebido para monitoreo de cables de potencia en industria.",
        "Con una Raspberry Pi 4, una cámara HD y un módulo de cámara térmica, se realizó un programa .py que usando un modelo entrenado para reconocimiento, detecta si hay presencia de cables y si en la zona se supera cierta temperatura configurada, para guardar y compartir dicha información a un Bot de Telegram."
      ]
    }, */
  {
    date: "MAR 2022 - Abr 2022",
    title: "Ayudante de investigación (Técnico de desarrollo)",
    company: "Centro de Tecnologías de Información (CTI)",
    description: [
      "Desarrollo de modelos de predicción para el consumo energético de la infraestructura de un Data Center, desarrollando Jupyter notebooks para el preprocesado, procesado de datos, ejecución de los diferentes modelos, y muestra y comparación de los resultados.",
      "Revisión, y mejoramiento de aplicación para la obtención de datos de los equipos."
    ],
    //link: "https://twitch.tv/midudev",
  },
  /*  {
     date: "MAY 2021 - SEPT 2021",
     title: "Diseñador de piladora de arroz con energía renovable",
     company: "Prácticas comunitarias",
     description:
       [
         "Para una comunidad agrícola, se analizó la viabilidad de fabricar una piladora de arroz potenciada por energía renovable. Se investigó piladoras de arroz existentes, además del uso de energías renovables. Posteriormente, se realizó un diseño y dimensionamiento acorde las necesidades de la comunidad."
       ]
   }, */
  {
    date: "MAY 2021 - Jul 2021",
    title: "Programador web",
    company: "Edu4lab",
    description:
      [
        "Diseño con el framework Laravel, Se desarrolló una  plataforma web educativa, con las funcionalidades de crear, perfiles y roles, y pruebas online, asociadas a libros, cursos y encargados."
      ]
  },
]


export const proyectos = {
  title: "Proyectos",
  label: idproyecto,
  url: "/#" + idproyecto,
}

// Informacion de PreviewFooter.astro
export const previewFooter = {
  name: nombre,
  frase: "Dios creó la Tierra, la naturaleza, los animales, la humanidad… Y al ingeniero para que se encargue de todo lo demás.",
}

// Informacion de PreviewFooter.astro
export const footerInfor = {
  itemInfo: navItems[0],
  itemcontact: navItems[3],
  name: siglasNombre,
  mencion: "Plantilla diseñada por Midudev.",
  url: urlLinkedIn,
}


