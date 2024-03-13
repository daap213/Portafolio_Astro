//iconos links
import LinkedInIcon from "@/components/icons/LinkedIn.astro";
import MailIcon from "@/components/icons/Mail.astro";
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
const titleWeb =
  "Porfolio: Daniel Alvarado Peláez - Ingeniero Mecatrónico, Desarrollador y Programador";
const descriptionWeb =
  "Graduado de la carrera Mecatrónica en la universidad ESPOL, en Ecuador.";

//Datos generales
const nombre = "Daniel Alvarado Peláez";
const siglasNombre = "DAAP";
const nombreTitulo = "Ing. " + nombre;
const tituloUniversidad = "Ingeniero Mecatrónico";

//Link
const urlCorreo = "mailto:daap21.3@gmail.com";
const urlLinkedIn = "https://www.linkedin.com/in/daniel-alvarado-peláez/";

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
  },
];

//Secciones y titulo de la pag index.astro
export const pagIndex = {
  title: titleWeb,
  description: descriptionWeb,
  primeraSeccion: seccionItems[0],
  secciones: seccionItems.slice(1),
};

// Informacion de hero.astro (sobre mi)
export const sobreMi = {
  nombre: nombre,
  nombreTitulo: nombreTitulo,
  titulo: tituloUniversidad,
  estado: {
    est: "Trabajo remoto",
    url: urlLinkedIn,
  },
  imagenRuta: "/img/me.webp",
  contenido: [
    "Soy ecuatoriano, <strong>Ingeniero Mecatrónico</strong> apasionado por el mundo tecnológico y con ello la posibilidad de ser parte de él creando mis propios proyectos.",
    "Cuento con habilidades y experiencia relacionada a <strong>diseño 3D, programación web y aplicaciones, análisis de datos, ciencia de datos, y desarrollo de sistemas embebidos</strong>. Capaz de trabajar y aprender de forma autónoma, predispuesto a trabajar en equipos multidisciplinarios para compartir, mejorar o aprender conocimientos varios.",
  ],
  botones: [
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
  ],
};

//Experiencia
export const experiencias = [
  {
    date: "MAY 2023 - Actualidad",
    title: "Especialista general",
    company: "Information Tecnology XOA S. A.",
    description: [
      "Programación 'frontend' y 'backend' para añadir o mejorar nuevas funcionalidades a los servicios que ofrece la empresa.",
      "Resolución de problemas, inquietudes y bugs, para los clientes relacionados con los servicios ofrecidos.",
      "Chequeo de servicios, servidores, para su óptimo funcionamiento.",
      "Desarrollo de servicios locales para uso propio de la compañía.",
      "Actualización de versiones de los servicios ofrecidos a diferentes clientes.",
      "Ensamblar y realizar pruebas de funcionamiento de sistemas embebidos de la empresa.",
    ],
    link: ""
  },
  {
    date: "MAR 2022 - Abr 2022",
    title: "Ayudante de investigación (Técnico de desarrollo)",
    company: "Centro de Tecnologías de Información (CTI)",
    description: [
      "Desarrollo de modelos de predicción para el consumo energético de la infraestructura de un Data Center, desarrollando Jupyter notebooks para el preprocesado, procesado de datos, ejecución de los diferentes modelos de ML y comparación de los resultados.",
      "Revisión y mejoramiento de aplicación para la obtención de datos de los equipos.",
    ],
    //link: "https://twitch.tv/midudev",
  },
  {
    date: "MAY 2021 - Jul 2021",
    title: "Programador web",
    company: "Edu4lab",
    description: [
      "Diseño con el framework Laravel, Se desarrolló una  plataforma web educativa, con las funcionalidades de crear, perfiles y roles, y pruebas online, asociadas a libros, cursos y encargados.",
    ],
    link: ""
  },
];

//Educacion
export const gradosCompletados = [
  {
    date: "Guayaquil- Ecuador / OCT 2017- FEBR 2023",
    title: "Educación Superior, Ingeniería Mecatrónica",
    institution: "Escuela Superior Politécnica del Litoral (ESPOL)",
    description: [],
  },
  {
    date: "Guayaquil- Ecuador  / MAY 2005- FEBR 2017",
    title: "Primaria - Secundaria",
    institution: "Unidad Educativa FAE Nº2",
    description: [],
    //link: "https://twitch.tv/midudev",
  },
];

