// Vinculo entre la configuracion (datos) y los componentes (codigo).
//
// data/secciones.*.json referencia tipos e iconos POR NOMBRE; aqui se traducen
// esos nombres a componentes reales. Es el unico sitio donde un dato JSON se
// convierte en un .astro.
//
// Este fichero SI importa .astro, asi que solo pueden cargarlo las paginas y
// los tests que usan el Container API de Astro. El administrador, los scripts
// de node y Playwright deben quedarse en tipos.js / locales.js / cv.js.

import { VARIANTE_BASE } from "./disenos.js";

// Iconos de seccion
import ProfileCheck from "@/components/icons/ProfileCheck.astro";
import Briefcase from "@/components/icons/Briefcase.astro";
import Code from "@/components/icons/Code.astro";
import Publication from "@/components/icons/Publication.astro";
import Education from "@/components/icons/Education.astro";
import Skill from "@/components/icons/Skill.astro";
import Certificado from "@/components/icons/Certificado.astro";

// Iconos de enlace
import CV from "@/components/icons/CV.astro";
import Mail from "@/components/icons/Mail.astro";
import LinkedIn from "@/components/icons/LinkedIn.astro";
import GitHub from "@/components/icons/GitHub.astro";

// Iconos de etiqueta de proyecto
import NextJS from "@/components/icons/NextJS.astro";
import Tailwind from "@/components/icons/Tailwind.astro";

// Renderizadores de la web
import Hero from "@/components/seccions/Hero.astro";
import Texto from "@/components/seccions/Texto.astro";
import Experience from "@/components/seccions/Experience.astro";
import Projects from "@/components/seccions/Projects.astro";
import Publications from "@/components/seccions/Publications.astro";
import EducationSeccion from "@/components/seccions/Education.astro";
import AllSkills from "@/components/seccions/AllSkills.astro";
import Certificados from "@/components/seccions/Certificados.astro";
import PreviewFooter from "@/components/seccions/PreviewFooter.astro";

// Variantes de diseño. Viven en components/disenos/<variante>/ para no tener que
// renombrar nada de seccions/, que sigue siendo la variante "clasico".
import PresentacionEditorial from "@/components/disenos/editorial/Presentacion.astro";
import ProyectosEditorial from "@/components/disenos/editorial/Proyectos.astro";
import PublicacionesEditorial from "@/components/disenos/editorial/Publicaciones.astro";
import CitaEditorial from "@/components/disenos/editorial/Cita.astro";

import PresentacionTerminal from "@/components/disenos/terminal/Presentacion.astro";
import ProyectosTerminal from "@/components/disenos/terminal/Proyectos.astro";
import HabilidadesTerminal from "@/components/disenos/terminal/Habilidades.astro";
import CronologiaTerminal from "@/components/disenos/terminal/Cronologia.astro";

import PresentacionTarjetas from "@/components/disenos/tarjetas/Presentacion.astro";
import ProyectosTarjetas from "@/components/disenos/tarjetas/Proyectos.astro";
import HabilidadesTarjetas from "@/components/disenos/tarjetas/Habilidades.astro";
import CertificadosTarjetas from "@/components/disenos/tarjetas/Certificados.astro";

import PresentacionNeon from "@/components/disenos/neon/Presentacion.astro";
import ProyectosNeon from "@/components/disenos/neon/Proyectos.astro";
import PublicacionesNeon from "@/components/disenos/neon/Publicaciones.astro";
import CitaNeon from "@/components/disenos/neon/Cita.astro";

// Renderizadores de impresion del CV (mundo aparte: sin Tailwind ni Layout)
import PerfilCv from "@/components/cv/DatosPersonales.astro";
import TextoCv from "@/components/cv/Texto.astro";
import CronologiaCv from "@/components/cv/Cronologia.astro";
import FormacionCv from "@/components/cv/Formacion.astro";
import ProyectosCv from "@/components/cv/Proyectos.astro";
import PublicacionesCv from "@/components/cv/Publicaciones.astro";
import HabilidadesCv from "@/components/cv/Habilidades.astro";
import CertificadosCv from "@/components/cv/Certificados.astro";
import ReferenciasCv from "@/components/cv/Referencias.astro";

