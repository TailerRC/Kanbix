import Icon from './Icon';
import './StatCard.css';

interface StatCardProps {
  label: string;
  value: string | number;
  trend: string;
  trendDirection: 'up' | 'down';
  trendLabel: string;
  percentage: number;
  accentColor: string;
}

/**
 * Stat card (fila superior del dashboard, estilo Finova):
 * label · número grande · pill de tendencia + "vs. semana pasada" y
 * una barra vertical redondeada a la derecha con un chip de porcentaje.
 */
export default function StatCard({
  label,
  value,
  trend,
  trendDirection,
  trendLabel,
  percentage,
  accentColor,
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card__info">
        <span className="stat-card__label">{label}</span>
        <span className="stat-card__value">{value}</span>
        <div className="stat-card__trend-row">
          <span className={`stat-card__trend stat-card__trend--${trendDirection}`}>
            <Icon name={trendDirection === 'up' ? 'trend-up' : 'trend-down'} size={13} strokeWidth={2.2} />
            {trend}
          </span>
          <span className="stat-card__trend-label">{trendLabel}</span>
        </div>
      </div>

      {/* Barra vertical con chip de porcentaje */}
      <div
        className="stat-card__gauge"
        style={{ ['--accent' as string]: accentColor }}
      >
        <div
          className="stat-card__gauge-fill"
          style={{ height: `${Math.min(percentage, 100)}%` }}
        >
          <span className="stat-card__gauge-chip">{percentage}%</span>
        </div>
      </div>
    </div>
  );
}
