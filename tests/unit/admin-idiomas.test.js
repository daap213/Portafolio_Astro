import { describe, expect, it } from 'vitest';
import { anadirIdioma, quitarIdioma } from '../../admin/api/lib/idiomas.js';
import { validar, resumir } from '@cv/validar.js';
import { IDIOMAS } from '@cv/locales.js';
import { CONTENIDOS, TEXTOS } from '@cv/data/indice.js';
import comun from '@cv/data/comun.json' with { type: 'json' };
import seccionesWeb from '@cv/data/secciones.web.json' with { type: 'json' };
import seccionesCv from '@cv/data/secciones.cv.json' with { type: 'json' };
import disenos from '@cv/data/disenos.json' with { type: 'json' };

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
    disenos,
});

// Un código que NO esté ya dado de alta: fijar "fr" a fuego hacía que la suite
// se cayera en cuanto alguien añadía el francés de verdad al portafolio.
const NUEVO = ['zz', 'qq', 'xy', 'ab', 'cd'].find(
    (codigo) => !IDIOMAS.some((idioma) => idioma.codigo === codigo),
);

describe('alta de idioma', () => {
    it('deja un estado que valida sin errores', () => {
        const nuevo = anadirIdioma(estadoBase(), { codigo: NUEVO });
        const resultado = validar(nuevo);
        expect(resultado.errores, `\n${resumir(resultado)}`).toEqual([]);
    });

    it('siembra contenido, textos y los textos de las dos listas', () => {
        const nuevo = anadirIdioma(estadoBase(), { codigo: NUEVO });
        expect(nuevo.contenidos[NUEVO]).toBeTruthy();
        expect(nuevo.textos[NUEVO]).toBeTruthy();
        for (const configuracion of [nuevo.seccionesWeb, nuevo.seccionesCv]) {
            for (const seccion of configuracion.secciones) {
                expect(seccion.textos[NUEVO], `${seccion.id} sin textos en ${NUEVO}`).toBeTruthy();
            }
        }
        expect(nuevo.seccionesWeb.contacto.textos[NUEVO]).toBeTruthy();
        expect(nuevo.seccionesWeb.pie.mencion[NUEVO]).toBeTruthy();
    });

    it('cada botón de CV lleva la etiqueta del idioma al que apunta', () => {
        // Antes se usaba el código del idioma NUEVO para todas las entradas, así
        // que en francés los tres botones decían "CV FR"
        const nuevo = anadirIdioma(estadoBase(), { codigo: NUEVO });
        const nuevoIdioma = nuevo.locales.find((idioma) => idioma.codigo === NUEVO);
        for (const codigo of Object.keys(nuevoIdioma.botonCv)) {
            expect(nuevoIdioma.botonCv[codigo], `botonCv.${codigo}`).toContain(codigo.toUpperCase());
        }
        // Y los idiomas que ya existían ganan su etiqueta para el nuevo
        for (const idioma of nuevo.locales) expect(idioma.botonCv[NUEVO]).toBeTruthy();
    });

    it('sobrevive a una sección sin textos en vez de reventar', () => {
        const estado = estadoBase();
        delete estado.seccionesWeb.secciones[0].textos;
        expect(() => anadirIdioma(estado, { codigo: NUEVO })).not.toThrow();
    });

    it('rechaza un código repetido o con mala pinta', () => {
        expect(() => anadirIdioma(estadoBase(), { codigo: 'es' })).toThrow();
        expect(() => anadirIdioma(estadoBase(), { codigo: 'noesuncodigo' })).toThrow();
    });

    it('no toca el estado que recibe', () => {
        const estado = estadoBase();
        const antes = JSON.stringify(estado);
        anadirIdioma(estado, { codigo: NUEVO });
        expect(JSON.stringify(estado)).toBe(antes);
    });
});

describe('baja de idioma', () => {
    it('quita el idioma de todas partes y sigue validando', () => {
        const conNuevo = anadirIdioma(estadoBase(), { codigo: NUEVO });
        const sinNuevo = quitarIdioma(conNuevo, NUEVO);

        expect(sinNuevo.locales.some((i) => i.codigo === NUEVO)).toBe(false);
        expect(sinNuevo.contenidos[NUEVO]).toBeUndefined();
        expect(sinNuevo.textos[NUEVO]).toBeUndefined();
        for (const seccion of sinNuevo.seccionesWeb.secciones) {
            expect(seccion.textos[NUEVO]).toBeUndefined();
        }
        for (const idioma of sinNuevo.locales) expect(idioma.botonCv[NUEVO]).toBeUndefined();

        const resultado = validar(sinNuevo);
        expect(resultado.errores, `\n${resumir(resultado)}`).toEqual([]);
    });

    it('se niega a quitar el idioma predeterminado', () => {
        const predeterminado = IDIOMAS.find((i) => i.predeterminado).codigo;
        expect(() => quitarIdioma(estadoBase(), predeterminado)).toThrow();
    });

    it('se niega a quitar uno que no existe', () => {
        expect(() => quitarIdioma(estadoBase(), NUEVO)).toThrow();
    });
});
