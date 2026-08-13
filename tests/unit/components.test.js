import { beforeAll, describe, expect, it } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import * as configEs from '@cv/es';
import * as configEn from '@cv/en';

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

const IDIOMAS = [['es', configEs], ['en', configEn]];

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
    it('el navbar renderiza un enlace por cada navItem y el cambio de idioma', async () => {
        const { default: NavBar } = await import('@/components/otros/NavBar.astro');
        const html = await container.renderToString(NavBar, {
            props: { navItems: configEs.navItems, rutaLeng: '/en/', ui: configEs.ui },
        });

        for (const item of configEs.navItems) {
            expect(html.includes(`href="${item.url}"`), `falta el enlace ${item.url}`).toBe(true);
        }
        expect(html.includes('href="/en/')).toBe(true);
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
