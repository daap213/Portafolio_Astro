import { describe, expect, it } from 'vitest';
import {
    conActivo,
    conDisenoNuevo,
    conToken,
    conVariante,
    leerToken,
    nuevoDiseno,
    problemasDeAltaDiseno,
    problemasDeBorrado,
    sinDiseno,
} from '../../admin/comun/disenos.js';
import { validar, resumir } from '@cv/validar.js';
import { TOKENS } from '@cv/disenos.js';
import { IDIOMAS } from '@cv/locales.js';
import { CONTENIDOS, TEXTOS } from '@cv/data/indice.js';
import comun from '@cv/data/comun.json' with { type: 'json' };
import seccionesWeb from '@cv/data/secciones.web.json' with { type: 'json' };
import seccionesCv from '@cv/data/secciones.cv.json' with { type: 'json' };
import disenos from '@cv/data/disenos.json' with { type: 'json' };

// Lo mismo que admin-secciones.test.js y por el mismo motivo: comprobar que lo
// que produce el panel pasa la validación ENTERA. Un diseño que no valida no se
// escribe (la API devuelve 422), así que el fallo se ve como "no se guarda" sin
// más pistas si no hay una prueba que lo diga.
//
// Sin dependencias del admin: solo JS puro y módulos del repositorio, para que
// corra en CI con la instalación de la raíz.

const estadoBase = () => structuredClone({
    locales: IDIOMAS,
    comun,
    contenidos: CONTENIDOS,
    textos: TEXTOS,
    seccionesWeb,
    seccionesCv,
    disenos,
});

const sinErrores = (estado) => {
    const resultado = validar(estado);
    expect(resultado.errores, `\n${resumir(resultado)}`).toEqual([]);
};

describe('alta de diseños', () => {
    it('un diseño duplicado valida sin errores', () => {
        const estado = estadoBase();
        estado.disenos = conDisenoNuevo(estado.disenos, {
            desde: estado.disenos.disenos[0],
            id: 'copia',
            nombre: 'Copia',
        });
        sinErrores(estado);
    });

    it('el duplicado se lleva todos los tokens del original', () => {
        // Un diseño en blanco dejaría todas las custom properties sin resolver:
        // fondo transparente y texto heredado. Por eso duplicar es la única vía.
        const original = disenos.disenos[0];
        const copia = nuevoDiseno({ desde: original, id: 'copia', nombre: 'Copia' });

        expect(Object.keys(copia.tokens).sort()).toEqual(Object.keys(original.tokens).sort());
        expect(copia.id).toBe('copia');
        expect(copia.nombre).toBe('Copia');
    });

    it('nuevoDiseno no toca el diseño del que copia', () => {
        const original = structuredClone(disenos.disenos[0]);
        const antes = JSON.stringify(original);
        nuevoDiseno({ desde: original, id: 'copia', nombre: 'Copia' });
        expect(JSON.stringify(original)).toBe(antes);
    });

    it('rechaza un id repetido y uno vacío', () => {
        const idsUsados = disenos.disenos.map((d) => d.id);
        expect(problemasDeAltaDiseno({ id: idsUsados[0], idsUsados })).not.toEqual([]);
        expect(problemasDeAltaDiseno({ id: '', idsUsados })).not.toEqual([]);
        expect(problemasDeAltaDiseno({ id: 'otro', idsUsados })).toEqual([]);
    });

    it('sin nombre se cae al id, que es lo que el panel enseña', () => {
        expect(nuevoDiseno({ desde: disenos.disenos[0], id: 'copia', nombre: '' }).nombre).toBe('copia');
    });
});

