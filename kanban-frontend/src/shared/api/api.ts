/**
 * Cliente HTTP de Kanbix (axios) con manejo de JWT.
 *
 * - baseURL apunta a /api/v1 del backend (VITE_API_URL).
 * - Interceptor de request: adjunta el access_token.
 * - Interceptor de response: ante 401 intenta refrescar el token una vez.
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

let isRefreshing = false;

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const refresh = tokenStore.getRefresh();

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      refresh &&
      !original.url?.includes('/auth/')
    ) {
      original._retry = true;
      try {
        if (!isRefreshing) {
          isRefreshing = true;
          const { data } = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
            refresh_token: refresh,
          });
          tokenStore.set(data.access_token);
          isRefreshing = false;
        }
        original.headers.Authorization = `Bearer ${tokenStore.getAccess()}`;
        return api(original);
      } catch {
        isRefreshing = false;
        tokenStore.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/** Extrae el mensaje de error legible del backend ({ detail }). */
export function getErrorMessage(error: unknown, fallback = 'Ocurrió un error'): string {
  if (axios.isAxiosError(error)) {
    const detail = (error.response?.data as { detail?: string } | undefined)?.detail;
    return detail ?? error.message ?? fallback;
  }
  return fallback;
}

export default api;
