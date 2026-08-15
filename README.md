# Mi portafolio

### Descripción:

Portafolio que muestra mi experiencia, proyectos, habilidades y demás a modo de web.
Adaptación de una plantilla desarrollada por Midudev, para realizar un portafolio que muestre mi CV a modo de web.

<div align="center">

[GitHub de Midudev](https://github.com/midudev)

</div>

### Link al sitio web:

<div align="center">

[Mi portafolio](https://portafolio.daaptech.org/)

</div>

<div align="center">
<a href="https://portafolio.daaptech.org/">
<img src="./public/img/Miporfolio.webp">
</a>
</div>

<div align="center">

![Astro Badge](https://img.shields.io/badge/Astro-FF3E00?logo=astro&logoColor=fff&style=flat)
![Tailwind CSS Badge](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=fff&style=flat)
![TypeScript Badge](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff&style=flat)
![React Badge](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=000&style=flat)
![pnpm Badge](https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=fff&style=flat)
![Vitest Badge](https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=fff&style=flat)
![Playwright Badge](https://img.shields.io/badge/Playwright-2EAD33?logo=playwright&logoColor=fff&style=flat)

</div>

## Qué hay aquí

- Un **sitio estático multiidioma** (hoy español e inglés) generado con Astro. Añadir un idioma no crea ficheros de código: es una entrada en un JSON.
- Una **vista imprimible del CV** por idioma, de la que salen los PDF descargables.
- Un **administrador local** (`admin/`) para editar todo el contenido desde el navegador: textos por idioma, imágenes, enlaces, QR y las secciones de la web y del CV. Es una herramienta de desarrollo: nunca se publica.

## Stack

- **Astro 7** — sitio estático multiidioma, sin islas de framework ni backend.
- **Tailwind CSS v4** — sin `tailwind.config.*`: toda la configuración vive en `src/styles/global.css` y se conecta con `@tailwindcss/vite` (no PostCSS).
- **TypeScript 7**.
- **pnpm** — la versión se fija en el campo `packageManager` y `pnpm-lock.yaml` está versionado.
- **Vitest + Playwright** — tests unitarios, de esquema, de build y end-to-end.
- **Puppeteer** (PDF del CV) y **qrcode** (QR de proyectos).
- **Express + React + Vite** — solo dentro de `admin/`, con su propio `package.json` y su propio lockfile.
- Despliegue en **Cloudflare Pages** (integración Git configurada fuera del repositorio).

La rama activa es `cloud_version`: es la que despliega y sobre la que corren los workflows.

## Requisitos

- Node.js >= 22.12 (Astro 7).
- pnpm (`corepack enable` respeta la versión declarada en `package.json`).

```bash
pnpm install
```

El postinstall de puppeteer está desactivado en `pnpm-workspace.yaml`, así que Chrome no se descarga al instalar. Solo hace falta para generar los PDF o correr sus tests:

```bash
pnpm exec puppeteer browsers install chrome
```

Para usar el administrador, una vez:

```bash
pnpm -C admin install
```

## Comandos

| Comando | Qué hace |
| --- | --- |
| `pnpm run dev` | Servidor de desarrollo en `:4321` |
| `pnpm run build` | Genera el sitio en `dist/` |
| `pnpm run preview` | Sirve `dist/` en `:4321` |
| `pnpm run admin` | Administrador local: interfaz, API y vista previa |
| `pnpm run idiomas` | Sincroniza los ficheros de idioma con `locales.json` |
| `pnpm run test` | Tests unitarios (esquema, datos, config, traducciones, componentes) |
| `pnpm run test:build` | Comprueba el contenido de `dist/` (requiere `build` previo) |
| `pnpm run test:scripts` | Genera QR y PDF de verdad (requiere `dist/` y Chrome) |
| `pnpm run test:e2e` | Tests end-to-end con Playwright (requiere `dist/`) |
| `pnpm run GQR` | Regenera los QR en `public/img/qr` |
| `pnpm run GPDF` | Imprime el CV de cada idioma a `public/docs` |

Para un solo fichero: `pnpm exec vitest run tests/unit/qr-sync.test.js`, `pnpm exec playwright test tests/e2e/cv.spec.ts`.

Puertos en uso, todos declarados en `tests/helpers/puertos.js`:

| Puerto | Para qué |
| --- | --- |
| 4321 | `dev` / `preview` y tests end-to-end |
| 4322 | `astro dev` que alimenta la vista previa del administrador |
| 4331 | `preview` efímero desde el que se imprimen los PDF |
| 4340 / 4341 | API e interfaz del administrador |

## Cómo se organiza el contenido

Todo el contenido son **datos en JSON**, en `src/cv_info/data/`. No hay texto escrito dentro de ficheros `.js`.

| Fichero | Qué guarda |
| --- | --- |
| `locales.json` | Los idiomas: código, etiqueta del menú, nombre del PDF, cuál es el predeterminado |
| `comun.json` | Lo que **no** se traduce: identidad, imágenes, enlaces, GitHub, etiquetas y de qué campo sale cada QR |
| `contenido.<idioma>.json` | Solo la prosa traducible, indexada por el `id` de cada elemento |
| `ui.<idioma>.json` | Todos los textos de interfaz, de la web y del CV |
| `secciones.web.json` | Las secciones de la portada: orden, tipo, icono, clases y títulos por idioma |
| `secciones.cv.json` | Las secciones del CV — **lista independiente** de la anterior |
| `indice.js` | Generado por `pnpm run idiomas`; es lo único que enumera los ficheros de idioma |

La separación entre `comun.json` y `contenido.<idioma>.json` es intencionada: la imagen y el enlace de un proyecto existen **una sola vez**, y los dos ficheros se unen por un `id` estable en minúsculas y sin tildes. Así desaparece de raíz el error de cambiar algo en un idioma y olvidarlo en el otro.

Encima de los datos hay una capa fina de ensamblado en `src/cv_info/`: `cv.js` (carga y une), `locales.js` (idiomas), `tipos.js` (catálogo de tipos de sección), `registro.js` (el único sitio donde un nombre de JSON se convierte en un componente `.astro`), `paginaWeb.js` y `paginaCv.js`.

## Añadir un idioma

```bash
# 1. añade la entrada a src/cv_info/data/locales.json (o hazlo desde el administrador)
# 2. crea sus ficheros y regístralo
pnpm run idiomas
# 3. traduce los textos en contenido.<x>.json, ui.<x>.json y secciones.*.json
# 4. reinicia astro dev
```

`pnpm run idiomas` crea `contenido.<x>.json` y `ui.<x>.json` copiando el idioma de origen, añade los textos de cada sección en las dos listas y regenera `data/indice.js`. Se copia en vez de dejarlo en blanco a propósito: así el sitio se puede seguir publicando mientras dura la traducción. El administrador te dice, por idioma, cuántos textos siguen idénticos al original.

El paso 4 es obligatorio porque `astro.config.mjs` lee la lista de idiomas al arrancar y no se entera de la ruta nueva hasta que se reinicia.

## Añadir o reordenar secciones

Editar `secciones.web.json` (portada) o `secciones.cv.json` (CV). **No hace falta tocar código**: cada entrada elige un `tipo` del catálogo, apunta a un bloque de datos y declara sus títulos por idioma, su icono y sus opciones (`mostrarQr`, `mostrarEnlace`, `mostrarRelacionadas`…).

Las dos listas son independientes: una sección puede estar solo en la web, solo en el CV, en las dos con distinto orden, o en ninguna. Si un bloque de datos no lo muestra ninguna lista, el diagnóstico lo avisa.

Tipos disponibles hoy: `perfil`, `presentacion`, `texto`, `cronologia`, `formacion`, `proyectos`, `publicaciones`, `habilidades`, `certificados`, `referencias`, `cita`.

Crear un **tipo nuevo** sí es trabajo de código: un componente en `src/components/seccions/` (web) o `src/components/cv/` (impresión), su descripción en `tipos.js` y su alta en `registro.js`.

## Administrador local

```bash
pnpm -C admin install   # una sola vez
pnpm run admin
```

Levanta tres procesos: la interfaz en `:4341`, su API en `:4340` y un `astro dev` en `:4322` que alimenta la vista previa. Ctrl+C los para todos.

| Pantalla | Qué permite |
| --- | --- |
| Panel | Diagnóstico de errores y avisos, lanzar QR/PDF/build/tests, ver qué ficheros has cambiado |
| Contenido | Editar cada elemento con un formulario generado desde su tipo; los campos traducibles salen en columnas, un idioma al lado del otro |
| Secciones | Las dos listas, web y CV, con su orden, sus tipos, sus iconos y sus opciones |
| Medios | Subir y reemplazar imágenes, y ver cuáles ya no usa nadie |
| Idiomas | Alta y baja de idiomas, y cuánto queda por traducir en cada uno |
| Vista previa | El sitio real dentro de un iframe, por idioma y vista |

Detalles que importan:

- **Valida antes de escribir.** Si el estado propuesto no cuadra, responde con la lista de problemas y **no toca el disco**. Cuando escribe, hace copia previa en `admin/.copias/` y usa fichero temporal + `rename`.
- **Escribe todos los idiomas a la vez.** Guardar uno sí y otro no dejaría el sitio desincronizado.
- **No hace commit, ni push, ni despliega.** Te enseña `git status` y decides tú.
- **Tiene su propio `pnpm-workspace.yaml`** para que `pnpm install` en la raíz —que es justo lo que ejecuta Cloudflare al publicar— no instale React ni Express.
- Solo escucha en `127.0.0.1`.

## Generar los QR de proyectos

```bash
pnpm run GQR
```

Se guardan en `public/img/qr`. Cada bloque de `comun.json` declara de qué campo sale su QR:

```json
"proyectos": { "qr": { "desde": "github", "porItem": true }, "items": [...] }
```

El nombre del fichero se deriva del **`id`** del elemento (`qr_proyectos_dron-para-monitoreo-termico.png`), no de su título. Así renombrar un proyecto ya no renombra el PNG ni deja colgados a los demás idiomas, y los nombres no llevan tildes, que se corrompen al viajar entre Windows y Linux.

## Generar los PDF del CV

```bash
pnpm exec astro preview --background
pnpm run GPDF
pnpm exec astro preview stop
```

Se guardan en `public/docs` (uno por idioma, con el nombre declarado en `locales.json`) y se versionan en el repositorio. `GPDF` imprime desde `http://localhost:4321`, por eso hace falta un servidor levantado; `URL_BASE` cambia esa base y `PROD=true` imprime desde el sitio en producción. Los PDF se generan de uno en uno a propósito: dos Chrome a la vez agotan la memoria.

> Desde Astro 7 el `preview` es un demonio, y es **único por máquina, no por puerto**: se arranca con `--background` y se detiene con `astro preview stop` (matar el proceso no lo da de baja). Los tests lo paran al arrancar, por eso la vista previa del administrador usa `astro dev` y no `preview`.

## Estructura

```
src/
  cv_info/
    data/        # TODO el contenido, en JSON (ver "Cómo se organiza el contenido")
    cv.js        # carga los JSON, une común + idioma y expone los datos
    locales.js   # idiomas declarados
    tipos.js     # catálogo de tipos de sección (sin .astro: lo usan admin y tests)
    registro.js  # tipo/icono -> componente .astro
    validar.js   # validación de datos y configuración
    paginaWeb.js | paginaCv.js
  components/    # icons/, otros/, seccions/ (web), cv/ (impresión)
  layouts/       # Layout.astro
  pages/
    index.astro        # raíz: idioma predeterminado
    [lang]/index.astro # portada de cada idioma
    [lang]/cv.astro    # vista imprimible de cada idioma
  scripts/       # url_to_qr.js, pdf_cv.js, sync_idiomas.js
  styles/        # global.css (Tailwind) y cv_impresion.css (CSS del CV)
admin/           # administrador local (no se publica)
public/
  docs/          # PDF del CV generados
  img/qr/        # QR generados
config.js        # rutas base de prod y dev
```

### Dos cosas frágiles del CV

Las páginas del CV son un mundo aparte: no usan `Layout.astro` ni Tailwind, solo FontAwesome por CDN y `src/styles/cv_impresion.css`.

1. **Ese CSS tiene que estar fuera del `.astro`.** Dentro de un `<style>`, Astro lo compila con ámbito (`.check_y[data-astro-cid-xxxx]`) y deja de alcanzar a los componentes hijos: todas las reglas `@media print` dejarían de aplicar sin ningún error, el PDF se repaginaría y el CI lo commitearía.
2. **El CV nunca debe importar `Layout.astro` ni `global.css`.** El preflight de Tailwind descuadraría la paginación.

Hay un test en `tests/build/dist.test.js` para cada una de las dos.

## Flujo para actualizar el contenido

1. Editar los JSON de `src/cv_info/data/`, a mano o con `pnpm run admin`.
2. `pnpm run GQR` si cambió alguna URL de las que sale un QR, o el `id` de un elemento.
3. `pnpm run test` — valida el esquema, la coherencia entre idiomas, los recursos que faltan y los QR desactualizados.
4. `pnpm run build && pnpm run test:build`, y opcionalmente regenerar los PDF con el preview levantado.
5. Commit a `cloud_version` (el CI regenera los PDF igualmente).

## Tests

- `tests/unit/` — no necesita build. Valida los JSON contra el catálogo de tipos, la paridad entre idiomas, las claves de traducción (`ui.*`), que los QR versionados coincidan byte a byte con los que produce el script, y renderiza los componentes con la Container API de Astro.
- `tests/build/` — comprueba las páginas generadas, que todo `src`/`href` local exista en `dist/` y las dos trampas del CV.
- `tests/scripts/` — ejecución real de `GQR` y `GPDF`.
- `tests/e2e/` — Playwright: tema claro/oscuro, cambio de idioma, anclas del menú, imágenes y PDF enlazados.

`tests/unit/esquema.test.js` merece mención aparte: además de validar el estado actual, rompe a propósito una cosa cada vez (un tipo inexistente, un elemento sin traducción, una ruta de imagen absoluta, un ancla duplicada, un campo común colado en un idioma…) y comprueba que el validador la detecta. Es la red que sustituye al type-checker.

No hay paso de `astro check`: TypeScript 7 aún no expone una API programática estable y el type-checker de plantillas de Astro no puede correr sobre él ([withastro/astro#17268](https://github.com/withastro/astro/issues/17268)).

## CI/CD

- **`ci.yml`** — suite completa (unitarios → build → assertions sobre `dist/` → GQR/GPDF → Playwright). Se dispara en `pull_request` y por `workflow_call`.
- **`deploy.yml`** — en cada push a `cloud_version` llama a `ci.yml`; si además cambió algo de `src/cv_info/`, `src/components/cv/`, un `cv.astro` o el CSS de impresión, regenera los PDF y los commitea de vuelta (los commits `Update PDFs`). El despliegue en sí lo hace Cloudflare Pages.
- **`dependabot.yml`** — dependencias npm (semanal) y GitHub Actions (mensual) contra `cloud_version`, así sus PR pasan por el CI antes de fusionarse. Vigila la raíz; las dependencias de `admin/`, que tiene su propio lockfile, quedan fuera.

El commit automático de los PDF está acotado con `file_pattern: public/docs/*.pdf`: sin eso commitearía cualquier cosa que estuviera sin guardar en el árbol de trabajo. Y el filtro de rutas **nunca** debe incluir `public/docs/**`, porque la acción usa un token personal y su propio commit volvería a disparar el workflow en bucle.
