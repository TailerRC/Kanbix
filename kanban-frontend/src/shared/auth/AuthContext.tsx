/**
 * Contexto de autenticación de Kanbix (cross-cutting, capa shared).
 *
 * Gestiona el usuario autenticado y los tokens. Las vistas (features/auth)
 * consumen `useAuth()` para login/logout y para leer el usuario actual.
 *
 * RN-31: si `cambiar_password=true` en la respuesta del login, el contexto
 * expone `mustChangePassword` para que App.tsx fuerce la ruta /change-password.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import api, { tokenStore } from '../api/api';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  mustChangePassword: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  clearChangePasswordFlag: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]                   = useState<User | null>(null);
  const [loading, setLoading]             = useState(true);
  const [mustChangePassword, setMustChange] = useState(false);

  // Al montar: si hay token, recuperar el perfil.
  useEffect(() => {
    let active = true;
    const token = tokenStore.getAccess();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<User>('/auth/me')
      .then((res) => {
        if (active) {
          setUser(res.data);
          // RN-31: si el perfil ya trae cambiar_password=true (password expirada)
          if (res.data.cambiar_password) setMustChange(true);
        }
      })
      .catch(() => {
        tokenStore.clear();
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    tokenStore.set(data.access_token, data.refresh_token);

    // RN-31: si el backend indica que debe cambiar la contraseña
    if (data.cambiar_password) setMustChange(true);

    const me = await api.get<User>('/auth/me');
    setUser(me.data);
    return me.data;
  }, []);

  const logout = useCallback(async () => {
    const refresh = tokenStore.getRefresh();
    try {
      if (refresh) await api.post('/auth/logout', { refresh_token: refresh });
    } catch {
      /* ignora errores de red al cerrar sesión */
    }
    tokenStore.clear();
    setUser(null);
    setMustChange(false);
  }, []);

  /** Llamar después de que el usuario cambió su contraseña exitosamente. */
  const clearChangePasswordFlag = useCallback(() => setMustChange(false), []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      mustChangePassword,
      login,
      logout,
      clearChangePasswordFlag,
    }),
    [user, loading, mustChangePassword, login, logout, clearChangePasswordFlag]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
