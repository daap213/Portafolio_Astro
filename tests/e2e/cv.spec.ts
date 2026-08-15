import { expect, test } from '@playwright/test';
import { DATOS } from '../../src/cv_info/cv.js';
import { CODIGOS } from '../../src/cv_info/locales.js';

const VISTAS = CODIGOS.map((codigo) => ({ ruta: `/${codigo}/cv`, datos: DATOS[codigo] }));

// Estas son las páginas que Puppeteer imprime a PDF: si se rompen, el CV sale mal
test.describe('vistas del CV', () => {
    for (const { ruta, datos } of VISTAS) {
        test(`${ruta} muestra los datos de contacto`, async ({ page }) => {
            await page.goto(ruta);

            await expect(page.getByText(datos.nombre).first()).toBeVisible();
            await expect(page.getByText(datos.correo).first()).toBeVisible();
            await expect(page.getByText(datos.git_user).first()).toBeVisible();
        });

        test(`${ruta} lista experiencias, estudios y proyectos`, async ({ page }) => {
            await page.goto(ruta);
            const cuerpo = page.locator('body');

            for (const experiencia of datos.experiencias) {
                await expect(cuerpo).toContainText(experiencia.company);
            }
            for (const grado of datos.gradosCompletados) {
                await expect(cuerpo).toContainText(grado.institution);
            }
            for (const proyecto of datos.proyectos) {
                await expect(cuerpo).toContainText(proyecto.title);
            }
        });

        test(`${ruta}: todas las imágenes cargan (incluidos los QR)`, async ({ page }) => {
            await page.goto(ruta);
            await page.waitForLoadState('networkidle');

            const rotas = await page.evaluate(() =>
                Array.from(document.images)
                    .filter((img) => !img.complete || img.naturalWidth === 0)
                    .map((img) => img.getAttribute('src') ?? '(sin src)'),
            );

            expect(rotas, `imágenes que no cargan:\n${rotas.join('\n')}`).toEqual([]);
        });

        test(`${ruta} conserva el ancho de página para impresión`, async ({ page }) => {
            await page.goto(ruta);

            // El contenedor mide 21cm (A4): si esto cambia, el PDF se descuadra
            const ancho = await page.locator('.container').first().evaluate(
                (el) => getComputedStyle(el).maxWidth,
            );
            expect(ancho).toBe('793.701px'); // 21cm a 96dpi
        });

        test(`${ruta} se puede emular en modo impresión sin romperse`, async ({ page }) => {
            await page.goto(ruta);
            await page.emulateMedia({ media: 'print' });

            await expect(page.locator('body')).toBeVisible();
            const alto = await page.evaluate(() => document.body.scrollHeight);
            expect(alto, 'el CV quedó vacío en modo impresión').toBeGreaterThan(1000);
        });
    }
});
