import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

const COLORS = ['#1C4D8D', '#2CB2DD', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-3 shadow-elevated">
      <p className="text-sm font-semibold" style={{ color: payload[0].payload.fill }}>
        {payload[0].name}: {payload[0].value.toLocaleString()}
      </p>
    </div>
  );
};

export default function PieChartCard({ title, data = [], height = 300 }) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-100 dark:border-neutral-800">
      {title && (
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 mb-4 font-heading">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            formatter={(value) => (
              <span className="text-neutral-700 dark:text-neutral-300">{value}</span>
            )}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
