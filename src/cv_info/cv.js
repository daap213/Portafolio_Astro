//   raizApp = "/" para local
//   raizApp = "/Portafolio_Astro/"  para servidor
import { config } from "./../../config.js";

const isPROD = import.meta.env?.PROD ?? false;
export const raizApp = isPROD ? config.prod.RAIZAPP + "/" : config.dev.RAIZAPP;
const rutaProyect = raizApp + "img/projects/";
export const rutaQR = raizApp + "img/qr/";
const nombre = "Daniel Alvarado Peláez";
const siglasNombre = "DAAP";
const git_user = "daap213";
const linkedin_user = "daniel-alvarado-peláez";
const correo = "daniel.alvardo.1999@gmail.com";

//////////////////////////////////////////
//////////////// Español ////////////////
////////////////////////////////////////

export const es = {
  raizApp: raizApp,
  nombre: nombre,
  siglasNombre: siglasNombre,
  mi_web: "portafolio.daaptech.org/",
  tituloUniversidad: "Magíster en Ciberseguridad | Ingeniero Mecatrónico",
  nombreTitulo: "Ing. " + nombre,
  titleWeb:
    "Portafolio: " +
    nombre +
    " - Magíster en Ciberseguridad | Ingeniero Mecatrónico, Desarrollador y Programador",
  descriptionWeb:
    "Graduado de la carrera Mecatrónica en la universidad ESPOL, en Ecuador.",
  ubicacion: "Ecuador - Guayaquil",
  cumpleaños: "24 de Marzo del 1999",
  correo: correo,
  git_user: git_user,
  linkedin_user: linkedin_user,
  work_state: "Trabajo remoto",
 sobremi: [
"Soy ecuatoriano, <strong>Ingeniero Mecatrónico y Máster en Ciberseguridad</strong>, apasionado por la tecnología, la innovación y la resolución de problemas complejos. Cuento con experiencia en el diseño, desarrollo e implementación de soluciones tecnológicas de alto impacto, integrando <strong>desarrollo de software, análisis de datos, inteligencia artificial y ciberseguridad</strong> para generar valor en entornos empresariales e industriales.",

"Mi perfil combina una sólida formación técnica con una visión integral de negocio, permitiéndome participar en todo el ciclo de vida de las soluciones tecnológicas: desde la adquisición y procesamiento de datos hasta el desarrollo de aplicaciones, automatización de procesos y protección de activos digitales. Poseo experiencia en <strong>desarrollo full-stack, machine learning, arquitectura de sistemas, seguridad de la información, gestión de riesgos, auditorías de seguridad y sistemas IoT</strong>. Asimismo, he liderado iniciativas técnicas y coordinado proyectos multidisciplinarios, promoviendo la colaboración entre equipos y la entrega de soluciones alineadas con los objetivos organizacionales.",

"Complemento mi perfil con una comunicación efectiva en entornos internacionales gracias a mi dominio profesional del inglés (C1), facilitando la interacción con equipos, documentación y tecnologías globales. Mantengo un enfoque de aprendizaje continuo y una visión responsable de la inteligencia artificial, impulsando su adopción tanto desde una perspectiva ética como práctica para mejorar la productividad, optimizar procesos y apoyar la toma de decisiones basada en datos. Me caracterizo por mi pensamiento analítico, liderazgo técnico, orientación a resultados y compromiso con la excelencia profesional."
] ,
  experiencias: [
    {
      date: "MAY 2023 - Actualidad",
      title: "Especialista general",
      company: "Information Tecnology XOA S. A.",
      description: [
        "Desarrollo full-stack: diseño e implementación de aplicaciones web con arquitecturas seguras, utilizando tecnologías modernas y buenas prácticas de codificación.",
        "Desarrollo de modelos de Machine Learning e integración con APIs y servicios empresariales, incluyendo pipelines de ML en producción.",
        "Análisis y procesamiento de datos: definición de estrategias de adquisición, limpieza, preprocesado y procesamiento de grandes volúmenes de datos con herramientas especializadas.",
        "Seguridad informática: implementación de medidas de protección, auditorías de código, validación de entrada, gestión segura de información, y monitoreo de servicios.",
        "Propuestas y mejoras de seguridad: identificación de vulnerabilidades, evaluación de riesgos, diseño de soluciones de mitigación.",
        "Soporte técnico: trabajo de campo para diagnóstico, detección y resolución de problemas críticos en producto y servicios de clientes.",
        "Monitoreo proactivo: supervisión continua de servicios, servidores y aplicaciones en producción para garantizar disponibilidad, rendimiento y seguridad.",
        "Actualización y migración de versiones: planificación e implementación de actualizaciones seguras con minimización de impacto y validación exhaustiva.",
        "Desarrollo de herramientas internas: creación de servicios y utilidades propias de la empresa para optimizar procesos operacionales.",
        "Control de calidad: pruebas funcionales, de seguridad y de rendimiento en sistemas embebidos y aplicaciones antes de su liberación.",
      ],
      link: "",
    },
    {
      date: "MAR 2022 - ABR 2022",
      title: "Ayudante de Investigación (Técnico de Desarrollo)",
      company: "Centro de Tecnologías de Información (CTI)",
      description: [
        "Participación en un proyecto de investigación orientado a la predicción del consumo energético de la infraestructura de un Data Center mediante técnicas de Machine Learning.",
        "Diseño y desarrollo de notebooks en Jupyter para la adquisición, limpieza, preprocesamiento y análisis exploratorio de datos provenientes de sistemas de monitoreo.",
        "Implementación, entrenamiento y evaluación comparativa de distintos modelos predictivos, utilizando métricas de desempeño para determinar la solución más eficiente.",
        "Optimización y mejora de una aplicación de recolección de datos, fortaleciendo la calidad, consistencia y disponibilidad de la información utilizada en los modelos analíticos.",
        "Colaboración en actividades de investigación que contribuyeron a la publicación científica presentada en IEEE Future Networks World Forum (FNWF 2022)."
      ]
    },
    {
      date: "MAY 2021 - JUL 2021",
      title: "Programador Web",
      company: "Edu4Lab",
      description: [
        "Desarrollo de una plataforma web educativa utilizando Laravel bajo una arquitectura orientada a la escalabilidad y mantenimiento del sistema.",
        "Implementación de módulos de gestión de usuarios, perfiles y roles, garantizando un control de acceso adecuado según las responsabilidades de cada tipo de usuario.",
        "Desarrollo de funcionalidades para la administración de cursos, libros, evaluaciones en línea y responsables académicos.",
        "Diseño e integración de la lógica de negocio y base de datos para la gestión centralizada de contenidos educativos.",
        "Participación en pruebas funcionales y validación de requerimientos para asegurar la correcta operación de la plataforma."
      ]
    }
  ],
  gradosCompletados: [
    {
      date: "Guayaquil, Ecuador / JUL 2024 - ENE 2026",
      title: "Posgrado, Maestría en ciberseguridad",
      institution: "Universidad Casa Grande",
      appreciation: "Aprobado con honores; Cum laude",
      description: [],
    },
    {
      date: "Guayaquil, Ecuador / OCT 2017- FEBR 2023",
      title: "Educación Superior, Ingeniería Mecatrónica",
      institution: "Escuela Superior Politécnica del Litoral (ESPOL)",
      description: [],
    },
    {
      date: "Guayaquil, Ecuador  / MAY 2005- FEBR 2017",
      title: "Primaria - Secundaria",
      institution: "Unidad Educativa FAE Nº2",
      description: [],
      //link: "https://twitch.tv/midudev",
    },
  ],
  certificados: {
    link: "https://drive.google.com/drive/folders/1k3Gb4c1tQa0eKYGnvWbXT8EdypvT9Jb-?usp=share_link",
    qr: rutaQR + "qr_certificados_link.png",
    titleLink: "Drive con certificados",
    title: "Cursos realizados",
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
  },
  publicaciones: [
    {
      title:
        "Comparison of Traditional ML Algorithms for Energy Consumption Prediction Models",
      authors: "R. Estrada, V. Asanza, D. Torres, I. Valeriano and D. Alvarado",
      description:
        " 2022 IEEE Future Networks World Forum (FNWF), Montreal, QC, Canada, 2022, pp. 232-237,",
      link: "https://ieeexplore.ieee.org/document/10056675",
      codigo: "doi: 10.1109/FNWF55208.2022.00048.",
      image: "",
      qr: rutaQR + "qr_publicaciones_link.png",
    },
  ],
  habilidades: [
    {
      name: "Lenguajes de programación",
      skills: ["JAVA", "Python", "C/C++", "HTML", "JavaScript", "PHP"],
      related: ["Node.js", "Laravel", "Jupyter Notebook", "Dataiku", "Astro", "Vue.js"],
    },
    {
      name: "Bases de datos",
      skills: ["MySQL", "Postgresql", "MongoDB", "Redis", "Meilisearch"],
      related: [
        "Supabase",
        "MongoDBCompass",
        "MongoDB Atlas",
        "Laragon",
        "XAMPP",
        "HeidiSQL",
        "PGAdmin4",
        "DBeaver"
      ],
    },
    {
      name: "Otras herramientas de desarrollo",
      skills: ["Git & GitHub", "Docker", "Cloudflare", "Copilot", "MATLAB & Simulink"],
    },
    {
      name: "Ciberseguridad",
      skills: [
        "ISO 27001",
        "OWASP Top 10",
        "Ley Orgánica de Protección de Datos Personales (Ecuador)",
        "Herramientas OSINT",
        "Shodan",
      ],
      related: [
        "Análisis de vulnerabilidades",
        "Gestión de riesgos",
        "Auditorías de seguridad",
      ],
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
      name: "Otras herramientas",
      skills: ["Paquete Office", "Notion", "Odoo", "Claude", "Copilot", "Canva"],
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
      name: "Habilidades personales",
      skills: [
        "Trabajo en equipo",
        "Compromiso en tareas",
        "Capacidad de aprendizaje",
        "Orientación a resultados",
      ],
    },
    {
      name: "Idiomas",
      skills: ["Español - Nativo", "Ingles - C1"],
    },
  ],
  proyectos: [
    {
      title: "Dron para monitoreo Térmico",
      description: [
        "Diseños CAD y circuitos con Arduino de un dron. Diseños CAD, circuitos y programa con Raspberry Pi de un sistema embebido que detecta presencia de cables, capturar imágenes térmicas y detectar si existen picos de temperatura.",
      ],
      link: "https://www.canva.com/design/DAFX9yXkbVk/DF8M5vSArvJTF0_a-fzVag/watch?utm_content=DAFX9yXkbVk&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink",
      github: "https://github.com/daap213/MonitoreoTermico",
      image: rutaProyect + "dron.webp",
      tags: [],
      qr: rutaQR + "qr_Dron_para_monitoreo_Térmico.png",
    },
    {
      title: "Simulación OPC en tiempo real",
      description: [
        "Simulación de un circuito en tiempo real, conectado por OPC a un interfaz de LABVIEW, para su monitoreo y control.",
      ],
      link: "https://www.canva.com/design/DAFJCVANN2g/aI2GtYXtZmk-CkhwHaSFEQ/watch?utm_content=DAFJCVANN2g&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink",
      github:
        "https://github.com/daap213/Simulacion-protocolo-OPC-en-tiempo-real",
      image: rutaProyect + "simulacionOPC.webp",
      tags: [],
      qr: rutaQR + "qr_Simulación_OPC_en_tiempo_real.png",
    },
    {
      title: "Control de bombas Proteus/Ubidots",
      description: [
        "Diseño de un sistema de bombas en el programa Proteus, controlado por un Atmega328p, y visualización en Ubidots del estado del sistema comunicados por un programa desarrollado en Python.",
      ],
      link: "https://www.canva.com/design/DAE1pn3Eg34/oXMn2FTiOz5Hzs9sH3YjGQ/watch?utm_content=DAE1pn3Eg34&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink",
      github: "https://github.com/daap213/Control-de-bombas-Proteus-",
      image: rutaProyect + "bombasUbidots.webp",
      tags: [],
      qr: rutaQR + "qr_Control_de_bombas_Proteus_Ubidots.png",
    },
    {
      title: "Adaptación de prótesis para rodilla",
      description: [
        "Diseño 3D de una rodilla y edición de una prótesis total de rodilla, utilizando el software 3D Slice y Blender para adaptar la prótesis de rodilla que ya existir a la rodilla de prueba.",
      ],
      link: "",
      github: "https://github.com/daap213/adaptation-of-knee-prosthesis",
      image: rutaProyect + "protesisRodilla.webp",
      tags: [],
      qr: rutaQR + "qr_Adaptación_de_prótesis_para_rodilla.png",
    },
    {
      title: "Control de bombeo LABVIEW",
      description: [
        "Diseño de una HMI para el control de un sistema de bombas, el cual cuenta con tres bombas. Dos bombas son las principales y la tercera es de respaldo en caso de que una se dañe o se deshabilite por mantenimiento. Cada bomba tiene su pulsador de marcha y paro, así como también su selector de habilitado o deshabilitado. El sistema tendrá funcionamiento manual y automático comandado por la señal enviada por un selector.",
      ],
      link: "",
      github: "https://github.com/daap213/Control-de-bombeo-LABVIEW",
      image: rutaProyect + "bombasLabview.webp",
      tags: [],
      qr: rutaQR + "qr_Control_de_bombeo_LABVIEW.png",
    },
    {
      title: "Simulación Dinámica de Mecanismo",
      description: [
        "Se diseña un mecanismo donde el eje de un molino recibe la potencia y velocidad necesaria por medio de poleas-cadenas, a su vez el eje que transmite la potencia a la polea con cadena recibe la potencia de entrada por medio de un juego de poleas con banda en V, ademas de estar apoyado en 2 rodamientos.",
      ],
      link: "",
      github: "https://github.com/daap213/SimulacionDinamicaMecanismo",
      image: rutaProyect + "ejeMolino.webp",
      tags: [],
      qr: rutaQR + "qr_Simulación_Dinámica_de_Mecanismo.png",
    },
    {
      title: "Diseño de una apiladora de arroz",
      description: [
        "Diseño y análisis de viabilidad de una apiladora de arroz usando energía renovable para su implementación en una comunidad agrícola en desarrollo.",
      ],
      link: "",
      github:
        "https://github.com/daap213/Practica-comunitaria-apiladora-de-arroz",
      image: rutaProyect + "apiladoraArroz.webp",
      tags: [],
      qr: rutaQR + "qr_Diseño_de_una_apiladora_de_arroz.png",
    },
    {
      title: "Alimentador de mascotas automático",
      description: [
        "Proyecto de alimentador de mascotas automático controlado por una aplicación móvil que permita programar los horarios de comida.",
      ],
      link: "https://youtu.be/xK9o9PrH0lI",
      github: "https://github.com/daap213/Alimentador-de-mascotas",
      image: rutaProyect + "petFeeder.webp",
      tags: [],
      qr: rutaQR + "qr_Alimentador_de_mascotas_automático.png",
    },
    {
      title: "Proceso de fabricación flexible",
      description: [
        "Rediseñar el sistema de fabricación de botellas de una empresa, para la reducción de los tiempos de producción asi como el aumento de la flexibilidad del sistema y la rentabilidad de la empresa.",
      ],
      link: "https://www.canva.com/design/DAFLZCEZKGQ/C2buCKb0bE4fJlOO9KrR9w/watch?utm_content=DAFLZCEZKGQ&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink",
      github: "https://github.com/daap213/Flexible-Manufacturing-Process",
      image: rutaProyect + "fabricacionFlexible.webp",
      tags: [],
      qr: rutaQR + "qr_Proceso_de_fabricación_flexible.png",
    },
    {
      title: "Calidad de Producción de Azúcar",
      description: [
        "<strong>Objetivo:</strong><br />Mejorar el sistema de producción de calidad de azúcar mediante la modificación en las etapas de fabricación evitando el frecuente rechazo del producto al momento de su entrega.<br /><strong>Problemática:</strong><br />Una planta encargada de generar azúcar se conforma por una serie de etapas que contienen ciertos procesos que hacen la producción de forma eficiente:<br />*Cristalización<br />*Entrega y extracción de jugo<br />*Evaporación<br />*Purificación del jugo<br />La planta no cuenta con controles de la calidad del azúcar, por ello los clientes desean realizar pruebas de calidad en base a la toma de muestras aleatorias de manera que, si el producto pasa las pruebas, se acepte el pedido, por otra parte, si el producto no pasa las pruebas de calidad, el producto será devuelto en su totalidad independientemente del tamaño del pedido.",
      ],
      link: "https://www.youtube.com/watch?v=AorRajwlaNI",
      github: "https://github.com/daap213/Monitoreo-produccion-de-azucar",
      image: rutaProyect + "sinfoto.webp",
      tags: [],
      qr: rutaQR + "qr_Calidad_de_Producción_de_Azúcar.png",
    },
  ],
  referencias: [
    {
      nombre: "Ph.D. Víctor Manuel Asanza",
      cargo: "Docente de la facultad de FIEC",
      empresa: "Universidad ESPOL",
      telefono: "+593 98 265 9680",
      correo: "",
    },
    {
      nombre: "Ing. Tamara García",
      cargo: "Supervisor",
      empresa: "Delta Delfini",
      telefono: "+593 98 459 1065",
      correo: "tamikgr@outlook.con",
    },
    {
      nombre: "Mgs. Alexandra Pérez Rivera",
      cargo: "Docente de la Carrera de Turismo",
      empresa: "Universidad ECOTEC",
      telefono: "+593 99 457 8095",
      correo: "",
    },
    {
      nombre: "Darwin León",
      cargo: "Gerente",
      empresa: "Edu4lat",
      telefono: "+593 98 480 5355",
      correo: "",
    },
  ],
  previewFooter: {
    name: nombre,
    logo: raizApp + "img/me_panoramico.webp",
    frase:
      "Dios creó la Tierra, la naturaleza, los animales, la humanidad… Y al ingeniero para que se encargue de todo lo demás.",
  },
};

