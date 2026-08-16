import { expect, test } from '@playwright/test';
// Solo cv.js y locales.js: es.js/en.js importan componentes .astro que el loader
// de Playwright no entiende
import { DATOS } from '../../src/cv_info/cv.js';
import { IDIOMAS as LOCALES, IDIOMA_PREDETERMINADO, otrosIdiomas } from '../../src/cv_info/locales.js';

const IDIOMAS = LOCALES.map(({ codigo }) => ({
    ruta: `/${codigo}/`,
    idioma: codigo,
    datos: DATOS[codigo],
    // Los demás idiomas: el conmutador ya no se supone binario
    otros: otrosIdiomas(codigo).map((idioma) => `/${idioma.codigo}/`),
}));

const RUTA_PREDETERMINADA = `/${IDIOMA_PREDETERMINADO.codigo}/`;

test.describe('portada', () => {
    test('la raíz sirve el idioma predeterminado', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('html')).toHaveAttribute('lang', IDIOMA_PREDETERMINADO.codigo);
        await expect(page.locator('h2').first()).toBeVisible();
    });

    for (const { ruta, idioma, datos, otros } of IDIOMAS) {
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

        for (const otro of otros) {
            test(`${ruta} enlaza a ${otro} para cambiar de idioma`, async ({ page }) => {
                await page.goto(ruta);
                await page.locator(`#navbar a[href="${otro}"]`).click();

                await expect(page).toHaveURL(new RegExp(`${otro}$`));
                await expect(page.locator('html')).toHaveAttribute('lang', otro.replaceAll('/', ''));
            });
        }

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

        test(`${ruta} ofrece un PDF del CV por idioma`, async ({ page }) => {
            await page.goto(ruta);

            for (const pdf of LOCALES.map(({ pdf: nombre }) => `/docs/${nombre}`)) {
                await expect(page.locator(`a[href="${pdf}"]`)).toHaveCount(1);
                const respuesta = await page.request.get(pdf);
                expect(respuesta.status(), `${pdf} no se sirve`).toBe(200);
            }
        });
    }
});

test.describe('selector de tema', () => {
    test('aplica el tema oscuro y lo recuerda', async ({ page }) => {
        await page.goto(RUTA_PREDETERMINADA);

        await page.locator('#theme-toggle-btn').click();
        await expect(page.locator('#themes-menu')).toHaveClass(/open/);
        await page.locator('.themes-menu-option[data-tema="dark"]').click();

        // El modo oscuro es por clase (@variant dark en global.css), no por media query
        await expect(page.locator('html')).toHaveClass(/dark/);
        expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('dark');

        await page.reload();
        await expect(page.locator('html')).toHaveClass(/dark/);
    });

    test('vuelve al tema claro', async ({ page }) => {
        await page.goto(RUTA_PREDETERMINADA);

        await page.locator('#theme-toggle-btn').click();
        await page.locator('.themes-menu-option[data-tema="dark"]').click();
        await expect(page.locator('html')).toHaveClass(/dark/);

        await page.locator('#theme-toggle-btn').click();
        await page.locator('.themes-menu-option[data-tema="light"]').click();

        await expect(page.locator('html')).not.toHaveClass(/dark/);
        expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('light');
    });

    test('el botón tiene texto accesible en todos los idiomas', async ({ page }) => {
        // Regresión: la clave de traducción estaba mal escrita y el label salía vacío en español
        for (const { ruta } of IDIOMAS) {
            await page.goto(ruta);
            await expect(page.locator('#theme-toggle-btn .sr-only'), ruta).not.toBeEmpty();
        }
    });
});

test.describe('menú responsive', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('el menú se despliega en móvil', async ({ page }) => {
        await page.goto(RUTA_PREDETERMINADA);

        const navbar = page.locator('#navbar');
        await expect(navbar).toHaveClass(/grid-hidden/);

        await page.locator('#toggleButton').click();
        await expect(navbar).not.toHaveClass(/grid-hidden/);
    });
});

