import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { glob } from 'node:fs/promises';
import { ui as uiEs } from '@cv/es';
import { ui as uiEn } from '@cv/en';

const SRC = resolve(import.meta.dirname, '../../src');

// Recorre los componentes buscando accesos `ui.loQueSea` para comprobar que
// esas claves existen realmente en es.js y en.js. El objeto ui viaja como prop
// sin tipar (`ui: any`), así que nada más detecta un nombre mal escrito.
async function clavesUsadasEnComponentes() {
    const usos = new Map();
    for await (const fichero of glob('**/*.astro', { cwd: SRC })) {
        const ruta = resolve(SRC, fichero);
        const contenido = readFileSync(ruta, 'utf8');
        for (const [, clave] of contenido.matchAll(/\bui\.([A-Za-z0-9_]+)/g)) {
            if (!usos.has(clave)) usos.set(clave, []);
            usos.get(clave).push(fichero);
        }
    }
    return usos;
}

describe('claves de traducción (ui)', () => {
    it('encuentra al menos un uso de ui.* en los componentes', async () => {
        expect((await clavesUsadasEnComponentes()).size).toBeGreaterThan(0);
    });

    it('toda clave ui.* leída por un componente existe en es.js y en.js', async () => {
        const usos = await clavesUsadasEnComponentes();
        const faltantes = [];

        for (const [clave, ficheros] of usos) {
            if (!(clave in uiEs)) faltantes.push(`es.js: ui.${clave} (usada en ${ficheros.join(', ')})`);
            if (!(clave in uiEn)) faltantes.push(`en.js: ui.${clave} (usada en ${ficheros.join(', ')})`);
        }

        expect(faltantes, `claves inexistentes:\n${faltantes.join('\n')}`).toEqual([]);
    });

    it('no hay claves de traducción definidas pero nunca usadas', async () => {
        const usadas = new Set((await clavesUsadasEnComponentes()).keys());
        const sinUsar = Object.keys(uiEs).filter((clave) => !usadas.has(clave));
        expect(sinUsar, `claves muertas en es.js/en.js: ${sinUsar.join(', ')}`).toEqual([]);
    });

    it('ninguna traducción está vacía', () => {
        for (const [nombre, ui] of [['es', uiEs], ['en', uiEn]]) {
            for (const [clave, valor] of Object.entries(ui)) {
                expect(typeof valor, `${nombre}.${clave} no es texto`).toBe('string');
                expect(valor.trim(), `${nombre}.${clave} está vacía`).not.toBe('');
            }
        }
    });
});
