import { useState } from 'react';
import { Github, Sparkles } from 'lucide-react';
import Sidebar from './components/Sidebar';
import MetadataCard from './components/MetadataCard';
import ContributorsTable from './components/ContributorsTable';
import CommitChart from './components/CommitChart';
import MetricCards from './components/MetricCards';
import ErrorBanner from './components/ErrorBanner';
import { MetadataSkeleton, ContributorsSkeleton, ChartSkeleton, MetricSkeleton } from './components/Skeleton';
import { apiUrl } from './api';

function App() {
  const [repoData, setRepoData] = useState(null);
  const [repoUrl, setRepoUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async (url) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(apiUrl('/analyze'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to analyze repository');
      }
      setRepoData(data.data);
      setRepoUrl(url);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDismissError = () => {
    setError(null);
  };

  const handleLoadHistory = async (histUrl) => {
    setLoading(true);
    setError(null);
    try {
      const ownerRepo = histUrl.split('/').slice(-2).join('/');
      const response = await fetch(apiUrl(`/repo/${ownerRepo}`));
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to load repository');
      }
      if (!data.metadata) {
        throw new Error('This repository has incomplete data. Please re-analyze it.');
      }
      setRepoData(data);
      setRepoUrl(histUrl);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100 bg-gradient-to-br from-slate-100 via-slate-50 to-brand-50">
      <Sidebar onAnalyze={handleAnalyze} onLoadHistory={handleLoadHistory} />

      <div className="flex-1 ml-[280px] p-6 lg:p-10">
        {/* Top header bar */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              Repository Insights
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Metadata, contributors, and commit activity at a glance
            </p>
          </div>
          {repoUrl && (
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow-card text-sm font-medium text-slate-700 hover:text-brand-600 transition-colors"
            >
              <Github className="w-4 h-4" />
              View on GitHub
            </a>
          )}
        </header>

        {error && <ErrorBanner error={error} onDismiss={handleDismissError} />}

        {!loading && !repoData && !error && (
          <div className="flex flex-col items-center justify-center text-center py-24 animate-fade-in-up">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-glow flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Analyze a GitHub repository</h2>
            <p className="text-slate-500 mt-2 max-w-md">
              Paste a repository URL in the sidebar to explore stars, forks, top
              contributors, and commit trends.
            </p>
          </div>
        )}

        {loading && (
          <div className="space-y-6">
            <MetadataSkeleton />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <ContributorsSkeleton />
              <ChartSkeleton />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <MetricSkeleton />
              <MetricSkeleton />
              <MetricSkeleton />
            </div>
          </div>
        )}

        {repoData && !loading && (
          <div className="space-y-6 animate-fade-in-up">
            <MetadataCard metadata={repoData.metadata} repoUrl={repoUrl} />
            <MetricCards commitActivity={repoData.commit_activity} contributors={repoData.contributors} />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <ContributorsTable contributors={repoData.contributors} />
              <CommitChart commitActivity={repoData.commit_activity} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