//Certificados
export const certificados =
{
  link: "https://drive.google.com/drive/folders/1k3Gb4c1tQa0eKYGnvWbXT8EdypvT9Jb-?usp=share_link",
  items: [
    {
      date: "MAR 2023",
      title: "Despliegue de MySQL con Docker",
    },
    {
      date: "FEB 2023",
      title: "Python para data scientist avanzado",
    },
    {
      date: "FEB 2023",
      title: "Docker esencial",
    },
    {
      date: "FEB 2023",
      title: "Learning Docker",
    },
    {
      date: "ENE 2023",
      title: "OPENedX Escritura Académica",
    },
    {
      date: "DIC 2022",
      title: "Examen CAMBRIDGE ENGLISH PLACEMENT TEST, C1",
    },
    {
      date: "FEB 2022",
      title: "Cuarta revolución Industrial: Data science",
    },
    {
      date: "FEB 2022",
      title: "Aprende Excel (Office365/Microsoft365)",
    },
    {
      date: "FEB 2022",
      title: "Cómo eliminar las distracciones",
    },
    {
      date: "FEB 2022",
      title: "Cómo conciliar las funciones múltiples del líder",
    },
    {
      date: "ABR 2021",
      title: "Introducción a la programación en Python",
    },
    {
      date: "SEPT 2021",
      title: "Fundamentos de programación en PLC",
    },
    {
      date: "SEPT 2021",
      title: "Python para data science y big data esencial",
    },
    {
      date: "OCT 2020",
      title: "MATLAB Onramp",
    },
    {
      date: "NOV 2017",
      title: "Certificate of Competency in English, ECCE B2",
    },
    {
      date: "MAY 2017",
      title: "Certificado de graduación, CEN",
    },
  ],
}

//Publicaciones
export const publicaciones = [
  {
    title:
      "Comparison of Traditional ML Algorithms for Energy Consumption Prediction Models",
    authors: "R. Estrada, V. Asanza, D. Torres, I. Valeriano and D. Alvarado",
    description:
      " 2022 IEEE Future Networks World Forum (FNWF), Montreal, QC, Canada, 2022, pp. 232-237,",
    link: "https://ieeexplore.ieee.org/document/10056675",
    codigo: "doi: 10.1109/FNWF55208.2022.00048.",
    image: "",
  }
];

// Herramientas y habilidades
export const habilidades = [
  {
    name: "Lenguajes de programación",
    skills: ["JAVA", "Python", "C/C++", "HTML", "JavaScript", "PHP"],
    related: ["Node.js", "Laravel", "Jupyter Notebook"],
  },
  {
    name: "Bases de datos",
    skills: ["MySQL", "Postgresql", "MongoDB"],
    related: [
      "MongoDBCompass",
      "MongoDB Atlas",
      "Laragon",
      "XAMPP",
      "HeidiSQL",
      "PGAdmin4",
    ],
  },
  {
    name: "Otras herramientas de desarrollo",
    skills: ["Paquete Office", "Git & GitHub", "Docker", "MATLAB & Simulink"],
  },
  {
    name: "Herramientas de hardware",
    skills: [
      "Arduino",
      "Raspberry Pi",
      "ESP32 - 8266",
      "PLC Siemens",
      "PLC Logo",
    ],
  },
  {
    name: "Habilidades técnicas",
    skills: [
      "Desarrollo y progamación",
      "Análisis y ciencia de datos",
      "Diseño 3D",
      "Desarrollo de sistemas embebidos",
    ],
    related: [
      "Autodesk Inventor",
      "Autodesk AutoCAD",
      "Automation Studio",
      "CADe Simu",
      "CCW (Connected Components Workbench)",
      "FluidSIM",
      "LabVIEW",
      "TIA Portal",
      "Proteus",
      "FlexSim",
    ],
  },
  {
    name: "Idiomas",
    skills: ["Español - Nativo", "Ingles - C1"],
  },
  {
    name: "Habilidades personales",
    skills: [
      "Trabajo en equipo",
      "Compromiso en tareas",
      "Capacidad de aprendizaje",
      "Orientación a resultados",
    ],
  },
];

