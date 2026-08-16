import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { PUERTOS } from './api/rutas.js';

// Interfaz del administrador. Nada de esto entra en el sitio publicado.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // El puerto de la vista previa viaja al navegador desde api/rutas.js: es el
  // unico sitio donde se declara (src/constantes.js no puede importarlo porque
  // rutas.js usa node:path)
  define: {
    __PUERTO_WEB__: JSON.stringify(PUERTOS.web),
  },
  server: {
    host: '127.0.0.1',
    port: PUERTOS.ui,
    // La interfaz importa src/cv_info/tipos.js, que está por encima de la raíz
    // de Vite (admin/). Sin esto Vite lo bloquea por seguridad; aquí no hay
    // nada que proteger: solo escucha en 127.0.0.1 y nunca se publica.
    fs: { allow: ['..'] },
    // La API va en otro puerto; el proxy evita tener que pensar en CORS
    proxy: {
      '/api': {
        target: `http://127.0.0.1:${PUERTOS.api}`,
        changeOrigin: true,
      },
    },
  },
});
