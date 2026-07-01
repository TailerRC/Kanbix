import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import Icon from '../../../shared/components/Icon';
import ProjectViewHeader from '../../../shared/components/ProjectViewHeader';
import { getErrorMessage } from '../../../shared/api/api';
import { getProject } from '../../projects/api/projectsApi';
import { planningApi } from '../../planning/api/planningApi';
import { useAuth } from '../../../shared/auth/AuthContext';
import type { Sprint } from '../../../shared/types';
import {
  reportsApi,
  type BurndownPoint,
  type BurnupPoint,
  type SprintReportSummary,
  type SprintReportDetail,
} from '../api/reportsApi';
import './InformesPage.css';

function fmtDay(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
}

export default function InformesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [projectName, setProjectName] = useState('');
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
  const [selectedSprint, setSelectedSprint] = useState<string>('');
  const [burndown, setBurndown] = useState<BurndownPoint[]>([]);
  const [burnup, setBurnup] = useState<BurnupPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sprints cerrados / histórico
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [completedReports, setCompletedReports] = useState<SprintReportSummary[]>([]);
  const [selectedReport, setSelectedReport] = useState<SprintReportDetail | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const currentUserMember = project?.members?.find((m: any) => m.user_id === user?.id);
  const isManager = currentUserMember?.rol === 'Manager' || user?.rol_global === 'Admin';

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    Promise.all([getProject(projectId), planningApi.getSprints(projectId)])
      .then(([proj, sp]) => {
        setProject(proj);
        setProjectName(proj.name);
        const active = sp.find((s) => s.state === 'active');
        setActiveSprint(active || null);
        setSelectedSprint(active?.id ?? '');
      })
      .catch((err) => setError(getErrorMessage(err, 'No se pudieron cargar los informes')))
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    if (!projectId || !selectedSprint) {
      setBurndown([]);
      setBurnup([]);
      return;
    }
    reportsApi.getBurndown(projectId, selectedSprint).then(setBurndown).catch(() => setBurndown([]));
    reportsApi.getBurnup(projectId, selectedSprint).then(setBurnup).catch(() => setBurnup([]));
  }, [projectId, selectedSprint]);

  useEffect(() => {
    if (!projectId || activeTab !== 'history' || !isManager) return;
    setLoadingHistory(true);
    reportsApi.listCompletedSprintsReports(projectId)
      .then(setCompletedReports)
      .catch((err) => console.error('Error loading closed sprints reports', err))
      .finally(() => setLoadingHistory(false));
  }, [projectId, activeTab, isManager]);

  const handleSelectReport = async (sprintId: string) => {
    if (!projectId) return;
    try {
      const detail = await reportsApi.getCompletedSprintReportDetail(projectId, sprintId);
      setSelectedReport(detail);
    } catch (err) {
      alert('No se pudo cargar el detalle del sprint cerrado.');
    }
  };

  if (!projectId) return null;

  const burndownData = burndown.map((p) => ({ ...p, label: fmtDay(p.date) }));
  const burnupData = burnup.map((p) => ({ ...p, label: fmtDay(p.date) }));

  const startStr = activeSprint?.start_date ? new Date(activeSprint.start_date).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }) : '';
  const endStr = activeSprint?.end_date ? new Date(activeSprint.end_date).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }) : '';

  return (
    <div className="informes-page">
      <ProjectViewHeader
        projectId={projectId}
        title={`${projectName || 'Proyecto'} — Informes`}
        subtitle="Métricas de Scrum del Sprint Actual"
      />

      {/* Tab Navigation (for Managers/Admins to view closed sprints history) */}
      {isManager && (
        <div className="informes-tabs">
          <button
            className={`informes-tab ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => { setActiveTab('active'); setSelectedReport(null); }}
          >
            Métricas Sprint Activo
          </button>
          <button
            className={`informes-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Historial de Sprints Cerrados
          </button>
        </div>
      )}

      {loading && <div className="app-loader">Cargando informes…</div>}
      {!loading && error && <div className="informes-error">{error}</div>}

      {!loading && !error && (
        <>
          {activeTab === 'active' ? (
            <>
              {!activeSprint ? (
                <div className="informes-empty-banner" style={{
                  background: 'var(--color-surface)',
                  border: '1px dashed var(--color-border)',
                  borderRadius: '12px',
                  padding: '40px 24px',
                  textAlign: 'center',
                  color: 'var(--color-text-secondary)',
                  marginTop: '8px'
                }}>
                  <Icon name="inbox" size={32} style={{ color: 'var(--color-text-muted)', marginBottom: '12px' }} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 4px 0' }}>
                    No hay ningún sprint activo actualmente
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    Inicia un sprint desde la pestaña <strong>Backlog</strong> para ver los gráficos de Burndown y Burnup.
                  </p>
                </div>
              ) : (
                <>
                  <div className="sprint-info-banner" style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    marginBottom: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '8px'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
                          {activeSprint.name}
                        </h2>
                        <span className="badge badge--success" style={{
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          color: '#22c55e',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}>
                          Sprint Activo
                        </span>
                      </div>
                      {activeSprint.goal && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
                          <strong>Objetivo:</strong> {activeSprint.goal}
                        </p>
                      )}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Icon name="calendar" size={14} />
                      <span>{startStr} - {endStr}</span>
                    </div>
                  </div>

                  <div className="informes-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                    {/* Burndown */}
                    <div className="informes-card">
                      <h3 className="informes-card__title">Burndown Chart</h3>
                      {burndownData.length === 0 ? (
                        <div className="informes-empty">Sin datos (el sprint necesita fechas de inicio y fin)</div>
                      ) : (
                        <div style={{ width: '100%', height: 280 }}>
                          <ResponsiveContainer>
                            <LineChart data={burndownData} margin={{ top: 8, right: 12, bottom: 4, left: -12 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" />
                              <XAxis dataKey="label" fontSize={11} />
                              <YAxis fontSize={11} />
                              <Tooltip />
                              <Legend wrapperStyle={{ fontSize: 12 }} />
                              <Line type="monotone" dataKey="ideal_remaining" name="Ideal" stroke="#94A3B8" strokeDasharray="5 5" dot={false} />
                              <Line type="monotone" dataKey="actual_remaining" name="Real" stroke="#3B82F6" strokeWidth={2} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>

                    {/* Burnup */}
                    <div className="informes-card">
                      <h3 className="informes-card__title">Burnup Chart</h3>
                      {burnupData.length === 0 ? (
                        <div className="informes-empty">Sin datos (el sprint necesita fechas de inicio y fin)</div>
                      ) : (
                        <div style={{ width: '100%', height: 280 }}>
                          <ResponsiveContainer>
                            <AreaChart data={burnupData} margin={{ top: 8, right: 12, bottom: 4, left: -12 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" />
                              <XAxis dataKey="label" fontSize={11} />
                              <YAxis fontSize={11} />
                              <Tooltip />
                              <Legend wrapperStyle={{ fontSize: 12 }} />
                              <Area type="monotone" dataKey="scope" name="Alcance" stroke="#F97316" fill="#F9731622" />
                              <Area type="monotone" dataKey="completed" name="Completado" stroke="#22C55E" fill="#22C55E33" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {selectedReport ? (
                <div className="closed-sprint-detail">
                  <button className="closed-sprint-detail__back" onClick={() => setSelectedReport(null)}>
                    <Icon name="chevron-left" size={14} /> Volver al historial
                  </button>
                  
                  <div className="closed-sprint-detail__header">
                    <div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 6px 0', color: 'var(--color-text-primary)' }}>
                        Reporte de Cierre: {selectedReport.sprint_name}
                      </h2>
                      {selectedReport.goal && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                          <strong>Objetivo original:</strong> {selectedReport.goal}
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="badge badge--success" style={{
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        color: '#22c55e',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        Cerrado el {new Date(selectedReport.completed_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="informes-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '24px', gap: '12px' }}>
                    <div className="informes-card" style={{ textAlign: 'center', padding: '12px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>Tareas Totales</span>
                      <strong style={{ fontSize: '1.4rem', color: 'var(--color-text-primary)' }}>{selectedReport.metrics.total_tasks}</strong>
                    </div>
                    <div className="informes-card" style={{ textAlign: 'center', padding: '12px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>Tareas Completadas</span>
                      <strong style={{ fontSize: '1.4rem', color: '#22c55e' }}>{selectedReport.metrics.completed_tasks}</strong>
                    </div>
                    <div className="informes-card" style={{ textAlign: 'center', padding: '12px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>Puntos Comprometidos</span>
                      <strong style={{ fontSize: '1.4rem', color: 'var(--color-text-primary)' }}>{selectedReport.metrics.committed_points}</strong>
                    </div>
                    <div className="informes-card" style={{ textAlign: 'center', padding: '12px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>Puntos Logrados</span>
                      <strong style={{ fontSize: '1.4rem', color: '#3b82f6' }}>{selectedReport.metrics.completed_points}</strong>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 12px 0' }}>Detalle de Tareas al Cierre</h3>
                  <div className="snapshot-table-container">
                    <table className="snapshot-table">
                      <thead>
                        <tr>
                          <th>Código</th>
                          <th>Título</th>
                          <th>Prioridad</th>
                          <th>Responsable</th>
                          <th style={{ textAlign: 'center' }}>Puntos</th>
                          <th style={{ textAlign: 'center' }}>Subtareas</th>
                          <th style={{ textAlign: 'right' }}>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedReport.tasks.map((t) => (
                          <tr key={t.id}>
                            <td style={{ fontWeight: 600, color: 'var(--color-text-muted)', width: '90px' }}>KBX-{t.id.substring(t.id.length - 4).toUpperCase()}</td>
                            <td style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{t.title}</td>
                            <td>
                              <span style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                backgroundColor: t.priority === 'Alta' || t.priority === 'Crítica' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(148, 163, 184, 0.08)',
                                color: t.priority === 'Alta' || t.priority === 'Crítica' ? '#ef4444' : '#64748b'
                              }}>
                                {t.priority}
                              </span>
                            </td>
                            <td>{t.assignee_name}</td>
                            <td style={{ textAlign: 'center', fontWeight: 600 }}>{t.story_points}</td>
                            <td style={{ textAlign: 'center' }}>
                              {t.subtasks_count > 0 ? `${t.completed_subtasks_count}/${t.subtasks_count}` : '—'}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <span className={`badge badge--${t.status === 'Done' ? 'success' : 'warning'}`} style={{
                                backgroundColor: t.status === 'Done' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(249, 115, 22, 0.1)',
                                color: t.status === 'Done' ? '#22c55e' : '#f97316',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 600
                              }}>
                                {t.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="closed-sprints-list">
                  {loadingHistory && <div className="app-loader">Cargando historial de sprints…</div>}
                  {!loadingHistory && completedReports.length === 0 ? (
                    <div className="informes-empty-banner" style={{
                      background: 'var(--color-surface)',
                      border: '1px dashed var(--color-border)',
                      borderRadius: '12px',
                      padding: '40px 24px',
                      textAlign: 'center',
                      color: 'var(--color-text-secondary)',
                      marginTop: '8px'
                    }}>
                      <Icon name="inbox" size={32} style={{ color: 'var(--color-text-muted)', marginBottom: '12px' }} />
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 4px 0' }}>
                        No hay sprints cerrados
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                        Los reportes de cierre de sprint aparecerán aquí una vez que completes un sprint activo.
                      </p>
                    </div>
                  ) : (
                    completedReports.map((report) => (
                      <div
                        key={report.sprint_id}
                        className="closed-sprint-card"
                        onClick={() => handleSelectReport(report.sprint_id)}
                      >
                        <div>
                          <h3 className="closed-sprint-card__title">{report.sprint_name}</h3>
                          <div className="closed-sprint-card__dates">
                            Cerrado el {new Date(report.completed_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                        <div className="closed-sprint-card__metrics">
                          <div className="closed-sprint-card__metric-item">
                            <span className="closed-sprint-card__metric-val">
                              {report.metrics.completed_tasks}/{report.metrics.total_tasks}
                            </span>
                            Tareas listas
                          </div>
                          <div className="closed-sprint-card__metric-item">
                            <span className="closed-sprint-card__metric-val" style={{ color: '#3b82f6' }}>
                              {report.metrics.completed_points}/{report.metrics.committed_points}
                            </span>
                            Puntos logrados
                          </div>
                          <Icon name="chevron-right" size={16} style={{ color: 'var(--color-text-muted)', marginLeft: '10px' }} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
