import React from 'react';

const Skeleton = ({ className }) => {
  return (
    <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
  );
};

export const MetadataSkeleton = () => (
  <div className="rounded-2xl shadow-card overflow-hidden">
    <div className="bg-gradient-to-br from-brand-500 to-brand-700 p-6">
      <Skeleton className="h-8 w-1/2 mb-3 bg-white/30" />
      <Skeleton className="h-4 w-3/4 mb-2 bg-white/20" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full bg-white/20 rounded-xl" />
        ))}
      </div>
    </div>
    <div className="bg-white px-6 py-4">
      <Skeleton className="h-4 w-1/3" />
    </div>
  </div>
);

export const ContributorsSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-card p-6">
    <Skeleton className="h-6 w-40 mb-4" />
    <Skeleton className="h-9 w-full mb-4 rounded-xl" />
    <div className="space-y-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
          <Skeleton className="h-4 w-10" />
        </div>
      ))}
    </div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-card p-6">
    <Skeleton className="h-6 w-40 mb-4" />
    <Skeleton className="h-[280px] w-full rounded-xl" />
  </div>
);

export const MetricSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-card p-5">
    <Skeleton className="h-4 w-24 mb-3" />
    <Skeleton className="h-8 w-16" />
  </div>
);

export default Skeleton;
