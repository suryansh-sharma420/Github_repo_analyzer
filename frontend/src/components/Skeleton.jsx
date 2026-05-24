import React from 'react';

const Skeleton = ({ className }) => {
  return (
    <div className={`animate-pulse bg-gray-200 ${className}`} />
  );
};

export const MetadataSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
    <Skeleton className="h-8 w-3/4 mb-4" />
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-5/6 mb-4" />
    <div className="flex gap-4 mb-4">
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-6 w-20" />
    </div>
    <Skeleton className="h-4 w-1/2" />
  </div>
);

export const ContributorsSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-lg p-6">
    <div className="flex justify-between items-center mb-4">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-8 w-24" />
    </div>
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-lg p-6">
    <Skeleton className="h-6 w-32 mb-4" />
    <Skeleton className="h-48 w-full" />
  </div>
);

export const MetricSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-lg p-6">
    <Skeleton className="h-6 w-24 mb-2" />
    <Skeleton className="h-8 w-16" />
  </div>
);

export default Skeleton;
