import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { borrarImagen, imagenesUsadas, inventario, MOTIVOS, nombreSeguro } from '../../admin/api/lib/medios.js';
import { CONTENIDOS } from '@cv/data/indice.js';
import comun from '@cv/data/comun.json' with { type: 'json' };

// El inventario de medios decide qué imagen se puede BORRAR, así que un falso
// "no la usa nadie" es una vía directa a perder un fichero que el sitio
// necesita. Durante un tiempo solo se miraban dos claves de comun.json, y se
// escapaban el favicon (que se referencia desde el código) y los once QR (cuyo
// nombre se deriva en tiempo de ejecución y no está guardado en ningún sitio).

const estado = () => ({ comun, contenidos: CONTENIDOS });
const aRutaDeDisco = (ruta) => resolve(process.cwd(), 'public', ruta);

describe('imágenes en uso', () => {
    it('cuenta las rutas que están en los datos', async () => {
        const usadas = await imagenesUsadas(estado());
        expect(usadas.get('img/me.webp')).toContain(MOTIVOS.datos);
        expect(usadas.get(comun.bloques.previewFooter.logo)).toContain(MOTIVOS.datos);
        for (const proyecto of comun.bloques.proyectos.items) {
            if (!proyecto.image) continue;
            expect(usadas.get(proyecto.image), `${proyecto.id} no cuenta como usada`).toContain(MOTIVOS.datos);
        }
    });

    it('cuenta el favicon, que solo se nombra desde el código', async () => {
        // src/layouts/Layout.astro lo pone en el <link rel="icon">
        const usadas = await imagenesUsadas(estado());
        expect(usadas.get('img/logo.webp')).toContain(MOTIVOS.codigo);
    });

    it('cuenta los QR, cuyo nombre se deriva y no se guarda', async () => {
        const usadas = await imagenesUsadas(estado());
        const qr = [...usadas].filter(([, motivos]) => motivos.includes(MOTIVOS.qr));
        expect(qr.length, 'no se detectó ningún QR en uso').toBeGreaterThan(0);
        for (const [ruta] of qr) {
            expect(ruta.startsWith('img/qr/'), `${ruta} no está en img/qr/`).toBe(true);
            expect(existsSync(aRutaDeDisco(ruta)), `falta el PNG ${ruta}`).toBe(true);
        }
    });

    it('encuentra una ruta de imagen aunque esté en una clave nueva y anidada', async () => {
        // El recorrido es recursivo a propósito: la lista de claves escrita a
        // mano se quedaba corta en cuanto se añadía un campo de tipo imagen
        const inventado = structuredClone(comun);
        inventado.bloques.proyectos.items[0].portadaAlternativa = 'img/projects/sinfoto.webp';
        const usadas = await imagenesUsadas({ comun: inventado, contenidos: CONTENIDOS });
        expect(usadas.has('img/projects/sinfoto.webp')).toBe(true);
    });

    it('ninguna imagen en uso queda marcada como huérfana', async () => {
        const lista = await inventario(estado());
        const usadas = await imagenesUsadas(estado());
        for (const imagen of lista) {
            expect(imagen.usada, `${imagen.ruta}`).toBe(usadas.has(imagen.ruta));
            if (imagen.usada) expect(imagen.motivos.length).toBeGreaterThan(0);
        }
    });

    it('se niega a borrar una imagen en uso', async () => {
        await expect(borrarImagen('img/logo.webp', estado())).rejects.toMatchObject({ estado: 409 });
        expect(existsSync(aRutaDeDisco('img/logo.webp')), 'el favicon sigue en disco').toBe(true);
    });

    it('se niega a borrar algo de fuera de public/img', async () => {
        await expect(borrarImagen('../../src/cv_info/data/comun.json', estado())).rejects.toMatchObject({
            estado: 404,
        });
    });
});

describe('nombres de fichero', () => {
    it('normaliza a slug ASCII conservando la extensión', () => {
        expect(nombreSeguro('Diseño Mecánico.WEBP')).toBe('diseno-mecanico.webp');
        expect(nombreSeguro('  ??  .png')).toBe('imagen.png');
    });
});
