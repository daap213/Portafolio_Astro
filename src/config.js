import LinkedInIcon from "@/components/icons/LinkedIn.astro";
import MailIcon from "@/components/icons/Mail.astro";
import Hero from "@/components/Hero.astro";
import PreviewFooter from "@/components/PreviewFooter.astro";
import Briefcase from "@/components/icons/Briefcase.astro";
import CodeIcon from "@/components/icons/Code.astro";
import Experience from "@/components/Experience.astro";
import ProfileCheck from "@/components/icons/ProfileCheck.astro";
import Projects from "@/components/Projects.astro";
import NextJS from "@/components/icons/NextJS.astro";
import Tailwind from "@/components/icons/Tailwind.astro";

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
const idproyecto = "misproyectos"

// Nav items de la pag
export const navItems = [
  {
    title: "Sobre_mí",
    label: idsobreMi,
    id: idsobreMi,
    url: "#" + idsobreMi,
  },
  {
    title: "Experiencia",
    label: idexperiencia,
    id: idexperiencia,
    url: "#" + idexperiencia,
  },
  {
    title: "Proyectos",
    label: idproyecto,
    id: idproyecto,
    url: "#" + idproyecto,
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
  imagenRuta: "/img/logo_rimuru.webp",
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

// Informacion de PreviewFooter.astro
export const previewFooter = {
  name: nombre,
  frase: "Dios creó la Tierra, la naturaleza, los animales, la humanidad… Y al ingeniero para que se encargue de todo lo demás.",
}

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
export const proyectos = [
  {
    title: "Dron para monitoreo Térmico",
    description:
      ["Diseños CAD y circuitos con Arduino de un dron. Diseños CAD, circuitos y programa con Raspberry Pi de un sistema embebido que detecta presencia de cables, capturar imágenes térmicas y detectar si existen picos de temperatura.",
      ],
    link: "",
    github: "https://github.com/daap213/MonitoreoTermico",
    image: "/projects/dron.webp",
    tags: [TAGS.NEXT, TAGS.TAILWIND],
  },
  {
    title: "Simulación OPC en tiempo real",
    description:
      ["Simulación de un circuito en tiempo real, conectado por OPC a un interzas de LABVIEW, para su monitoreo y control.",
      ],
    link: "",
    github: "https://github.com/daap213/Simulacion-protocolo-OPC-en-tiempo-real",
    image: "/projects/simulacionOPC.webp",
    tags: [TAGS.NEXT, TAGS.TAILWIND],
  },
  {
    title: "Control de bombas Proteus/Ubidots",
    description:
      ["Diseño de un sistema de bombas en el programa Proteus, controlado por un Atmega328p, y visualización en Ubidots del estado del sistema, comunicados por un programa desarrollado en Python.",
      ],
    link: "",
    github: "https://github.com/daap213/Control-de-bombas-Proteus-",
    image: "/projects/bombasUbidots.webp",
    tags: [TAGS.NEXT, TAGS.TAILWIND],
  },
  {
    title: "Adaptación de prótesis para rodilla",
    description:
      ["Diseño 3D de una rodilla y edición de una prótesis total de rodilla utilizando el software 3D Slice y Blender, para adaptar la prótesis de rodilla que ya existir a la rodilla de prueba.",
      ],
    link: "",
    github: "https://github.com/daap213/adaptation-of-knee-prosthesis",
    image: "/projects/protesisRodilla.webp",
    tags: [TAGS.NEXT, TAGS.TAILWIND],
  },
  {
    title: "Control de bombeo LABVIEW",
    description:
      ["Diseño de una HMI para el control de un sistema de bombas, el cual cuenta con tres bombas. Dos bombas son las principales y la tercera es de respaldo en caso de que una se dañe o se deshabilite por mantenimiento. Cada bomba tiene su pulsador de marcha y paro, así como también su selector de habilitado o deshabilitada. El sistema tendrá funcionamiento manual y automático comandado por la señal enviada por un selector.",
      ],
    link: "",
    github: "https://github.com/daap213/Control-de-bombeo-LABVIEW",
    image: "/projects/bombasLabview.webp",
    tags: [TAGS.NEXT, TAGS.TAILWIND],
  },
  {
    title: "Simulación Dinámica de Mecanismo",
    description:
      ["Se diseña un mecanismo donde el eje de un molino recibe la potencia y velocidad necesaria por medio de poleas-cadenas, a su ves el eje que le trasmite la potencia a la polea con cadena, recibe la potencia de entrada por medio de un juego de poleas con banda en V, ademas de estar apoyado en 2 rodamientos.",
      ],
    link: "",
    github: "https://github.com/daap213/SimulacionDinamicaMecanismo",
    image: "/projects/ejeMolino.webp",
    tags: [TAGS.NEXT, TAGS.TAILWIND],
  },
  {
    title: "Diseño una apiladora de arroz",
    description:
      ["Diseño y análisis de viabilidad de una apiladora de arroz usando energía renovable para su implementación en una comunidad agricola en desarrollo.",
      ],
    link: "",
    github: "https://github.com/daap213/Practica-comunitaria-apiladora-de-arroz",
    image: "/projects/apiladoraArroz.webp",
    tags: [TAGS.NEXT, TAGS.TAILWIND],
  },
  {
    title: "Alimentador de mascotas automático",
    description:
      ["Proyecto de alimentador de mascotas automático controlado por una aplicación móvil que permita programar los horarios de comida.",
      ],
    link: "",
    github: "https://github.com/daap213/Alimentador-de-mascotas",
    image: "/projects/petFeeder.webp",
    tags: [TAGS.NEXT, TAGS.TAILWIND],
  },
  {
    title: "Proceso de fabricación flexible",
    description:
      ["<strong>Objetivo:</strong><br />Rediseñar el sistema de fabricación de botellas de una empresa, para la reducción de los tiempos de producción, aumento de la flexibilidad del sistema y la rentabilidad de la empresa.<br /><strong>Descripción:</strong><br />Una empresa quiere montar una fabrica de botellas de plástico, esta industria ha adquirido varias maquinarias automatizadas para el proceso de elaboración de materia prima, estas ya han sido instaladas y automatizadas respectivamente.<br /> Las siguientes fases, que son:<br /> *El proceso de mezclado<br /> *El proceso de formación de botellas<br />*El proceso de paletizado de botellas<br />",
      ],
    link: "",
    github: "https://github.com/daap213/Flexible-Manufacturing-Process",
    image: "/projects/fabricacionFlexible.webp",
    tags: [TAGS.NEXT, TAGS.TAILWIND],
  },
  {
    title: "Calidad de Producción de Azúcar",
    description:
      ["<strong>Objetivo:</strong><br />Mejorar el sistema de producción de calidad de azúcar mediante la modificación en las etapas de fabricación evitando el frecuente rechazo del producto al momento de su entrega.<br /><strong>Problematica:</strong><br />Una planta encargada de generar azúcar se conforma por una serie de etapas que contienenciertos procesos que hacen la producción de forma eficiente:<br />*Cristalización<br />*Entrega y extracción de jugo<br />*Evaporación<br />*Purificación del jugo<br />La planta no cuenta con controles de la calidad del azúcar, por ello los clientes desean realizar pruebas de calidad en base a la toma de muestras aleatorias, de manera que, si el producto pasa las pruebas, se acepte el pedido, por otra parte, si el producto no pasa las pruebas de calidad, el producto será devuelto en su totalidad independientemente del tamaño del pedido.",
      ],
    link: "",
    github: "https://github.com/daap213/Monitoreo-produccion-de-azucar",
    image: "/projects/sinfoto.webp",
    tags: [TAGS.NEXT, TAGS.TAILWIND],
  }
];

// Informacion de PreviewFooter.astro
export const footerInfor = {
  itemInfo: navItems[0],
  itemcontact: navItems[3],
  name: siglasNombre,
  mencion: "Plantilla diseñada por Midudev.",
  url: urlLinkedIn,
}


