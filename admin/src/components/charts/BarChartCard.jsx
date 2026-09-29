import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useTheme } from '@/context/ThemeContext';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-3 shadow-elevated">
      <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  );
};

export default function BarChartCard({ title, data = [], bars = [], height = 300 }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const defaultBars = bars.length > 0 ? bars : [
    { dataKey: 'value', fill: '#1C4D8D', name: 'Value' },
  ];

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-100 dark:border-neutral-800 shadow-soft hover:shadow-card transition-shadow duration-300">
      {title && (
        <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-50 mb-4 font-heading">
          <span className="h-4 w-1 rounded-full bg-gradient-to-b from-primary-500 to-secondary-400" />
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? '#1E293B' : '#E9F0F8'}
            vertical={false}
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: isDark ? '#94A3B8' : '#64748B', fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: isDark ? '#94A3B8' : '#64748B', fontSize: 12 }}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: isDark ? 'rgba(148, 163, 184, 0.08)' : 'rgba(21, 101, 192, 0.06)' }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          {defaultBars.map((bar, i) => (
            <Bar
              key={i}
              dataKey={bar.dataKey}
              fill={bar.fill}
              name={bar.name}
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
