import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 — Page Not Found | Simba Supermarket',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center px-4 text-center">
      {/* Logo */}
      <div className="w-20 h-20 rounded-full bg-[#FF6600] flex items-center justify-center mb-6 shadow-xl shadow-orange-500/20 overflow-hidden">
        <Image src="/simba-icon.png" alt="Simba" width={60} height={60} className="object-contain" />
      </div>

      {/* 404 */}
      <h1 className="text-8xl font-black text-gray-200 dark:text-gray-800 leading-none mb-4">404</h1>
      <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Page not found</h2>
      <p className="text-gray-400 text-sm max-w-sm mb-8 leading-relaxed">
        The page you're looking for doesn't exist or has been moved. Try going back to the store.
      </p>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 bg-[#FF6600] hover:bg-orange-700 text-white font-black text-sm rounded-2xl transition-colors shadow-lg shadow-orange-500/20"
        >
          ← Back to Store
        </Link>
        <Link
          href="/faq"
          className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-bold text-sm rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          View FAQ
        </Link>
      </div>

      {/* Footer hint */}
      <p className="text-[10px] text-gray-300 dark:text-gray-700 mt-16">
        © {new Date().getFullYear()} Simba Supermarket Ltd · Kigali, Rwanda
      </p>
    </div>
  );
}
