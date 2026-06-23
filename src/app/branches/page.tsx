import { SIMBA_BRANCHES } from '@/lib/branches';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Our Branches | Simba Supermarket Kigali',
  description:
    'Find your nearest Simba Supermarket branch across Kigali. Locations include Centenary House, Kigali Heights, Gisozi, Remera, Kimironko, Kacyiru, Nyamirambo and more. Open Mon–Sat 8 AM–9 PM.',
};

const HOURS_STANDARD = [
  { day: 'Monday – Saturday', hours: '08:00 – 21:00' },
  { day: 'Sunday',            hours: '09:00 – 18:00' },
];

const HOURS_NYANZA = [
  { day: 'Daily',             hours: '08:00 – 20:00' },
];

export default function BranchesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Header */}
      <header className="bg-brand-dark text-white px-4 sm:px-6 py-6">
        <div className="max-w-screen-lg mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center overflow-hidden">
                <Image src="/simba-icon.png" alt="Simba" width={28} height={28} className="object-contain" />
              </div>
              <span className="font-black text-white text-sm hidden sm:block">Simba Supermarket</span>
            </Link>
            <span className="text-white/30">/</span>
            <span className="font-bold text-white/80 text-sm">Our Branches</span>
          </div>
          <h1 className="text-3xl font-black mb-2">Our Branches</h1>
          <p className="text-white/70 text-sm max-w-xl">
            {SIMBA_BRANCHES.length} locations across Kigali and Rwanda. Order online and pick up at your nearest branch in 20–45 minutes.
          </p>
        </div>
      </header>

      <main className="max-w-screen-lg mx-auto px-4 sm:px-6 py-8 pb-24">

        {/* Standard hours summary */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-8">
          <h2 className="font-black text-gray-900 dark:text-white text-base mb-4">Standard Opening Hours</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {HOURS_STANDARD.map(({ day, hours }) => (
              <div key={day} className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <span className="font-bold text-sm text-gray-700 dark:text-gray-300">{day}</span>
                <span className="font-black text-sm text-brand-dark dark:text-brand">{hours}</span>
              </div>
            ))}
            <div className="flex items-center justify-between px-4 py-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 sm:col-span-2">
              <span className="font-bold text-sm text-amber-700 dark:text-amber-400">Nyanza branch (exception)</span>
              <span className="font-black text-sm text-amber-700 dark:text-amber-400">Daily 08:00 – 20:00</span>
            </div>
          </div>
        </div>

        {/* Branch grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SIMBA_BRANCHES.map((branch, i) => (
            <a
              key={branch.id}
              href={branch.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:border-brand/40 hover:shadow-md transition-all"
            >
              {/* Branch number + name */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 bg-brand/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="font-black text-sm text-brand-dark dark:text-brand">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-gray-900 dark:text-white text-sm leading-snug group-hover:text-brand-dark dark:group-hover:text-brand transition-colors">
                    {branch.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">{branch.area}</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2 mb-3">
                <span className="text-base flex-shrink-0 mt-0.5">📍</span>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{branch.address}</p>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-2 mb-3">
                <span className="text-base flex-shrink-0 mt-0.5">🕐</span>
                <div>
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{branch.hours}</p>
                  {branch.hoursNote && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">{branch.hoursNote}</p>
                  )}
                </div>
              </div>

              {/* Pickup note */}
              <p className="text-[11px] text-gray-400 italic leading-relaxed mb-4">{branch.pickupNote}</p>

              {/* Google Maps CTA */}
              <div className="flex items-center gap-1.5 text-xs font-black text-brand-dark dark:text-brand group-hover:gap-2.5 transition-all">
                <span>Get Directions</span>
                <span>→</span>
              </div>
            </a>
          ))}
        </div>

        {/* Back to store CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-dark text-white rounded-2xl font-black text-sm hover:bg-gray-800 transition-colors shadow-lg"
          >
            🛒 Shop Now — Pick Up in 20–45 Min
          </Link>
          <p className="text-xs text-gray-400 mt-3">
            Order online, pay a 500 RWF deposit, and collect at your chosen branch.
          </p>
        </div>
      </main>
    </div>
  );
}
