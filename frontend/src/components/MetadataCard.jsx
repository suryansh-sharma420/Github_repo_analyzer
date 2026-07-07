import { Star, GitFork, AlertCircle, Scale, Calendar, Clock, ExternalLink, Link2 } from 'lucide-react';

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function StatTile({ icon: Icon, label, value, accent }) {
  const display = typeof value === 'number' ? value.toLocaleString() : value;
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/15 backdrop-blur px-4 py-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="min-w-0">
        <div className="text-lg font-bold leading-none truncate">{display}</div>
        <div className="text-xs text-white/70 mt-1">{label}</div>
      </div>
    </div>
  );
}

export default function MetadataCard({ metadata, repoUrl }) {
  if (!metadata) return null;

  const ownerRepo = repoUrl
    ? repoUrl.replace(/\/$/, '').split('/').slice(-2).join('/')
    : metadata.name;

  return (
    <div className="rounded-2xl shadow-card overflow-hidden">
      {/* Gradient banner */}
      <div className="bg-gradient-to-br from-brand-600 via-brand-500 to-indigo-400 text-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-3xl font-bold truncate">{metadata.name}</h2>
              {metadata.language && (
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                  {metadata.language}
                </span>
              )}
            </div>
            <p className="text-white/80 text-sm mt-1">{ownerRepo}</p>
            {metadata.description && (
              <p className="text-white/90 text-base mt-3 max-w-3xl">{metadata.description}</p>
            )}
          </div>
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <StatTile icon={Star} label="Stars" value={metadata.stars} accent="bg-amber-400/90" />
          <StatTile icon={GitFork} label="Forks" value={metadata.forks} accent="bg-emerald-400/90" />
          <StatTile icon={AlertCircle} label="Open Issues" value={metadata.open_issues} accent="bg-rose-400/90" />
          <StatTile icon={Scale} label="License" value={metadata.license || 'None'} accent="bg-sky-400/90" />
        </div>
      </div>

      {/* Footer meta row */}
      <div className="bg-white px-6 py-4 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
        <span className="inline-flex items-center gap-2 text-slate-600">
          <Calendar className="w-4 h-4 text-slate-400" />
          Created {formatDate(metadata.created_at)}
        </span>
        <span className="inline-flex items-center gap-2 text-slate-600">
          <Clock className="w-4 h-4 text-slate-400" />
          Last push {formatDate(metadata.last_push)}
        </span>
        {metadata.homepage && (
          <a
            href={metadata.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium"
          >
            <Link2 className="w-4 h-4" />
            Homepage
            <ExternalLink className="w-3 h-3" />
          </a>
        )}

        {metadata.topics && metadata.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 w-full mt-1">
            {metadata.topics.map((topic, index) => (
              <span
                key={index}
                className="px-2.5 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-medium"
              >
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
