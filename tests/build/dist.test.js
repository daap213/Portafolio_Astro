import { beforeAll, describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { glob } from 'node:fs/promises';
import { resolve } from 'node:path';
import { DATOS } from '@cv/cv';
import { CODIGOS, IDIOMAS, IDIOMA_PREDETERMINADO, otrosIdiomas } from '@cv/locales.js';
import catalogoDisenos from '@cv/data/disenos.json' with { type: 'json' };

const DIST = resolve(import.meta.dirname, '../../dist');

// Rutas que astro debe generar (i18n con prefixDefaultLocale: true), derivadas
// de data/locales.json: añadir un idioma no obliga a tocar este fichero
const PAGINAS = [
    'index.html',
    ...CODIGOS.flatMap((codigo) => [`${codigo}/index.html`, `${codigo}/cv/index.html`]),
];

const PAGINAS_PORTADA = CODIGOS.map((codigo) => [`${codigo}/index.html`, codigo]);
const PAGINAS_CV = CODIGOS.map((codigo) => [`${codigo}/cv/index.html`, codigo]);

beforeAll(() => {
    if (!existsSync(DIST)) {
        throw new Error('No existe dist/. Ejecuta `pnpm run build` antes de `pnpm run test:build`.');
    }
});

const leer = (ruta) => readFileSync(resolve(DIST, ruta), 'utf8');

async function paginasGeneradas() {
    const paginas = [];
    for await (const fichero of glob('**/*.html', { cwd: DIST })) paginas.push(fichero.replaceAll('\\', '/'));
    return paginas;
}

// Resuelve una ruta pública ("/es/cv") al fichero que debería servirla
function ficheroDe(ruta) {
    const limpia = decodeURIComponent(ruta.split('#')[0].split('?')[0]);
    const candidatos = limpia.endsWith('/')
        ? [limpia + 'index.html']
        : [limpia, limpia + '/index.html', limpia + '.html'];
    return candidatos.map((c) => resolve(DIST, '.' + c)).find(existsSync);
}

describe('salida del build', () => {
    it('genera exactamente las páginas esperadas', async () => {
        expect((await paginasGeneradas()).sort()).toEqual(PAGINAS.sort());
    });

    it('genera el robots.txt de astro-robots-txt', () => {
        expect(existsSync(resolve(DIST, 'robots.txt'))).toBe(true);
        expect(leer('robots.txt')).toMatch(/User-agent/i);
    });

    it('copia un PDF del CV por idioma', () => {
        for (const { pdf } of IDIOMAS) {
            expect(existsSync(resolve(DIST, `docs/${pdf}`)), `falta docs/${pdf}`).toBe(true);
        }
    });

    it('copia todos los QR e imágenes de proyecto referenciados en los datos', () => {
        const proyectos = CODIGOS.flatMap((codigo) => DATOS[codigo].proyectos);
        for (const ruta of proyectos.flatMap((p) => [p.qr, p.image])) {
            expect(existsSync(resolve(DIST, '.' + ruta)), `falta en dist: ${ruta}`).toBe(true);
        }
    });

    it('emite CSS y las fuentes Onest', async () => {
        const assets = [];
        for await (const f of glob('_astro/**', { cwd: DIST })) assets.push(f);
        expect(assets.some((f) => f.endsWith('.css')), 'no se generó CSS').toBe(true);
        expect(assets.some((f) => f.includes('onest')), 'no se empaquetó la fuente Onest').toBe(true);
    });
});

// El PDF se imprime desde estas páginas y su paginación depende por completo de
// src/styles/cv_impresion.css. Dos formas silenciosas de romperlo, ambas vigiladas aquí.
describe('contrato de impresión del CV', () => {
    it.each(PAGINAS_CV)('%s no carga hojas de estilo de Astro (Tailwind rompe la paginación)', (pagina) => {
        const enlaces = [...leer(pagina).matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map((m) => m[1]);
        const locales = enlaces.filter((href) => href.startsWith('/'));
        expect(locales, `el CV no debe importar Layout.astro ni global.css: ${locales}`).toEqual([]);
    });

    it.each(PAGINAS_CV)('%s aplica las reglas de impresión sin ámbito de componente', (pagina) => {
        const html = leer(pagina);
        // Si el CSS volviera dentro de un <style> de .astro, Astro lo compilaría como
        // `.check_y[data-astro-cid-xxxx]` y dejaría de alcanzar a los componentes hijos:
        // el PDF se repaginaría en silencio y el CI commitearía el resultado.
        expect(html, 'falta la regla de impresión .check_y').toMatch(/\.check_y\s*[,{]/);
        expect(html.includes('data-astro-cid'), 'el CSS del CV volvió a estar scoped').toBe(false);
    });
});

describe('enlaces y recursos locales', () => {
    it('todo src/href local apunta a un fichero existente en dist/', async () => {
        const rotos = [];

        for (const pagina of await paginasGeneradas()) {
            const html = leer(pagina);
            for (const [, url] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
                // Solo rutas locales absolutas: externas, anclas y data: quedan fuera
                if (!url.startsWith('/') || url.startsWith('//')) continue;
                if (!ficheroDe(url)) rotos.push(`${pagina} -> ${url}`);
            }
        }

        expect(rotos, `enlaces rotos:\n${rotos.join('\n')}`).toEqual([]);
    });

    it.each(PAGINAS_PORTADA)('%s: cada ancla del menú existe como id en la página', (pagina) => {
        const html = leer(pagina);
        const anclas = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);

        expect(anclas.length, `${pagina} no tiene anclas`).toBeGreaterThan(0);
        for (const ancla of anclas) {
            expect(html.includes(`id="${ancla}"`), `${pagina}: ancla #${ancla} sin destino`).toBe(true);
        }
    });

    it.each(PAGINAS_PORTADA)('%s enlaza a todos los demás idiomas', (pagina, codigo) => {
        const html = leer(pagina);
        for (const otro of otrosIdiomas(codigo)) {
            expect(html.includes(`href="/${otro.codigo}/"`), `${pagina}: no enlaza a /${otro.codigo}/`).toBe(true);
        }
    });
});

describe('contenido de las páginas generadas', () => {
    it.each(PAGINAS_PORTADA)('%s incluye los proyectos y el título', (pagina, codigo) => {
        const html = leer(pagina);
        const datos = DATOS[codigo];
        expect(html).toContain(datos.nombre);
        for (const proyecto of datos.proyectos) {
            expect(html.includes(proyecto.title), `${pagina}: falta el proyecto ${proyecto.title}`).toBe(true);
        }
    });

    it.each(PAGINAS_CV)('%s incluye los datos de contacto', (pagina, codigo) => {
        const html = leer(pagina);
        const datos = DATOS[codigo];
        expect(html).toContain(datos.nombre);
        expect(html).toContain(datos.correo);
        expect(html).toContain(datos.git_user);
    });

    it.each([...PAGINAS_PORTADA, ...PAGINAS_CV])('%s declara el idioma correcto en <html lang>', (pagina, codigo) => {
        expect(leer(pagina)).toMatch(new RegExp(`<html lang="${codigo}"`));
    });

    it('la raíz sirve el idioma predeterminado', () => {
        expect(leer('index.html')).toMatch(new RegExp(`<html lang="${IDIOMA_PREDETERMINADO.codigo}"`));
    });
});

describe('el diseño activo llega a la página', () => {
    // El build compila UN diseño, el que marca disenos.json. Que las variantes
    // pintan se comprueba en unit con el Container API; aquí solo se ancla que
    // lo publicado es el diseño elegido y que sus tokens llegan a tiempo.

    it.each(PAGINAS_PORTADA)('%s marca el diseño activo en <html>', (pagina) => {
        expect(leer(pagina)).toMatch(
            new RegExp(`<html[^>]*data-diseno="${catalogoDisenos.activo}"`),
        );
    });

    it.each(PAGINAS_PORTADA)('%s emite los tokens dentro del <head>', (pagina) => {
        // Si el bloque cayera detrás del cuerpo, el primer pintado usaría los
        // valores heredados y se corregiría después: el mismo fogonazo que ya
        // costó mover el script del tema.
        const html = leer(pagina);
        const finHead = html.indexOf('</head>');
        const posicion = html.indexOf('--dis-fondo');

        expect(posicion, 'no están los tokens del diseño').toBeGreaterThan(-1);
        expect(posicion, 'los tokens quedaron fuera del <head>').toBeLessThan(finHead);
        expect(html).toContain(':root.dark{');
    });

    it.each(PAGINAS_PORTADA)('%s no ata ningún estilo en línea al sistema operativo', (pagina) => {
        // La comprobación hermana solo mira los .css enlazados, y los tokens van
        // en línea: sin esta aserción un diseño podría colar un
        // @media (prefers-color-scheme) y contradecir el interruptor de tema.
        //
        // Se miran los <style>, no el <head> entero: el script del tema SÍ
        // consulta prefers-color-scheme, y debe hacerlo — es como la opción
        // «sistema» sabe qué tiene puesto el sistema operativo.
        const estilos = [...leer(pagina).matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);

        expect(estilos.length, 'no hay ningún <style> en línea').toBeGreaterThan(0);
        for (const css of estilos) {
            expect(css.includes('prefers-color-scheme'), 'un estilo en línea sigue al sistema').toBe(false);
        }
    });

    it('el CV no lleva diseño: es un mundo aparte', () => {
        for (const [pagina] of PAGINAS_CV) {
            const html = leer(pagina);
            expect(html.includes('data-diseno'), `${pagina} recibió un diseño`).toBe(false);
            expect(html.includes('--dis-fondo'), `${pagina} recibió tokens`).toBe(false);
        }
    });

    it('las rutas de vista previa de diseños no se publican', () => {
        // /vista/<diseno>/<idioma> existe solo en `astro dev`, con
        // getStaticPaths devolviendo [] fuera de desarrollo. La prueba que
        // enumera las páginas ya lo cubriría, pero conviene que el motivo esté
        // dicho donde se lee.
        expect(existsSync(resolve(DIST, 'vista'))).toBe(false);
    });
});

describe('el tema se decide antes de pintar', () => {
    // El único código que pone `.dark` en <html> vivía en un script del <body>
    // (dentro del selector de tema) y encima esperaba a DOMContentLoaded: la
    // página pintaba siempre en claro y se corregía después. Aquí se ancla la
    // colocación, que en e2e es difícil de comprobar porque los `expect` de
    // Playwright reintentan y se comen el retardo.
    it.each(PAGINAS_PORTADA)('%s aplica el tema dentro del <head>', (pagina) => {
        const html = leer(pagina);
        const finHead = html.indexOf('</head>');
        const posicion = html.indexOf('aplicarTema');

        expect(finHead, 'no se encontró el </head>').toBeGreaterThan(-1);
        expect(posicion, 'no está el script del tema').toBeGreaterThan(-1);
        expect(posicion, 'el script del tema quedó fuera del <head>: habría fogonazo').toBeLessThan(finHead);
    });

    it.each(PAGINAS_PORTADA)('%s no deja estilos atados al sistema operativo', (pagina) => {
        // `prefers-color-scheme` en el CSS del sitio significa estilos que
        // ignoran el interruptor: con la elección opuesta al sistema, el color
        // del texto y las animaciones de la barra se contradecían.
        const html = leer(pagina);
        for (const hoja of [...html.matchAll(/href="([^"]+\.css)"/g)].map((m) => m[1])) {
            const css = readFileSync(resolve(DIST, '.' + hoja), 'utf8');
            expect(css.includes('prefers-color-scheme'), `${hoja} sigue al sistema`).toBe(false);
        }
    });
});
