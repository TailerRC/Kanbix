import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Icon from '../../../shared/components/Icon';
import ProjectViewHeader from '../../../shared/components/ProjectViewHeader';
import { getErrorMessage } from '../../../shared/api/api';
import { getProject } from '../../projects/api/projectsApi';
import { reportsApi, type DashboardOverview } from '../api/reportsApi';
import './ProjectResumenPage.css';

const STATUS_COLORS: Record<string, string> = {
  'To Do': '#94A3B8',
  Backlog: '#94A3B8',
  'In Progress': '#3B82F6',
  'In Review': '#F97316',
  Done: '#22C55E',
};
const PALETTE = ['#3B82F6', '#22C55E', '#A855F7', '#F97316', '#EAB308', '#14B8A6', '#EF4444'];

function colorFor(key: string, i: number) {
  return STATUS_COLORS[key] ?? PALETTE[i % PALETTE.length];
}

const METRIC_CARDS = [
  { key: 'completed', label: 'finalizadas', hint: 'en los últimos 7 días', icon: 'check-circle', color: '#22C55E' },
  { key: 'updated', label: 'actualizadas', hint: 'en los últimos 7 días', icon: 'edit', color: '#3B82F6' },
  { key: 'created', label: 'creadas', hint: 'en los últimos 7 días', icon: 'plus-circle', color: '#A855F7' },
  { key: 'due_soon', label: 'vencen pronto', hint: 'en los próximos 7 días', icon: 'calendar', color: '#F97316' },
] as const;

function timeAgo(iso: string | null): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'hace un momento';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  return `hace ${days} d`;
}

function DonutCard({
  title,
  data,
  nameKey,
}: {
  title: string;
  data: { name: string; value: number }[];
  nameKey: string;
}) {
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <div className="resumen-chart-card">
      <h3 className="resumen-chart-card__title">{title}</h3>
      {total === 0 ? (
        <div className="resumen-empty">Sin datos aún</div>
      ) : (
        <div style={{ width: '100%', height: 240 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
              >
                {data.map((d, i) => (
                  <Cell key={`${nameKey}-${i}`} fill={colorFor(d.name, i)} />
                ))}
              </Pie>
              <Tooltip />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default function ProjectResumenPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [projectName, setProjectName] = useState('');
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    Promise.all([getProject(projectId), reportsApi.getOverview(projectId)])
      .then(([proj, overview]) => {
        setProjectName(proj.name);
        setData(overview);
      })
      .catch((err) => setError(getErrorMessage(err, 'No se pudo cargar el resumen')))
      .finally(() => setLoading(false));
  }, [projectId]);

  const statusData = useMemo(
    () => (data?.by_status ?? []).map((s) => ({ name: s.status, value: s.count })),
    [data]
  );
  const typeData = useMemo(
    () => (data?.by_type ?? []).map((t) => ({ name: t.type, value: t.count })),
    [data]
  );
  const assigneeData = useMemo(
    () => (data?.by_assignee ?? []).map((a) => ({ name: a.name, value: a.count })),
    [data]
  );

  if (!projectId) return null;

  return (
    <div className="resumen-page">
      <ProjectViewHeader projectId={projectId} title={`${projectName || 'Proyecto'} — Resumen`} subtitle="Vistazo rápido del progreso del proyecto" />

      {loading && <div className="app-loader">Cargando resumen…</div>}
      {!loading && error && <div className="resumen-error">{error}</div>}

      {!loading && !error && data && (
        <>
          <div className="resumen-metrics">
            {METRIC_CARDS.map((c) => (
              <div className="resumen-metric" key={c.key}>
                <span className="resumen-metric__icon" style={{ color: c.color, background: `${c.color}1a` }}>
                  <Icon name={c.icon} size={20} />
                </span>
                <div>
                  <div className="resumen-metric__value">
                    {data.metrics_7d[c.key as keyof typeof data.metrics_7d]} <span>{c.label}</span>
                  </div>
                  <div className="resumen-metric__hint">{c.hint}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="resumen-grid">
            <DonutCard title="Actividades por estado" data={statusData} nameKey="status" />
            <DonutCard title="Actividades por tipo" data={typeData} nameKey="type" />
            <DonutCard title="Actividades por responsable" data={assigneeData} nameKey="assignee" />
          </div>

          <div className="resumen-activity">
            <h3 className="resumen-chart-card__title">Actividad reciente</h3>
            {data.recent_activity.length === 0 ? (
              <div className="resumen-empty">Sin actividad reciente</div>
            ) : (
              <ul className="resumen-activity__list">
                {data.recent_activity.map((a) => (
                  <li key={a.task_id} className="resumen-activity__item">
                    <span className="resumen-activity__avatar">
                      {a.assignee ? a.assignee.trim().charAt(0).toUpperCase() : <Icon name="user" size={13} />}
                    </span>
                    <span className="resumen-activity__text">
                      <strong>{a.assignee || 'Sin asignar'}</strong> actualizó{' '}
                      <span className="resumen-activity__task">{a.title}</span>
                    </span>
                    {a.status && <span className="resumen-activity__status">{a.status}</span>}
                    <span className="resumen-activity__time">{timeAgo(a.updated_at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
