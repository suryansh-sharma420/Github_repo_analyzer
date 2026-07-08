import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3 } from 'lucide-react';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg bg-ink-900 text-white px-3 py-2 shadow-lg text-sm">
      <div className="font-semibold">{label}</div>
      <div className="text-brand-400">{payload[0].value} commits</div>
    </div>
  );
}

export default function CommitChart({ commitActivity }) {
  if (!commitActivity || commitActivity.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-6 flex items-center justify-center min-h-[360px]">
        <p className="text-slate-400">No commit activity data available</p>
      </div>
    );
  }

  const chartData = commitActivity.map((week, index) => ({
    week: `W${index + 1}`,
    commits: week.total || 0,
  }));

  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-brand-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Weekly Commits</h3>
        </div>
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          Last 12 Weeks
        </span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="commitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
          <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#c7d2fe', strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="commits"
            stroke="#4f46e5"
            strokeWidth={2.5}
            fill="url(#commitGradient)"
            dot={{ r: 3, fill: '#4f46e5' }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
