import { useState } from 'react';
import Sidebar from './components/Sidebar';
import MetadataCard from './components/MetadataCard';
import ContributorsTable from './components/ContributorsTable';
import CommitChart from './components/CommitChart';
import MetricCards from './components/MetricCards';
import ErrorBanner from './components/ErrorBanner';
import { MetadataSkeleton, ContributorsSkeleton, ChartSkeleton, MetricSkeleton } from './components/Skeleton';

function App() {
  const [repoData, setRepoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async (url) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/analyze', {
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

  const handleLoadHistory = async (repoUrl) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/repo/${repoUrl.split('/').slice(-2).join('/')}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to load repository');
      }
      // Check that data.metadata exists before setting repoData
      if (!data.metadata) {
        throw new Error('This repository has incomplete data. Please re-analyze it.');
      }
      setRepoData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Sidebar */}
      <Sidebar onAnalyze={handleAnalyze} onLoadHistory={handleLoadHistory} />

      {/* Right Main Panel */}
      <div className="flex-1 ml-[280px] p-8">
        {error && <ErrorBanner error={error} onDismiss={handleDismissError} />}

        {!loading && !repoData && !error && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600 text-lg">Enter a GitHub URL to analyze</p>
          </div>
        )}

        {loading && (
          <div>
            {/* 1. Metadata Card Skeleton */}
            <MetadataSkeleton />

            {/* 2. Middle Row Skeleton */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <ContributorsSkeleton />
              <ChartSkeleton />
            </div>

            {/* 3. Metric Cards Row Skeleton */}
            <div className="grid grid-cols-3 gap-6">
              <MetricSkeleton />
              <MetricSkeleton />
              <MetricSkeleton />
            </div>
          </div>
        )}

        {repoData && !loading && (
          <div>
            {/* 1. Metadata Card */}
            <MetadataCard metadata={repoData.metadata} />

            {/* 2. Middle Row */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <ContributorsTable contributors={repoData.contributors} />
              <CommitChart commitActivity={repoData.commit_activity} />
            </div>

            {/* 3. Metric Cards Row */}
            <MetricCards commitActivity={repoData.commit_activity} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
