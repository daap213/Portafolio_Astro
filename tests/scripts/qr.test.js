import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { es } from '@cv/cv';
import { buildQrJobs, generateQrFiles, qrFileName } from '@/scripts/url_to_qr.js';

const QR_COMMITEADOS = resolve(import.meta.dirname, '../../public/img/qr');
const FIRMA_PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47]); // \x89PNG

let salida;
let generados;

beforeAll(async () => {
    // Se genera en una carpeta temporal para no tocar public/
    salida = mkdtempSync(join(tmpdir(), 'qr-test-'));
    generados = await generateQrFiles(buildQrJobs(es), salida + '/');
}, 120_000);

afterAll(() => {
    if (salida) rmSync(salida, { recursive: true, force: true });
});

describe('generación real de QR', () => {
    it('escribe un PNG por cada enlace de los datos', () => {
        expect(generados).toHaveLength(buildQrJobs(es).length);
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

    it('no sobra ningún PNG en public/img/qr', () => {
        const esperados = new Set(generados.map((n) => n.normalize('NFC')));
        const enDisco = readdirSync(QR_COMMITEADOS).filter((f) => f.endsWith('.png'));
        const sobrantes = enDisco.filter((f) => !esperados.has(f.normalize('NFC')));
        expect(sobrantes, `QR sin uso: ${sobrantes.join(', ')}`).toEqual([]);
    });

    it('la generación es determinista: dos ejecuciones dan el mismo binario', async () => {
        const otra = mkdtempSync(join(tmpdir(), 'qr-test-2-'));
        try {
            const jobs = buildQrJobs(es).slice(0, 3);
            await generateQrFiles(jobs, otra + '/');
            for (const job of jobs) {
                const nombre = qrFileName(job.nombre);
                expect(readFileSync(join(otra, nombre)).equals(readFileSync(join(salida, nombre)))).toBe(true);
            }
        } finally {
            rmSync(otra, { recursive: true, force: true });
        }
    }, 60_000);
});
