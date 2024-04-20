//   raizApp = "/" para local
//   raizApp = "/Portafolio_Astro/"  para servidor

export const raizApp = "/Portafolio_Astro/"
const rutaProyect = raizApp + "img/projects/"
export const rutaQR = raizApp + "img/qr/"
const nombre = "Daniel Alvarado Peláez"
const siglasNombre = "DAAP"
const git_user = "daap213"
const linkedin_user = "daniel-alvarado-peláez"
const correo = "daap21.3@gmail.com"

//////////////////////////////////////////
//////////////// Español ////////////////
////////////////////////////////////////

export const es = {
    raizApp: raizApp,
    nombre: nombre,
    siglasNombre: siglasNombre,
    mi_web: "daap213.github.io/Portafolio_Astro/",
    tituloUniversidad: "Ingeniero Mecatrónico",
    nombreTitulo: "Ing. " + nombre,
    titleWeb: "Portafolio: " + nombre + " - Ingeniero Mecatrónico, Desarrollador y Programador",
    descriptionWeb: "Graduado de la carrera Mecatrónica en la universidad ESPOL, en Ecuador.",
    ubicacion: "Ecuador - Guayaquil",
    cumpleaños: "24 de Marzo del 1999",
    correo: correo,
    git_user: git_user,
    linkedin_user: linkedin_user,
    work_state: "Trabajo remoto",
    sobremi: [
        "Soy ecuatoriano, <strong>Ingeniero Mecatrónico</strong> apasionado por el mundo tecnológico y con ello la posibilidad de ser parte de él creando mis propios proyectos.",
        "Cuento con habilidades y experiencia relacionada a <strong>diseño 3D, programación web y aplicaciones, análisis de datos, ciencia de datos, y desarrollo de sistemas embebidos</strong>. Capaz de trabajar y aprender de forma autónoma, predispuesto a trabajar en equipos multidisciplinarios para compartir, mejorar o aprender conocimientos varios.",
    ],
    experiencias: [
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
            date: "MAR 2022 - ABR 2022",
            title: "Ayudante de investigación (Técnico de desarrollo)",
            company: "Centro de Tecnologías de Información (CTI)",
            description: [
                "Desarrollo de modelos de predicción para el consumo energético de la infraestructura de un Data Center, desarrollando Jupyter notebooks para el preprocesado, procesado de datos, ejecución de los diferentes modelos de ML y comparación de los resultados.",
                "Revisión y mejoramiento de aplicación para la obtención de datos de los equipos.",
            ],
            //link: "https://twitch.tv/midudev",
        },
        {
            date: "MAY 2021 - JUL 2021",
            title: "Programador web",
            company: "Edu4lab",
            description: [
                "Diseño con el framework Laravel, Se desarrolló una  plataforma web educativa, con las funcionalidades de crear, perfiles y roles, y pruebas online, asociadas a libros, cursos y encargados.",
            ],
            link: ""
        },
    ],
    gradosCompletados: [
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
    ],
    certificados:
    {
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
        }
    ],
    habilidades: [
        {
            name: "Lenguajes de programación",
            skills: ["JAVA", "Python", "C/C++", "HTML", "JavaScript", "PHP"],
            related: ["Node.js", "Laravel", "Jupyter Notebook"],
        },
        {
            name: "Bases de datos",
            skills: ["MySQL", "Postgresql", "MongoDB", "Redis"],
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
            qr: rutaQR + "qr_Dron_para_monitoreo_Térmico.png"
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
            qr: rutaQR + "qr_Simulación_OPC_en_tiempo_real.png"
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
            qr: rutaQR + "qr_Control_de_bombas_Proteus_Ubidots.png"
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
            qr: rutaQR + "qr_Adaptación_de_prótesis_para_rodilla.png"
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
            qr: rutaQR + "qr_Control_de_bombeo_LABVIEW.png"
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
            qr: rutaQR + "qr_Simulación_Dinámica_de_Mecanismo.png"
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
            qr: rutaQR + "qr_Diseño_de_una_apiladora_de_arroz.png"
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
            qr: rutaQR + "qr_Alimentador_de_mascotas_automático.png"
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
            qr: rutaQR + "qr_Proceso_de_fabricación_flexible.png"
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
            qr: rutaQR + "qr_Calidad_de_Producción_de_Azúcar.png"
        },
    ],
    previewFooter: {
        name: nombre,
        logo: raizApp + "img/me_panoramico.webp",
        frase:
            "Dios creó la Tierra, la naturaleza, los animales, la humanidad… Y al ingeniero para que se encargue de todo lo demás.",
    },
}

