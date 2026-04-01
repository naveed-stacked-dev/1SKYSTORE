import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
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

export default function LineChartCard({ title, data = [], lines = [], height = 300 }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const defaultLines = lines.length > 0 ? lines : [
    { dataKey: 'value', stroke: '#1C4D8D', name: 'Value' },
  ];

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-100 dark:border-neutral-800">
      {title && (
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 mb-4 font-heading">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
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
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />
          {defaultLines.map((line, i) => (
            <Line
              key={i}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.stroke}
              name={line.name}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, fill: '#fff' }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
