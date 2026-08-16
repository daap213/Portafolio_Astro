import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import {
    ficherosDe,
    guardarEstado,
    leerEstado,
    marcaDeTiempo,
    partirNombreDeCopia,
    restaurarCopia,
} from '../../admin/api/lib/almacen.js';
import { FICHEROS } from '../../admin/api/rutas.js';

// El administrador escribe sobre el árbol de trabajo, así que la garantía que
// más importa es la negativa: si el estado propuesto no valida, el disco no se
// toca. Estas pruebas se apoyan en eso para poder correr sobre los datos reales
// sin peligro (un estado inválido no escribe, y uno idéntico tampoco).

const contenidoEnDisco = () =>
    Object.fromEntries(
        Object.values(FICHEROS)
            .filter((f) => typeof f === 'string')
            .map((ruta) => [ruta, readFileSync(ruta, 'utf8')]),
    );

describe('guardado validado', () => {
    it('un estado inválido se rechaza y no escribe nada', async () => {
        const antes = contenidoEnDisco();
        const estado = await leerEstado();
        estado.seccionesWeb.secciones.push({ id: 'rota', tipo: 'noExiste', bloque: 'tampoco', textos: {} });

        const resultado = await guardarEstado(estado, { marca: marcaDeTiempo() });

        expect(resultado.ok).toBe(false);
        expect(resultado.escritos).toEqual([]);
        expect(resultado.errores.map((e) => e.codigo)).toContain('TIPO_DESCONOCIDO');
        expect(contenidoEnDisco()).toEqual(antes);
    });

    it('sin idiomas devuelve el error, no una excepción', async () => {
        // validar.js calculaba el idioma predeterminado ANTES de comprobar que
        // hubiera alguno: con locales vacío lanzaba TypeError y la API respondía
        // un 500 opaco en vez del 422 que corresponde
        const estado = await leerEstado();
        const resultado = await guardarEstado({ ...estado, locales: [] }, { marca: marcaDeTiempo() });
        expect(resultado.ok).toBe(false);
        expect(resultado.errores.map((e) => e.codigo)).toContain('SIN_IDIOMAS');
    });

    it('una lista de secciones a null se rechaza en vez de escribir "null"', async () => {
        const antes = contenidoEnDisco();
        const estado = await leerEstado();
        const resultado = await guardarEstado({ ...estado, seccionesWeb: null }, { marca: marcaDeTiempo() });
        expect(resultado.ok).toBe(false);
        expect(contenidoEnDisco()).toEqual(antes);
    });

    // No hay prueba de "guardar sin cambios no escribe nada": obligaría a
    // escribir de verdad sobre los datos del repositorio. Esa rama (saltarse el
    // fichero cuyo texto coincide) se ejerce en cada guardado real; aquí se
    // cubre lo que de verdad protege, que es no escribir cuando algo no valida.

    it('ficherosDe cubre los dos ficheros de cada idioma', async () => {
        const estado = await leerEstado();
        const nombres = [...ficherosDe(estado).keys()].map((ruta) => basename(ruta));
        for (const idioma of estado.locales) {
            expect(nombres).toContain(`contenido.${idioma.codigo}.json`);
            expect(nombres).toContain(`ui.${idioma.codigo}.json`);
        }
        expect(nombres).toContain('comun.json');
        expect(nombres).toContain('locales.json');
    });
});

describe('copias de seguridad', () => {
    it('la marca de tiempo vale como nombre de fichero', () => {
        // Ni ':' (ilegal en Windows) ni '.', que es lo que rompía el troceo
        const marca = marcaDeTiempo();
        expect(marca).not.toMatch(/[:.]/);
        expect(marca).toMatch(/^\d{4}-\d{2}-\d{2}T[\d-]+Z$/);
    });

    it('trocea el nombre de una copia, del formato nuevo y del antiguo', () => {
        expect(partirNombreDeCopia('comun.json@2026-08-15T18-47-11-511Z')).toEqual({
            fichero: 'comun.json',
            marca: '2026-08-15T18-47-11-511Z',
        });
        // Las copias viejas llevaban un punto, y la marca ISO también: partir
        // por el último punto daba "comun.json.2026-08-15T18-47-11" y restaurar
        // escribía un fichero basura dentro de src/cv_info/data
        expect(partirNombreDeCopia('comun.json.2026-08-15T18-47-11.511Z')).toEqual({
            fichero: 'comun.json',
            marca: '2026-08-15T18-47-11.511Z',
        });
        expect(partirNombreDeCopia('cualquier-cosa')).toBeNull();
    });

    it('restaurar exige una copia de verdad y un destino que exista', async () => {
        await expect(restaurarCopia('no-existe-nada')).rejects.toThrow();
        await expect(restaurarCopia('inventado.json@2026-08-15T18-47-11-511Z')).rejects.toThrow();
    });
});
