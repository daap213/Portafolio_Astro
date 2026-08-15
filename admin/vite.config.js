import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { PUERTOS } from './api/rutas.js';

// Interfaz del administrador. Nada de esto entra en el sitio publicado.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '127.0.0.1',
    port: PUERTOS.ui,
    // La API va en otro puerto; el proxy evita tener que pensar en CORS
    proxy: {
      '/api': {
        target: `http://127.0.0.1:${PUERTOS.api}`,
        changeOrigin: true,
      },
    },
  },
});
