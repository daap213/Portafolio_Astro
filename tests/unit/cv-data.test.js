import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { DATOS, raizApp } from '@cv/cv';
import { CODIGOS, IDIOMA_PREDETERMINADO, otrosIdiomas } from '@cv/locales.js';

const RAIZ = resolve(import.meta.dirname, '../..');

// Traduce una ruta pública del CV ("/img/qr/x.png") a una ruta de disco en public/
const aRutaDeDisco = (ruta) => resolve(RAIZ, 'public', ruta.slice(raizApp.length));

const IDIOMAS = CODIGOS.map((codigo) => [codigo, DATOS[codigo]]);

// El idioma predeterminado es la referencia contra la que se comparan los demás
const REFERENCIA = DATOS[IDIOMA_PREDETERMINADO.codigo];
const OTROS = otrosIdiomas(IDIOMA_PREDETERMINADO.codigo).map(({ codigo }) => [codigo, DATOS[codigo]]);

// Arrays que deben tener la misma longitud en todos los idiomas
const ARRAYS_PARALELOS = [
    'sobremi',
    'experiencias',
    'gradosCompletados',
    'publicaciones',
    'habilidades',
    'proyectos',
    'referencias',
];

// Campos que salen de comun.json: el cargador nunca debería hacerlos divergir
const CAMPOS_COMUNES = ['nombre', 'siglasNombre', 'correo', 'git_user', 'linkedin_user', 'mi_web'];

describe.each(OTROS)(`paridad de ${IDIOMA_PREDETERMINADO.codigo} con %s`, (_codigo, datos) => {
    it('exporta exactamente las mismas claves', () => {
        expect(Object.keys(datos).sort()).toEqual(Object.keys(REFERENCIA).sort());
    });

    it.each(ARRAYS_PARALELOS)('%s tiene la misma longitud', (clave) => {
        expect(Array.isArray(REFERENCIA[clave])).toBe(true);
        expect(datos[clave]).toHaveLength(REFERENCIA[clave].length);
    });

    it('certificados.items tiene la misma longitud', () => {
        expect(datos.certificados.items).toHaveLength(REFERENCIA.certificados.items.length);
    });

    it('los datos que no se traducen coinciden', () => {
        // `cumpleaños`, `ubicacion` y los títulos sí se traducen; estos no deberían
        for (const clave of CAMPOS_COMUNES) {
            expect(datos[clave], `desincronizado: ${clave}`).toBe(REFERENCIA[clave]);
        }
    });

    it('cada proyecto apunta al mismo enlace, imagen y QR', () => {
        REFERENCIA.proyectos.forEach((proyecto, i) => {
            expect(datos.proyectos[i].github).toBe(proyecto.github);
            expect(datos.proyectos[i].qr).toBe(proyecto.qr);
            expect(datos.proyectos[i].image).toBe(proyecto.image);
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
