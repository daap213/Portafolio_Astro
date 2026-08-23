import { describe, expect, it } from 'vitest';
import {
    aSlug,
    conBloqueNuevo,
    huecoDeBloque,
    nuevaSeccion,
    opcionesPorDefecto,
    problemasDeAlta,
    RELLENO,
    tipoDelBloque,
} from '../../admin/comun/secciones.js';
import { validar, resumir } from '@cv/validar.js';
import { TIPOS } from '@cv/tipos.js';
import { IDIOMAS } from '@cv/locales.js';
import { CONTENIDOS, TEXTOS } from '@cv/data/indice.js';
import comun from '@cv/data/comun.json' with { type: 'json' };
import seccionesWeb from '@cv/data/secciones.web.json' with { type: 'json' };
import seccionesCv from '@cv/data/secciones.cv.json' with { type: 'json' };
import disenos from '@cv/data/disenos.json' with { type: 'json' };

// Crear una sección desde el administrador era imposible: validar.js rechaza
// cualquier sección que apunte a un bloque inexistente, y el formulario no
// sabía crear bloques. Estas pruebas comprueban lo único que importa de verdad:
// que lo que genera el alta pasa la validación entera, sin un solo error.

const CODIGOS = IDIOMAS.map((idioma) => idioma.codigo);
const estadoBase = () => structuredClone({
    locales: IDIOMAS,
    comun,
    contenidos: CONTENIDOS,
    textos: TEXTOS,
    seccionesWeb,
    seccionesCv,
    disenos,
});

/** Aplica un alta completa (bloque nuevo + sección) sobre un estado. */
function conSeccionNueva(estado, { lista, id, tipoNombre, claveBloque }) {
    const clave = lista === 'web' ? 'seccionesWeb' : 'seccionesCv';
    const { comun: nuevoComun, contenidos } = conBloqueNuevo({
        comun: estado.comun,
        contenidos: estado.contenidos,
        clave: claveBloque,
        tipo: TIPOS[tipoNombre],
    });

    const listaNueva = structuredClone(estado[clave]) ?? { version: 1, secciones: [] };
    listaNueva.secciones.push(
        nuevaSeccion({
            lista,
            id,
            tipoNombre,
            bloque: claveBloque,
            tipo: TIPOS[tipoNombre],
            idiomas: CODIGOS,
            modelo: listaNueva.secciones.at(-1),
        }),
    );

    return { ...estado, comun: nuevoComun, contenidos, [clave]: listaNueva };
}