describe('borrado de diseños', () => {
    it('no deja borrar el único diseño', () => {
        const configuracion = { version: 1, activo: 'solo', disenos: [{ id: 'solo', nombre: 'Solo' }] };
        expect(problemasDeBorrado({ id: 'solo', configuracion })).not.toEqual([]);
    });

    it('no deja borrar el diseño activo', () => {
        const configuracion = conDisenoNuevo(disenos, {
            desde: disenos.disenos[0],
            id: 'otro',
            nombre: 'Otro',
        });
        expect(problemasDeBorrado({ id: configuracion.activo, configuracion })).not.toEqual([]);
        expect(problemasDeBorrado({ id: 'otro', configuracion })).toEqual([]);
    });

    it('borrar deja un estado que sigue validando', () => {
        const estado = estadoBase();
        estado.disenos = conDisenoNuevo(estado.disenos, {
            desde: estado.disenos.disenos[0],
            id: 'temporal',
            nombre: 'Temporal',
        });
        estado.disenos = sinDiseno(estado.disenos, 'temporal');

        expect(estado.disenos.disenos.map((d) => d.id)).not.toContain('temporal');
        sinErrores(estado);
    });
});

describe('edición de un diseño', () => {
    it('activar otro diseño deja un estado válido', () => {
        const estado = estadoBase();
        estado.disenos = conDisenoNuevo(estado.disenos, {
            desde: estado.disenos.disenos[0],
            id: 'otro',
            nombre: 'Otro',
        });
        estado.disenos = conActivo(estado.disenos, 'otro');

        expect(estado.disenos.activo).toBe('otro');
        sinErrores(estado);
    });

    it('un token por tema se guarda como {claro, oscuro} y el resto como cadena', () => {
        // Guardar la forma equivocada no rompe nada visible en el panel, pero
        // deja el tema oscuro sin valor: la forma la decide el catálogo.
        const porTema = TOKENS.find((t) => t.porTema);
        const suelto = TOKENS.find((t) => !t.porTema);
        const id = disenos.disenos[0].id;

        const conColor = conToken(disenos, id, porTema.clave, 'oscuro', '#123456');
        expect(conColor.disenos[0].tokens[porTema.clave].oscuro).toBe('#123456');
        expect(conColor.disenos[0].tokens[porTema.clave].claro).toBe(
            disenos.disenos[0].tokens[porTema.clave].claro,
        );

        const conTexto = conToken(disenos, id, suelto.clave, 'claro', 'monospace');
        expect(conTexto.disenos[0].tokens[suelto.clave]).toBe('monospace');
    });

    it('conToken no toca la configuración que recibe', () => {
        const antes = JSON.stringify(disenos);
        conToken(disenos, disenos.disenos[0].id, 'acento', 'claro', '#ff0000');
        expect(JSON.stringify(disenos)).toBe(antes);
    });

    it('conToken se niega con un token que no está en el catálogo', () => {
        expect(() => conToken(disenos, disenos.disenos[0].id, 'inventado', 'claro', 'x')).toThrow(
            /desconocido/,
        );
    });

    it('una variante vacía borra la clave en vez de guardar ""', () => {
        // Guardar "" sería una variante inexistente y la validación lo
        // rechazaría; lo que quiere decir el desplegable vacío es "la del diseño"
        const id = disenos.disenos[0].id;
        const puesta = conVariante(disenos, id, 'proyectos', 'clasico');
        expect(puesta.disenos[0].variantes.proyectos).toBe('clasico');

        const quitada = conVariante(puesta, id, 'proyectos', '');
        expect('proyectos' in quitada.disenos[0].variantes).toBe(false);

        const estado = estadoBase();
        estado.disenos = quitada;
        sinErrores(estado);
    });

    it('leerToken devuelve cadena vacía y no undefined cuando no hay valor', () => {
        // Un input controlado de React con value={undefined} pasa a no
        // controlado y avisa por consola en cada tecla
        const vacio = { id: 'x', tokens: {} };
        for (const token of TOKENS) {
            expect(leerToken(vacio, token, 'claro'), token.clave).toBe('');
        }
    });

    it('una cadena suelta en un token por tema vale para los dos temas', () => {
        const porTema = TOKENS.find((t) => t.porTema);
        const diseno = { id: 'x', tokens: { [porTema.clave]: '#abcdef' } };
        expect(leerToken(diseno, porTema, 'claro')).toBe('#abcdef');
        expect(leerToken(diseno, porTema, 'oscuro')).toBe('#abcdef');
    });
});
