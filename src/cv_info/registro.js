// Vinculo entre la configuracion (datos) y los componentes (codigo).
//
// data/secciones.*.json referencia tipos e iconos POR NOMBRE; aqui se traducen
// esos nombres a componentes reales. Es el unico sitio donde un dato JSON se
// convierte en un .astro.
//
// Este fichero SI importa .astro, asi que solo pueden cargarlo las paginas y
// los tests que usan el Container API de Astro. El administrador, los scripts
// de node y Playwright deben quedarse en tipos.js / locales.js / cv.js.

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
import Experience from "@/components/seccions/Experience.astro";
import Projects from "@/components/seccions/Projects.astro";
import Publications from "@/components/seccions/Publications.astro";
import EducationSeccion from "@/components/seccions/Education.astro";
import AllSkills from "@/components/seccions/AllSkills.astro";
import Certificados from "@/components/seccions/Certificados.astro";
import PreviewFooter from "@/components/seccions/PreviewFooter.astro";

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

/** Iconos disponibles para `icono` en secciones.*.json y para los enlaces del hero. */
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

/** tipo de seccion -> componente que la pinta en la web. */
export const COMPONENTES_WEB = {
  presentacion: Hero,
  cronologia: Experience,
  formacion: EducationSeccion,
  proyectos: Projects,
  publicaciones: Publications,
  habilidades: AllSkills,
  certificados: Certificados,
  cita: PreviewFooter,
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

/** Componente web de un tipo, o null si ese tipo no se muestra en la web. */
export const componenteWebDe = (tipo) => COMPONENTES_WEB[tipo] ?? null;