describe('alta de sección con bloque nuevo', () => {
    // Todo tipo que se pueda usar en cada lista debe poder darse de alta
    const casos = [];
    for (const [nombre, tipo] of Object.entries(TIPOS)) {
        // perfil y presentacion leen de identidad/meta, no de un bloque propio
        if (tipo.origen === 'perfil') continue;
        for (const lista of tipo.alcance) casos.push([lista, nombre]);
    }

    // Lo que de verdad importa: crear una sección NO puede romper nada de lo que
    // ya había. Como mucho puede quedar pendiente rellenar un campo obligatorio
    // suyo que no se puede inventar (una imagen, un enlace del que sale un QR).
    // Antes rompía otros bloques: la pareja tipo/bloque por defecto hacía que
    // "experiencias" se validara con el tipo equivocado.
    it.each(casos)('en la lista de %s, un tipo "%s" no rompe nada ajeno', (lista, tipoNombre) => {
        const claveBloque = `bloquePrueba${tipoNombre}`;
        const nuevo = conSeccionNueva(estadoBase(), {
            lista,
            id: `prueba-${tipoNombre}`,
            tipoNombre,
            claveBloque,
        });
        const resultado = validar(nuevo);
        for (const error of resultado.errores) {
            expect(error.codigo, `\n${resumir(resultado)}`).toBe('CAMPO_REQUERIDO');
            expect(error.ruta, `error fuera del bloque nuevo:\n${resumir(resultado)}`).toContain(claveBloque);
        }
    });

    it('una sección de prosa nace ya válida, con texto de relleno', () => {
        // Es el caso normal de "quiero una sección nueva": si naciera vacía, la
        // validación la rechazaría y no habría nada que ver en la vista previa
        const nuevo = conSeccionNueva(estadoBase(), {
            lista: 'web',
            id: 'manifiesto',
            tipoNombre: 'texto',
            claveBloque: 'manifiesto',
        });
        const resultado = validar(nuevo);
        expect(resultado.errores, `\n${resumir(resultado)}`).toEqual([]);
        for (const codigo of CODIGOS) {
            expect(nuevo.contenidos[codigo].bloques.manifiesto.parrafos).toEqual([RELLENO]);
        }
    });

    it('una lista nace vacía y válida: los ítems se añaden después', () => {
        const nuevo = conSeccionNueva(estadoBase(), {
            lista: 'web',
            id: 'voluntariado',
            tipoNombre: 'cronologia',
            claveBloque: 'voluntariado',
        });
        const resultado = validar(nuevo);
        expect(resultado.errores, `\n${resumir(resultado)}`).toEqual([]);
    });

    it('crea el bloque en comun.json y en TODOS los idiomas', () => {
        const nuevo = conSeccionNueva(estadoBase(), {
            lista: 'web',
            id: 'voluntariado',
            tipoNombre: 'cronologia',
            claveBloque: 'voluntariado',
        });
        expect(nuevo.comun.bloques.voluntariado).toEqual({ items: [] });
        for (const codigo of CODIGOS) {
            expect(nuevo.contenidos[codigo].bloques.voluntariado, `falta en ${codigo}`).toEqual({ items: {} });
        }
    });

    it('un bloque de prosa vive solo en los contenidos, no en comun.json', () => {
        // Es la forma del "sobre mí": no hay nada común que guardar
        const nuevo = conSeccionNueva(estadoBase(), {
            lista: 'web',
            id: 'manifiesto',
            tipoNombre: 'texto',
            claveBloque: 'manifiesto',
        });
        expect(nuevo.comun.bloques.manifiesto).toBeUndefined();
        for (const codigo of CODIGOS) {
            expect(nuevo.contenidos[codigo].bloques.manifiesto).toEqual({ parrafos: [RELLENO] });
        }
    });

    it('la sección nueva trae textos de todos los idiomas', () => {
        const entrada = nuevaSeccion({
            lista: 'web',
            id: 'x',
            tipoNombre: 'texto',
            bloque: 'x',
            tipo: TIPOS.texto,
            idiomas: CODIGOS,
        });
        for (const codigo of CODIGOS) {
            expect(entrada.textos[codigo]).toEqual({ titulo: 'x', nav: 'x', ancla: 'x' });
        }
    });

    it('la entrada de CV no lleva icono, enNav ni ancla', () => {
        const entrada = nuevaSeccion({
            lista: 'cv',
            id: 'x',
            tipoNombre: 'texto',
            bloque: 'x',
            tipo: TIPOS.texto,
            idiomas: CODIGOS,
        });
        expect(entrada.icono).toBeUndefined();
        expect(entrada.enNav).toBeUndefined();
        expect(Object.keys(entrada.clases)).toEqual(['titulo']);
        expect(Object.keys(entrada.textos[CODIGOS[0]])).toEqual(['titulo']);
    });
});

describe('opciones sembradas', () => {
    it('se guardan con el valor por defecto del tipo, no vacías', () => {
        const entrada = nuevaSeccion({
            lista: 'web',
            id: 'p',
            tipoNombre: 'proyectos',
            bloque: 'proyectos',
            tipo: TIPOS.proyectos,
            idiomas: CODIGOS,
        });
        expect(entrada.opciones).toEqual({
            mostrarImagen: true,
            mostrarEnlace: true,
            mostrarEtiquetas: true,
        });
    });

    it('omite las opciones que no aplican a esa lista', () => {
        // mostrarQr es de impresión: ningún componente de la web pinta un QR
        expect(opcionesPorDefecto(TIPOS.proyectos, 'web')).not.toHaveProperty('mostrarQr');
        expect(opcionesPorDefecto(TIPOS.proyectos, 'cv')).toHaveProperty('mostrarQr', false);
    });
});