test.describe('selector de tema: la opción «sistema»', () => {
    // Esta rama no tenía NINGUNA prueba, y es justo la que se dio por rota.
    // `emulateMedia` simula la preferencia del sistema operativo, que es lo que
    // el navegador reporta en `prefers-color-scheme`.
    const elegir = async (page, tema) => {
        await page.locator('#theme-toggle-btn').click();
        await page.locator(`.themes-menu-option[data-tema="${tema}"]`).click();
    };

    test('con el sistema en oscuro, «sistema» pone el tema oscuro', async ({ page }) => {
        await page.emulateMedia({ colorScheme: 'dark' });
        await page.goto(RUTA_PREDETERMINADA);
        await elegir(page, 'system');

        await expect(page.locator('html')).toHaveClass(/dark/);
        expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('system');
    });

    test('con el sistema en claro, «sistema» deja el tema claro', async ({ page }) => {
        await page.emulateMedia({ colorScheme: 'light' });
        await page.goto(RUTA_PREDETERMINADA);
        await elegir(page, 'system');

        await expect(page.locator('html')).not.toHaveClass(/dark/);
    });

    test('sin nada guardado, la primera visita sigue al sistema', async ({ page }) => {
        await page.emulateMedia({ colorScheme: 'dark' });
        await page.goto(RUTA_PREDETERMINADA);

        expect(await page.evaluate(() => localStorage.getItem('theme'))).toBeNull();
        await expect(page.locator('html')).toHaveClass(/dark/);
    });

    test('si el sistema cambia con la página abierta, el tema le sigue', async ({ page }) => {
        await page.emulateMedia({ colorScheme: 'dark' });
        await page.goto(RUTA_PREDETERMINADA);
        await elegir(page, 'system');
        await expect(page.locator('html')).toHaveClass(/dark/);

        await page.emulateMedia({ colorScheme: 'light' });
        await expect(page.locator('html')).not.toHaveClass(/dark/);

        await page.emulateMedia({ colorScheme: 'dark' });
        await expect(page.locator('html')).toHaveClass(/dark/);
    });

    test('una elección explícita gana al sistema', async ({ page }) => {
        // Lo que se elige manda: antes había estilos (color-scheme, las
        // animaciones de la barra) que seguían al sistema y contradecían esto
        await page.emulateMedia({ colorScheme: 'dark' });
        await page.goto(RUTA_PREDETERMINADA);
        await elegir(page, 'light');
        await expect(page.locator('html')).not.toHaveClass(/dark/);

        await page.emulateMedia({ colorScheme: 'light' });
        await page.reload();
        await elegir(page, 'dark');
        await expect(page.locator('html')).toHaveClass(/dark/);
    });

    test('color-scheme acompaña a la elección, no al sistema', async ({ page }) => {
        // Gobierna las barras de desplazamiento y los controles nativos
        const esquema = () =>
            page.evaluate(() => getComputedStyle(document.documentElement).colorScheme);

        await page.emulateMedia({ colorScheme: 'dark' });
        await page.goto(RUTA_PREDETERMINADA);
        await elegir(page, 'light');
        expect(await esquema()).toBe('light');

        await elegir(page, 'dark');
        expect(await esquema()).toBe('dark');
    });

    test('el tema ya está aplicado en el primer pintado, sin fogonazo', async ({ page }) => {
        // Antes la clase la ponía un script del <body> detrás de
        // DOMContentLoaded: la página pintaba en claro y se corregía después.
        await page.emulateMedia({ colorScheme: 'dark' });
        await page.goto(RUTA_PREDETERMINADA);
        await page.evaluate(() => localStorage.setItem('theme', 'dark'));

        await page.goto(RUTA_PREDETERMINADA, { waitUntil: 'commit' });
        const claseAlEmpezar = await page.evaluate(() => {
            // En cuanto hay <html> la clase debe estar: el script va en el <head>
            return document.documentElement.className;
        });
        expect(claseAlEmpezar).toContain('dark');
    });
});
