import { beforeAll, describe, expect, it } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { IDIOMAS, configuracionDe } from '../helpers/configuraciones.js';
import { IDIOMA_PREDETERMINADO, otrosIdiomas } from '@cv/locales.js';
import { construirPagina } from '@cv/paginaWeb.js';
import catalogoDisenos from '@cv/data/disenos.json' with { type: 'json' };

// Los componentes compartidos se prueban con un idioma cualquiera: el predeterminado
const configEs = configuracionDe(IDIOMA_PREDETERMINADO.codigo);

let container;
beforeAll(async () => {
    container = await AstroContainer.create();
});

// Astro escapa el HTML al interpolar, así que hay que deshacerlo antes de
// buscar textos que contengan &, comillas, etc. ("Git & GitHub")
const decodificar = (html) =>
    html
        .replaceAll('&#38;', '&')
        .replaceAll('&amp;', '&')
        .replaceAll('&#34;', '"')
        .replaceAll('&quot;', '"')
        .replaceAll('&#39;', "'")
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>');


// Las secciones se identifican por POSICIÓN, no por id: los ids están
// traducidos (#sobre-mi en español, #about_me en inglés).
const HERO = 0;
const EXPERIENCIA = 1;
const PROYECTOS = 2;
const PUBLICACIONES = 3;
const EDUCACION = 4;
const HABILIDADES = 5;
const CERTIFICADOS = 6;

// Para cada sección: qué textos de los datos deben acabar en el HTML renderizado
const textosEsperados = {
    [HERO]: (config) => [config.sobreMi.nombre, ...config.sobreMi.botones.map((b) => b.title)],
    [EXPERIENCIA]: (config) => config.experiencias.flatMap((e) => [e.title, e.company]),
    [PROYECTOS]: (config) => config.proyectos.map((p) => p.title),
    [PUBLICACIONES]: (config) => config.publicaciones.flatMap((p) => [p.title, p.authors]),
    [EDUCACION]: (config) => config.gradosCompletados.flatMap((g) => [g.title, g.institution]),
    [HABILIDADES]: (config) => config.habilidades.flatMap((h) => [h.name, ...h.skills]),
    [CERTIFICADOS]: (config) => [
        config.certificados.titleLink,
        ...config.certificados.items.map((c) => c.title),
    ],
};

describe.each(IDIOMAS)('renderizado de secciones (%s)', (_idioma, config) => {
    const secciones = [config.pagIndex.primeraSeccion, ...config.pagIndex.secciones];

    it.each(secciones.map((s) => [s.name, s]))('%s renderiza sin lanzar', async (nombre, seccion) => {
        const html = await container.renderToString(seccion.seccion, {
            props: { infoSeccion: seccion.seccionInfo, ui: config.ui },
        });
        expect(html.length, `${nombre} no generó HTML`).toBeGreaterThan(0);
    });

    it.each(secciones.map((s) => [s.name, s]))('%s no filtra valores sin resolver', async (nombre, seccion) => {
        const html = await container.renderToString(seccion.seccion, {
            props: { infoSeccion: seccion.seccionInfo, ui: config.ui },
        });
        for (const basura of ['undefined', '[object Object]', 'NaN']) {
            expect(html.includes(basura), `${nombre} contiene "${basura}"`).toBe(false);
        }
    });

    it.each(Object.keys(textosEsperados))('la sección en posición %s vuelca todos sus datos al HTML', async (indice) => {
        const seccion = secciones[indice];
        expect(seccion, `no existe la sección ${indice}`).toBeDefined();

        const html = decodificar(
            await container.renderToString(seccion.seccion, {
                props: { infoSeccion: seccion.seccionInfo, ui: config.ui },
            }),
        );

        for (const texto of textosEsperados[indice](config)) {
            expect(html.includes(texto), `falta en el HTML de "${seccion.name}": "${texto}"`).toBe(true);
        }
    });

    it('Projects renderiza un <article> por proyecto, con su imagen y su enlace a GitHub', async () => {
        const seccion = secciones[PROYECTOS];
        const html = await container.renderToString(seccion.seccion, {
            props: { infoSeccion: seccion.seccionInfo, ui: config.ui },
        });

        expect((html.match(/<article/g) || []).length).toBe(config.proyectos.length);
        for (const proyecto of config.proyectos) {
            expect(html.includes(proyecto.image), `falta la imagen de ${proyecto.title}`).toBe(true);
            if (proyecto.github) {
                expect(html.includes(proyecto.github), `falta el repo de ${proyecto.title}`).toBe(true);
            }
        }
    });

    it('Hero muestra la foto y un enlace por cada botón', async () => {
        const seccion = secciones[HERO];
        const html = await container.renderToString(seccion.seccion, {
            props: { infoSeccion: seccion.seccionInfo, ui: config.ui },
        });

        expect(html.includes(config.sobreMi.imagenRuta)).toBe(true);
        for (const boton of config.sobreMi.botones) {
            expect(html.includes(boton.url), `falta el botón ${boton.title}`).toBe(true);
        }
    });

    it('Certificados enlaza al Drive de certificados', async () => {
        const seccion = secciones[CERTIFICADOS];
        const html = await container.renderToString(seccion.seccion, {
            props: { infoSeccion: seccion.seccionInfo, ui: config.ui },
        });
        expect(html.includes(config.certificados.link)).toBe(true);
    });
});

