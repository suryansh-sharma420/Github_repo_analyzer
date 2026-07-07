import { useState, useEffect } from 'react';
import { Search, History, Trash2, Github, Star, Loader2 } from 'lucide-react';
import { apiUrl } from '../api';

export default function Sidebar({ onAnalyze, onLoadHistory }) {
  const [url, setUrl] = useState('');
  const [history, setHistory] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(apiUrl('/history'));
      const data = await response.json();
      setHistory(data.history || []);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onAnalyze(url);
      setUrl('');
      fetchHistory();
    } finally {
      setSubmitting(false);
    }
  };

  const handleHistoryClick = (repoUrl) => {
    onLoadHistory(repoUrl);
  };

  const handleDelete = async (e, repoUrl) => {
    e.stopPropagation();
    try {
      const [owner, repo] = repoUrl.split('/').slice(-2);
      const response = await fetch(apiUrl(`/repo/${owner}/${repo}`), {
        method: 'DELETE',
      });
      if (response.ok) {
        setHistory((prev) => prev.filter((item) => item.repo_url !== repoUrl));
      }
    } catch (error) {
      console.error('Failed to delete repo:', error);
    }
  };

  return (
    <div className="w-[280px] h-screen bg-gradient-to-b from-ink-900 to-ink-800 text-white flex flex-col fixed left-0 top-0 overflow-hidden border-r border-white/5">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow">
            <Github className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">GitAnalyze</h1>
            <p className="text-xs text-slate-400">Repository Analyzer</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-white/10">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/60 focus:border-transparent transition"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 px-4 rounded-xl font-semibold shadow-glow transition-all"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing…
              </>
            ) : (
              'Analyze'
            )}
          </button>
        </form>
      </div>

      {/* History */}
      <div className="flex-1 overflow-y-auto scroll-slim">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-slate-400" />
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">History</h2>
            {history.length > 0 && (
              <span className="ml-auto text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                {history.length}
              </span>
            )}
          </div>
          <div className="space-y-2">
            {history.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No repositories analyzed yet</p>
            ) : (
              history
                .filter((item) => item.data?.metadata?.name)
                .map((item, index) => (
                  <div key={index} className="group flex items-center gap-1">
                    <button
                      onClick={() => handleHistoryClick(item.repo_url)}
                      className="flex-1 text-left p-3 bg-white/5 hover:bg-white/10 border border-transparent hover:border-brand-500/40 rounded-xl transition-all min-w-0"
                    >
                      <div className="text-sm font-medium text-white group-hover:text-brand-400 truncate transition-colors">
                        {item.data.metadata.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {item.data.metadata.language && (
                          <span className="text-xs text-slate-400">
                            {item.data.metadata.language}
                          </span>
                        )}
                        {typeof item.data.metadata.stars === 'number' && (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                            <Star className="w-3 h-3 text-amber-400" />
                            {item.data.metadata.stars.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, item.repo_url)}
                      className="p-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                      title="Delete from history"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
