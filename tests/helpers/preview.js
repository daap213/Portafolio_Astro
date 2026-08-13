import { execFile } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { promisify } from 'node:util';

const ejecutar = promisify(execFile);
const require = createRequire(import.meta.url);
const RAIZ = resolve(import.meta.dirname, '../..');

import { PUERTO_SCRIPTS } from './puertos.js';

// astro no expone ./bin/* en "exports", así que se localiza desde su entrada principal
function cliDeAstro() {
    const entrada = require.resolve('astro'); // <raiz>/dist/index.js
    return join(dirname(dirname(entrada)), 'bin', 'astro.mjs');
}

const astro = (...args) =>
    ejecutar(process.execPath, [cliDeAstro(), ...args], { cwd: RAIZ });

/**
 * Levanta `astro preview` para servir dist/.
 *
 * Desde Astro 7 el preview es un demonio: se arranca con --background y se
 * detiene con `astro preview stop`. Matar el proceso del CLI no lo para, y
 * dejarlo vivo hace que el siguiente arranque salga con "already running".
 */
export async function iniciarPreview({ puerto = PUERTO_SCRIPTS, timeoutMs = 60_000 } = {}) {
    await detener(); // limpia cualquier demonio de una ejecución anterior
    await astro('preview', '--background', '--host', '127.0.0.1', '--port', String(puerto));

    const baseUrl = `http://127.0.0.1:${puerto}/`;
    const limite = Date.now() + timeoutMs;

    while (Date.now() < limite) {
        try {
            const respuesta = await fetch(baseUrl, { signal: AbortSignal.timeout(2000) });
            if (respuesta.ok) return { baseUrl, stop: detener };
        } catch {
            // todavía no escucha
        }
        await new Promise((r) => setTimeout(r, 250));
    }

    await detener();
    throw new Error(`El preview no respondió en ${timeoutMs}ms`);
}

export async function detener() {
    try {
        await astro('preview', 'stop');
    } catch {
        // no había ninguno corriendo
    }
}