/////////////////////////////////////////
//////////////// Ingles ////////////////
////////////////////////////////////////

export const en = {
    raizApp: raizApp,
    nombre: nombre,
    siglasNombre: siglasNombre,
    mi_web: "daap213.github.io/Portafolio_Astro/",
    tituloUniversidad: "Mechatronic Engineer",
    nombreTitulo: "Ing. " + nombre,
    titleWeb: "Portafolio: " + nombre + " - Mechatronic Engineer, Developer and Programmer",
    descriptionWeb: "Graduated from the Mechatronics degree at ESPOL University, in Ecuador.",
    ubicacion: "Ecuador - Guayaquil",
    cumpleaños: "March 24, 1999",
    correo: correo,
    git_user: git_user,
    linkedin_user: linkedin_user,
    work_state: "Remote work",
    sobremi: [
        "I am Ecuadorian, <strong>Mechatronic Engineer</strong> passionate about the technological world and with it the possibility of being part of it creating my own projects.",
        "I have skills and experience related to <strong>3D design, web and application programming, data analysis, data science, and embedded systems development</strong>. Able to work and learn autonomously, predisposed to work in multidisciplinary teams to share, improve or learn various knowledge.",
    ],
    experiencias: [
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
    ],
    gradosCompletados: [
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
    ],
    certificados:
    {
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
        }
    ],
    habilidades: [
        {
            name: "Programming languages",
            skills: ["JAVA", "Python", "C/C++", "HTML", "JavaScript", "PHP"],
            related: ["Node.js", "Laravel", "Jupyter Notebook"],
        },
        {
            name: "Databases",
            skills: ["MySQL", "Postgresql", "MongoDB", "Redis"],
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
                "CAD designs and Arduino circuits for a drone. CAD designs, circuits, and Raspberry Pi program for an embedded system that detects cable presence, captures thermal images, and detects temperature spikes."
            ],
            link: "https://www.canva.com/design/DAFX9yXkbVk/DF8M5vSArvJTF0_a-fzVag/watch?utm_content=DAFX9yXkbVk&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink",
            github: "https://github.com/daap213/MonitoreoTermico",
            image: rutaProyect + "dron.webp",
            tags: [],
            qr: rutaQR + "qr_Dron_para_monitoreo_Térmico.png"
        },
        {
            title: "Real-time OPC Simulation",
            description: [
                "Real-time circuit simulation, connected via OPC to a LABVIEW interface, for monitoring and control."
            ],
            link: "https://www.canva.com/design/DAFJCVANN2g/aI2GtYXtZmk-CkhwHaSFEQ/watch?utm_content=DAFJCVANN2g&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink",
            github: "https://github.com/daap213/Simulacion-protocolo-OPC-en-tiempo-real",
            image: rutaProyect + "simulacionOPC.webp",
            tags: [],
            qr: rutaQR + "qr_Simulación_OPC_en_tiempo_real.png"
        },
        {
            title: "Proteus/Ubidots Pump Control",
            description: [
                "Design of a pump system in Proteus, controlled by an Atmega328p, and visualization in Ubidots of the system's status communicated by a program developed in Python."
            ],
            link: "https://www.canva.com/design/DAE1pn3Eg34/oXMn2FTiOz5Hzs9sH3YjGQ/watch?utm_content=DAE1pn3Eg34&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink",
            github: "https://github.com/daap213/Control-de-bombas-Proteus-",
            image: rutaProyect + "bombasUbidots.webp",
            tags: [],
            qr: rutaQR + "qr_Control_de_bombas_Proteus_Ubidots.png"
        },
        {
            title: "Knee Prosthesis Adaptation",
            description: [
                "3D design of a knee and editing of a total knee prosthesis, using Slice 3D and Blender software to adapt the existing knee prosthesis to the test knee."
            ],
            link: "",
            github: "https://github.com/daap213/adaptation-of-knee-prosthesis",
            image: rutaProyect + "protesisRodilla.webp",
            tags: [],
            qr: rutaQR + "qr_Adaptación_de_prótesis_para_rodilla.png"
        },
        {
            title: "LABVIEW Pump Control",
            description: [
                "Design of an HMI for the control of a pump system, which has three pumps. Two pumps are primary and the third is backup in case one fails or is disabled for maintenance. Each pump has its start and stop pushbuttons, as well as its enable or disable selector. The system will have manual and automatic operation commanded by the signal sent by a selector."
            ],
            link: "",
            github: "https://github.com/daap213/Control-de-bombeo-LABVIEW",
            image: rutaProyect + "bombasLabview.webp",
            tags: [],
            qr: rutaQR + "qr_Control_de_bombeo_LABVIEW.png"
        },
        {
            title: "Dynamic Mechanism Simulation",
            description: [
                "A mechanism is designed where the shaft of a mill receives the necessary power and speed through pulley-chains. In turn, the shaft that transmits power to the pulley with chain receives the input power through a set of V-belt pulleys, as well as being supported by 2 bearings."
            ],
            link: "",
            github: "https://github.com/daap213/SimulacionDinamicaMecanismo",
            image: rutaProyect + "ejeMolino.webp",
            tags: [],
            qr: rutaQR + "qr_Simulación_Dinámica_de_Mecanismo.png"
        },
        {
            title: "Rice Stacker Design",
            description: [
                "Design and feasibility analysis of a rice stacker using renewable energy for implementation in a developing agricultural community."
            ],
            link: "",
            github: "https://github.com/daap213/Practica-comunitaria-apiladora-de-arroz",
            image: rutaProyect + "apiladoraArroz.webp",
            tags: [],
            qr: rutaQR + "qr_Diseño_de_una_apiladora_de_arroz.png"
        },
        {
            title: "Automatic Pet Feeder",
            description: [
                "Automatic pet feeder project controlled by a mobile application that allows scheduling feeding times."
            ],
            link: "https://youtu.be/xK9o9PrH0lI",
            github: "https://github.com/daap213/Alimentador-de-mascotas",
            image: rutaProyect + "petFeeder.webp",
            tags: [],
            qr: rutaQR + "qr_Alimentador_de_mascotas_automático.png"
        },
        {
            title: "Flexible Manufacturing Process",
            description: [
                "Redesigning the bottle manufacturing system of a company to reduce production times, increase system flexibility, and improve company profitability."
            ],
            link: "https://www.canva.com/design/DAFLZCEZKGQ/C2buCKb0bE4fJlOO9KrR9w/watch?utm_content=DAFLZCEZKGQ&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink",
            github: "https://github.com/daap213/Flexible-Manufacturing-Process",
            image: rutaProyect + "fabricacionFlexible.webp",
            tags: [],
            qr: rutaQR + "qr_Proceso_de_fabricación_flexible.png"
        },
        {
            title: "Sugar Production Quality",
            description: [
                "<strong>Objective:</strong><br />Improve sugar production quality system by modifying manufacturing stages to avoid frequent product rejection upon delivery.<br /><strong>Issue:</strong><br />A sugar-producing plant consists of several stages containing certain processes that make production efficient:<br />*Crystallization<br />*Juice delivery and extraction<br />*Evaporation<br />*Juice purification<br />The plant lacks sugar quality controls, so customers want quality tests based on random sampling so that if the product passes the tests, the order is accepted; otherwise, the product will be returned in full regardless of the order size."
            ],
            link: "https://www.youtube.com/watch?v=AorRajwlaNI",
            github: "https://github.com/daap213/Monitoreo-produccion-de-azucar",
            image: rutaProyect + "sinfoto.webp",
            tags: [],
            qr: rutaQR + "qr_Calidad_de_Producción_de_Azúcar.png"
        }
    ],
    previewFooter: {
        name: nombre,
        logo: raizApp + "img/me_panoramico.webp",
        frase:
            "God created the Earth, nature, animals, humanity... And the engineer to take care of everything else.",
    },
}