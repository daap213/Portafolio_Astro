// Sincroniza los ficheros de un idioma con lo declarado en data/locales.json.
//
// Hace tres cosas, todas idempotentes:
//   1. crea data/contenido.<codigo>.json y data/ui.<codigo>.json si faltan,
//      copiandolos del idioma predeterminado (asi el sitio sigue publicandose
//      mientras se traduce);
//   2. anade `textos.<codigo>` a cada seccion de data/secciones.*.json,
//      copiando los del idioma predeterminado como punto de partida;
//   3. regenera data/indice.js, el unico modulo que enumera los idiomas.
//
// Es lo que ejecuta el administrador local al pulsar "anadir idioma", y lo que
// puede lanzarse a mano con `pnpm run idiomas`.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
export const DIR_DATOS = resolve(AQUI, '../cv_info/data');

const leerJson = (ruta) => JSON.parse(readFileSync(ruta, 'utf8'));
const escribirJson = (ruta, valor) => writeFileSync(ruta, JSON.stringify(valor, null, 2) + '\n', 'utf8');

/**
 * Siembra el idioma nuevo COPIANDO el de origen, no dejandolo en blanco.
 *
 * Se probo lo contrario y no vale: los campos obligatorios vacios hacen que la
 * validacion rechace el alta (y, si se colara, el sitio se publicaria con
 * titulos vacios y la suite en rojo mientras dura la traduccion). Copiando, el
 * sitio sigue siendo publicable desde el minuto uno y el administrador enumera
 * lo que todavia esta igual que el original.
 */
export const sembrarDesde = (valor) => structuredClone(valor);

/** Vacia todos los textos de una estructura, conservando su forma. */
export function vaciarTextos(valor) {
    if (typeof valor === 'string') return '';
    if (Array.isArray(valor)) return valor.map(vaciarTextos);
    if (valor && typeof valor === 'object') {
        return Object.fromEntries(Object.entries(valor).map(([clave, v]) => [clave, vaciarTextos(v)]));
    }
    return valor;
}

/** Contenido del modulo indice.js para unos codigos de idioma dados. */
export function generarIndice(codigos) {
    const imports = codigos
        .flatMap((codigo) => [
            `import contenido_${codigo} from "./contenido.${codigo}.json" with { type: "json" };`,
            `import ui_${codigo} from "./ui.${codigo}.json" with { type: "json" };`,
        ])
        .join('\n');

    const contenidos = codigos.map((codigo) => `  ${codigo}: contenido_${codigo},`).join('\n');
    const textos = codigos.map((codigo) => `  ${codigo}: ui_${codigo},`).join('\n');

    return `// GENERADO por src/scripts/sync_idiomas.js — no editar a mano.
//
// Es el unico sitio que enumera los ficheros de idioma. Se regenera con
// \`pnpm run idiomas\` (o desde el administrador local al anadir un idioma),
// asi que dar de alta un idioma no obliga a tocar codigo escrito a mano.
${imports}

/** contenido.<codigo>.json indexado por codigo de idioma. */
export const CONTENIDOS = {
${contenidos}
};

/** ui.<codigo>.json indexado por codigo de idioma. */
export const TEXTOS = {
${textos}
};
`;
}

/** Crea los ficheros que falten y regenera el indice. Devuelve un informe. */
export function sincronizar(dirDatos = DIR_DATOS) {
    const locales = leerJson(resolve(dirDatos, 'locales.json'));
    const codigos = locales.map((idioma) => idioma.codigo);
    const predeterminado = (locales.find((idioma) => idioma.predeterminado) ?? locales[0]).codigo;

    const creados = [];
    const seccionesTocadas = [];

    for (const codigo of codigos) {
        for (const plantilla of ['contenido', 'ui']) {
            const destino = resolve(dirDatos, `${plantilla}.${codigo}.json`);
            if (existsSync(destino)) continue;
            const origen = leerJson(resolve(dirDatos, `${plantilla}.${predeterminado}.json`));
            escribirJson(destino, sembrarDesde(origen));
            creados.push(`${plantilla}.${codigo}.json`);
        }
    }

    // Textos por idioma de cada seccion, en ambas listas
    for (const lista of ['secciones.web.json', 'secciones.cv.json']) {
        const ruta = resolve(dirDatos, lista);
        if (!existsSync(ruta)) continue;
        const configuracion = leerJson(ruta);
        let cambiada = false;

        const completar = (contenedor, etiqueta) => {
            if (!contenedor?.textos) return;
            for (const codigo of codigos) {
                if (contenedor.textos[codigo]) continue;
                contenedor.textos[codigo] = sembrarDesde(contenedor.textos[predeterminado]);
                seccionesTocadas.push(`${lista}: ${etiqueta} (${codigo})`);
                cambiada = true;
            }
        };

        completar(configuracion.contacto, 'contacto');
        for (const seccion of configuracion.secciones ?? []) completar(seccion, seccion.id);
        for (const codigo of codigos) {
            if (configuracion.pie && !(codigo in configuracion.pie.mencion)) {
                configuracion.pie.mencion[codigo] = configuracion.pie.mencion[predeterminado];
                seccionesTocadas.push(`${lista}: pie (${codigo})`);
                cambiada = true;
            }
        }

        if (cambiada) escribirJson(ruta, configuracion);
    }

    const indice = generarIndice(codigos);
    const rutaIndice = resolve(dirDatos, 'indice.js');
    const previo = existsSync(rutaIndice) ? readFileSync(rutaIndice, 'utf8') : '';
    if (previo !== indice) writeFileSync(rutaIndice, indice, 'utf8');

    return { codigos, creados, seccionesTocadas, indiceActualizado: previo !== indice };
}

async function main() {
    const informe = sincronizar();
    console.log('idiomas:', informe.codigos.join(', '));
    console.log('ficheros creados:', informe.creados.length ? informe.creados.join(', ') : 'ninguno');
    console.log('textos de sección añadidos:', informe.seccionesTocadas.length || 'ninguno');
    console.log('indice.js:', informe.indiceActualizado ? 'regenerado' : 'sin cambios');
    if (informe.creados.length || informe.seccionesTocadas.length) {
        console.log('\nQuedan textos vacíos por traducir. Reinicia `astro dev` si estaba corriendo.');
    }
}

const esEntrypoint = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (esEntrypoint) {
    await main();
}
