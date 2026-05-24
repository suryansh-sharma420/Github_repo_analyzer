import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CommitChart({ commitActivity }) {
  if (!commitActivity || commitActivity.length === 0) {
    return <p className="text-gray-500">No commit activity data available</p>;
  }

  // Transform commit activity data for the chart
  const chartData = commitActivity.map((week, index) => ({
    week: `W${index + 1}`,
    commits: week.total || 0,
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900">Weekly Commits</h3>
        <span className="text-sm text-gray-500 uppercase tracking-wider">Last 12 Weeks</span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="commits" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
