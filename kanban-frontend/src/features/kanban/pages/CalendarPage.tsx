import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import ProjectViewHeader from '../../../shared/components/ProjectViewHeader';
import { getErrorMessage } from '../../../shared/api/api';
import { getProject } from '../../projects/api/projectsApi';
import { listProjectTasks, updateTask } from '../api/kanbanApi';
import type { TaskCard } from '../../../shared/types';
import './CalendarPage.css';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const STATUS_COLOR: Record<string, string> = {
  'To Do': '#94A3B8',
  Backlog: '#94A3B8',
  'In Progress': '#3B82F6',
  'In Review': '#F97316',
  Done: '#22C55E',
};

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Devuelve la matriz de días (semanas de lunes a domingo) que cubren el mes. */
function buildMonthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // lunes = 0
  const start = new Date(year, month, 1 - startOffset);
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    days.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }
  return days;
}

export default function CalendarPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [projectName, setProjectName] = useState('');
  const [tasks, setTasks] = useState<TaskCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cursor, setCursor] = useState(() => new Date());
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    Promise.all([getProject(projectId), listProjectTasks(projectId)])
      .then(([proj, t]) => {
        setProjectName(proj.name);
        setTasks(t);
      })
      .catch((err) => setError(getErrorMessage(err, 'No se pudo cargar el calendario')))
      .finally(() => setLoading(false));
  }, [projectId]);

  const days = useMemo(() => buildMonthGrid(cursor.getFullYear(), cursor.getMonth()), [cursor]);

  const tasksByDay = useMemo(() => {
    const map: Record<string, TaskCard[]> = {};
    for (const t of tasks) {
      if (!t.due_date) continue;
      const k = dayKey(new Date(t.due_date));
      (map[k] ||= []).push(t);
    }
    return map;
  }, [tasks]);

  const unscheduled = useMemo(() => tasks.filter((t) => !t.due_date), [tasks]);

  const monthLabel = cursor.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
  const todayKey = dayKey(new Date());

  const handleDropOnDay = async (d: Date) => {
    setDragOverKey(null);
    const taskId = dragId;
    setDragId(null);
    if (!taskId) return;
    const iso = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0).toISOString();
    const prev = tasks;
    setTasks((cur) => cur.map((t) => (t.id === taskId ? { ...t, due_date: iso } : t)));
    try {
      await updateTask(taskId, { due_date: iso });
    } catch (err) {
      setTasks(prev);
      alert(getErrorMessage(err, 'No se pudo actualizar la fecha'));
    }
  };

  if (!projectId) return null;

  return (
    <div className="cal-page">
      <ProjectViewHeader
        projectId={projectId}
        title={`${projectName || 'Proyecto'} — Calendario`}
        subtitle="Arrastra una actividad a un día para asignarle fecha de vencimiento"
        actions={
          <div className="cal-nav">
            <button className="cal-nav__btn" onClick={() => setCursor(new Date())}>
              Hoy
            </button>
            <button
              className="cal-nav__btn cal-nav__btn--icon"
              onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
              aria-label="Mes anterior"
            >
              <Icon name="arrow-left" size={16} />
            </button>
            <span className="cal-nav__label">{monthLabel}</span>
            <button
              className="cal-nav__btn cal-nav__btn--icon"
              onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))}
              aria-label="Mes siguiente"
            >
              <Icon name="arrow-right" size={16} />
            </button>
          </div>
        }
      />

      {loading && <div className="app-loader">Cargando calendario…</div>}
      {!loading && error && <div className="cal-error">{error}</div>}

      {!loading && !error && (
        <div className="cal-layout">
          <div className="cal-grid-wrap">
            <div className="cal-weekdays">
              {WEEKDAYS.map((w) => (
                <div key={w} className="cal-weekday">
                  {w}
                </div>
              ))}
            </div>
            <div className="cal-grid">
              {days.map((d) => {
                const k = dayKey(d);
                const inMonth = d.getMonth() === cursor.getMonth();
                const dayTasks = tasksByDay[k] ?? [];
                return (
                  <div
                    key={k}
                    className={`cal-cell ${inMonth ? '' : 'cal-cell--out'} ${dragOverKey === k ? 'cal-cell--over' : ''}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverKey(k);
                    }}
                    onDragLeave={() => setDragOverKey((cur) => (cur === k ? null : cur))}
                    onDrop={() => handleDropOnDay(d)}
                  >
                    <div className={`cal-cell__num ${k === todayKey ? 'cal-cell__num--today' : ''}`}>
                      {d.getDate()}
                    </div>
                    <div className="cal-cell__tasks">
                      {dayTasks.map((t) => (
                        <div
                          key={t.id}
                          className="cal-chip"
                          draggable
                          onDragStart={() => setDragId(t.id)}
                          onDragEnd={() => setDragId(null)}
                          style={{ borderLeftColor: STATUS_COLOR[t.status ?? ''] ?? '#94A3B8' }}
                          title={t.title}
                        >
                          {t.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="cal-side">
            <h3 className="cal-side__title">
              <Icon name="inbox" size={15} /> Sin programar ({unscheduled.length})
            </h3>
            <p className="cal-side__hint">Arrastra estas actividades al calendario.</p>
            <div className="cal-side__list">
              {unscheduled.length === 0 ? (
                <div className="cal-side__empty">Todo tiene fecha 🎉</div>
              ) : (
                unscheduled.map((t) => (
                  <div
                    key={t.id}
                    className="cal-side__card"
                    draggable
                    onDragStart={() => setDragId(t.id)}
                    onDragEnd={() => setDragId(null)}
                    style={{ borderLeftColor: STATUS_COLOR[t.status ?? ''] ?? '#94A3B8' }}
                  >
                    <div className="cal-side__card-title">{t.title}</div>
                    {t.status && <span className="cal-side__card-status">{t.status}</span>}
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
