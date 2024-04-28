import { launch } from 'puppeteer';
import { config } from './../../config.js'

let isPROD = true
try {
    isPROD = import.meta.env.PROD
} catch (error) {
}
const urlweb = (isPROD) ? config.prod.URLWEB : config.dev.URLWEB
const generatePDF = async (pageURL, pdfFilePath) => {
    console.log("pdf-cv", pageURL, pdfFilePath)

    const browser = await launch();
    const page = await browser.newPage();

    // Cambiar el modo de visualización a modo de impresión
    await page.emulateMediaType('print');

    await page.goto(pageURL, { waitUntil: 'networkidle2' });
    await page.waitForSelector('body'); // Esperar a que el cuerpo de la página esté presente

    // Definir las opciones del PDF, incluyendo displayHeaderFooter, headerTemplate y footerTemplate
    const pdfOptions = {
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

    // Generar el PDF con las opciones definidas
    await page.pdf(pdfOptions);

    console.log(`PDF generado en: ${pdfFilePath}`);

    await browser.close();
};

const urlEn = urlweb + "en/cv"
const urlEs = urlweb + "es/cv"

// Generar el PDF para la versión en inglés
generatePDF(urlEn, "public/docs/test/CV_EN.pdf");

// Generar el PDF para la versión en español
generatePDF(urlEs, "public/docs/test/CV_ESP.pdf");
