import { describe, expect, it } from 'vitest';
import { anadirIdioma, quitarIdioma } from '../../admin/api/lib/idiomas.js';
import { validar, resumir } from '@cv/validar.js';
import { IDIOMAS } from '@cv/locales.js';
import { CONTENIDOS, TEXTOS } from '@cv/data/indice.js';
import comun from '@cv/data/comun.json' with { type: 'json' };
import seccionesWeb from '@cv/data/secciones.web.json' with { type: 'json' };
import seccionesCv from '@cv/data/secciones.cv.json' with { type: 'json' };

// Dar de alta un idioma toca los seis sitios donde vive: locales.json, un
// contenido, unos textos y los `textos.<idioma>` de las dos listas de secciones.
// Son funciones puras: devuelven un estado nuevo y quien escribe es la API.

const estadoBase = () => structuredClone({
    locales: IDIOMAS,
    comun,
    contenidos: CONTENIDOS,
    textos: TEXTOS,
    seccionesWeb,
    seccionesCv,
});

describe('alta de idioma', () => {
    it('deja un estado que valida sin errores', () => {
        const nuevo = anadirIdioma(estadoBase(), { codigo: 'fr', etiqueta: 'fr', nombre: 'Français' });
        const resultado = validar(nuevo);
        expect(resultado.errores, `\n${resumir(resultado)}`).toEqual([]);
    });

    it('siembra contenido, textos y los textos de las dos listas', () => {
        const nuevo = anadirIdioma(estadoBase(), { codigo: 'fr' });
        expect(nuevo.contenidos.fr).toBeTruthy();
        expect(nuevo.textos.fr).toBeTruthy();
        for (const configuracion of [nuevo.seccionesWeb, nuevo.seccionesCv]) {
            for (const seccion of configuracion.secciones) {
                expect(seccion.textos.fr, `${seccion.id} sin textos en fr`).toBeTruthy();
            }
        }
        expect(nuevo.seccionesWeb.contacto.textos.fr).toBeTruthy();
        expect(nuevo.seccionesWeb.pie.mencion.fr).toBeTruthy();
    });

    it('cada botón de CV lleva la etiqueta del idioma al que apunta', () => {
        // Antes se usaba el código del idioma NUEVO para todas las entradas, así
        // que en francés los tres botones decían "CV FR"
        const nuevo = anadirIdioma(estadoBase(), { codigo: 'fr' });
        const frances = nuevo.locales.find((idioma) => idioma.codigo === 'fr');
        for (const codigo of Object.keys(frances.botonCv)) {
            expect(frances.botonCv[codigo], `botonCv.${codigo}`).toContain(codigo.toUpperCase());
        }
        // Y los idiomas que ya existían ganan su etiqueta para el nuevo
        for (const idioma of nuevo.locales) expect(idioma.botonCv.fr).toBeTruthy();
    });

    it('sobrevive a una sección sin textos en vez de reventar', () => {
        const estado = estadoBase();
        delete estado.seccionesWeb.secciones[0].textos;
        expect(() => anadirIdioma(estado, { codigo: 'fr' })).not.toThrow();
    });

    it('rechaza un código repetido o con mala pinta', () => {
        expect(() => anadirIdioma(estadoBase(), { codigo: 'es' })).toThrow();
        expect(() => anadirIdioma(estadoBase(), { codigo: 'noesuncodigo' })).toThrow();
    });

    it('no toca el estado que recibe', () => {
        const estado = estadoBase();
        const antes = JSON.stringify(estado);
        anadirIdioma(estado, { codigo: 'fr' });
        expect(JSON.stringify(estado)).toBe(antes);
    });
});

describe('baja de idioma', () => {
    it('quita el idioma de todas partes y sigue validando', () => {
        const conFrances = anadirIdioma(estadoBase(), { codigo: 'fr' });
        const sinFrances = quitarIdioma(conFrances, 'fr');

        expect(sinFrances.locales.some((i) => i.codigo === 'fr')).toBe(false);
        expect(sinFrances.contenidos.fr).toBeUndefined();
        expect(sinFrances.textos.fr).toBeUndefined();
        for (const seccion of sinFrances.seccionesWeb.secciones) {
            expect(seccion.textos.fr).toBeUndefined();
        }
        for (const idioma of sinFrances.locales) expect(idioma.botonCv.fr).toBeUndefined();

        const resultado = validar(sinFrances);
        expect(resultado.errores, `\n${resumir(resultado)}`).toEqual([]);
    });

    it('se niega a quitar el idioma predeterminado', () => {
        const predeterminado = IDIOMAS.find((i) => i.predeterminado).codigo;
        expect(() => quitarIdioma(estadoBase(), predeterminado)).toThrow();
    });

    it('se niega a quitar uno que no existe', () => {
        expect(() => quitarIdioma(estadoBase(), 'zz')).toThrow();
    });
});
