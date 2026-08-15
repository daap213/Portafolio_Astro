import { describe, expect, it } from 'vitest';
import { IDIOMAS, configuracionDe } from '../helpers/configuraciones.js';
import { IDIOMA_PREDETERMINADO, otrosIdiomas, IDIOMAS as LOCALES } from '@cv/locales.js';

// Todas las secciones de la home, en orden: la primera va fuera del bucle en index.astro
const seccionesDe = (config) => [config.pagIndex.primeraSeccion, ...config.pagIndex.secciones];

const REFERENCIA = configuracionDe(IDIOMA_PREDETERMINADO.codigo);
const OTROS = otrosIdiomas(IDIOMA_PREDETERMINADO.codigo).map(({ codigo }) => [codigo, configuracionDe(codigo)]);

describe.each(OTROS)(`paridad de la configuración de ${IDIOMA_PREDETERMINADO.codigo} con %s`, (_codigo, config) => {
    it('exporta exactamente los mismos nombres', () => {
        expect(Object.keys(config).sort()).toEqual(Object.keys(REFERENCIA).sort());
    });

    it('navItems tiene la misma longitud', () => {
        // Los ids sí difieren a propósito: las anclas están traducidas
        // (#sobre-mi en español, #about_me en inglés)
        expect(config.navItems).toHaveLength(REFERENCIA.navItems.length);
    });

    it('la home tiene el mismo número de secciones', () => {
        expect(seccionesDe(config)).toHaveLength(seccionesDe(REFERENCIA).length);
    });

    it('cada sección usa el mismo componente', () => {
        const seccionesReferencia = seccionesDe(REFERENCIA);
        seccionesDe(config).forEach((seccion, i) => {
            expect(seccion.seccion).toBe(seccionesReferencia[i].seccion);
        });
    });

    it('el objeto ui tiene las mismas claves', () => {
        expect(Object.keys(config.ui).sort()).toEqual(Object.keys(REFERENCIA.ui).sort());
    });

    it('los botones del hero son los mismos y en el mismo orden', () => {
        expect(config.sobreMi.botones).toHaveLength(REFERENCIA.sobreMi.botones.length);
        expect(config.sobreMi.botones.map((b) => b.url)).toEqual(
            REFERENCIA.sobreMi.botones.map((b) => b.url),
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

    it('el hero enlaza un PDF del CV por cada idioma declarado', () => {
        const pdfs = config.sobreMi.botones.map((b) => b.url).filter((u) => u.endsWith('.pdf'));
        expect(pdfs).toHaveLength(LOCALES.length);
        const esperados = LOCALES.map(({ pdf }) => `docs/${pdf}`);
        for (const pdf of pdfs) {
            expect(esperados.some((esperado) => pdf.endsWith(esperado)), `PDF no declarado: ${pdf}`).toBe(true);
        }
    });
});
