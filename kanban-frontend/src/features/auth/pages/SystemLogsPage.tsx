/**
 * SystemLogsPage — Bitácora de Auditoría del Sistema (solo Admin).
 *
 * Muestra el registro inmutable de acciones sensibles de Kanbix (RN-33).
 */
import { useState } from 'react';
import { useAdminLogs } from '../hooks/useAdminLogs';
import './SystemLogsPage.css';

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  // El backend serializa datetimes UTC sin sufijo "Z" → el navegador los
  // interpreta como hora local. Forzamos UTC añadiendo "Z" si falta.
  const utcIso = (iso.endsWith('Z') || iso.includes('+')) ? iso : iso + 'Z';
  const d = new Date(utcIso);
  return d.toLocaleString('es-PE', {
    timeZone: 'America/Lima',
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}

function getActionBadgeClass(action: string) {
  const act = action.toLowerCase();
  if (act.includes('crear') || act.includes('register') || act.includes('seed')) return 'admin-logs__badge--create';
  if (act.includes('eliminar') || act.includes('degradar') || act.includes('desactivar')) return 'admin-logs__badge--danger';
  if (act.includes('rol') || act.includes('permiso')) return 'admin-logs__badge--role';
  if (act.includes('unlock') || act.includes('desbloquea')) return 'admin-logs__badge--unlock';
  return 'admin-logs__badge--update';
}

interface CopyableIdProps {
  id: string;
  label?: string;
}

function CopyableId({ id, label }: CopyableIdProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Error al copiar al portapapeles', err);
    }
  };

  const displayId = id.length > 10 ? `${id.substring(0, 6)}…${id.substring(id.length - 4)}` : id;

  return (
    <div className="copyable-id" title={id}>
      <span className="copyable-id__text">{label || displayId}</span>
      <button
        className={`copyable-id__btn ${copied ? 'copyable-id__btn--copied' : ''}`}
        onClick={handleCopy}
        type="button"
        title="Copiar ID completo"
      >
        {copied ? (
          <svg className="copyable-id__icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg className="copyable-id__icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
        <span className="copyable-id__tooltip">{copied ? '¡Copiado!' : 'Copiar'}</span>
      </button>
    </div>
  );
}

export default function SystemLogsPage() {
  const {
    logs, total, page, limit, loading, error,
    setPage, refresh
  } = useAdminLogs(50);

  const [selectedLog, setSelectedLog] = useState<any>(null);

  const totalPages = Math.ceil(total / limit) || 1;


  return (
    <div className="admin-logs">
      {/* Header */}
      <div className="admin-logs__header">
        <div>
          <h1 className="admin-logs__title">Bitácora de Auditoría</h1>
          <p className="admin-logs__subtitle">
            {total} {total === 1 ? 'evento registrado' : 'eventos registrados'} en el sistema
          </p>
        </div>
        <div className="admin-logs__header-actions">
          <button
            className="admin-logs__btn-refresh"
            onClick={refresh}
            disabled={loading}
            aria-label="Actualizar bitácora"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10" /><polyline points="23 20 23 14 17 14" />
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="admin-logs__error" role="alert">
          {error}
        </div>
      )}

      {/* Tabla */}
      <div className="admin-logs__table-wrap">
        {loading && !logs.length ? (
          <div className="admin-logs__loading">
            <div className="admin-logs__spinner" />
            Cargando logs del sistema…
          </div>
        ) : (
          <table className="admin-logs__table">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Acción</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="admin-logs__date">{formatDate(log.fecha)}</td>
                  <td>
                    <span className={`admin-logs__badge ${getActionBadgeClass(log.accion)}`}>
                      {log.accion}
                    </span>
                  </td>
                  <td className="admin-logs__actions-col">
                    <button
                      className="admin-logs__detail-btn"
                      onClick={() => setSelectedLog(log)}
                      type="button"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}

              {!loading && !logs.length && (
                <tr>
                  <td colSpan={3} className="admin-logs__empty">
                    No se han registrado eventos en la bitácora.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="admin-logs__pagination">
          <button
            className="admin-logs__page-btn"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1 || loading}
          >
            ← Anterior
          </button>
          <span className="admin-logs__page-info">
            Página {page} de {totalPages}
          </span>
          <button
            className="admin-logs__page-btn"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages || loading}
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* Modal de Detalle */}
      {selectedLog && (
        <div className="logs-modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="logs-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="logs-modal-header">
              <h2 className="logs-modal-title">Detalles del Evento</h2>
              <button className="logs-modal-close" onClick={() => setSelectedLog(null)} aria-label="Cerrar modal">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            
            <div className="logs-modal-body">
              <div className="logs-modal-section">
                <div className="logs-modal-label">Acción Registrada</div>
                <div className="logs-modal-value">
                  <span className={`admin-logs__badge ${getActionBadgeClass(selectedLog.accion)}`}>
                    {selectedLog.accion}
                  </span>
                </div>
              </div>

              <div className="logs-modal-grid">
                <div className="logs-modal-section">
                  <div className="logs-modal-label">Fecha y Hora</div>
                  <div className="logs-modal-value logs-modal-date">
                    {formatDate(selectedLog.fecha)}
                  </div>
                </div>

                <div className="logs-modal-section">
                  <div className="logs-modal-label">ID de Log</div>
                  <div className="logs-modal-value">
                    <CopyableId id={selectedLog.id} />
                  </div>
                </div>
              </div>

              <div className="logs-modal-section">
                <div className="logs-modal-label">Usuario Ejecutor</div>
                <div className="logs-modal-value logs-modal-box">
                  {selectedLog.usuario_ejecutor_nombre === 'Sistema' ? (
                    <span className="executor-cell__system-label">Sistema</span>
                  ) : (
                    <div>
                      <div className="executor-cell__name" style={{ fontSize: '0.95rem' }}>
                        {selectedLog.usuario_ejecutor_nombre || 'Usuario'}
                      </div>
                      <div className="executor-cell__email" style={{ fontSize: '0.8125rem', marginBottom: '8px' }}>
                        {selectedLog.usuario_ejecutor_email || '—'}
                      </div>
                      {selectedLog.id_usuario && (
                        <CopyableId id={selectedLog.id_usuario} />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="logs-modal-section">
                <div className="logs-modal-label">Recurso Afectado</div>
                <div className="logs-modal-value logs-modal-box">
                  {selectedLog.id_recurso ? (
                    <div>
                      {selectedLog.recurso_afectado_nombre && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span className="resource-cell__name" style={{ fontSize: '0.95rem', maxWidth: '100%' }}>
                            {selectedLog.recurso_afectado_nombre}
                          </span>
                          <span className={`resource-tag ${selectedLog.recurso_afectado_tipo === 'proyecto' ? 'resource-tag--project' : 'resource-tag--user'}`}>
                            {selectedLog.recurso_afectado_tipo === 'proyecto' ? 'Proyecto' : 'Usuario'}
                          </span>
                        </div>
                      )}
                      <CopyableId id={selectedLog.id_recurso} />
                    </div>
                  ) : (
                    <span className="resource-cell__empty">—</span>
                  )}
                </div>
              </div>

              <div className="logs-modal-section">
                <div className="logs-modal-label">Detalle Completo de la Acción</div>
                <div className="logs-modal-detail-box">
                  {selectedLog.detalle}
                </div>
              </div>
            </div>

            <div className="logs-modal-footer">
              <button className="logs-modal-close-btn" onClick={() => setSelectedLog(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
