import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '..', ''); // Load env variables from root or Axs_Web
  return {
    base: '/AxsReact/',
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 3000,
      strictPort: false, // Si 3000 está ocupado, usa el siguiente disponible
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        // Redirige /AxsReact/backend/* → IIS (localhost:80) que ejecuta PHP + MySQL
        '/AxsReact/backend': {
          target: 'http://localhost:80',
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.error('[Proxy] Error al conectar con IIS:', err.message);
            });
          },
        },
      },
    },
  }
})
