'use client';

import { useEffect, useState } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { Product } from '@/types';
import { motion } from 'framer-motion';
import { Tag } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

function getMidnightMs() {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Kigali' }));
  const midnight = new Date(now);
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);
  return Math.max(0, midnight.getTime() - now.getTime());
}

function pad(n: number) { return String(n).padStart(2, '0'); }

export default function DealsOfTheDay() {
  const { language } = useSimbaStore();
  const [deals, setDeals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [ms, setMs] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/promos?type=daily');
        const data = await res.json();
        if (data.ok && Array.isArray(data.deals) && data.deals.length > 0) {
          setDeals(data.deals);
        } else {
          setDeals([]);
        }
      } catch {
        setDeals([]);
      }
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    const tick = () => setMs(getMidnightMs());
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const countdownUnits = ms === null
    ? ['--', '--', '--']
    : [pad(Math.floor(ms / 3600000)), pad(Math.floor((ms % 3600000) / 60000)), pad(Math.floor((ms % 60000) / 1000))];

  const L = {
    title:   language === 'fr' ? 'Offres du jour' : language === 'rw' ? 'Ibiciro Byo Uyu Munsi' : 'Deals of the Day',
    endsIn:  language === 'fr' ? 'Expire dans' : language === 'rw' ? 'Birangira mu' : 'Ends in',
    none:    language === 'fr' ? "Aucune offre du jour configurée" : language === 'rw' ? 'Nta mabi ya none yashyizweho' : 'No deals configured for today',
    noneSub: language === 'fr' ? "L'administrateur peut les configurer depuis le panneau admin" : language === 'rw' ? 'Umuyobozi ashobora gubishyiraho' : 'The admin can set these from the admin panel',
  };

  if (loading) {
    return (
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-purple-500 rounded-2xl animate-pulse" />
          <div className="h-5 w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {[1,2,3,4,5].map(i => <div key={i} className="h-56 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />)}
        </div>
      </section>
    );
  }

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
