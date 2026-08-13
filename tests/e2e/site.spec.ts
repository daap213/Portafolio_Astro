import { expect, test } from '@playwright/test';
// Solo cv.js: es.js/en.js importan componentes .astro que el loader de Playwright no entiende
import { es, en } from '../../src/cv_info/cv.js';

const IDIOMAS = [
    { ruta: '/es/', idioma: 'es', datos: es, otro: '/en/' },
    { ruta: '/en/', idioma: 'en', datos: en, otro: '/es/' },
];

test.describe('portada', () => {
    test('la raíz sirve la versión en español', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('html')).toHaveAttribute('lang', 'es');
        await expect(page.locator('h2').first()).toBeVisible();
    });

    for (const { ruta, idioma, datos, otro } of IDIOMAS) {
        test(`${ruta} carga con su idioma y su contenido`, async ({ page }) => {
            await page.goto(ruta);

            await expect(page.locator('html')).toHaveAttribute('lang', idioma);
            await expect(page).toHaveTitle(datos.titleWeb);
            await expect(page.getByText(datos.nombre).first()).toBeVisible();
        });

        test(`${ruta}: cada ancla del menú lleva a una sección existente`, async ({ page }) => {
            await page.goto(ruta);

            const anclas = await page.locator('#navbar a[href^="#"]').evaluateAll(
                (enlaces) => enlaces.map((e) => e.getAttribute('href')!.slice(1)),
            );

            expect(anclas.length, 'el menú no tiene anclas').toBeGreaterThan(0);
            for (const ancla of anclas) {
                await expect(page.locator(`#${ancla}`), `sección ausente: #${ancla}`).toHaveCount(1);
            }
        });

        test(`${ruta}: al pulsar una sección del menú se navega a ella`, async ({ page }) => {
            await page.goto(ruta);

            const primera = page.locator('#navbar a[href^="#"]').first();
            const destino = (await primera.getAttribute('href'))!;
            await primera.click();

            await expect(page).toHaveURL(new RegExp(`${destino}$`));
            await expect(page.locator(destino)).toBeInViewport();
        });

        test(`${ruta} enlaza a ${otro} para cambiar de idioma`, async ({ page }) => {
            await page.goto(ruta);
            await page.locator(`#navbar a[href="${otro}"]`).click();

            await expect(page).toHaveURL(new RegExp(`${otro}$`));
            await expect(page.locator('html')).toHaveAttribute('lang', otro.replaceAll('/', ''));
        });

        test(`${ruta} renderiza todos los proyectos`, async ({ page }) => {
            await page.goto(ruta);

            for (const proyecto of datos.proyectos) {
                await expect(
                    page.getByRole('heading', { name: proyecto.title, exact: true }),
                    `falta el proyecto ${proyecto.title}`,
                ).toBeVisible();
            }
        });

        test(`${ruta}: todas las imágenes cargan`, async ({ page }) => {
            await page.goto(ruta);
            await page.waitForLoadState('networkidle');

            const rotas = await page.evaluate(() =>
                Array.from(document.images)
                    .filter((img) => !img.complete || img.naturalWidth === 0)
                    .map((img) => img.getAttribute('src') ?? '(sin src)'),
            );

            expect(rotas, `imágenes que no cargan:\n${rotas.join('\n')}`).toEqual([]);
        });

        test(`${ruta} no registra errores de consola`, async ({ page }) => {
            const errores: string[] = [];
            page.on('console', (msg) => { if (msg.type() === 'error') errores.push(msg.text()); });
            page.on('pageerror', (err) => errores.push(err.message));

            await page.goto(ruta);
            await page.waitForLoadState('networkidle');

            expect(errores, `errores en consola:\n${errores.join('\n')}`).toEqual([]);
        });

        test(`${ruta} ofrece los dos PDF del CV`, async ({ page }) => {
            await page.goto(ruta);

            for (const pdf of ['/docs/CV_ESP.pdf', '/docs/CV_EN.pdf']) {
                await expect(page.locator(`a[href="${pdf}"]`)).toHaveCount(1);
                const respuesta = await page.request.get(pdf);
                expect(respuesta.status(), `${pdf} no se sirve`).toBe(200);
            }
        });
    }
});

test.describe('selector de tema', () => {
    test('aplica el tema oscuro y lo recuerda', async ({ page }) => {
        await page.goto('/es/');

        await page.locator('#theme-toggle-btn').click();
        await expect(page.locator('#themes-menu')).toHaveClass(/open/);
        await page.locator('.themes-menu-option', { hasText: 'Dark' }).click();

        // El modo oscuro es por clase (@variant dark en global.css), no por media query
        await expect(page.locator('html')).toHaveClass(/dark/);
        expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('dark');

        await page.reload();
        await expect(page.locator('html')).toHaveClass(/dark/);
    });

    test('vuelve al tema claro', async ({ page }) => {
        await page.goto('/es/');

        await page.locator('#theme-toggle-btn').click();
        await page.locator('.themes-menu-option', { hasText: 'Dark' }).click();
        await expect(page.locator('html')).toHaveClass(/dark/);

        await page.locator('#theme-toggle-btn').click();
        await page.locator('.themes-menu-option', { hasText: 'Light' }).click();

        await expect(page.locator('html')).not.toHaveClass(/dark/);
        expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('light');
    });

    test('el botón tiene texto accesible en ambos idiomas', async ({ page }) => {
        // Regresión: la clave de traducción estaba mal escrita y el label salía vacío en español
        for (const ruta of ['/es/', '/en/']) {
            await page.goto(ruta);
            await expect(page.locator('#theme-toggle-btn .sr-only'), ruta).not.toBeEmpty();
        }
    });
});

test.describe('menú responsive', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('el menú se despliega en móvil', async ({ page }) => {
        await page.goto('/es/');

        const navbar = page.locator('#navbar');
        await expect(navbar).toHaveClass(/grid-hidden/);

        await page.locator('#toggleButton').click();
        await expect(navbar).not.toHaveClass(/grid-hidden/);
    });
});
