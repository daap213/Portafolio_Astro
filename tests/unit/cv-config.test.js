import { describe, expect, it } from 'vitest';
import * as configEs from '@cv/es';
import * as configEn from '@cv/en';

const IDIOMAS = [['es', configEs], ['en', configEn]];

// Todas las secciones de la home, en orden: la primera va fuera del bucle en index.astro
const seccionesDe = (config) => [config.pagIndex.primeraSeccion, ...config.pagIndex.secciones];

describe('paridad entre es.js y en.js', () => {
    it('exportan exactamente los mismos nombres', () => {
        expect(Object.keys(configEn).sort()).toEqual(Object.keys(configEs).sort());
    });

    it('navItems tiene la misma longitud', () => {
        // Los ids sí difieren a propósito: las anclas están traducidas
        // (#sobre-mi en español, #about_me en inglés)
        expect(configEn.navItems).toHaveLength(configEs.navItems.length);
    });

    it('la home tiene el mismo número de secciones', () => {
        expect(seccionesDe(configEn)).toHaveLength(seccionesDe(configEs).length);
    });

    it('cada sección usa el mismo componente en ambos idiomas', () => {
        const seccionesEs = seccionesDe(configEs);
        seccionesDe(configEn).forEach((seccion, i) => {
            expect(seccion.seccion).toBe(seccionesEs[i].seccion);
        });
    });

    it('el objeto ui tiene las mismas claves', () => {
        expect(Object.keys(configEn.ui).sort()).toEqual(Object.keys(configEs.ui).sort());
    });

    it('los botones del hero son los mismos y en el mismo orden', () => {
        expect(configEn.sobreMi.botones).toHaveLength(configEs.sobreMi.botones.length);
        expect(configEn.sobreMi.botones.map((b) => b.url)).toEqual(
            configEs.sobreMi.botones.map((b) => b.url),
        );
    });
});

describe.each(IDIOMAS)('coherencia de la configuración (%s)', (_idioma, config) => {
    it('cada navItem con ancla apunta a una sección existente', () => {
        const idsDeSeccion = new Set(seccionesDe(config).map((s) => s.navitems.id));
        for (const item of config.navItems) {
            expect(item.url).toBe('#' + item.id);
            expect(idsDeSeccion.has(item.id), `el ancla ${item.url} no tiene sección`).toBe(true);
        }
    });

    it('cada sección declara nombre, componente y datos', () => {
        for (const seccion of seccionesDe(config)) {
            expect(seccion.name, 'sección sin nombre').toBeTruthy();
            expect(seccion.seccion, `${seccion.name}: sin componente`).toBeTruthy();
            expect(seccion.seccionInfo, `${seccion.name}: sin datos`).toBeDefined();
        }
    });

    it('los ids de sección son únicos', () => {
        const ids = seccionesDe(config).map((s) => s.navitems.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('el footer y los botones del hero apuntan a URLs utilizables', () => {
        const urls = [
            config.footerInfor.url,
            config.footerInfor.urlMencion,
            ...config.sobreMi.botones.map((b) => b.url),
        ];
        for (const url of urls) {
            expect(url, 'URL vacía en footer/hero').toBeTruthy();
            const esAbsoluta = url.startsWith('http') || url.startsWith('mailto:');
            const esRutaLocal = url.startsWith('/');
            expect(esAbsoluta || esRutaLocal, `URL sospechosa: ${url}`).toBe(true);
        }
    });

    it('los enlaces a los PDF del CV apuntan a public/docs', () => {
        const pdfs = config.sobreMi.botones.map((b) => b.url).filter((u) => u.endsWith('.pdf'));
        expect(pdfs).toHaveLength(2);
        for (const pdf of pdfs) {
            expect(pdf).toMatch(/docs\/CV_(EN|ESP)\.pdf$/);
        }
    });
});
