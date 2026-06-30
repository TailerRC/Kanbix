/**
 * Cliente HTTP de Kanbix (axios) con manejo de JWT.
 *
 * - baseURL apunta a /api/v1 del backend (VITE_API_URL).
 * - Interceptor de request: adjunta el access_token.
 * - Interceptor de response: ante 401 intenta refrescar el token una vez.
 *   Se usa una cola (refreshSubscribers) para serializar todos los reintentos
 *   concurrentes y evitar múltiples llamadas simultáneas al endpoint /refresh.
 */
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export const ACCESS_KEY = 'kanbix_access_token';
export const REFRESH_KEY = 'kanbix_refresh_token';

export const tokenStore = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: (access: string, refresh?: string) => {
    localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = tokenStore.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---- Cola de suscriptores para serializar refreshes concurrentes ----
let isRefreshing = false;
type Subscriber = (token: string) => void;
let refreshSubscribers: Subscriber[] = [];

function subscribeTokenRefresh(cb: Subscriber) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

function onRefreshFailed() {
  refreshSubscribers = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Solo intentar refresh ante 401, si hay refresh token y no es un endpoint de auth
    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes('/auth/')
    ) {
      const refresh = tokenStore.getRefresh();
      if (!refresh) {
        // Sin refresh token: redirigir a login directamente
        tokenStore.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      original._retry = true;

      if (isRefreshing) {
        // Otra request ya está refrescando: encolar y esperar el nuevo token
        return new Promise<typeof error.response>((resolve, reject) => {
          subscribeTokenRefresh((newToken: string) => {
            if (original.headers) {
              original.headers.Authorization = `Bearer ${newToken}`;
            }
            resolve(api(original));
          });
          // Si el refresh falla, rechazar esta request también
          const unsubIdx = refreshSubscribers.length - 1;
          // Timeout de seguridad: si el refresh tarda más de 10s, rechazar
          setTimeout(() => {
            if (refreshSubscribers[unsubIdx]) {
              refreshSubscribers.splice(unsubIdx, 1);
              reject(new Error('Refresh token timeout'));
            }
          }, 10000);
        });
      }

      isRefreshing = true;

      try {
        const { data } = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
          refresh_token: refresh,
        });
        const newToken: string = data.access_token;
        tokenStore.set(newToken);
        isRefreshing = false;
        onTokenRefreshed(newToken);

        // Reintentar la request original con el nuevo token
        if (original.headers) {
          original.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(original);
      } catch {
        isRefreshing = false;
        onRefreshFailed();
        tokenStore.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

/** Extrae el mensaje de error legible del backend ({ detail }). */
export function getErrorMessage(error: unknown, fallback = 'Ocurrió un error'): string {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | { detail?: string; message?: string }
      | undefined;
    const detail = responseData?.detail ?? responseData?.message;
    if (detail && typeof detail === 'string') return detail;
    // Para errores de red reales, mostrar mensaje más claro
    if (!error.response) {
      console.error('Axios connection error (no response):', error);
      return 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
    }
    console.error('Axios response error:', error.response.status, error.response.data);
    return error.message ?? fallback;
  }
  console.error('Non-Axios error:', error);
  return fallback;
}

export default api;
