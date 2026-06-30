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

export default function StatCard({
  label,
  value,
  trend,
  trendDirection,
  trendLabel,
  percentage,
  accentColor,
}: StatCardProps) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="stat-card">
      <div className="stat-card__info">
        <span className="stat-card__label">{label}</span>
        <span className="stat-card__value">{value}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`stat-card__trend stat-card__trend--${trendDirection}`}>
            {trendDirection === 'up' ? '↑' : '↓'} {trend}
          </span>
          <span className="stat-card__trend-label">{trendLabel}</span>
        </div>
      </div>

      <div className="stat-card__indicator">
        <svg viewBox="0 0 48 48">
          <circle
            className="stat-card__indicator-bg"
            cx="24"
            cy="24"
            r={radius}
          />
          <circle
            className="stat-card__indicator-fill"
            cx="24"
            cy="24"
            r={radius}
            stroke={accentColor}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <span className="stat-card__indicator-text">{percentage}%</span>
      </div>
    </div>
  );
}
