import { afterEach, describe, expect, it } from 'vitest';
import { buildPdfJobs, buildPdfOptions, resolveUrlWeb } from '@/scripts/pdf_cv.js';
import { IDIOMAS } from '@cv/locales.js';
import { config } from '../../config.js';

const PROD_ORIGINAL = process.env.PROD;
const URL_BASE_ORIGINAL = process.env.URL_BASE;

afterEach(() => {
    if (PROD_ORIGINAL === undefined) delete process.env.PROD;
    else process.env.PROD = PROD_ORIGINAL;
    if (URL_BASE_ORIGINAL === undefined) delete process.env.URL_BASE;
    else process.env.URL_BASE = URL_BASE_ORIGINAL;
});

describe('resolveUrlWeb', () => {
    it('usa la URL de producción solo con PROD="true"', () => {
        expect(resolveUrlWeb('true')).toBe(config.prod.URLWEB);
    });

    it.each([undefined, '', 'false', '1', 'TRUE'])('usa localhost con PROD=%s', (valor) => {
        expect(resolveUrlWeb(valor)).toBe(config.dev.URLWEB);
    });

    it('lee process.env.PROD cuando no se le pasa argumento', () => {
        process.env.PROD = 'true';
        expect(resolveUrlWeb()).toBe(config.prod.URLWEB);
        process.env.PROD = 'false';
        expect(resolveUrlWeb()).toBe(config.dev.URLWEB);
    });

    it('URL_BASE tiene prioridad sobre PROD y siempre acaba en barra', () => {
        // Lo usa el administrador local, que imprime contra su propio preview
        expect(resolveUrlWeb('true', 'http://127.0.0.1:4331')).toBe('http://127.0.0.1:4331/');
        process.env.URL_BASE = 'http://127.0.0.1:4331/';
        expect(resolveUrlWeb()).toBe('http://127.0.0.1:4331/');
    });
});

describe('buildPdfJobs', () => {
    it('genera una vista del CV por idioma declarado, en el mismo orden', () => {
        expect(buildPdfJobs('http://localhost:4321/')).toEqual(
            IDIOMAS.map(({ codigo, pdf }) => ({
                url: `http://localhost:4321/${codigo}/cv`,
                path: `public/docs/${pdf}`,
            })),
        );
    });

    it('respeta la URL base de producción', () => {
        const jobs = buildPdfJobs(config.prod.URLWEB);
        expect(jobs.map((j) => j.url)).toEqual(
            IDIOMAS.map(({ codigo }) => `${config.prod.URLWEB}${codigo}/cv`),
        );
    });

    it('las URLs generadas son absolutas y válidas', () => {
        for (const job of buildPdfJobs(resolveUrlWeb('true'))) {
            expect(() => new URL(job.url)).not.toThrow();
        }
    });

    it('las rutas de salida son las que consume la web y commitea el CI', () => {
        // El hero enlaza un PDF por idioma; el CI los regenera y los commitea
        expect(buildPdfJobs('/').map((j) => j.path).sort())
            .toEqual(IDIOMAS.map(({ pdf }) => `public/docs/${pdf}`).sort());
    });

    it('los nombres de PDF son únicos entre idiomas', () => {
        const nombres = IDIOMAS.map(({ pdf }) => pdf);
        expect(new Set(nombres).size).toBe(nombres.length);
    });
});

describe('buildPdfOptions', () => {
    it('escribe en la ruta indicada y mantiene cabecera y pie', () => {
        const opciones = buildPdfOptions('salida.pdf');
        expect(opciones.path).toBe('salida.pdf');
        expect(opciones.displayHeaderFooter).toBe(true);
        expect(opciones.headerTemplate).toContain('class="title"');
        expect(opciones.footerTemplate).toContain('class="pageNumber"');
        expect(opciones.footerTemplate).toContain('class="totalPages"');
    });

    it('deja margen inferior suficiente para que se vea el pie', () => {
        // Con menos margen Puppeteer recorta el footer
        expect(buildPdfOptions('x.pdf').margin.bottom).toBeGreaterThanOrEqual(50);
    });
});

describe('config.js', () => {
    it('la URL de desarrollo es el puerto por defecto de astro preview', () => {
        expect(config.dev.URLWEB).toBe('http://localhost:4321/');
    });

    it('las dos URLs base terminan en barra para poder concatenar rutas', () => {
        expect(config.dev.URLWEB.endsWith('/')).toBe(true);
        expect(config.prod.URLWEB.endsWith('/')).toBe(true);
    });
});