describe('componentes compartidos', () => {
    it('el navbar renderiza un enlace por cada navItem y uno por cada otro idioma', async () => {
        const { default: NavBar } = await import('@/components/otros/NavBar.astro');
        const idiomas = otrosIdiomas(IDIOMA_PREDETERMINADO.codigo).map((idioma) => ({
            codigo: idioma.codigo,
            etiqueta: idioma.etiqueta,
            ruta: `/${idioma.codigo}/`,
        }));
        const html = await container.renderToString(NavBar, {
            props: { navItems: configEs.navItems, idiomas, ui: configEs.ui },
        });

        for (const item of configEs.navItems) {
            expect(html.includes(`href="${item.url}"`), `falta el enlace ${item.url}`).toBe(true);
        }
        for (const idioma of idiomas) {
            expect(html.includes(`href="${idioma.ruta}"`), `falta el idioma ${idioma.codigo}`).toBe(true);
        }
    });

    it('el footer renderiza los datos de contacto', async () => {
        const { default: Footer } = await import('@/components/seccions/Footer.astro');
        const html = await container.renderToString(Footer, {
            props: { footerInfor: configEs.footerInfor },
        });

        expect(html.includes(configEs.footerInfor.name)).toBe(true);
        expect(html.includes(configEs.footerInfor.itemcontact.url)).toBe(true);
    });
});

// ---------------------------------------------------------------------------

