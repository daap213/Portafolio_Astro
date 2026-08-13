import { beforeAll, describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { glob } from 'node:fs/promises';
import { resolve } from 'node:path';
import { es, en } from '@cv/cv';

const DIST = resolve(import.meta.dirname, '../../dist');

// Rutas que astro debe generar (i18n con prefixDefaultLocale: true)
const PAGINAS = [
    'index.html',
    'es/index.html',
    'en/index.html',
    'es/cv/index.html',
    'en/cv/index.html',
];

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

    it('copia los PDF del CV que enlaza el hero', () => {
        expect(existsSync(resolve(DIST, 'docs/CV_ESP.pdf'))).toBe(true);
        expect(existsSync(resolve(DIST, 'docs/CV_EN.pdf'))).toBe(true);
    });

    it('copia todos los QR e imágenes de proyecto referenciados en los datos', () => {
        for (const ruta of [...es.proyectos, ...en.proyectos].flatMap((p) => [p.qr, p.image])) {
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

    it('cada ancla del menú existe como id en la página', () => {
        for (const [pagina] of [['es/index.html', es], ['en/index.html', en]]) {
            const html = leer(pagina);
            const anclas = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);

            expect(anclas.length, `${pagina} no tiene anclas`).toBeGreaterThan(0);
            for (const ancla of anclas) {
                expect(html.includes(`id="${ancla}"`), `${pagina}: ancla #${ancla} sin destino`).toBe(true);
            }
        }
    });

    it('el selector de idioma enlaza a la otra versión del sitio', () => {
        expect(leer('es/index.html')).toContain('href="/en/"');
        expect(leer('en/index.html')).toContain('href="/es/"');
    });
});

describe('contenido de las páginas generadas', () => {
    it.each([['es/index.html', es], ['en/index.html', en]])('%s incluye los proyectos y el título', (pagina, datos) => {
        const html = leer(pagina);
        expect(html).toContain(datos.nombre);
        for (const proyecto of datos.proyectos) {
            expect(html.includes(proyecto.title), `${pagina}: falta el proyecto ${proyecto.title}`).toBe(true);
        }
    });

    it.each([['es/cv/index.html', es], ['en/cv/index.html', en]])('%s incluye los datos de contacto', (pagina, datos) => {
        const html = leer(pagina);
        expect(html).toContain(datos.nombre);
        expect(html).toContain(datos.correo);
        expect(html).toContain(datos.git_user);
    });

    it('las páginas declaran el idioma correcto en <html lang>', () => {
        expect(leer('es/index.html')).toMatch(/<html lang="es"/);
        expect(leer('en/index.html')).toMatch(/<html lang="en"/);
    });

    it('la raíz sirve la versión en español', () => {
        expect(leer('index.html')).toMatch(/<html lang="es"/);
    });
});
