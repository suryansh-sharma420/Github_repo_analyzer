import { useState, useEffect } from 'react';
import { Search, History, Trash2 } from 'lucide-react';

export default function Sidebar({ onAnalyze, onLoadHistory }) {
  const [url, setUrl] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:8000/history');
      const data = await response.json();
      setHistory(data.history || []);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    await onAnalyze(url);
    setUrl('');
    fetchHistory();
  };

  const handleHistoryClick = (repoUrl) => {
    onLoadHistory(repoUrl);
  };

  const handleDelete = async (e, repoUrl) => {
    e.stopPropagation();
    try {
      const [owner, repo] = repoUrl.split('/').slice(-2);
      const response = await fetch(`http://localhost:8000/repo/${owner}/${repo}`, {
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
    <div className="w-[280px] h-screen bg-gray-900 text-white flex flex-col fixed left-0 top-0 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white">GitAnalyze</h1>
        <p className="text-sm text-gray-400 mt-1">Repository Analyzer</p>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Search repositories..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Analyze
          </button>
        </form>
      </div>

      {/* History */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">History</h2>
          </div>
          <div className="space-y-2">
            {history.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No repositories analyzed yet</p>
            ) : (
              history
                .filter((item) => item.data?.metadata?.name)
                .map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2"
                  >
                    <button
                      onClick={() => handleHistoryClick(item.repo_url)}
                      className="flex-1 text-left p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors group min-w-0"
                    >
                      <div className="text-sm font-medium text-white group-hover:text-blue-400 truncate">
                        {item.data.metadata.name}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 truncate">
                        {item.repo_url}
                      </div>
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, item.repo_url)}
                      className="p-2 text-gray-500 hover:text-red-400 transition-colors shrink-0"
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
