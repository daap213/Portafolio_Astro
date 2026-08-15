import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { buildPdfJobs, generatePDF } from '@/scripts/pdf_cv.js';
import { CODIGOS, IDIOMAS } from '@cv/locales.js';
import { iniciarPreview } from '../helpers/preview.js';

const DIST = resolve(import.meta.dirname, '../../dist');

let servidor;
let baseUrl;
let salida;

beforeAll(async () => {
    if (!existsSync(DIST)) {
        throw new Error('No existe dist/. Ejecuta `pnpm run build` antes de `pnpm run test:scripts`.');
    }
    servidor = await iniciarPreview();
    baseUrl = servidor.baseUrl;
    salida = mkdtempSync(join(tmpdir(), 'pdf-test-'));
}, 120_000);

afterAll(async () => {
    if (servidor) await servidor.stop();
    if (salida) rmSync(salida, { recursive: true, force: true });
});

describe('servidor de preview', () => {
    it.each(CODIGOS.flatMap((codigo) => [`${codigo}/cv`, `${codigo}/`]))('sirve /%s', async (ruta) => {
        const respuesta = await fetch(baseUrl + ruta);
        expect(respuesta.status).toBe(200);
        expect((await respuesta.text()).length).toBeGreaterThan(1000);
    });
});

describe('generación real de PDF con Puppeteer', () => {
    // Requiere Chrome: `pnpm exec puppeteer browsers install chrome`
    // (pnpm-workspace.yaml desactiva el postinstall de puppeteer)
    it.each(IDIOMAS.map(({ codigo, pdf }) => [codigo, pdf]))(
        'imprime la vista /%s/cv a un PDF válido',
        async (idioma, nombre) => {
            const destino = join(salida, nombre);
            await generatePDF(`${baseUrl}${idioma}/cv`, destino);

            expect(existsSync(destino)).toBe(true);
            const contenido = readFileSync(destino);
            expect(contenido.subarray(0, 5).toString('latin1'), 'no es un PDF').toBe('%PDF-');
            // Los PDF reales rondan los 800 KB; por debajo de 20 KB algo falló
            expect(contenido.length).toBeGreaterThan(20_000);

            // Debe tener varias páginas: si la CSS de impresión se rompe, colapsa a una
            const paginas = (contenido.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
            expect(paginas, 'el CV debería ocupar varias páginas').toBeGreaterThanOrEqual(5);
        },
        180_000,
    );

    it('buildPdfJobs apunta a las rutas que sirve el preview', async () => {
        for (const job of buildPdfJobs(baseUrl)) {
            const respuesta = await fetch(job.url);
            expect(respuesta.status, `${job.url} no responde`).toBe(200);
        }
    });
});