describe('el catálogo de tipos y el registro de componentes van a la par', () => {
    it('todo tipo tiene componente en las listas que dice admitir', async () => {
        // `texto` declaraba alcance ["cv","web"] pero no tenía renderizador web:
        // la sección pasaba la validación y el build reventaba al pintarla.
        //
        // En la web el mapa tiene dos niveles (tipo -> variante -> componente) y
        // lo que se exige es la variante base: es a la que cae un diseño que no
        // trae la suya, así que sin ella el tipo no se puede pintar con NINGÚN
        // diseño.
        const { COMPONENTES_WEB, COMPONENTES_CV } = await import('@cv/registro.js');
        const { TIPOS } = await import('@cv/tipos.js');
        const { VARIANTE_BASE } = await import('@cv/disenos.js');

        for (const [nombre, tipo] of Object.entries(TIPOS)) {
            if (tipo.alcance.includes('web')) {
                expect(
                    COMPONENTES_WEB[nombre]?.[VARIANTE_BASE],
                    `el tipo "${nombre}" admite web pero no tiene componente "${VARIANTE_BASE}"`,
                ).toBeTruthy();
            }
            if (tipo.alcance.includes('cv')) {
                expect(
                    COMPONENTES_CV[nombre],
                    `el tipo "${nombre}" admite cv pero no tiene componente de cv`,
                ).toBeTruthy();
            }
        }
    });

    it('no hay componentes registrados para tipos que no existen', async () => {
        const { COMPONENTES_WEB, COMPONENTES_CV } = await import('@cv/registro.js');
        const { TIPOS } = await import('@cv/tipos.js');
        for (const [destino, mapa] of [['web', COMPONENTES_WEB], ['cv', COMPONENTES_CV]]) {
            for (const nombre of Object.keys(mapa)) {
                expect(TIPOS[nombre], `${destino}: "${nombre}" no es un tipo`).toBeDefined();
                expect(
                    TIPOS[nombre].alcance.includes(destino),
                    `${destino}: "${nombre}" tiene componente pero su alcance no incluye ${destino}`,
                ).toBe(true);
            }
        }
    });

    it('las variantes del catálogo son exactamente las del registro', async () => {
        // Mismo reparto que iconos.js / ICONOS: disenos.js solo tiene los
        // NOMBRES (lo cargan el administrador, validar.js y Playwright, que no
        // saben parsear .astro) y registro.js les pone cara. Si se separan, el
        // panel ofrece una variante que revienta el build al guardarla, o hay un
        // componente que nadie puede elegir.
        const { COMPONENTES_WEB } = await import('@cv/registro.js');
        const { VARIANTES } = await import('@cv/disenos.js');

        expect(Object.keys(VARIANTES).sort()).toEqual(Object.keys(COMPONENTES_WEB).sort());
        for (const [tipo, nombres] of Object.entries(VARIANTES)) {
            expect([...nombres].sort(), `variantes de "${tipo}"`).toEqual(
                Object.keys(COMPONENTES_WEB[tipo] ?? {}).sort(),
            );
        }
    });

    it('los nombres de icono del catálogo son exactamente los del registro', async () => {
        // iconos.js existe para que el administrador y validar.js puedan
        // comprobar `icono` sin importar registro.js, que arrastra .astro
        const { ICONOS } = await import('@cv/registro.js');
        const { NOMBRES_ICONO } = await import('@cv/iconos.js');
        expect([...NOMBRES_ICONO].sort()).toEqual(Object.keys(ICONOS).sort());
    });
});

// ---------------------------------------------------------------------------

