import React from 'react';

const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-10 bg-gray-300 rounded-lg w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>

        {/* Search Bar Skeleton */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 animate-pulse">
          <div className="h-10 bg-gray-200 rounded-lg"></div>
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
              <div className="bg-gray-300 h-24 p-4">
                <div className="h-6 bg-gray-400 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-400 rounded w-1/2"></div>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-20 bg-gray-100 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-16 bg-gray-100 rounded"></div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
