import Icon, { type IconName } from '../../../shared/components/Icon';
import './TaskDistribution.css';

interface DistributionItem {
  label: string;
  count: number;
  color: string;
  icon: IconName;
  percentage: number;
}

const distributionData: DistributionItem[] = [
  { label: 'Backlog', count: 32, color: '#94A3B8', icon: 'backlog', percentage: 25 },
  { label: 'Por hacer', count: 24, color: '#3B82F6', icon: 'square', percentage: 19 },
  { label: 'En progreso', count: 18, color: '#F59E0B', icon: 'sprint', percentage: 14 },
  { label: 'En revisión', count: 22, color: '#8B5CF6', icon: 'eye', percentage: 17 },
  { label: 'Completado', count: 32, color: '#10B981', icon: 'check-circle', percentage: 25 },
];

export default function TaskDistribution() {
  return (
    <div className="task-distribution">
      <div className="task-distribution__header">
        <h2 className="task-distribution__title">Distribución de Tareas</h2>
        <button className="task-distribution__settings" aria-label="Reordenar">
          <Icon name="shuffle" size={17} />
        </button>
      </div>

      {distributionData.map((item) => (
        <div key={item.label} className="task-distribution__row">
          <div
            className="task-distribution__icon"
            style={{ backgroundColor: item.color }}
          >
            <Icon name={item.icon} size={16} strokeWidth={2} />
          </div>
          <span className="task-distribution__count">
            {item.count}
          </span>
          <div className="task-distribution__bar-wrap">
            <div
              className="task-distribution__bar-fill"
              style={{
                width: `${item.percentage}%`,
                backgroundColor: item.color,
              }}
            />
          </div>
          <span className="task-distribution__percentage">
            {item.percentage}%
          </span>
          <span className="task-distribution__tag">
            {item.label}
          </span>
        </div>
      ))}

      <div className="task-distribution__footer">
        <span>Distribución del sprint actual.</span>
        <a href="#">Ver más</a>
      </div>
    </div>
  );
}
