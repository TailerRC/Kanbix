import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Icon from '../../../shared/components/Icon';
import './WeeklyOverview.css';

const weeklyData = [
  { day: 'Lun', creadas: 8, completadas: 5, enProgreso: 3 },
  { day: 'Mar', creadas: 6, completadas: 7, enProgreso: 4 },
  { day: 'Mié', creadas: 10, completadas: 8, enProgreso: 6 },
  { day: 'Jue', creadas: 7, completadas: 9, enProgreso: 5 },
  { day: 'Vie', creadas: 12, completadas: 10, enProgreso: 7 },
  { day: 'Sáb', creadas: 4, completadas: 3, enProgreso: 2 },
  { day: 'Dom', creadas: 2, completadas: 1, enProgreso: 1 },
];

const legendItems = [
  { label: 'Creadas', color: '#3B82F6' },
  { label: 'Completadas', color: '#10B981' },
  { label: 'En progreso', color: '#F59E0B' },
];

interface TooltipEntry {
  dataKey?: string | number;
  color?: string;
  name?: string | number;
  value?: number;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload) return null;

  return (
    <div className="weekly-overview__tooltip">
      <div className="weekly-overview__tooltip-label">{label}</div>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="weekly-overview__tooltip-item">
          <span
            className="weekly-overview__tooltip-dot"
            style={{ backgroundColor: entry.color }}
          />
          <span>{entry.name}: {entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function WeeklyOverview() {
  return (
    <div className="weekly-overview">
      <div className="weekly-overview__header">
        <h2 className="weekly-overview__title">Resumen Semanal</h2>
        <div className="weekly-overview__controls">
          <div className="weekly-overview__legend">
            {legendItems.map((item) => (
              <span key={item.label} className="weekly-overview__legend-item">
                <span
                  className="weekly-overview__legend-dot"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </span>
            ))}
          </div>
          <button className="weekly-overview__filter">
            Semanal
            <Icon name="chevron-down" size={15} />
          </button>
        </div>
      </div>

      <div className="weekly-overview__chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={weeklyData}
            margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
            barCategoryGap="20%"
            barGap={3}
          >
            <defs>
              <pattern
                id="wo-stripes"
                patternUnits="userSpaceOnUse"
                width="6"
                height="6"
                patternTransform="rotate(45)"
              >
                <rect width="6" height="6" fill="#F59E0B" opacity="0.18" />
                <line x1="0" y1="0" x2="0" y2="6" stroke="#F59E0B" strokeWidth="3" />
              </pattern>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E5E7EB"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
            <Bar
              dataKey="creadas"
              name="Creadas"
              fill="#3B82F6"
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="completadas"
              name="Completadas"
              fill="#10B981"
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="enProgreso"
              name="En progreso"
              fill="url(#wo-stripes)"
              stroke="#F59E0B"
              strokeWidth={1}
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
