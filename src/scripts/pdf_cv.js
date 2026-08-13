import { launch as puppeteerLaunch } from 'puppeteer';
import { pathToFileURL } from 'url';
import { config } from './../../config.js'

// Selecciona la URL base según la variable de entorno PROD
export function resolveUrlWeb(prodEnv = process.env.PROD) {
    return (prodEnv == 'true') ? config.prod.URLWEB : config.dev.URLWEB;
}

// Pares (url de la vista, ruta del PDF de salida). Sin efectos secundarios.
export function buildPdfJobs(urlweb) {
    return [
        { url: urlweb + "en/cv", path: "public/docs/CV_EN.pdf" },
        { url: urlweb + "es/cv", path: "public/docs/CV_ESP.pdf" },
    ];
}

// Opciones de impresión, incluyendo displayHeaderFooter, headerTemplate y footerTemplate
export function buildPdfOptions(pdfFilePath) {
    return {
        path: pdfFilePath,
        displayHeaderFooter: true,
        headerTemplate: `<div style='width:100%;text-align: right; border-bottom: 1pt solid #eeeeee;'><span class="title"></span></div>`,
        footerTemplate: `
        <div style="color: lightgray; border-top: solid lightgray 1px; font-size: 14px; padding-top: 5px; text-align: center; width: 100%;">
        Act: <span class="date"></span> - <span>Pag:</span> <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>
        `,
        margin: {
            bottom: 50, // minimum required for footer msg to display
            top: 35,
        },
    };
}

// `launch` es inyectable para poder testear sin abrir un navegador real
export const generatePDF = async (pageURL, pdfFilePath, launch = puppeteerLaunch) => {
    console.log("pdf-cv", pageURL, pdfFilePath)

    const browser = await launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    // Cambiar el modo de visualización a modo de impresión
    await page.emulateMediaType('print');

    await page.goto(pageURL, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForSelector('body'); // Esperar a que el cuerpo de la página esté presente

    // Generar el PDF con las opciones definidas
    await page.pdf(buildPdfOptions(pdfFilePath));

    console.log(`PDF generado en: ${pdfFilePath}`);

    await browser.close();

    return pdfFilePath;
};

async function main() {
    const urlweb = resolveUrlWeb();
    console.log("PROD:", process.env.PROD, "-> base:", urlweb);
    // De uno en uno: dos Chrome simultáneos agotan la memoria en máquinas
    // ajustadas (y en los runners de CI) y uno de los dos PDF se queda a medias.
    for (const { url, path } of buildPdfJobs(urlweb)) {
        await generatePDF(url, path);
    }
}

const esEntrypoint = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (esEntrypoint) {
    await main();
}
