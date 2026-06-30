/**
 * Hook para la gestión paginada de usuarios (Módulo 1 — Admin).
 *
 * Encapsula el estado, la paginación y las mutaciones (crear, desbloquear,
 * cambiar rol) para que AdminUsersPage sea declarativa y limpia.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  adminChangeRole,
  adminCreateUser,
  adminListUsers,
  adminUnlockUser,
  type RegisterPayload,
  type UserListItem,
} from '../api/authApi';
import { getErrorMessage } from '../../../shared/api/api';
import type { RolGlobal } from '../../../shared/types';

interface UseAdminUsersReturn {
  users: UserListItem[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  error: string;
  setPage: (page: number) => void;
  refresh: () => void;
  createUser: (payload: RegisterPayload) => Promise<void>;
  unlockUser: (userId: string) => Promise<void>;
  changeRole: (userId: string, rol: RolGlobal) => Promise<void>;
}

export function useAdminUsers(initialLimit = 20): UseAdminUsersReturn {
  const [users, setUsers]   = useState<UserListItem[]>([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const limit = initialLimit;

  // Prevent state updates on unmounted component
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const fetchUsers = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError('');
    try {
      const res = await adminListUsers(targetPage, limit);
      if (mounted.current) {
        setUsers(res.data);
        setTotal(res.total);
      }
    } catch (err) {
      if (mounted.current) {
        setError(getErrorMessage(err, 'No se pudo cargar la lista de usuarios'));
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [limit]);

  // Fetch inicial y cada vez que cambia la página
  useEffect(() => {
    fetchUsers(page);
  }, [fetchUsers, page]);

  const refresh = useCallback(() => fetchUsers(page), [fetchUsers, page]);

  const createUser = useCallback(async (payload: RegisterPayload) => {
    await adminCreateUser(payload);
    // Volver a página 1 para ver el nuevo usuario
    setPage(1);
    await fetchUsers(1);
  }, [fetchUsers]);

  const unlockUser = useCallback(async (userId: string) => {
    await adminUnlockUser(userId);
    // Actualizar el usuario en la lista local optimísticamente
    setUsers(prev =>
      prev.map(u => u.id === userId ? { ...u, bloqueado: false } : u)
    );
  }, []);

  const changeRole = useCallback(async (userId: string, rol: RolGlobal) => {
    await adminChangeRole(userId, rol);
    // Actualizar el rol en la lista local optimísticamente
    setUsers(prev =>
      prev.map(u => u.id === userId ? { ...u, rol_global: rol } : u)
    );
  }, []);

  return {
    users, total, page, limit, loading, error,
    setPage, refresh, createUser, unlockUser, changeRole,
  };
}
