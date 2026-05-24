export default function MetricCards({ commitActivity }) {
  if (!commitActivity || commitActivity.length === 0) {
    return <p className="text-gray-500">No commit activity data available</p>;
  }

  // Calculate metrics
  const totalCommits = commitActivity.reduce((sum, week) => sum + (week.total || 0), 0);
  const weeklyAverage = Math.round(totalCommits / commitActivity.length);
  const peakWeek = commitActivity.reduce((max, week, index) => {
    if (week.total > max.total) {
      return { total: week.total, week: index + 1 };
    }
    return max;
  }, { total: 0, week: 0 });

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Total Commits Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Total Commits
        </h4>
        <p className="text-3xl font-bold text-gray-900">{totalCommits}</p>
      </div>

      {/* Weekly Average Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Weekly Average
        </h4>
        <p className="text-3xl font-bold text-gray-900">{weeklyAverage}</p>
      </div>

      {/* Peak Week Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Peak Week
        </h4>
        <p className="text-3xl font-bold text-gray-900">
          W{peakWeek.week}: {peakWeek.total}
        </p>
      </div>
    </div>
  );
}
