import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import ProjectViewHeader from '../../../shared/components/ProjectViewHeader';
import { getErrorMessage } from '../../../shared/api/api';
import { getProject } from '../../projects/api/projectsApi';
import { listProjectTasks } from '../api/kanbanApi';
import type { TaskCard } from '../../../shared/types';
import './TimelinePage.css';

const STATUS_COLOR: Record<string, string> = {
  'To Do': '#94A3B8',
  Backlog: '#94A3B8',
  'In Progress': '#3B82F6',
  'In Review': '#F97316',
  Done: '#22C55E',
};
const DAY = 86400000;

function parse(d?: string | null): Date | null {
  return d ? new Date(d) : null;
}

export default function TimelinePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [projectName, setProjectName] = useState('');
  const [tasks, setTasks] = useState<TaskCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    Promise.all([getProject(projectId), listProjectTasks(projectId)])
      .then(([proj, t]) => {
        setProjectName(proj.name);
        setTasks(t);
      })
      .catch((err) => setError(getErrorMessage(err, 'No se pudo cargar el cronograma')))
      .finally(() => setLoading(false));
  }, [projectId]);

  const { rangeStart, totalDays, monthMarkers } = useMemo(() => {
    const dates: number[] = [];
    for (const t of tasks) {
      const s = parse(t.start_date);
      const e = parse(t.due_date);
      if (s) dates.push(s.getTime());
      if (e) dates.push(e.getTime());
    }
    let start: Date;
    let end: Date;
    if (dates.length === 0) {
      start = new Date();
      end = new Date(Date.now() + 30 * DAY);
    } else {
      start = new Date(Math.min(...dates));
      end = new Date(Math.max(...dates));
    }
    // padding de 3 días a cada lado y normalizar a inicio de día
    const rs = new Date(start.getFullYear(), start.getMonth(), start.getDate() - 3);
    const re = new Date(end.getFullYear(), end.getMonth(), end.getDate() + 3);
    const total = Math.max(1, Math.round((re.getTime() - rs.getTime()) / DAY));

    // marcadores de mes
    const markers: { label: string; leftPct: number }[] = [];
    const cur = new Date(rs.getFullYear(), rs.getMonth(), 1);
    while (cur.getTime() <= re.getTime()) {
      const offset = Math.round((cur.getTime() - rs.getTime()) / DAY);
      markers.push({
        label: cur.toLocaleDateString('es-PE', { month: 'short', year: 'numeric' }),
        leftPct: (offset / total) * 100,
      });
      cur.setMonth(cur.getMonth() + 1);
    }
    return { rangeStart: rs, totalDays: total, monthMarkers: markers };
  }, [tasks]);

  const bars = useMemo(() => {
    return tasks.map((t) => {
      const s = parse(t.start_date);
      const e = parse(t.due_date);
      const barStart = s ?? e;
      const barEnd = e ?? s;
      if (!barStart || !barEnd) return { task: t, hasBar: false as const };
      const startOffset = Math.round((barStart.getTime() - rangeStart.getTime()) / DAY);
      const spanDays = Math.max(1, Math.round((barEnd.getTime() - barStart.getTime()) / DAY) + 1);
      return {
        task: t,
        hasBar: true as const,
        leftPct: (startOffset / totalDays) * 100,
        widthPct: (spanDays / totalDays) * 100,
      };
    });
  }, [tasks, rangeStart, totalDays]);

  if (!projectId) return null;

  return (
    <div className="tl-page">
      <ProjectViewHeader
        projectId={projectId}
        title={`${projectName || 'Proyecto'} — Cronograma`}
        subtitle="Planificación a largo plazo (barras según fecha de inicio y vencimiento)"
      />

      {loading && <div className="app-loader">Cargando cronograma…</div>}
      {!loading && error && <div className="tl-error">{error}</div>}

      {!loading && !error && (
        <div className="tl-wrap">
          {tasks.length === 0 ? (
            <div className="tl-empty">Este proyecto aún no tiene actividades.</div>
          ) : (
            <div className="tl-board">
              {/* Columna izquierda: lista de actividades */}
              <div className="tl-left">
                <div className="tl-left__head">Actividad</div>
                {bars.map(({ task }) => (
                  <div className="tl-left__row" key={task.id} title={task.title}>
                    <span
                      className="tl-left__dot"
                      style={{ background: STATUS_COLOR[task.status ?? ''] ?? '#94A3B8' }}
                    />
                    <span className="tl-left__name">{task.title}</span>
                    <span className="tl-left__assignee">
                      {task.assignee ? task.assignee.split(' ')[0] : <Icon name="user" size={12} />}
                    </span>
                  </div>
                ))}
              </div>

              {/* Columna derecha: barras */}
              <div className="tl-right">
                <div className="tl-right__head">
                  {monthMarkers.map((m, i) => (
                    <span key={i} className="tl-month" style={{ left: `${m.leftPct}%` }}>
                      {m.label}
                    </span>
                  ))}
                </div>
                {bars.map((b) => (
                  <div className="tl-right__row" key={b.task.id}>
                    {b.hasBar ? (
                      <div
                        className="tl-bar"
                        style={{
                          left: `${b.leftPct}%`,
                          width: `${b.widthPct}%`,
                          background: STATUS_COLOR[b.task.status ?? ''] ?? '#94A3B8',
                        }}
                        title={`${b.task.title}`}
                      >
                        <span className="tl-bar__label">{b.task.title}</span>
                      </div>
                    ) : (
                      <span className="tl-bar__none">sin fechas</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
