import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import ProjectViewHeader from '../../../shared/components/ProjectViewHeader';
import { getErrorMessage } from '../../../shared/api/api';
import { getProject } from '../../projects/api/projectsApi';
import { planningApi } from '../../planning/api/planningApi';
import type { Sprint } from '../../../shared/types';
import {
  reportsApi,
  type BurndownPoint,
  type BurnupPoint,
  type VelocityItem,
} from '../api/reportsApi';
import './InformesPage.css';

function fmtDay(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
}

export default function InformesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [projectName, setProjectName] = useState('');
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedSprint, setSelectedSprint] = useState<string>('');
  const [burndown, setBurndown] = useState<BurndownPoint[]>([]);
  const [burnup, setBurnup] = useState<BurnupPoint[]>([]);
  const [velocity, setVelocity] = useState<VelocityItem[]>([]);
  const [velocityDenied, setVelocityDenied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    Promise.all([getProject(projectId), planningApi.getSprints(projectId)])
      .then(([proj, sp]) => {
        setProjectName(proj.name);
        setSprints(sp);
        const preferred = sp.find((s) => s.state === 'active') || sp.find((s) => s.state === 'completed') || sp[0];
        setSelectedSprint(preferred?.id ?? '');
      })
      .catch((err) => setError(getErrorMessage(err, 'No se pudieron cargar los informes')))
      .finally(() => setLoading(false));

    reportsApi
      .getVelocity(projectId)
      .then(setVelocity)
      .catch((err: any) => {
        if (err?.response?.status === 403) setVelocityDenied(true);
      });
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

  if (!projectId) return null;

  const burndownData = burndown.map((p) => ({ ...p, label: fmtDay(p.date) }));
  const burnupData = burnup.map((p) => ({ ...p, label: fmtDay(p.date) }));

  return (
    <div className="informes-page">
      <ProjectViewHeader
        projectId={projectId}
        title={`${projectName || 'Proyecto'} — Informes`}
        subtitle="Métricas de cierre de Scrum: burndown, burnup y velocidad"
        actions={
          sprints.length > 0 ? (
            <select
              className="informes-select"
              value={selectedSprint}
              onChange={(e) => setSelectedSprint(e.target.value)}
            >
              {sprints.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.state === 'active' ? '(activo)' : s.state === 'completed' ? '(cerrado)' : ''}
                </option>
              ))}
            </select>
          ) : undefined
        }
      />

      {loading && <div className="app-loader">Cargando informes…</div>}
      {!loading && error && <div className="informes-error">{error}</div>}

      {!loading && !error && (
        <>
          {sprints.length === 0 && (
            <div className="informes-empty-banner">
              Este proyecto no tiene sprints todavía. Crea un sprint en la pestaña <strong>Backlog</strong> para ver
              gráficos de burndown/burnup.
            </div>
          )}

          <div className="informes-grid">
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

            {/* Velocity */}
            <div className="informes-card informes-card--wide">
              <h3 className="informes-card__title">Velocity Chart</h3>
              {velocityDenied ? (
                <div className="informes-empty">Requiere rol Manager+ para ver la velocidad del equipo</div>
              ) : velocity.length === 0 ? (
                <div className="informes-empty">Aún no hay sprints cerrados para calcular la velocidad</div>
              ) : (
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={velocity} margin={{ top: 8, right: 12, bottom: 4, left: -12 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" />
                      <XAxis dataKey="sprint_name" fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="committed_points" name="Comprometido" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="completed_points" name="Completado" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
