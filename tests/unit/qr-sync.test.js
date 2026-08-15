import { describe, expect, it } from 'vitest';
import { readdirSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { DATOS, nombreQr } from '@cv/cv';
import { CODIGOS, IDIOMA_PREDETERMINADO } from '@cv/locales.js';
import { buildQrJobs, qrFileName } from '@/scripts/url_to_qr.js';
import comun from '@cv/data/comun.json' with { type: 'json' };

const DIR_QR = resolve(import.meta.dirname, '../../public/img/qr');

const ficherosEnDisco = () => readdirSync(DIR_QR).filter((f) => f.endsWith('.png'));
const nombresGenerados = () => buildQrJobs().map((job) => job.nombre);

describe('nombres de fichero de QR', () => {
    it('se derivan del id del item, no del título', () => {
        expect(qrFileName('proyectos', 'dron-para-monitoreo-termico'))
            .toBe('qr_proyectos_dron-para-monitoreo-termico.png');
    });

    it('sin id, el QR es del bloque entero', () => {
        expect(qrFileName('certificados')).toBe('qr_certificados.png');
    });

    it('cv.js y el script de generación coinciden en el nombre', () => {
        // Si divergen, los datos apuntarían a un PNG que el script nunca escribe
        expect(nombreQr('proyectos', 'x')).toBe(qrFileName('proyectos', 'x'));
        expect(nombreQr('certificados', null)).toBe(qrFileName('certificados'));
    });

    it('ningún nombre lleva acentos ni caracteres raros', () => {
        // Los nombres con tilde se corrompían al viajar entre Windows y Linux
        for (const nombre of [...nombresGenerados(), ...ficherosEnDisco()]) {
            expect(nombre, `nombre no portable: ${nombre}`).toMatch(/^[a-z0-9_.-]+$/);
        }
    });
});

describe('QR commiteados sincronizados con los datos', () => {
    // Solo se comprueba una dirección: que todo QR que los datos piden esté en disco.
    // Un dato que apunta a un PNG inexistente sí rompe la página (imagen rota);
    // un PNG que sobra no lo pide nadie, así que no tumba el build.
    it('todo QR referenciado por los datos existe en public/img/qr/', () => {
        // Si esto falla: alguien cambió un enlace o un id y no ejecutó `pnpm run GQR`.
        const enDisco = new Set(ficherosEnDisco());
        const faltan = nombresGenerados().filter((f) => !enDisco.has(f));
        expect(faltan, `pedidos por los datos pero ausentes del disco: ${faltan.join(', ')}`).toEqual([]);
    });

    it('los QR huérfanos solo se avisan, no rompen el build', () => {
        const generados = new Set(nombresGenerados());
        const huerfanos = ficherosEnDisco().filter((f) => !generados.has(f));
        if (huerfanos.length) {
            process.stderr.write(`[qr] PNG sin referencia en los datos, se pueden borrar: ${huerfanos.join(', ')}\n`);
        }
        expect(huerfanos).toBeInstanceOf(Array);
    });

    it('el campo qr de cada proyecto apunta al fichero que genera el script', () => {
        const datos = DATOS[IDIOMA_PREDETERMINADO.codigo];
        const porId = new Map(comun.bloques.proyectos.items.map((item, i) => [i, item.id]));
        datos.proyectos.forEach((proyecto, i) => {
            if (!proyecto.qr) return;
            expect(basename(proyecto.qr), `desincronizado: ${proyecto.title}`)
                .toBe(qrFileName('proyectos', porId.get(i)));
        });
    });

    it('todos los idiomas comparten exactamente los mismos ficheros QR', () => {
        // El QR ya no se guarda por idioma: se deriva del id, que es idioma-neutro
        const referencia = DATOS[IDIOMA_PREDETERMINADO.codigo];
        for (const codigo of CODIGOS) {
            expect(DATOS[codigo].proyectos.map((p) => p.qr), `${codigo} difiere en los QR`)
                .toEqual(referencia.proyectos.map((p) => p.qr));
            expect(DATOS[codigo].certificados.qr).toBe(referencia.certificados.qr);
        }
    });

    it('cada proyecto con github tiene su QR y ninguno sin github lo tiene de más', () => {
        const conGithub = comun.bloques.proyectos.items.filter((p) => p.github);
        const jobsDeProyectos = buildQrJobs().filter((j) => j.bloque === 'proyectos');
        expect(jobsDeProyectos).toHaveLength(conGithub.length);
    });
});

describe('buildQrJobs', () => {
    it('incluye los bloques que declaran QR', () => {
        const bloques = buildQrJobs().map((j) => j.bloque);
        expect(bloques).toContain('certificados');
        expect(bloques).toContain('publicaciones');
        expect(bloques.filter((b) => b === 'proyectos').length).toBeGreaterThan(0);
    });

    it('no genera QR de bloques que no lo declaran', () => {
        const bloques = new Set(buildQrJobs().map((j) => j.bloque));
        for (const sinQr of ['experiencias', 'gradosCompletados', 'habilidades', 'referencias']) {
            expect(bloques.has(sinQr), `${sinQr} no debería generar QR`).toBe(false);
        }
    });

    it('todos los trabajos llevan un enlace absoluto', () => {
        for (const job of buildQrJobs()) {
            expect(() => new URL(job.link), `enlace inválido en ${job.nombre}`).not.toThrow();
        }
    });

    it('es una función pura: no toca disco ni depende de los datos importados', () => {
        const fixture = {
            bloques: {
                certificados: { link: 'https://example.com/certs', qr: { desde: 'link', porItem: false } },
                publicaciones: {
                    qr: { desde: 'link', porItem: true },
                    items: [{ id: 'paper-a', link: 'https://example.com/paper' }],
                },
                proyectos: {
                    qr: { desde: 'github', porItem: true },
                    items: [
                        { id: 'proyecto-a', github: 'https://github.com/x/a' },
                        { id: 'sin-repo', github: '' },
                    ],
                },
                habilidades: { items: [{ id: 'x' }] },
            },
        };
        expect(buildQrJobs(fixture)).toEqual([
            { bloque: 'certificados', id: null, link: 'https://example.com/certs', nombre: 'qr_certificados.png' },
            { bloque: 'publicaciones', id: 'paper-a', link: 'https://example.com/paper', nombre: 'qr_publicaciones_paper-a.png' },
            { bloque: 'proyectos', id: 'proyecto-a', link: 'https://github.com/x/a', nombre: 'qr_proyectos_proyecto-a.png' },
        ]);
    });
});