describe('todos los diseños pintan todas las secciones', () => {
    // El build solo compila el diseño ACTIVO, así que dist.test.js y los e2e
    // dejan los demás sin tocar: un diseño podría llevar meses roto y no
    // enterarse nadie hasta activarlo. Aquí se pintan los cinco con el Container
    // API, que no necesita compilar nada.
    const IDIOMA = IDIOMA_PREDETERMINADO.codigo;
    const DISENOS = catalogoDisenos.disenos.map((diseno) => [diseno.id]);

    const escapar = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const seccionesDe = (idDiseno) => {
        const config = construirPagina(IDIOMA, { diseno: idDiseno });
        return { config, secciones: [config.pagIndex.primeraSeccion, ...config.pagIndex.secciones] };
    };

    const pintar = (seccion, config) =>
        container.renderToString(seccion.seccion, {
            props: { infoSeccion: seccion.seccionInfo, ui: config.ui, opciones: seccion.opciones },
        });

    it.each(DISENOS)('%s: todas las secciones renderizan y no filtran valores sin resolver', async (id) => {
        const { config, secciones } = seccionesDe(id);

        for (const seccion of secciones) {
            const html = await pintar(seccion, config);
            expect(html.length, `${id}/${seccion.name}: sin HTML`).toBeGreaterThan(0);
            for (const basura of ['undefined', '[object Object]', 'NaN']) {
                expect(html.includes(basura), `${id}/${seccion.name} contiene "${basura}"`).toBe(false);
            }
        }
    });

    it.each(DISENOS)('%s: la presentación mantiene la foto y un enlace por botón', async (id) => {
        // Es el contrato que comparten todas las variantes de `presentacion`:
        // los e2e comprueban un a[href="/docs/<pdf>"] por idioma y que la foto
        // cargue. Una variante que se los deje fuera rompe la suite entera.
        const { config, secciones } = seccionesDe(id);
        const html = await pintar(secciones[HERO], config);

        expect(html.includes(config.sobreMi.imagenRuta), `${id}: falta la foto`).toBe(true);
        for (const boton of config.sobreMi.botones) {
            expect(html.includes(boton.url), `${id}: falta el botón ${boton.title}`).toBe(true);
        }
    });

    it.each(DISENOS)('%s: cada proyecto tiene su título en un encabezado', async (id) => {
        // Los e2e los buscan con getByRole('heading'), así que un <p> con pinta
        // de título pasaría la vista y rompería la prueba.
        const { config, secciones } = seccionesDe(id);
        const html = decodificar(await pintar(secciones[PROYECTOS], config));

        for (const proyecto of config.proyectos) {
            const encabezado = new RegExp(`<h[1-6][^>]*>\\s*${escapar(proyecto.title)}`);
            expect(encabezado.test(html), `${id}: "${proyecto.title}" no está en un encabezado`).toBe(true);
        }
    });

    it('un diseño sin variante propia cae a la clásica en vez de romper', async () => {
        // Es lo que hace manejable el catálogo: un diseño solo escribe los
        // componentes que le dan carácter.
        const { COMPONENTES_WEB } = await import('@cv/registro.js');
        const { componenteWebDe } = await import('@cv/registro.js');
        expect(componenteWebDe('formacion', 'neon')).toBe(COMPONENTES_WEB.formacion.clasico);
        expect(componenteWebDe('proyectos', 'inventada')).toBe(COMPONENTES_WEB.proyectos.clasico);
        expect(componenteWebDe('noExiste', 'clasico')).toBeNull();
    });
});

describe('las opciones de sección llegan al componente', () => {
    // paginaWeb.js calculaba `opciones` para cada sección, pero index.astro no
    // las pasaba y ningún componente las declaraba: todos los interruptores del
    // administrador se guardaban y no hacían absolutamente nada.
    // Por POSICIÓN, como el resto del fichero: los ids están traducidos
    const proyectos = [configEs.pagIndex.primeraSeccion, ...configEs.pagIndex.secciones][PROYECTOS];

    const pintar = (opciones) =>
        container.renderToString(proyectos.seccion, {
            props: { infoSeccion: proyectos.seccionInfo, ui: configEs.ui, opciones },
        });

    it('mostrarImagen=false quita las imágenes de los proyectos', async () => {
        expect((await pintar({})).includes(configEs.proyectos[0].image)).toBe(true);
        const sinImagen = await pintar({ mostrarImagen: false });
        for (const proyecto of configEs.proyectos) {
            expect(sinImagen.includes(proyecto.image), `sigue la imagen de ${proyecto.title}`).toBe(false);
        }
        // pero los proyectos siguen ahí
        expect((sinImagen.match(/<article/g) || []).length).toBe(configEs.proyectos.length);
    });

    it('mostrarEnlace=false quita los enlaces a GitHub', async () => {
        const conEnlace = await pintar({});
        const sinEnlace = await pintar({ mostrarEnlace: false });
        const conGithub = configEs.proyectos.filter((p) => p.github);
        expect(conGithub.length).toBeGreaterThan(0);
        for (const proyecto of conGithub) {
            expect(conEnlace.includes(proyecto.github)).toBe(true);
            expect(sinEnlace.includes(proyecto.github), `sigue el repo de ${proyecto.title}`).toBe(false);
        }
    });

    it('sin opciones se comporta como antes de que existieran', async () => {
        const sinProp = await container.renderToString(proyectos.seccion, {
            props: { infoSeccion: proyectos.seccionInfo, ui: configEs.ui },
        });
        expect(sinProp).toBe(await pintar({}));
    });
});
