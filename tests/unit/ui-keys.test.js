import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { glob } from 'node:fs/promises';
import { IDIOMAS, configuracionDe } from '../helpers/configuraciones.js';
import { IDIOMA_PREDETERMINADO } from '@cv/locales.js';

const SRC = resolve(import.meta.dirname, '../../src');

// [codigo, objetoUi] de cada idioma declarado
const UIS = IDIOMAS.map(([codigo, config]) => [codigo, config.ui]);
const UI_REFERENCIA = configuracionDe(IDIOMA_PREDETERMINADO.codigo).ui;

// Recorre los componentes y los ensambladores buscando accesos `ui.loQueSea`
// para comprobar que esas claves existen en todos los ui.<idioma>.json. El
// objeto ui viaja como prop sin tipar (`ui: any`), así que nada más detecta un
// nombre mal escrito. Se miran también los .js porque paginaWeb/paginaCv
// componen algunos textos antes de pasarlos a la plantilla.
async function clavesUsadasEnComponentes() {
    const usos = new Map();
    for await (const fichero of glob('**/*.{astro,js}', { cwd: SRC })) {
        // cv_info/data solo tiene datos y el índice generado, cuyas rutas de
        // importación ("./ui.es.json") no son accesos a claves
        if (fichero.replaceAll('\\', '/').startsWith('cv_info/data/')) continue;
        const ruta = resolve(SRC, fichero);
        const contenido = readFileSync(ruta, 'utf8');
        // El lookbehind descarta rutas y accesos encadenados (".../ui.x", "config.ui.x")
        for (const [, clave] of contenido.matchAll(/(?<![/\w.])ui\.([A-Za-z0-9_]+)/g)) {
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

    it('toda clave ui.* leída por un componente existe en todos los idiomas', async () => {
        const usos = await clavesUsadasEnComponentes();
        const faltantes = [];

        for (const [clave, ficheros] of usos) {
            for (const [codigo, ui] of UIS) {
                if (!(clave in ui)) faltantes.push(`${codigo}: ui.${clave} (usada en ${ficheros.join(', ')})`);
            }
        }

        expect(faltantes, `claves inexistentes:\n${faltantes.join('\n')}`).toEqual([]);
    });

    it('no hay claves de traducción definidas pero nunca usadas', async () => {
        const usadas = new Set((await clavesUsadasEnComponentes()).keys());
        const sinUsar = Object.keys(UI_REFERENCIA).filter((clave) => !usadas.has(clave));
        expect(sinUsar, `claves muertas: ${sinUsar.join(', ')}`).toEqual([]);
    });

    it('todos los idiomas definen exactamente las mismas claves', () => {
        const referencia = Object.keys(UI_REFERENCIA).sort();
        for (const [codigo, ui] of UIS) {
            expect(Object.keys(ui).sort(), `${codigo} no coincide en claves ui`).toEqual(referencia);
        }
    });

    it('ninguna traducción está vacía', () => {
        for (const [codigo, ui] of UIS) {
            for (const [clave, valor] of Object.entries(ui)) {
                expect(typeof valor, `${codigo}.${clave} no es texto`).toBe('string');
                expect(valor.trim(), `${codigo}.${clave} está vacía`).not.toBe('');
            }
        }
    });
});
