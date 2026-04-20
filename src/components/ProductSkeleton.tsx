'use client';

export default function ProductSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-100 dark:bg-gray-800" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 bg-gray-100 dark:bg-gray-800 rounded-full w-4/5" />
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-2/5" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full w-1/3" />
          <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function GridSkeleton() {
  return (
    <div className="px-4">
      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full w-24 mb-4 animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

