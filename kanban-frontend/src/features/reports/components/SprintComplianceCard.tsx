import Icon from '../../../shared/components/Icon';
import './SprintComplianceCard.css';

export default function SprintComplianceCard() {
  const completed = 26;
  const total = 30;
  const percentage = Math.round((completed / total) * 100);

  return (
    <div className="sprint-compliance">
      <h2 className="sprint-compliance__title">Tasa de Cumplimiento</h2>

      <div className="sprint-compliance__metric">
        <span className="sprint-compliance__big-number">{percentage}%</span>
        <span className="sprint-compliance__subtitle">
          {completed} de {total}
        </span>
      </div>

      <div className="sprint-compliance__progress">
        <div
          className="sprint-compliance__progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="sprint-compliance__trend">
        <span className="sprint-compliance__trend-badge">
          <Icon name="trend-up" size={13} strokeWidth={2.2} />
          +15%
        </span>
        <span className="sprint-compliance__trend-text">
          vs. sprint anterior
        </span>
      </div>

      <div className="sprint-compliance__actions">
        <button className="btn btn--outline">Ver detalle</button>
        <button className="btn btn--primary">Ver reporte</button>
      </div>
    </div>
  );
}
