import StatCard from '../../../shared/components/StatCard';
import WeeklyOverview from '../components/WeeklyOverview';
import SprintComplianceCard from '../components/SprintComplianceCard';
import ActivityTable from '../components/ActivityTable';
import TaskDistribution from '../components/TaskDistribution';
import './DashboardPage.css';

const statCards = [
  {
    label: 'Tareas totales',
    value: 128,
    trend: '+12%',
    trendDirection: 'up' as const,
    trendLabel: 'vs. semana pasada',
    percentage: 100,
    accentColor: '#3B82F6',
  },
  {
    label: 'Completadas',
    value: 96,
    trend: '+18%',
    trendDirection: 'up' as const,
    trendLabel: 'vs. semana pasada',
    percentage: 75,
    accentColor: '#10B981',
  },
  {
    label: 'En progreso',
    value: 24,
    trend: '-5%',
    trendDirection: 'down' as const,
    trendLabel: 'vs. semana pasada',
    percentage: 19,
    accentColor: '#F59E0B',
  },
  {
    label: 'Vencidas',
    value: 8,
    trend: '+3%',
    trendDirection: 'up' as const,
    trendLabel: 'vs. semana pasada',
    percentage: 6,
    accentColor: '#EF4444',
  },
];

export default function DashboardPage() {
  return (
    <div className="dashboard-page">
      {/* Stat cards row */}
      <div className="dashboard-page__stats">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Middle row: chart + compliance */}
      <div className="dashboard-page__middle">
        <WeeklyOverview />
        <SprintComplianceCard />
      </div>

      {/* Bottom row: activity table + task distribution */}
      <div className="dashboard-page__bottom">
        <ActivityTable />
        <TaskDistribution />
      </div>
    </div>
  );
}
