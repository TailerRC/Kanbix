import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

// ─── Request interceptor: attach access token ───

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor: auto-refresh on 401 ───

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  pendingQueue.forEach((p) => {
    if (token) p.resolve(token);
    else p.reject(error);
  });
  pendingQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        isRefreshing = false;
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:8000"
          }/api/v1/auth/refresh`,
          { refresh_token: refreshToken }
        );
        localStorage.setItem("access_token", data.access_token);
        processQueue(null, data.access_token);
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Auth API calls ───

export interface RegisterPayload {
  email: string;
  password: string;
  nombre_completo: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  nombre_completo: string;
  fecha_creacion: string;
  ultimo_acceso: string | null;
}

export interface TokenData {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export const authApi = {
  register: (data: RegisterPayload) =>
    api.post<{ id: string; email: string; nombre_completo: string; fecha_creacion: string }>(
      "/api/v1/auth/register",
      data
    ),

  login: (data: LoginPayload) =>
    api.post<TokenData>("/api/v1/auth/login", data),

  refresh: (refresh_token: string) =>
    api.post<{ access_token: string; expires_in: number }>("/api/v1/auth/refresh", {
      refresh_token,
    }),

  logout: (refresh_token: string) =>
    api.post<{ message: string }>("/api/v1/auth/logout", { refresh_token }),

  getMe: () => api.get<UserProfile>("/api/v1/auth/me"),
};
