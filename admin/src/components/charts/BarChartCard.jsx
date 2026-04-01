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
    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-100 dark:border-neutral-800">
      {title && (
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 mb-4 font-heading">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? '#404040' : '#E5E5E5'}
            vertical={false}
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: isDark ? '#A3A3A3' : '#737373', fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: isDark ? '#A3A3A3' : '#737373', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
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
