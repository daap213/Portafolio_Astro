import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { buildQrJobs, generateQrFiles } from '@/scripts/url_to_qr.js';

const QR_COMMITEADOS = resolve(import.meta.dirname, '../../public/img/qr');
const FIRMA_PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47]); // \x89PNG

let salida;
let generados;

beforeAll(async () => {
    // Se genera en una carpeta temporal para no tocar public/
    salida = mkdtempSync(join(tmpdir(), 'qr-test-'));
    generados = await generateQrFiles(buildQrJobs(), salida + '/');
}, 120_000);

afterAll(() => {
    if (salida) rmSync(salida, { recursive: true, force: true });
});

describe('generación real de QR', () => {
    it('escribe un PNG por cada enlace de los datos', () => {
        expect(generados).toHaveLength(buildQrJobs().length);
        expect(readdirSync(salida)).toHaveLength(generados.length);
    });

    it('todos los ficheros son PNG válidos y no están vacíos', () => {
        for (const nombre of generados) {
            const contenido = readFileSync(join(salida, nombre));
            expect(contenido.subarray(0, 4).equals(FIRMA_PNG), `${nombre} no es un PNG`).toBe(true);
            expect(contenido.length, `${nombre} está vacío`).toBeGreaterThan(100);
        }
    });

    it('los QR commiteados en public/img/qr son exactamente los que produce el script', () => {
        // Si esto falla: los datos cambiaron y falta ejecutar `pnpm run GQR`
        for (const nombre of generados) {
            const recienGenerado = readFileSync(join(salida, nombre));
            const commiteado = readFileSync(join(QR_COMMITEADOS, nombre));
            expect(recienGenerado.equals(commiteado), `${nombre} está desactualizado en public/img/qr`).toBe(true);
        }
    });

    // Que sobre un PNG (su proyecto se borró de cv.js) no rompe ninguna página:
    // no hay nada que lo pida. Se avisa para poder limpiarlo, pero no falla.
    it('avisa de los PNG que sobran en public/img/qr sin fallar', () => {
        const esperados = new Set(generados.map((n) => n.normalize('NFC')));
        const enDisco = readdirSync(QR_COMMITEADOS).filter((f) => f.endsWith('.png'));
        const sobrantes = enDisco.filter((f) => !esperados.has(f.normalize('NFC')));
        if (sobrantes.length) {
            process.stderr.write(`[qr] PNG sin uso, se pueden borrar: ${sobrantes.join(', ')}\n`);
        }
        expect(sobrantes).toBeInstanceOf(Array);
    });

    it('la generación es determinista: dos ejecuciones dan el mismo binario', async () => {
        const otra = mkdtempSync(join(tmpdir(), 'qr-test-2-'));
        try {
            const jobs = buildQrJobs().slice(0, 3);
            await generateQrFiles(jobs, otra + '/');
            for (const { nombre } of jobs) {
                expect(readFileSync(join(otra, nombre)).equals(readFileSync(join(salida, nombre)))).toBe(true);
            }
        } finally {
            rmSync(otra, { recursive: true, force: true });
        }
    }, 60_000);
});
