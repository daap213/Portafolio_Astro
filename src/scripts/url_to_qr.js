import { writeFileSync } from 'fs'; // Importar módulo 'fs'
import { toDataURL, toBuffer, toString } from 'qrcode'; // Importar biblioteca 'qrcode'
import { es } from "./../cv_info/cv.js";

// Leer el archivo JSON
let ulrs = []
ulrs.push({ seccion: "certificados", link: es.certificados.link, nombre: "certificados_link" })
ulrs.push({ seccion: "publicaciones", link: es.publicaciones[0].link, nombre: "publicaciones_link" })

for (const proyecto of es.proyectos) {
    if (proyecto.github) {
        ulrs.push({
            seccion: "proyectos", link: proyecto.github, nombre: proyecto.title.replaceAll(" ", "_").replaceAll("/", "_")
        })
    }
}
console.log(ulrs)

// Procesar el JSON y generar QR's
for (const dato of ulrs) {
    const url = dato.link; // Extraer la URL
    const imagenQR = await toBuffer(url); // Generar código QR como buffer
    const nombreImg = 'qr_' + dato.nombre + '.png'
    // Guardar la imagen QR
    writeFileSync('public/img/qr/' + nombreImg, imagenQR);
}