describe('comprobaciones previas al alta', () => {
    const bloquesExistentes = Object.keys(comun.bloques);

    it('acepta un alta correcta', () => {
        expect(
            problemasDeAlta({
                id: 'nueva',
                modo: 'nuevo',
                claveBloque: 'nueva',
                idsUsados: ['proyectos'],
                bloquesExistentes,
                tipoNombre: 'texto',
            }),
        ).toEqual([]);
    });

    it('rechaza un id repetido y uno vacío', () => {
        expect(problemasDeAlta({ id: '', modo: 'nuevo', claveBloque: 'x' })).toHaveLength(1);
        expect(
            problemasDeAlta({ id: 'proyectos', modo: 'nuevo', claveBloque: 'x', idsUsados: ['proyectos'] }),
        ).toHaveLength(1);
    });

    it('rechaza crear un bloque que ya existe', () => {
        const problemas = problemasDeAlta({
            id: 'otro',
            modo: 'nuevo',
            claveBloque: 'proyectos',
            bloquesExistentes,
            tipoNombre: 'proyectos',
        });
        expect(problemas.join(' ')).toMatch(/ya existe/);
    });

    it('rechaza reutilizar un bloque con un tipo distinto del que ya lo muestra', () => {
        // Este era EL fallo: la pareja por defecto era presentacion+experiencias,
        // y validar.js resuelve el tipo de un bloque con la última sección que lo
        // nombra, así que "experiencias" pasaba a validarse como "presentacion" y
        // salía un muro de CAMPO_REQUERIDO sobre ítems que nadie había tocado.
        const problemas = problemasDeAlta({
            id: 'otra',
            modo: 'existente',
            claveBloque: 'experiencias',
            bloquesExistentes,
            tipoNombre: 'presentacion',
            tipoDelBloque: tipoDelBloque([seccionesWeb, seccionesCv], 'experiencias'),
        });
        expect(problemas.join(' ')).toMatch(/ya se muestra con el tipo "cronologia"/);
    });

    it('y ese estado, si se colara, sería efectivamente inválido', () => {
        // Se usa `referencias`, que solo aparece en la lista del CV. Con un
        // bloque que está en las DOS listas el choque queda tapado: validar.js
        // recorre [web, cv] y la entrada del CV vuelve a imponer el tipo bueno.
        // Otra razón para comprobarlo en el formulario y no fiarlo a la
        // validación, que solo se entera a veces.
        const roto = estadoBase();
        roto.seccionesCv.secciones.push(
            nuevaSeccion({
                lista: 'cv',
                id: 'colada',
                tipoNombre: 'cronologia',
                bloque: 'referencias',
                tipo: TIPOS.cronologia,
                idiomas: CODIGOS,
            }),
        );
        const { errores } = validar(roto);
        expect(errores.length).toBeGreaterThan(0);
        expect(errores.every((e) => e.codigo === 'CAMPO_REQUERIDO')).toBe(true);
        expect(errores.some((e) => e.ruta.includes('referencias'))).toBe(true);
    });
});

describe('huecos y slugs', () => {
    it('cada forma tiene su hueco', () => {
        // Con el tipo entero: los obligatorios de prosa nacen con relleno
        expect(huecoDeBloque(TIPOS.cronologia)).toEqual({ comun: { items: [] }, traducido: { items: {} } });
        expect(huecoDeBloque(TIPOS.texto)).toEqual({ comun: null, traducido: { parrafos: [RELLENO] } });
        // Solo con la forma sigue valiendo, sin sembrar nada
        expect(huecoDeBloque('lista')).toEqual({ comun: { items: [] }, traducido: { items: {} } });
        expect(huecoDeBloque('objeto')).toEqual({ comun: {}, traducido: {} });
    });

    it('el slug quita tildes y espacios: de él sale el ancla de la URL', () => {
        expect(aSlug('Sección Nueva')).toBe('seccion-nueva');
        expect(aSlug('  ¿Qué hago?  ')).toBe('que-hago');
        expect(aSlug('###')).toBe('');
    });

    it('conBloqueNuevo no toca el estado que recibe', () => {
        const original = estadoBase();
        const antes = JSON.stringify(original.comun);
        conBloqueNuevo({ comun: original.comun, contenidos: original.contenidos, clave: 'x', tipo: TIPOS.cronologia });
        expect(JSON.stringify(original.comun)).toBe(antes);
    });
});
