'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { getSimbaData } from '@/lib/data';
import { motion } from 'framer-motion';
import { Tag } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

function getKigaliDateString(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Kigali',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

function buildSeed(dateString: string) {
  return dateString.replace(/-/g, '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

// Deals of the day: lowest-priced in-stock items that change daily
function getDailyDeals(seed: number) {
  const { products } = getSimbaData();
  const shuffled = [...products.filter(p => p.inStock)]
    .sort((a, b) => ((a.id * seed) % 97) - ((b.id * seed) % 97));
  return shuffled.slice(0, 8);
}

// Midnight countdown in Kigali time
function getMidnightMs(now = new Date()) {
  const kigaliNow = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Kigali' }));
  const midnight = new Date(kigaliNow);
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);
  return midnight.getTime() - kigaliNow.getTime();
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

type ClockState = {
  seed: number;
  ms: number | null;
};

export default function DealsOfTheDay() {
  const { language } = useSimbaStore();
  const [clock, setClock] = useState<ClockState>({ seed: 0, ms: null });
  const deals = useMemo(() => getDailyDeals(clock.seed), [clock.seed]);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setClock({
        seed: buildSeed(getKigaliDateString(now)),
        ms: getMidnightMs(now),
      });
    };

    updateClock();
    const t = setInterval(updateClock, 1000);
    return () => clearInterval(t);
  }, []);

  const countdownUnits = clock.ms === null
    ? ['--', '--', '--']
    : [
        pad(Math.floor(clock.ms / 3600000)),
        pad(Math.floor((clock.ms % 3600000) / 60000)),
        pad(Math.floor((clock.ms % 60000) / 1000)),
      ];

  const L = {
    title: language === 'fr' ? 'Offres du jour' : language === 'rw' ? 'Ibiciro Byo Uyu Munsi' : 'Deals of the Day',
    sub: language === 'fr' ? 'Expire à minuit' : language === 'rw' ? 'Birangira bwa saa sita' : 'Expires at midnight',
    endsIn: language === 'fr' ? 'Expire dans' : language === 'rw' ? 'Birangira mu' : 'Ends in',
  };

  if (deals.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Tag className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-black text-gray-900 dark:text-white text-base leading-tight">{L.title}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-gray-400 font-medium">{L.endsIn}</span>
              <div className="flex items-center gap-0.5">
                {countdownUnits.map((unit, i) => (
                  <span key={i} className="inline-flex items-center">
                    <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[10px] font-black px-1.5 py-0.5 rounded-lg font-mono">{unit}</span>
                    {i < 2 && <span className="text-gray-400 text-[10px] mx-0.5">:</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
        {deals.slice(0, 5).map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </section>
  );
}
