import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { es, en, raizApp } from '@cv/cv';

const RAIZ = resolve(import.meta.dirname, '../..');

// Traduce una ruta pública del CV ("/img/qr/x.png") a una ruta de disco en public/
const aRutaDeDisco = (ruta) => resolve(RAIZ, 'public', ruta.slice(raizApp.length));

const IDIOMAS = [['es', es], ['en', en]];

// Arrays que deben tener la misma longitud en ambos idiomas
const ARRAYS_PARALELOS = [
    'sobremi',
    'experiencias',
    'gradosCompletados',
    'publicaciones',
    'habilidades',
    'proyectos',
    'referencias',
];

describe('paridad es/en', () => {
    it('ambos idiomas exportan exactamente las mismas claves', () => {
        expect(Object.keys(en).sort()).toEqual(Object.keys(es).sort());
    });

    it.each(ARRAYS_PARALELOS)('%s tiene la misma longitud en es y en', (clave) => {
        expect(Array.isArray(es[clave])).toBe(true);
        expect(en[clave]).toHaveLength(es[clave].length);
    });

    it('certificados.items tiene la misma longitud en ambos idiomas', () => {
        expect(en.certificados.items).toHaveLength(es.certificados.items.length);
    });

    it('los datos que no se traducen coinciden entre idiomas', () => {
        // `cumpleaños`, `ubicacion` y los títulos sí se traducen; estos no deberían
        for (const clave of ['nombre', 'siglasNombre', 'correo', 'git_user', 'linkedin_user', 'mi_web']) {
            expect(en[clave], `desincronizado: ${clave}`).toBe(es[clave]);
        }
    });

    it('cada proyecto apunta al mismo enlace y QR en ambos idiomas', () => {
        es.proyectos.forEach((proyecto, i) => {
            expect(en.proyectos[i].github).toBe(proyecto.github);
            expect(en.proyectos[i].qr).toBe(proyecto.qr);
            expect(en.proyectos[i].image).toBe(proyecto.image);
        });
    });
});

describe.each(IDIOMAS)('integridad de los datos (%s)', (_idioma, datos) => {
    it('todas las imágenes de proyecto existen en public/', () => {
        for (const proyecto of datos.proyectos) {
            expect(existsSync(aRutaDeDisco(proyecto.image)), `falta ${proyecto.image}`).toBe(true);
        }
    });

    it('todos los QR referenciados existen en public/', () => {
        const referencias = [
            datos.certificados.qr,
            ...datos.publicaciones.map((p) => p.qr),
            ...datos.proyectos.map((p) => p.qr),
        ].filter(Boolean);

        expect(referencias.length).toBeGreaterThan(0);
        for (const qr of referencias) {
            expect(existsSync(aRutaDeDisco(qr)), `falta ${qr}`).toBe(true);
        }
    });

    it('la imagen del previewFooter existe en public/', () => {
        expect(existsSync(aRutaDeDisco(datos.previewFooter.logo))).toBe(true);
    });

    it('todos los enlaces externos son URLs absolutas', () => {
        const enlaces = [
            datos.certificados.link,
            ...datos.publicaciones.map((p) => p.link),
            ...datos.proyectos.flatMap((p) => [p.link, p.github]),
        ].filter(Boolean);

        for (const enlace of enlaces) {
            expect(() => new URL(enlace), `URL inválida: ${enlace}`).not.toThrow();
            expect(enlace.startsWith('https://'), `no es https: ${enlace}`).toBe(true);
        }
    });

    it('cada proyecto tiene los campos que consume Projects.astro', () => {
        for (const proyecto of datos.proyectos) {
            expect(proyecto.title, 'proyecto sin título').toBeTruthy();
            expect(Array.isArray(proyecto.description)).toBe(true);
            expect(proyecto.description.length).toBeGreaterThan(0);
            expect(Array.isArray(proyecto.tags), `${proyecto.title}: tags debe ser array`).toBe(true);
            expect(proyecto.image, `${proyecto.title}: sin imagen`).toBeTruthy();
        }
    });

    it('cada experiencia tiene fecha, título, empresa y descripción', () => {
        for (const experiencia of datos.experiencias) {
            expect(experiencia.date).toBeTruthy();
            expect(experiencia.title).toBeTruthy();
            expect(experiencia.company).toBeTruthy();
            expect(experiencia.description.length).toBeGreaterThan(0);
        }
    });

    it('cada grado académico tiene fecha, título e institución', () => {
        for (const grado of datos.gradosCompletados) {
            expect(grado.date).toBeTruthy();
            expect(grado.title).toBeTruthy();
            expect(grado.institution).toBeTruthy();
        }
    });

    it('cada certificado tiene fecha y título', () => {
        for (const item of datos.certificados.items) {
            expect(item.date).toBeTruthy();
            expect(item.title).toBeTruthy();
        }
    });

    it('cada categoría de habilidades tiene nombre y al menos una skill', () => {
        for (const categoria of datos.habilidades) {
            expect(categoria.name).toBeTruthy();
            expect(categoria.skills.length).toBeGreaterThan(0);
        }
    });

    it('cada referencia tiene nombre, cargo y empresa', () => {
        for (const referencia of datos.referencias) {
            expect(referencia.nombre).toBeTruthy();
            expect(referencia.cargo).toBeTruthy();
            expect(referencia.empresa).toBeTruthy();
        }
    });
});
