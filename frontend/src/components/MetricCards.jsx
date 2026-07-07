import { GitCommit, Activity, TrendingUp, Users } from 'lucide-react';

function MetricCard({ icon: Icon, label, value, sub, gradient }) {
  return (
    <div className={`rounded-2xl p-5 text-white shadow-card ${gradient}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-white/80">{label}</h4>
        <Icon className="w-5 h-5 text-white/80" />
      </div>
      <p className="text-3xl font-bold mt-3">{value}</p>
      {sub && <p className="text-sm text-white/75 mt-1">{sub}</p>}
    </div>
  );
}

export default function MetricCards({ commitActivity, contributors }) {
  const hasActivity = commitActivity && commitActivity.length > 0;
  const contributorCount = Array.isArray(contributors) ? contributors.length : 0;

  const totalCommits = hasActivity
    ? commitActivity.reduce((sum, week) => sum + (week.total || 0), 0)
    : 0;
  const weeklyAverage = hasActivity ? Math.round(totalCommits / commitActivity.length) : 0;
  const peakWeek = hasActivity
    ? commitActivity.reduce(
        (max, week, index) =>
          (week.total || 0) > max.total ? { total: week.total || 0, week: index + 1 } : max,
        { total: 0, week: 0 }
      )
    : { total: 0, week: 0 };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      <MetricCard
        icon={GitCommit}
        label="Total Commits"
        value={totalCommits.toLocaleString()}
        sub="Last 12 weeks"
        gradient="bg-gradient-to-br from-brand-500 to-brand-700"
      />
      <MetricCard
        icon={Activity}
        label="Weekly Average"
        value={weeklyAverage.toLocaleString()}
        sub="Commits / week"
        gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
      />
      <MetricCard
        icon={TrendingUp}
        label="Peak Week"
        value={peakWeek.total > 0 ? `W${peakWeek.week}` : '—'}
        sub={peakWeek.total > 0 ? `${peakWeek.total} commits` : 'No data'}
        gradient="bg-gradient-to-br from-amber-500 to-orange-600"
      />
      <MetricCard
        icon={Users}
        label="Contributors"
        value={contributorCount.toLocaleString()}
        sub={contributorCount >= 100 ? 'Top 100 fetched' : 'Total tracked'}
        gradient="bg-gradient-to-br from-fuchsia-500 to-purple-600"
      />
    </div>
  );
}
