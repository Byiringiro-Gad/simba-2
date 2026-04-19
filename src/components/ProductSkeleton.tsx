'use client';

export default function ProductSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-3 border border-gray-100 dark:border-gray-800 animate-pulse">
      <div className="relative aspect-square rounded-[1.5rem] bg-gray-200 dark:bg-gray-800 mb-4"></div>
      <div className="space-y-3 px-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full w-3/4"></div>
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-1/2"></div>
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-full w-1/3"></div>
          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}

export function GridSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4 max-w-7xl mx-auto">
            {Array.from({ length: 10 }).map((_, i) => (
                <ProductSkeleton key={i} />
            ))}
        </div>
    );
}
