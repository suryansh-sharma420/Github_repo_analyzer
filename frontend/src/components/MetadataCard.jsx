import { Star, GitFork, AlertCircle } from 'lucide-react';

export default function MetadataCard({ metadata }) {
  if (!metadata) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Header with name and language badge */}
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-3xl font-bold text-gray-900">{metadata.name}</h2>
        {metadata.language && (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            {metadata.language}
          </span>
        )}
      </div>

      {/* Description */}
      {metadata.description && (
        <p className="text-gray-600 text-lg mb-6">{metadata.description}</p>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-8 mb-6">
        <div className="flex flex-col items-center">
          <Star className="w-5 h-5 text-yellow-500 mb-1" />
          <span className="text-gray-900 font-bold text-lg">
            {(metadata.stars || 0).toLocaleString()}
          </span>
          <span className="text-gray-500 text-xs">Stars</span>
        </div>
        <div className="flex flex-col items-center">
          <GitFork className="w-5 h-5 text-gray-500 mb-1" />
          <span className="text-gray-900 font-bold text-lg">
            {(metadata.forks || 0).toLocaleString()}
          </span>
          <span className="text-gray-500 text-xs">Forks</span>
        </div>
        <div className="flex flex-col items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mb-1" />
          <span className="text-gray-900 font-bold text-lg">
            {(metadata.open_issues || 0).toLocaleString()}
          </span>
          <span className="text-gray-500 text-xs">Issues</span>
        </div>
      </div>

      {/* Topic pills */}
      {metadata.topics && metadata.topics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {metadata.topics.map((topic, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
            >
              {topic}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
