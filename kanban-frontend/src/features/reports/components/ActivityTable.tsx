import Icon from '../../../shared/components/Icon';
import './ActivityTable.css';

interface ActivityRow {
  id: string;
  date: string;
  event: string;
  status: 'completed' | 'in-progress' | 'blocked' | 'review';
  statusLabel: string;
  user: string;
  initials: string;
}

const mockData: ActivityRow[] = [
  {
    id: 'KBX-0142',
    date: 'Jun 28, 2026',
    event: 'Tarea completada',
    status: 'completed',
    statusLabel: 'Completado',
    user: 'Gianfranco C.',
    initials: 'GC',
  },
  {
    id: 'KBX-0141',
    date: 'Jun 28, 2026',
    event: 'Sprint planning',
    status: 'in-progress',
    statusLabel: 'En progreso',
    user: 'Rodrigo Ch.',
    initials: 'RC',
  },
  {
    id: 'KBX-0139',
    date: 'Jun 27, 2026',
    event: 'Code review',
    status: 'review',
    statusLabel: 'En revisión',
    user: 'Jerzy C.',
    initials: 'JC',
  },
  {
    id: 'KBX-0138',
    date: 'Jun 27, 2026',
    event: 'Tarea bloqueada',
    status: 'blocked',
    statusLabel: 'Bloqueado',
    user: 'Piero V.',
    initials: 'PV',
  },
  {
    id: 'KBX-0137',
    date: 'Jun 26, 2026',
    event: 'Tarea completada',
    status: 'completed',
    statusLabel: 'Completado',
    user: 'Allisson M.',
    initials: 'AM',
  },
];

export default function ActivityTable() {
  return (
    <div className="activity-table">
      <div className="activity-table__header">
        <h2 className="activity-table__title">Historial de Actividad</h2>
        <button className="activity-table__filter">
          Semanal
          <Icon name="chevron-down" size={15} />
        </button>
      </div>

      <div className="activity-table__table-wrap">
        <table className="activity-table__table">
          <thead>
            <tr>
              <th><span className="th-content">ID <Icon name="chevrons" size={14} className="sort-icon" /></span></th>
              <th><span className="th-content">Fecha <Icon name="chevrons" size={14} className="sort-icon" /></span></th>
              <th><span className="th-content">Tipo de evento <Icon name="chevrons" size={14} className="sort-icon" /></span></th>
              <th><span className="th-content">Estado <Icon name="chevrons" size={14} className="sort-icon" /></span></th>
              <th><span className="th-content">Responsable <Icon name="chevrons" size={14} className="sort-icon" /></span></th>
            </tr>
          </thead>
          <tbody>
            {mockData.map((row) => (
              <tr key={row.id}>
                <td>
                  <span className="activity-table__id">{row.id}</span>
                </td>
                <td>
                  <span className="activity-table__date">{row.date}</span>
                </td>
                <td>
                  <span className="activity-table__event">{row.event}</span>
                </td>
                <td>
                  <span className={`activity-table__status activity-table__status--${row.status}`}>
                    {row.statusLabel}
                  </span>
                </td>
                <td>
                  <div className="activity-table__user">
                    <span className="activity-table__user-avatar">{row.initials}</span>
                    {row.user}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
