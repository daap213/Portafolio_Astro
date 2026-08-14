import { describe, expect, it } from 'vitest';
import { readdirSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { es, en } from '@cv/cv';
import { buildQrJobs, qrFileName, sanitizeNombre } from '@/scripts/url_to_qr.js';

const DIR_QR = resolve(import.meta.dirname, '../../public/img/qr');

// Los nombres llevan acentos; normalizar evita falsos negativos por NFC/NFD
const norm = (s) => s.normalize('NFC');

const ficherosEnDisco = () => readdirSync(DIR_QR).filter((f) => f.endsWith('.png')).map(norm);
const nombresGenerados = () => buildQrJobs(es).map((job) => norm(qrFileName(job.nombre)));

describe('sanitizeNombre', () => {
    it('sustituye espacios y barras por guiones bajos', () => {
        expect(sanitizeNombre('Control de bombas Proteus/Ubidots'))
            .toBe('Control_de_bombas_Proteus_Ubidots');
    });

    it('conserva los acentos, que forman parte del nombre de archivo real', () => {
        expect(sanitizeNombre('Dron para monitoreo Térmico')).toBe('Dron_para_monitoreo_Térmico');
    });

    it('qrFileName añade el prefijo y la extensión', () => {
        expect(qrFileName('publicaciones_link')).toBe('qr_publicaciones_link.png');
    });
});

describe('QR commiteados sincronizados con cv.js', () => {
    // Solo se comprueba una dirección: que todo QR que los datos piden esté en disco.
    // Un dato que apunta a un PNG inexistente sí rompe la página (imagen rota);
    // un PNG que sobra no lo pide nadie, así que no tumba el build.
    it('todo QR referenciado por los datos existe en public/img/qr/', () => {
        // Si esto falla: alguien cambió un título/enlace y no ejecutó `pnpm run GQR`.
        const enDisco = new Set(ficherosEnDisco());
        const faltan = nombresGenerados().filter((f) => !enDisco.has(f));
        expect(faltan, `referenciados en cv.js pero ausentes del disco: ${faltan.join(', ')}`).toEqual([]);
    });

    it('los QR huérfanos solo se avisan, no rompen el build', () => {
        const generados = new Set(nombresGenerados());
        const huerfanos = ficherosEnDisco().filter((f) => !generados.has(f));
        if (huerfanos.length) {
            process.stderr.write(`[qr] PNG sin referencia en cv.js, se pueden borrar: ${huerfanos.join(', ')}\n`);
        }
        expect(huerfanos).toBeInstanceOf(Array);
    });

    it('el campo qr de cada proyecto apunta al fichero que genera el script', () => {
        // El nombre se deriva SIEMPRE del título en español
        for (const proyecto of es.proyectos) {
            if (!proyecto.github) continue;
            const esperado = qrFileName(sanitizeNombre(proyecto.title));
            expect(norm(basename(proyecto.qr)), `desincronizado: ${proyecto.title}`).toBe(norm(esperado));
        }
    });

    it('los datos en inglés reutilizan los mismos ficheros QR en español', () => {
        // Trampa nº1 del repo: los QR se nombran desde el título en español
        // y las entradas en inglés apuntan a esos mismos archivos.
        const enDisco = new Set(ficherosEnDisco());
        for (const proyecto of en.proyectos) {
            if (!proyecto.qr) continue;
            expect(enDisco.has(norm(basename(proyecto.qr))), `falta el QR de ${proyecto.title}`).toBe(true);
        }
    });

    it('cada proyecto con github tiene su QR y ninguno sin github lo tiene de más', () => {
        const conGithub = es.proyectos.filter((p) => p.github);
        const jobsDeProyectos = buildQrJobs(es).filter((j) => j.seccion === 'proyectos');
        expect(jobsDeProyectos).toHaveLength(conGithub.length);
    });
});

describe('buildQrJobs', () => {
    it('incluye certificados, publicaciones y proyectos', () => {
        const jobs = buildQrJobs(es);
        expect(jobs.map((j) => j.seccion)).toContain('certificados');
        expect(jobs.map((j) => j.seccion)).toContain('publicaciones');
        expect(jobs.filter((j) => j.seccion === 'proyectos').length).toBeGreaterThan(0);
    });

    it('todos los trabajos llevan un enlace absoluto', () => {
        for (const job of buildQrJobs(es)) {
            expect(() => new URL(job.link), `enlace inválido en ${job.nombre}`).not.toThrow();
        }
    });

    it('es una función pura: no toca disco ni depende de los datos importados', () => {
        const fixture = {
            certificados: { link: 'https://example.com/certs' },
            publicaciones: [{ link: 'https://example.com/paper' }],
            proyectos: [
                { title: 'Proyecto A/B', github: 'https://github.com/x/a' },
                { title: 'Sin repo', github: '' },
            ],
        };
        expect(buildQrJobs(fixture)).toEqual([
            { seccion: 'certificados', link: 'https://example.com/certs', nombre: 'certificados_link' },
            { seccion: 'publicaciones', link: 'https://example.com/paper', nombre: 'publicaciones_link' },
            { seccion: 'proyectos', link: 'https://github.com/x/a', nombre: 'Proyecto_A_B' },
        ]);
    });
});