/////////////////////////////////////////
//////////////// Ingles ////////////////
////////////////////////////////////////

export const en = {
  raizApp: raizApp,
  nombre: nombre,
  siglasNombre: siglasNombre,
  mi_web: "portafolio.daaptech.org/",
  tituloUniversidad: "Master in Cybersecurity | Mechatronic Engineer",
  nombreTitulo: "Ing. " + nombre,
  titleWeb:
    "Portfolio: " +
    nombre +
    " - Master in Cybersecurity | Mechatronic Engineer, Developer and Programmer",
  descriptionWeb:
    "Graduated from the Mechatronics degree at ESPOL University, in Ecuador.",
  ubicacion: "Ecuador - Guayaquil",
  cumpleaños: "March 24, 1999",
  correo: correo,
  git_user: git_user,
  linkedin_user: linkedin_user,
  work_state: "Remote work",
     sobremi: [
"I am Ecuadorian, a <strong>Mechatronics Engineer and Master's Graduate in Cybersecurity</strong>, passionate about technology, innovation, and solving complex challenges. I have experience in the design, development, and implementation of high-impact technological solutions, integrating <strong>software development, data analytics, artificial intelligence, and cybersecurity</strong> to deliver value in both business and industrial environments.",

"My profile combines a strong technical foundation with a business-oriented perspective, enabling me to contribute throughout the entire lifecycle of technology solutions: from data acquisition and processing to application development, process automation, and digital asset protection. I have experience in <strong>full-stack development, machine learning, systems architecture, information security, risk management, security auditing, and IoT systems</strong>. In addition, I have led technical initiatives and coordinated multidisciplinary projects, fostering collaboration across teams and delivering solutions aligned with organizational objectives.",

"I complement my technical expertise with effective communication in international environments, supported by professional English proficiency (C1), allowing me to collaborate with global teams, technologies, and documentation. I maintain a continuous learning mindset and promote the responsible adoption of artificial intelligence, balancing ethical considerations with practical applications to enhance productivity, optimize processes, and support data-driven decision-making. I am recognized for my analytical thinking, technical leadership, results-oriented approach, collaborative mindset, and commitment to professional excellence."
],
  experiencias: [
    {
      date: "MAY 2023 - Present",
      title: "General Specialist",
      company: "Information Tecnology XOA S. A.",
      description: [
        "Full-stack development: design and implementation of secure web applications using modern technologies and coding best practices.",
        "Machine Learning model development and integration with company APIs and enterprise services, including production ML pipelines.",
        "Data analysis and processing: defining strategies for acquisition, cleaning, preprocessing, and handling large-scale data volumes with specialized tools.",
        "Information security: implementing protection measures, code audits, input validation, secure credential management, and service hardening.",
        "Security improvements: identifying vulnerabilities, assessing risks, designing mitigation solutions, and ensuring regulatory compliance.",
        "Technical support: field work for diagnostics, problem detection, and critical infrastructure issue resolution at client sites.",
        "Proactive monitoring: continuous supervision of services, servers, and production applications to ensure availability, performance, and security.",
        "Version updates and migrations: planning and implementing secure updates with minimal downtime and comprehensive validation.",
        "Internal tool development: creating company-specific services and utilities to optimize operational processes.",
        "Quality control: functional, security, and performance testing for embedded systems and web applications before release.",
      ],
      link: "",
    },
    {
      date: "MAR 2022 - APR 2022",
      title: "Research Assistant (Development Technician)",
      company: "Center for Information Technologies (CTI)",
      description: [
        "Participation in a research project focused on predicting the energy consumption of Data Center infrastructure using Machine Learning techniques.",
        "Design and development of Jupyter notebooks for data acquisition, cleaning, preprocessing, and exploratory data analysis from monitoring systems.",
        "Implementation, training, and comparative evaluation of different predictive models, using performance metrics to determine the most efficient solution.",
        "Optimization and improvement of a data collection application, enhancing the quality, consistency, and availability of information used in analytical models.",
        "Collaboration in research activities that contributed to the scientific publication presented at IEEE Future Networks World Forum (FNWF 2022)."
      ]
    },
    {
      date: "MAY 2021 - JUL 2021",
      title: "Web Developer",
      company: "Edu4Lab",
      description: [
        "Development of an educational web platform using Laravel under a scalable and maintainable system architecture.",
        "Implementation of user management, profile, and role modules, ensuring proper access control based on user responsibilities.",
        "Development of features for managing courses, books, online assessments, and academic staff.",
        "Design and integration of business logic and database for centralized management of educational content.",
        "Participation in functional testing and requirements validation to ensure proper platform operation."
      ]
    }
  ],
  gradosCompletados: [
    {
      date: "Guayaquil, Ecuador / JUL 2024 - JAN 2026",
      title: "Postgraduate, Master in Cybersecurity",
      institution: "Universidad Casa Grande",
      appreciation: "Passed with honors; Cum laude",
      description: [],
    },
    {
      date: "Guayaquil, Ecuador / OCT 2017 - FEB 2023",
      title: "Higher Education, Mechatronics Engineering",
      institution: "Escuela Superior Politécnica del Litoral (ESPOL)",
      description: [],
    },
    {
      date: "Guayaquil, Ecuador / MAY 2005 - FEB 2017",
      title: "Primary - Secondary Education",
      institution: "Unidad Educativa FAE Nº2",
      description: [],
      //"link": "https://twitch.tv/midudev"
    },
  ],
  certificados: {
    link: "https://drive.google.com/drive/folders/1k3Gb4c1tQa0eKYGnvWbXT8EdypvT9Jb-?usp=share_link",
    qr: rutaQR + "qr_certificados_link.png",
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
  },
  publicaciones: [
    {
      title:
        "Comparison of Traditional ML Algorithms for Energy Consumption Prediction Models",
      authors: "R. Estrada, V. Asanza, D. Torres, I. Valeriano and D. Alvarado",
      description:
        " 2022 IEEE Future Networks World Forum (FNWF), Montreal, QC, Canada, 2022, pp. 232-237,",
      link: "https://ieeexplore.ieee.org/document/10056675",
      codigo: "doi: 10.1109/FNWF55208.2022.00048.",
      image: "",
      qr: rutaQR + "qr_publicaciones_link.png",
    },
  ],
  habilidades: [
    {
      name: "Programming languages",
      skills: ["JAVA", "Python", "C/C++", "HTML", "JavaScript", "PHP"],
      related: ["Node.js", "Laravel", "Jupyter Notebook", "Dataiku", "Astro", "Vue.js"],
    },
    {
      name: "Databases",
      skills: ["MySQL", "Postgresql", "MongoDB", "Redis", "Meilisearch"],
      related: [
        "Supabase",
        "MongoDBCompass",
        "MongoDB Atlas",
        "Laragon",
        "XAMPP",
        "HeidiSQL",
        "PGAdmin4",
        "DBeaver"
      ],
    },
    {
      name: "Other development tools",
      skills: ["Git & GitHub", "Docker", "Cloudflare", "Copilot", "MATLAB & Simulink"],
    },
    {
      name: "Cybersecurity",
      skills: [
        "ISO 27001",
        "OWASP Top 10",
        "Personal Data Protection Law (Ecuador)",
        "OSINT Tools",
        "Shodan",
      ],
      related: [
        "Vulnerability analysis",
        "Risk management",
        "Security audits",
      ],
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
      name: "Other tools",
      skills: ["Paquete Office", "Notion", "Odoo", "Claude", "Copilot", "Canva"],
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
      name: "Personal skills",
      skills: [
        "Teamwork",
        "Commitment to tasks",
        "Learning capacity",
        "Orientation to results",
      ],
    },
    {
      name: "Languages",
      skills: ["Spanish - Native", "English - C1"],
    },
  ],
  proyectos: [
    {
      title: "Thermal Monitoring Drone",
      description: [
        "CAD designs and Arduino circuits for a drone. CAD designs, circuits, and Raspberry Pi program for an embedded system that detects cable presence, captures thermal images, and detects temperature spikes.",
      ],
      link: "https://www.canva.com/design/DAFX9yXkbVk/DF8M5vSArvJTF0_a-fzVag/watch?utm_content=DAFX9yXkbVk&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink",
      github: "https://github.com/daap213/MonitoreoTermico",
      image: rutaProyect + "dron.webp",
      tags: [],
      qr: rutaQR + "qr_Dron_para_monitoreo_Térmico.png",
    },
    {
      title: "Real-time OPC Simulation",
      description: [
        "Real-time circuit simulation, connected via OPC to a LABVIEW interface, for monitoring and control.",
      ],
      link: "https://www.canva.com/design/DAFJCVANN2g/aI2GtYXtZmk-CkhwHaSFEQ/watch?utm_content=DAFJCVANN2g&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink",
      github:
        "https://github.com/daap213/Simulacion-protocolo-OPC-en-tiempo-real",
      image: rutaProyect + "simulacionOPC.webp",
      tags: [],
      qr: rutaQR + "qr_Simulación_OPC_en_tiempo_real.png",
    },
    {
      title: "Proteus/Ubidots Pump Control",
      description: [
        "Design of a pump system in Proteus, controlled by an Atmega328p, and visualization in Ubidots of the system's status communicated by a program developed in Python.",
      ],
      link: "https://www.canva.com/design/DAE1pn3Eg34/oXMn2FTiOz5Hzs9sH3YjGQ/watch?utm_content=DAE1pn3Eg34&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink",
      github: "https://github.com/daap213/Control-de-bombas-Proteus-",
      image: rutaProyect + "bombasUbidots.webp",
      tags: [],
      qr: rutaQR + "qr_Control_de_bombas_Proteus_Ubidots.png",
    },
    {
      title: "Knee Prosthesis Adaptation",
      description: [
        "3D design of a knee and editing of a total knee prosthesis, using Slice 3D and Blender software to adapt the existing knee prosthesis to the test knee.",
      ],
      link: "",
      github: "https://github.com/daap213/adaptation-of-knee-prosthesis",
      image: rutaProyect + "protesisRodilla.webp",
      tags: [],
      qr: rutaQR + "qr_Adaptación_de_prótesis_para_rodilla.png",
    },
    {
      title: "LABVIEW Pump Control",
      description: [
        "Design of an HMI for the control of a pump system, which has three pumps. Two pumps are primary and the third is backup in case one fails or is disabled for maintenance. Each pump has its start and stop pushbuttons, as well as its enable or disable selector. The system will have manual and automatic operation commanded by the signal sent by a selector.",
      ],
      link: "",
      github: "https://github.com/daap213/Control-de-bombeo-LABVIEW",
      image: rutaProyect + "bombasLabview.webp",
      tags: [],
      qr: rutaQR + "qr_Control_de_bombeo_LABVIEW.png",
    },
    {
      title: "Dynamic Mechanism Simulation",
      description: [
        "A mechanism is designed where the shaft of a mill receives the necessary power and speed through pulley-chains. In turn, the shaft that transmits power to the pulley with chain receives the input power through a set of V-belt pulleys, as well as being supported by 2 bearings.",
      ],
      link: "",
      github: "https://github.com/daap213/SimulacionDinamicaMecanismo",
      image: rutaProyect + "ejeMolino.webp",
      tags: [],
      qr: rutaQR + "qr_Simulación_Dinámica_de_Mecanismo.png",
    },
    {
      title: "Rice Stacker Design",
      description: [
        "Design and feasibility analysis of a rice stacker using renewable energy for implementation in a developing agricultural community.",
      ],
      link: "",
      github:
        "https://github.com/daap213/Practica-comunitaria-apiladora-de-arroz",
      image: rutaProyect + "apiladoraArroz.webp",
      tags: [],
      qr: rutaQR + "qr_Diseño_de_una_apiladora_de_arroz.png",
    },
    {
      title: "Automatic Pet Feeder",
      description: [
        "Automatic pet feeder project controlled by a mobile application that allows scheduling feeding times.",
      ],
      link: "https://youtu.be/xK9o9PrH0lI",
      github: "https://github.com/daap213/Alimentador-de-mascotas",
      image: rutaProyect + "petFeeder.webp",
      tags: [],
      qr: rutaQR + "qr_Alimentador_de_mascotas_automático.png",
    },
    {
      title: "Flexible Manufacturing Process",
      description: [
        "Redesigning the bottle manufacturing system of a company to reduce production times, increase system flexibility, and improve company profitability.",
      ],
      link: "https://www.canva.com/design/DAFLZCEZKGQ/C2buCKb0bE4fJlOO9KrR9w/watch?utm_content=DAFLZCEZKGQ&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink",
      github: "https://github.com/daap213/Flexible-Manufacturing-Process",
      image: rutaProyect + "fabricacionFlexible.webp",
      tags: [],
      qr: rutaQR + "qr_Proceso_de_fabricación_flexible.png",
    },
    {
      title: "Sugar Production Quality",
      description: [
        "<strong>Objective:</strong><br />Improve sugar production quality system by modifying manufacturing stages to avoid frequent product rejection upon delivery.<br /><strong>Issue:</strong><br />A sugar-producing plant consists of several stages containing certain processes that make production efficient:<br />*Crystallization<br />*Juice delivery and extraction<br />*Evaporation<br />*Juice purification<br />The plant lacks sugar quality controls, so customers want quality tests based on random sampling so that if the product passes the tests, the order is accepted; otherwise, the product will be returned in full regardless of the order size.",
      ],
      link: "https://www.youtube.com/watch?v=AorRajwlaNI",
      github: "https://github.com/daap213/Monitoreo-produccion-de-azucar",
      image: rutaProyect + "sinfoto.webp",
      tags: [],
      qr: rutaQR + "qr_Calidad_de_Producción_de_Azúcar.png",
    },
  ],
  referencias: [
    {
      nombre: "Ph.D. Víctor Manuel Asanza",
      cargo: "Professor of the FIEC faculty",
      empresa: "ESPOL University",
      telefono: "+593 98 265 9680",
      correo: "",
    },
    {
      nombre: "Ing. Tamara García",
      cargo: "Supervisor",
      empresa: "Delta Delfini",
      telefono: "+593 98 459 1065",
      correo: "tamikgr@outlook.con",
    },
    {
      nombre: "Mgs. Alexandra Pérez Rivera",
      cargo: "Tourism Course Teacher",
      empresa: "ECOTEC University",
      telefono: "+593 99 457 8095",
      correo: "",
    },
    {
      nombre: "Darwin León",
      cargo: "Manager",
      empresa: "Edu4lat",
      telefono: "+593 98 480 5355",
      correo: "",
    },
  ],
  previewFooter: {
    name: nombre,
    logo: raizApp + "img/me_panoramico.webp",
    frase:
      "God created the Earth, nature, animals, humanity... And the engineer to take care of everything else.",
  },
};
