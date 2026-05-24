import { useState } from 'react';

export default function ContributorsTable({ contributors }) {
  const [filter, setFilter] = useState('');
  const [showAll, setShowAll] = useState(false);

  if (!contributors || contributors.length === 0) {
    return <p className="text-gray-500">No contributors data available</p>;
  }

  const filteredContributors = contributors.filter((c) =>
    c.username.toLowerCase().includes(filter.toLowerCase())
  );

  const displayContributors = showAll
    ? filteredContributors
    : filteredContributors.slice(0, 10);

  const maxContributions = Math.max(
    ...contributors.map((c) => c.contributions || 0),
    1
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Contributors</h3>

      {/* Filter input */}
      <div className="mb-4">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter contributors..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Toggle buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setShowAll(false)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            !showAll
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Top 10
        </button>
        <button
          onClick={() => setShowAll(true)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            showAll
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All
        </button>
      </div>

      {/* Table */}
      <div className="overflow-auto max-h-[400px] border border-gray-200 rounded-lg">
        <table className="w-full">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-gray-600 font-semibold">Avatar</th>
              <th className="text-left py-3 px-4 text-gray-600 font-semibold">Username</th>
              <th className="text-left py-3 px-4 text-gray-600 font-semibold">Commits</th>
              <th className="text-left py-3 px-4 text-gray-600 font-semibold">Activity</th>
            </tr>
          </thead>
          <tbody>
            {displayContributors.map((contributor, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <img
                    src={contributor.avatar}
                    alt={contributor.username}
                    className="w-8 h-8 rounded-full"
                  />
                </td>
                <td className="py-3 px-4">
                  <a
                    href={contributor.profile_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {contributor.username}
                  </a>
                </td>
                <td className="py-3 px-4 text-gray-700">
                  {contributor.contributions || 0}
                </td>
                <td className="py-3 px-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${(contributor.contributions / maxContributions) * 100}%`,
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
