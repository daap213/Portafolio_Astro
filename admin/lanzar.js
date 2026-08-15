// Arranca los tres procesos del administrador local con `pnpm run admin`.
//
// Sin dependencias a propósito (nada de concurrently): son tres spawn y un
// manejador de Ctrl+C.
//
//   4322  astro dev   -> alimenta la vista previa del iframe
//   4340  API         -> lee y escribe los JSON
//   4341  interfaz    -> React + Vite
//
// El 4321 NO se usa: es el puerto de las pruebas end-to-end, y `astro preview`
// es un demonio único por máquina que iniciarPreview() detiene al arrancar.
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PUERTOS } from './api/rutas.js';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, '..');

if (!existsSync(resolve(AQUI, 'node_modules'))) {
  console.error(
    'Faltan las dependencias del administrador.\n' +
    'Instálalas con:  pnpm -C admin install\n\n' +
    '(admin/ tiene su propio package.json a propósito: así lo que instala\n' +
    ' Cloudflare al publicar el sitio no cambia ni un byte.)',
  );
  process.exit(1);
}

const COLORES = { web: '\x1b[36m', api: '\x1b[33m', ui: '\x1b[35m' };
const FIN = '\x1b[0m';

const procesos = [];

function lanzar(etiqueta, comando, argumentos, cwd) {
  const hijo = spawn(comando, argumentos, {
    cwd,
    shell: process.platform === 'win32',
    env: process.env,
  });

  const prefijo = `${COLORES[etiqueta] ?? ''}[${etiqueta}]${FIN} `;
  const volcar = (buffer) => {
    for (const linea of buffer.toString().split('\n')) {
      if (linea.trim()) console.log(prefijo + linea);
    }
  };
  hijo.stdout.on('data', volcar);
  hijo.stderr.on('data', volcar);
  hijo.on('close', (codigo) => console.log(`${prefijo}terminado (código ${codigo})`));

  procesos.push(hijo);
  return hijo;
}

function pararTodo() {
  for (const hijo of procesos) {
    if (!hijo.pid || hijo.killed) continue;
    if (process.platform === 'win32') {
      // kill() no se lleva el árbol: astro dev quedaría huérfano ocupando el puerto
      spawn('taskkill', ['/pid', String(hijo.pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      hijo.kill('SIGTERM');
    }
  }
}

lanzar('web', 'pnpm', ['exec', 'astro', 'dev', '--port', String(PUERTOS.web)], RAIZ);
lanzar('api', 'node', ['api/servidor.js'], AQUI);
lanzar('ui', 'pnpm', ['exec', 'vite', '--port', String(PUERTOS.ui)], AQUI);

console.log(`
Administrador local en marcha:

  interfaz      http://127.0.0.1:${PUERTOS.ui}
  API           http://127.0.0.1:${PUERTOS.api}
  vista previa  http://127.0.0.1:${PUERTOS.web}

Los cambios se escriben en el árbol de trabajo. Revísalos con git y commitea tú.
Ctrl+C para parar los tres procesos.
`);

for (const senal of ['SIGINT', 'SIGTERM']) {
  process.on(senal, () => {
    pararTodo();
    process.exit(0);
  });
}
