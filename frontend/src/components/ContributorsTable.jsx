import { useState } from 'react';
import { Users, Search } from 'lucide-react';

const RANK_STYLES = {
  1: 'bg-amber-100 text-amber-700 ring-1 ring-amber-300',
  2: 'bg-slate-100 text-slate-600 ring-1 ring-slate-300',
  3: 'bg-orange-100 text-orange-700 ring-1 ring-orange-300',
};

export default function ContributorsTable({ contributors }) {
  const [filter, setFilter] = useState('');
  const [showAll, setShowAll] = useState(false);

  if (!contributors || contributors.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-6 flex items-center justify-center min-h-[360px]">
        <p className="text-slate-400">No contributors data available</p>
      </div>
    );
  }

  const filteredContributors = contributors.filter((c) =>
    (c.username || '').toLowerCase().includes(filter.toLowerCase())
  );

  const displayContributors = showAll
    ? filteredContributors
    : filteredContributors.slice(0, 10);

  const maxContributions = Math.max(...contributors.map((c) => c.contributions || 0), 1);

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
            <Users className="w-4 h-4 text-brand-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Contributors</h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {contributors.length} total
        </span>
      </div>

      {/* Filter input */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter contributors..."
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-transparent"
        />
      </div>

      {/* Toggle buttons */}
      <div className="inline-flex gap-1 mb-4 bg-slate-100 rounded-xl p-1 w-fit">
        {[
          { key: false, label: 'Top 10' },
          { key: true, label: 'All' },
        ].map(({ key, label }) => (
          <button
            key={label}
            onClick={() => setShowAll(key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              showAll === key
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="overflow-auto max-h-[360px] scroll-slim -mx-2 px-2">
        <div className="space-y-2">
          {displayContributors.map((contributor, index) => {
            const rank = index + 1;
            const pct = Math.round(((contributor.contributions || 0) / maxContributions) * 100);
            return (
              <div
                key={contributor.username || index}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <span
                  className={`w-6 h-6 shrink-0 rounded-full text-xs font-bold flex items-center justify-center ${
                    RANK_STYLES[rank] || 'bg-slate-50 text-slate-400'
                  }`}
                >
                  {rank}
                </span>
                <img
                  src={contributor.avatar}
                  alt={contributor.username}
                  className="w-9 h-9 rounded-full ring-2 ring-white shadow-sm"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <a
                    href={contributor.profile_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-slate-800 hover:text-brand-600 truncate block"
                  >
                    {contributor.username}
                  </a>
                  <div className="mt-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-700 tabular-nums shrink-0">
                  {(contributor.contributions || 0).toLocaleString()}
                </span>
              </div>
            );
          })}
          {displayContributors.length === 0 && (
            <p className="text-sm text-slate-400 py-6 text-center">No contributors match your filter.</p>
          )}
        </div>
      </div>
    </div>
  );
}
