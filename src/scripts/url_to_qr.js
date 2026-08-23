import { writeFileSync, mkdirSync } from 'fs'; // Importar módulo 'fs'
import { toBuffer } from 'qrcode'; // Importar biblioteca 'qrcode'
import { pathToFileURL } from 'url';
import { enlaceQr } from '../cv_info/tipos.js';
import comun from '../cv_info/data/comun.json' with { type: 'json' };

// Carpeta por defecto donde se guardan los QR generados
export const QR_OUT_DIR = 'public/img/qr/';

// Nombre final del archivo PNG de un QR.
//
// Se deriva del `id` del item (slug ASCII), no del titulo: antes salia del
// titulo en ESPANOL, asi que renombrar un proyecto renombraba el fichero y
// dejaba a los demas idiomas apuntando a un PNG inexistente. Ademas los nombres
// llevaban tildes, que se corrompen al viajar entre Windows y Linux.
export function qrFileName(bloque, id) {
    return `qr_${bloque}${id ? '_' + id : ''}.png`;
}

/**
 * Construye la lista de QR a generar leyendo comun.json.
 *
 * Cada bloque declara de que campo sale su QR:
 *   "qr": { "desde": "github", "porItem": true }   -> un QR por item
 *   "qr": { "desde": "link",   "porItem": false }  -> un QR para el bloque
 *
 * `desde` tambien admite una LISTA por orden de preferencia:
 *   "qr": { "desde": ["github", "link"], "porItem": true }
 * Se coge el primer campo con valor, asi que un proyecto de repositorio
 * privado saca su QR del enlace publico a la aplicacion en vez de quedarse
 * sin ninguno. La resolucion vive en tipos.js porque cv.js tiene que aplicar
 * exactamente la misma para que el dato apunte al PNG que este script escribe.
 *
 * Recibe los datos por parametro para poder testearla sin tocar disco.
 */
export function buildQrJobs(datos = comun) {
    const trabajos = [];

    for (const [bloque, contenido] of Object.entries(datos.bloques)) {
        const qr = contenido.qr;
        if (!qr) continue;

        if (!qr.porItem) {
            const enlace = enlaceQr(contenido, qr.desde);
            if (enlace) trabajos.push({ bloque, id: null, link: enlace, nombre: qrFileName(bloque) });
            continue;
        }

        for (const item of contenido.items ?? []) {
            const enlace = enlaceQr(item, qr.desde);
            if (!enlace) continue;
            trabajos.push({ bloque, id: item.id, link: enlace, nombre: qrFileName(bloque, item.id) });
        }
    }

    return trabajos;
}

// Genera y guarda las imágenes QR. Devuelve los nombres de archivo escritos.
export async function generateQrFiles(jobs, outDir = QR_OUT_DIR) {
    mkdirSync(outDir, { recursive: true });
    const escritos = [];
    for (const dato of jobs) {
        const imagenQR = await toBuffer(dato.link); // Generar código QR como buffer
        writeFileSync(outDir + dato.nombre, imagenQR); // Guardar la imagen QR
        escritos.push(dato.nombre);
    }
    return escritos;
}

async function main() {
    const jobs = buildQrJobs();
    console.log(jobs.map((j) => `${j.nombre} <- ${j.link}`).join('\n'));
    const escritos = await generateQrFiles(jobs);
    console.log(`\n${escritos.length} QR generados en ${QR_OUT_DIR}`);
}

const esEntrypoint = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (esEntrypoint) {
    await main();
}
