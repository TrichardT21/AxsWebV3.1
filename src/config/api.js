/**
 * Configuración central de la URL base del backend.
 * - En desarrollo (Vite): el proxy de vite.config.js redirige /AxsReact/backend/ → IIS localhost:80
 * - En producción (IIS): el build ya está en /AxsReact/ y el backend está en la misma ruta
 */
export const API_BASE = '/AxsReact/backend';
