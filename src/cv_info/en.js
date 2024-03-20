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
const titleWeb =
  "Portfolio: Daniel Alvarado Peláez - Mechatronic Engineer, Developer and Programmer";
const descriptionWeb =
  "Graduated from the Mechatronics degree at ESPOL University, in Ecuador.";

//Datos generales
const nombre = "Daniel Alvarado Peláez";
const siglasNombre = "DAAP";
const nombreTitulo = "Ing. " + nombre;
const tituloUniversidad = "Mechatronic Engineer";

//Link
const urlCorreo = "mailto:daap21.3@gmail.com";
const urlGithub = "https://github.com/daap213";
const urlLinkedIn = "https://www.linkedin.com/in/daniel-alvarado-peláez/";
const urlCVEN = "/Portafolio_Astro/docs/CV_EN.pdf";
const urlCVESP = "/Portafolio_Astro/docs/CV_ESP.pdf";
const rutaProyect = "/Portafolio_Astro/img/projects/"
// contacto
const contactObj = {
  title: "Contact",
  label: "contact",
  url: urlCorreo,
  id: "",
};

//Secciones id
const idsobreMi = "about_me";
const idexperiencia = "experience";
const idproyecto = "myprojects";
const idpublicaciones = "myposts";
const ideducacion = "education";
const idhabilidades = "myskills";
const idcertificados = "miscertificates";

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
    title: "About_me",
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
    est: "Remote work",
    url: urlLinkedIn,
  },
  imagenRuta: "/Portafolio_Astro/img/me.webp",
  contenido: [
    "I am Ecuadorian, <strong>Mechatronic Engineer</strong> passionate about the technological world and with it the possibility of being part of it creating my own projects.",
    "I have skills and experience related to <strong>3D design, web and application programming, data analysis, data science, and embedded systems development</strong>. Able to work and learn autonomously, predisposed to work in multidisciplinary teams to share, improve or learn various knowledge.",],
  botones: [
    {
      title: "CV Spa",
      icon: CVIcon,
      url: urlCVESP,
    },
    {
      title: "CV En",
      icon: CVIcon,
      url: urlCVEN,
    },
    {
      title: "Contact me",
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
export const experiencias = [
  {
    date: "MAY 2023 - Present",
    title: "General Specialist",
    company: "Information Tecnology XOA S. A.",
    description: [
      "Frontend and backend programming to add or enhance new functionalities to the company's services.",
      "Troubleshooting, addressing concerns, and fixing bugs for clients related to the offered services.",
      "Checking services and servers for optimal performance.",
      "Developing local services for the company's internal use.",
      "Updating versions of services offered to different clients.",
      "Assembling and testing embedded systems for the company.",
    ],
    link: ""
  },
  {
    date: "MAR 2022 - APR 2022",
    title: "Research Assistant (Development Technician)",
    company: "Center for Information Technologies (CTI)",
    description: [
      "Developing prediction models for the energy consumption of Data Center infrastructure, using Jupyter notebooks for data preprocessing, processing, executing various ML models, and comparing results.",
      "Reviewing and improving an application for obtaining equipment data.",
    ],
    //link: "https://twitch.tv/midudev",
  },
  {
    date: "MAY 2021 - JUL 2021",
    title: "Web Programmer",
    company: "Edu4lab",
    description: [
      "Design with the Laravel framework, a educational web platform was developed, with functionalities for creating profiles, roles, and online tests, associated with books, courses, and instructors.",
    ],
    link: ""
  },
];

//Educacion
export const gradosCompletados = [
  {
    date: "Guayaquil, Ecuador / OCT 2017 - FEB 2023",
    title: "Higher Education, Mechatronics Engineering",
    institution: "Escuela Superior Politécnica del Litoral (ESPOL)",
    description: []
  },
  {
    date: "Guayaquil, Ecuador / MAY 2005 - FEB 2017",
    title: "Primary - Secondary Education",
    institution: "Unidad Educativa FAE Nº2",
    description: []
    //"link": "https://twitch.tv/midudev"
  }
];

//Certificados
export const certificados =
{
  link: "https://drive.google.com/drive/folders/1k3Gb4c1tQa0eKYGnvWbXT8EdypvT9Jb-?usp=share_link",
  titleLink: "Drive with certificates",
  title: "Courses taken",
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
    name: "Programming languages",
    skills: ["JAVA", "Python", "C/C++", "HTML", "JavaScript", "PHP"],
    related: ["Node.js", "Laravel", "Jupyter Notebook"],
  },
  {
    name: "Databases",
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
    name: "Other development tools",
    skills: ["Paquete Office", "Git & GitHub", "Docker", "MATLAB & Simulink"],
  },
  {
    name: "hardware tools",
    skills: [
      "Arduino",
      "Raspberry Pi",
      "ESP32 - 8266",
      "PLC Siemens",
      "PLC Logo",
    ],
  },
  {
    name: "Technical skills",
    skills: [
      "Development and programming",
      "Analytics and data science",
      "3d design",
      "Development of embedded systems",
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
    name: "Languages",
    skills: ["Spanish - Native", "English - C1"],
  },
  {
    name: "Personal skills",
    skills: [
      "Teamwork",
      "Commitment to tasks",
      "Learning capacity",
      "Orientation to results",
    ],
  },
];

// Proyectos
export const proyectos = [

  {
    title: "Thermal Monitoring Drone",
    description: [
      "CAD designs and Arduino circuits for a drone. CAD designs, circuits, and Raspberry Pi program for an embedded system that detects cable presence, captures thermal images, and detects temperature spikes."
    ],
    link: "https://www.canva.com/design/DAFX9yXkbVk/DF8M5vSArvJTF0_a-fzVag/watch?utm_content=DAFX9yXkbVk&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink",
    github: "https://github.com/daap213/MonitoreoTermico",
    image: rutaProyect + "dron.webp",
    tags: []
  },
  {
    title: "Real-time OPC Simulation",
    description: [
      "Real-time circuit simulation, connected via OPC to a LABVIEW interface, for monitoring and control."
    ],
    link: "https://www.canva.com/design/DAFJCVANN2g/aI2GtYXtZmk-CkhwHaSFEQ/watch?utm_content=DAFJCVANN2g&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink",
    github: "https://github.com/daap213/Simulacion-protocolo-OPC-en-tiempo-real",
    image: rutaProyect + "simulacionOPC.webp",
    tags: []
  },
  {
    title: "Proteus/Ubidots Pump Control",
    description: [
      "Design of a pump system in Proteus, controlled by an Atmega328p, and visualization in Ubidots of the system's status communicated by a program developed in Python."
    ],
    link: "https://www.canva.com/design/DAE1pn3Eg34/oXMn2FTiOz5Hzs9sH3YjGQ/watch?utm_content=DAE1pn3Eg34&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink",
    github: "https://github.com/daap213/Control-de-bombas-Proteus-",
    image: rutaProyect + "bombasUbidots.webp",
    tags: []
  },
  {
    title: "Knee Prosthesis Adaptation",
    description: [
      "3D design of a knee and editing of a total knee prosthesis, using Slice 3D and Blender software to adapt the existing knee prosthesis to the test knee."
    ],
    link: "",
    github: "https://github.com/daap213/adaptation-of-knee-prosthesis",
    image: rutaProyect + "protesisRodilla.webp",
    tags: []
  },
  {
    title: "LABVIEW Pump Control",
    description: [
      "Design of an HMI for the control of a pump system, which has three pumps. Two pumps are primary and the third is backup in case one fails or is disabled for maintenance. Each pump has its start and stop pushbuttons, as well as its enable or disable selector. The system will have manual and automatic operation commanded by the signal sent by a selector."
    ],
    link: "",
    github: "https://github.com/daap213/Control-de-bombeo-LABVIEW",
    image: rutaProyect + "bombasLabview.webp",
    tags: []
  },
  {
    title: "Dynamic Mechanism Simulation",
    description: [
      "A mechanism is designed where the shaft of a mill receives the necessary power and speed through pulley-chains. In turn, the shaft that transmits power to the pulley with chain receives the input power through a set of V-belt pulleys, as well as being supported by 2 bearings."
    ],
    link: "",
    github: "https://github.com/daap213/SimulacionDinamicaMecanismo",
    image: rutaProyect + "ejeMolino.webp",
    tags: []
  },
  {
    title: "Rice Stacker Design",
    description: [
      "Design and feasibility analysis of a rice stacker using renewable energy for implementation in a developing agricultural community."
    ],
    link: "",
    github: "https://github.com/daap213/Practica-comunitaria-apiladora-de-arroz",
    image: rutaProyect + "apiladoraArroz.webp",
    tags: []
  },
  {
    title: "Automatic Pet Feeder",
    description: [
      "Automatic pet feeder project controlled by a mobile application that allows scheduling feeding times."
    ],
    link: "https://youtu.be/xK9o9PrH0lI",
    github: "https://github.com/daap213/Alimentador-de-mascotas",
    image: rutaProyect + "petFeeder.webp",
    tags: []
  },
  {
    title: "Flexible Manufacturing Process",
    description: [
      "Redesigning the bottle manufacturing system of a company to reduce production times, increase system flexibility, and improve company profitability."
    ],
    link: "https://www.canva.com/design/DAFLZCEZKGQ/C2buCKb0bE4fJlOO9KrR9w/watch?utm_content=DAFLZCEZKGQ&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink",
    github: "https://github.com/daap213/Flexible-Manufacturing-Process",
    image: rutaProyect + "fabricacionFlexible.webp",
    tags: []
  },
  {
    title: "Sugar Production Quality",
    description: [
      "<strong>Objective:</strong><br />Improve sugar production quality system by modifying manufacturing stages to avoid frequent product rejection upon delivery.<br /><strong>Issue:</strong><br />A sugar-producing plant consists of several stages containing certain processes that make production efficient:<br />*Crystallization<br />*Juice delivery and extraction<br />*Evaporation<br />*Juice purification<br />The plant lacks sugar quality controls, so customers want quality tests based on random sampling so that if the product passes the tests, the order is accepted; otherwise, the product will be returned in full regardless of the order size."
    ],
    link: "https://www.youtube.com/watch?v=AorRajwlaNI",
    github: "https://github.com/daap213/Monitoreo-produccion-de-azucar",
    image: rutaProyect + "sinfoto.webp",
    tags: []
  }
];

// Informacion de PreviewFooter.astro
export const previewFooter = {
  name: nombre,
  logo: "/Portafolio_Astro/img/me_panoramico.webp",
  frase:
    "God created the Earth, nature, animals, humanity... And the engineer to take care of everything else.",
};

// Informacion de Footer.astro
export const footerInfor = {
  itemInfo: navItems[0],
  itemcontact: contactObj,
  name: siglasNombre,
  url: urlLinkedIn,
  mencion: "Template designed by Midudev.",
  urlMencion: "https://linkedin.com/in/midudev"
};

//Las secciones visibles en index.astro
const seccionItems = [
  {
    navitems: navItems[0],
    name: "About me",
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
    name: "Job experience",
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
    name: "Projects",
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
    name: "Publications",
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
    name: "Education",
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
    name: "Skills and tools",
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
    name: "Certificates",
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
    name: "Phrase from an engineer:",
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