/** Iconos disponibles para `icono` en secciones.*.json y para los enlaces del hero.
 *  Los NOMBRES viven aparte en iconos.js, que si pueden cargar el administrador
 *  y validar.js; aqui solo se les pone cara. La prueba de esquema comprueba que
 *  las dos listas coincidan. */
export const ICONOS = {
  ProfileCheck,
  Briefcase,
  Code,
  Publication,
  Education,
  Skill,
  Certificado,
  CV,
  Mail,
  LinkedIn,
  GitHub,
  NextJS,
  Tailwind,
};

/** tipo de seccion -> variante -> componente que la pinta en la web.
 *
 *  Dos niveles desde que existen los disenos: un tipo puede pintarse de varias
 *  formas y es data/disenos.json quien elige. Los NOMBRES de variante viven en
 *  disenos.js (que no puede importar .astro); aqui se les pone cara, igual que
 *  iconos.js / ICONOS. components.test.js comprueba que las dos listas casen.
 *
 *  Todo tipo debe traer al menos `clasico`: es la variante a la que se cae
 *  cuando un diseno no tiene la suya. */
export const COMPONENTES_WEB = {
  presentacion: {
    clasico: Hero,
    editorial: PresentacionEditorial,
    terminal: PresentacionTerminal,
    tarjetas: PresentacionTarjetas,
    neon: PresentacionNeon,
  },
  texto: { clasico: Texto },
  cronologia: { clasico: Experience, terminal: CronologiaTerminal },
  formacion: { clasico: EducationSeccion },
  proyectos: {
    clasico: Projects,
    editorial: ProyectosEditorial,
    terminal: ProyectosTerminal,
    tarjetas: ProyectosTarjetas,
    neon: ProyectosNeon,
  },
  publicaciones: {
    clasico: Publications,
    editorial: PublicacionesEditorial,
    neon: PublicacionesNeon,
  },
  habilidades: {
    clasico: AllSkills,
    terminal: HabilidadesTerminal,
    tarjetas: HabilidadesTarjetas,
  },
  certificados: { clasico: Certificados, tarjetas: CertificadosTarjetas },
  cita: { clasico: PreviewFooter, editorial: CitaEditorial, neon: CitaNeon },
};

/** tipo de seccion -> componente de impresion del CV. */
export const COMPONENTES_CV = {
  perfil: PerfilCv,
  texto: TextoCv,
  cronologia: CronologiaCv,
  formacion: FormacionCv,
  proyectos: ProyectosCv,
  publicaciones: PublicacionesCv,
  habilidades: HabilidadesCv,
  certificados: CertificadosCv,
  referencias: ReferenciasCv,
};

/** Etiquetas de proyecto disponibles (hoy ningun proyecto usa ninguna). */
export const ETIQUETAS = {
  NEXT: { name: "Next.js", class: "bg-black text-white", icon: NextJS },
  TAILWIND: { name: "Tailwind CSS", class: "bg-[#003159] text-white", icon: Tailwind },
};

/** Busca un icono por nombre; devuelve "" si no hay (los .astro lo tratan como ausente). */
export const iconoDe = (nombre) => (nombre ? (ICONOS[nombre] ?? "") : "");

/**
 * Componente web de un tipo en una variante, o null si el tipo no se muestra
 * en la web.
 *
 * La caida a `clasico` es deliberada y es lo que hace manejable el catalogo de
 * disenos: uno solo escribe componente propio para las secciones que marcan su
 * caracter, y el resto se pinta con el clasico, que esta tokenizado y adopta su
 * paleta. Sin esta caida, cada diseno nuevo obligaria a escribir los nueve.
 */
export const componenteWebDe = (tipo, variante = VARIANTE_BASE) =>
  COMPONENTES_WEB[tipo]?.[variante] ?? COMPONENTES_WEB[tipo]?.[VARIANTE_BASE] ?? null;
