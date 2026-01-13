export function PostCardSkeleton({ showCompanyHeader = true }: { showCompanyHeader?: boolean }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Company Header Skeleton (Optional) */}
      {showCompanyHeader && (
        <div className="bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-950 dark:to-violet-950 p-4 border-b border-blue-100 dark:border-blue-900">
          <div className="flex items-center gap-3">
            {/* Logo Skeleton */}
            <div className="w-12 h-12 rounded-xl bg-gray-300 dark:bg-gray-700 animate-pulse" />

            {/* Company Info Skeleton */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32 animate-pulse" />
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-16 animate-pulse" />
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-24 animate-pulse" />
            </div>

            {/* Follow Button Skeleton */}
            <div className="w-20 h-8 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse" />
          </div>
        </div>
      )}

      {/* Category Bar Skeleton */}
      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse" />
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-24 animate-pulse" />
        </div>
      </div>

      {/* Content Area Skeleton */}
      <div className="p-4">
        {/* Content Lines */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-11/12 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-4/5 animate-pulse" />
        </div>

        {/* Footer Skeleton */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
          {/* Left side */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse" />
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-40 animate-pulse" />
          </div>

          {/* Right side - action buttons */}
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
            <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
            <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