// Proyectos
export const proyectos = [
  {
    title: "Dron para monitoreo Térmico",
    description: [
      "Diseños CAD y circuitos con Arduino de un dron. Diseños CAD, circuitos y programa con Raspberry Pi de un sistema embebido que detecta presencia de cables, capturar imágenes térmicas y detectar si existen picos de temperatura.",
    ],
    link: "https://www.canva.com/design/DAFX9yXkbVk/DF8M5vSArvJTF0_a-fzVag/watch?utm_content=DAFX9yXkbVk&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink",
    github: "https://github.com/daap213/MonitoreoTermico",
    image: "/projects/dron.webp",
    tags: [],
  },
  {
    title: "Simulación OPC en tiempo real",
    description: [
      "Simulación de un circuito en tiempo real, conectado por OPC a un interfaz de LABVIEW, para su monitoreo y control.",
    ],
    link: "https://www.canva.com/design/DAFJCVANN2g/aI2GtYXtZmk-CkhwHaSFEQ/watch?utm_content=DAFJCVANN2g&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink",
    github:
      "https://github.com/daap213/Simulacion-protocolo-OPC-en-tiempo-real",
    image: "/projects/simulacionOPC.webp",
    tags: [],
  },
  {
    title: "Control de bombas Proteus/Ubidots",
    description: [
      "Diseño de un sistema de bombas en el programa Proteus, controlado por un Atmega328p, y visualización en Ubidots del estado del sistema comunicados por un programa desarrollado en Python.",
    ],
    link: "https://www.canva.com/design/DAE1pn3Eg34/oXMn2FTiOz5Hzs9sH3YjGQ/watch?utm_content=DAE1pn3Eg34&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink",
    github: "https://github.com/daap213/Control-de-bombas-Proteus-",
    image: "/projects/bombasUbidots.webp",
    tags: [],
  },
  {
    title: "Adaptación de prótesis para rodilla",
    description: [
      "Diseño 3D de una rodilla y edición de una prótesis total de rodilla, utilizando el software 3D Slice y Blender para adaptar la prótesis de rodilla que ya existir a la rodilla de prueba.",
    ],
    link: "",
    github: "https://github.com/daap213/adaptation-of-knee-prosthesis",
    image: "/projects/protesisRodilla.webp",
    tags: [],
  },
  {
    title: "Control de bombeo LABVIEW",
    description: [
      "Diseño de una HMI para el control de un sistema de bombas, el cual cuenta con tres bombas. Dos bombas son las principales y la tercera es de respaldo en caso de que una se dañe o se deshabilite por mantenimiento. Cada bomba tiene su pulsador de marcha y paro, así como también su selector de habilitado o deshabilitado. El sistema tendrá funcionamiento manual y automático comandado por la señal enviada por un selector.",
    ],
    link: "",
    github: "https://github.com/daap213/Control-de-bombeo-LABVIEW",
    image: "/projects/bombasLabview.webp",
    tags: [],
  },
  {
    title: "Simulación Dinámica de Mecanismo",
    description: [
      "Se diseña un mecanismo donde el eje de un molino recibe la potencia y velocidad necesaria por medio de poleas-cadenas, a su vez el eje que transmite la potencia a la polea con cadena recibe la potencia de entrada por medio de un juego de poleas con banda en V, ademas de estar apoyado en 2 rodamientos.",
    ],
    link: "",
    github: "https://github.com/daap213/SimulacionDinamicaMecanismo",
    image: "/projects/ejeMolino.webp",
    tags: [],
  },
  {
    title: "Diseño de una apiladora de arroz",
    description: [
      "Diseño y análisis de viabilidad de una apiladora de arroz usando energía renovable para su implementación en una comunidad agrícola en desarrollo.",
    ],
    link: "",
    github:
      "https://github.com/daap213/Practica-comunitaria-apiladora-de-arroz",
    image: "/projects/apiladoraArroz.webp",
    tags: [],
  },
  {
    title: "Alimentador de mascotas automático",
    description: [
      "Proyecto de alimentador de mascotas automático controlado por una aplicación móvil que permita programar los horarios de comida.",
    ],
    link: "https://youtu.be/xK9o9PrH0lI",
    github: "https://github.com/daap213/Alimentador-de-mascotas",
    image: "/projects/petFeeder.webp",
    tags: [],
  },
  {
    title: "Proceso de fabricación flexible",
    description: [
      "Rediseñar el sistema de fabricación de botellas de una empresa, para la reducción de los tiempos de producción asi como el aumento de la flexibilidad del sistema y la rentabilidad de la empresa.",
    ],
    link: "https://www.canva.com/design/DAFLZCEZKGQ/C2buCKb0bE4fJlOO9KrR9w/watch?utm_content=DAFLZCEZKGQ&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink",
    github: "https://github.com/daap213/Flexible-Manufacturing-Process",
    image: "/projects/fabricacionFlexible.webp",
    tags: [],
  },
  {
    title: "Calidad de Producción de Azúcar",
    description: [
      "<strong>Objetivo:</strong><br />Mejorar el sistema de producción de calidad de azúcar mediante la modificación en las etapas de fabricación evitando el frecuente rechazo del producto al momento de su entrega.<br /><strong>Problemática:</strong><br />Una planta encargada de generar azúcar se conforma por una serie de etapas que contienen ciertos procesos que hacen la producción de forma eficiente:<br />*Cristalización<br />*Entrega y extracción de jugo<br />*Evaporación<br />*Purificación del jugo<br />La planta no cuenta con controles de la calidad del azúcar, por ello los clientes desean realizar pruebas de calidad en base a la toma de muestras aleatorias de manera que, si el producto pasa las pruebas, se acepte el pedido, por otra parte, si el producto no pasa las pruebas de calidad, el producto será devuelto en su totalidad independientemente del tamaño del pedido.",
    ],
    link: "https://www.youtube.com/watch?v=AorRajwlaNI",
    github: "https://github.com/daap213/Monitoreo-produccion-de-azucar",
    image: "/projects/sinfoto.webp",
    tags: [],
  },
];

// Informacion de PreviewFooter.astro
export const previewFooter = {
  name: nombre,
  logo: "/img/me_panoramico.webp",
  frase:
    "Dios creó la Tierra, la naturaleza, los animales, la humanidad… Y al ingeniero para que se encargue de todo lo demás.",
};

// Informacion de Footer.astro
export const footerInfor = {
  itemInfo: navItems[0],
  itemcontact: contactObj,
  name: siglasNombre,
  url: urlLinkedIn,
  mencion: "Plantilla diseñada por Midudev.",
  urlMencion: "https://linkedin.com/in/midudev"
};
