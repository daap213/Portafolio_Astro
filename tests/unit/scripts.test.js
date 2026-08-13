import { afterEach, describe, expect, it } from 'vitest';
import { buildPdfJobs, buildPdfOptions, resolveUrlWeb } from '@/scripts/pdf_cv.js';
import { config } from '../../config.js';

const PROD_ORIGINAL = process.env.PROD;

afterEach(() => {
    if (PROD_ORIGINAL === undefined) delete process.env.PROD;
    else process.env.PROD = PROD_ORIGINAL;
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
});

describe('buildPdfJobs', () => {
    it('genera las dos vistas del CV con sus rutas de salida', () => {
        expect(buildPdfJobs('http://localhost:4321/')).toEqual([
            { url: 'http://localhost:4321/en/cv', path: 'public/docs/CV_EN.pdf' },
            { url: 'http://localhost:4321/es/cv', path: 'public/docs/CV_ESP.pdf' },
        ]);
    });

    it('respeta la URL base de producción', () => {
        const jobs = buildPdfJobs(config.prod.URLWEB);
        expect(jobs.map((j) => j.url)).toEqual([
            config.prod.URLWEB + 'en/cv',
            config.prod.URLWEB + 'es/cv',
        ]);
    });

    it('las URLs generadas son absolutas y válidas', () => {
        for (const job of buildPdfJobs(resolveUrlWeb('true'))) {
            expect(() => new URL(job.url)).not.toThrow();
        }
    });

    it('las rutas de salida son las que consume la web y commitea el CI', () => {
        // src/cv_info/es.js y en.js enlazan estos dos ficheros desde el hero
        expect(buildPdfJobs('/').map((j) => j.path).sort())
            .toEqual(['public/docs/CV_EN.pdf', 'public/docs/CV_ESP.pdf']);
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
