/**
 * Hook para la gestión paginada de logs de auditoría (Módulo 1 — Admin).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { adminListLogs, type AuditLogItem } from '../api/authApi';
import { getErrorMessage } from '../../../shared/api/api';

interface UseAdminLogsReturn {
  logs: AuditLogItem[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  error: string;
  setPage: (page: number) => void;
  refresh: () => void;
}

export function useAdminLogs(initialLimit = 50): UseAdminLogsReturn {
  const [logs, setLogs]       = useState<AuditLogItem[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const limit = initialLimit;

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const fetchLogs = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError('');
    try {
      const res = await adminListLogs(targetPage, limit);
      if (mounted.current) {
        setLogs(res.data);
        setTotal(res.total);
      }
    } catch (err) {
      if (mounted.current) {
        setError(getErrorMessage(err, 'No se pudo cargar la bitácora de logs'));
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchLogs(page);
  }, [fetchLogs, page]);

  const refresh = useCallback(() => fetchLogs(page), [fetchLogs, page]);

  return {
    logs,
    total,
    page,
    limit,
    loading,
    error,
    setPage,
    refresh,
  };
}
