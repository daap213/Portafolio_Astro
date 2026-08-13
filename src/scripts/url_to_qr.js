import { writeFileSync, mkdirSync } from 'fs'; // Importar módulo 'fs'
import { toBuffer } from 'qrcode'; // Importar biblioteca 'qrcode'
import { pathToFileURL } from 'url';
import { es } from "../cv_info/cv.js";

// Carpeta por defecto donde se guardan los QR generados
export const QR_OUT_DIR = 'public/img/qr/';

// Convierte el título de un proyecto en la parte variable del nombre de archivo.
// Ojo: los QR se nombran siempre desde el título en ESPAÑOL, y los datos en
// inglés apuntan a esos mismos archivos.
export function sanitizeNombre(titulo) {
    return titulo.replaceAll(" ", "_").replaceAll("/", "_");
}

// Nombre final del archivo PNG de un QR
export function qrFileName(nombre) {
    return 'qr_' + nombre + '.png';
}

// Construye la lista de QR a generar a partir de los datos del CV.
// Recibe los datos por parámetro para poder testearla sin tocar disco.
export function buildQrJobs(datos) {
    const ulrs = [];
    ulrs.push({ seccion: "certificados", link: datos.certificados.link, nombre: "certificados_link" });
    ulrs.push({ seccion: "publicaciones", link: datos.publicaciones[0].link, nombre: "publicaciones_link" });

    for (const proyecto of datos.proyectos) {
        if (proyecto.github) {
            ulrs.push({
                seccion: "proyectos", link: proyecto.github, nombre: sanitizeNombre(proyecto.title)
            });
        }
    }
    return ulrs;
}

// Genera y guarda las imágenes QR. Devuelve los nombres de archivo escritos.
export async function generateQrFiles(jobs, outDir = QR_OUT_DIR) {
    mkdirSync(outDir, { recursive: true });
    const escritos = [];
    for (const dato of jobs) {
        const imagenQR = await toBuffer(dato.link); // Generar código QR como buffer
        const nombreImg = qrFileName(dato.nombre);
        writeFileSync(outDir + nombreImg, imagenQR); // Guardar la imagen QR
        escritos.push(nombreImg);
    }
    return escritos;
}

async function main() {
    const jobs = buildQrJobs(es);
    console.log(jobs);
    await generateQrFiles(jobs);
}

const esEntrypoint = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (esEntrypoint) {
    await main();
}
