'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { getSimbaData } from '@/lib/data';
import { getProductRating } from '@/lib/reviews';
import { motion } from 'framer-motion';
import { TrendingUp, Flame, Plus, Minus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

function getKigaliHour(now = new Date()) {
  return Number(new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Kigali',
    hour: '2-digit',
    hour12: false,
  }).format(now));
}

export default function TrendingProducts() {
  const { cart, addToCart, updateQuantity, language } = useSimbaStore();
  const { products } = useMemo(() => getSimbaData(), []);
  const [hourSeed, setHourSeed] = useState(0);

  useEffect(() => {
    setHourSeed(getKigaliHour());
  }, []);

  // "Trending" = weighted mix of high rating, good price range, in-stock
  const trending = useMemo(() => {
    const hour = hourSeed;

    return [...products]
      .filter(p => p.inStock)
      .map(p => {
        const { avg, count } = getProductRating(p.id);
        const priceScore = p.price >= 800 && p.price <= 5000 ? 2 : 1;
        const ratingScore = avg * count * 0.5;
        const freshness = ((p.id * 11 + hour) % 20);
        return { ...p, score: ratingScore + priceScore + freshness };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
  }, [products, hourSeed]);

  const L = {
    title: language === 'fr' ? 'Tendances du moment' : language === 'rw' ? 'Ibicuruzwa Bikunzwe' : 'Trending Now',
    sub: language === 'fr' ? 'Ce que les clients achètent en ce moment' : language === 'rw' ? 'Ibyo abakiriya bakunda uyu munsi' : 'What customers are buying today',
  };

  if (trending.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-black text-gray-900 dark:text-white text-base leading-tight">{L.title}</h2>
            <p className="text-xs text-gray-400 font-medium">{L.sub}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3">
        {trending.slice(0, 6).map((p, i) => {
          const qty = cart.find(c => c.id === p.id)?.quantity ?? 0;
          const { avg, count } = getProductRating(p.id);

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
            >
              <div className="relative">
                <Link href={`/products/${p.id}`} className="block relative aspect-square bg-gray-50 dark:bg-gray-800">
                  <Image src={p.image} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="200px" />
                  <div className="absolute top-2 left-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-3 h-3 text-white" />
                  </div>
                  <div className="absolute top-2 right-2 bg-black/50 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                    #{i + 1}
                  </div>
                </Link>
              </div>

              <div className="p-2.5">
                {count > 0 && (
                  <div className="flex gap-0.5 mb-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span
                        key={star}
                        className={`text-[9px] ${star <= Math.round(avg) ? 'text-amber-500' : 'text-gray-200 dark:text-gray-700'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                )}
                <Link href={`/products/${p.id}`}>
                  <h3 className="text-[11px] font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug mb-1.5 hover:text-brand transition-colors min-h-[2rem]">
                    {p.name}
                  </h3>
                </Link>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-black text-gray-900 dark:text-white">{p.price.toLocaleString()}</span>
                    <span className="text-[9px] text-gray-400 ml-0.5">RWF</span>
                  </div>
                  {qty === 0 ? (
                    <button onClick={() => addToCart(p)} className="w-7 h-7 bg-brand-dark hover:bg-brand text-white rounded-xl flex items-center justify-center transition-all">
                      <Plus className="w-3.5 h-3.5 stroke-[2.5px]" />
                    </button>
                  ) : (
                    <div className="flex items-center bg-brand-dark rounded-xl overflow-hidden">
                      <button onClick={() => updateQuantity(p.id, qty - 1)} className="w-6 h-7 text-white text-xs flex items-center justify-center hover:bg-black/10">
                        -
                      </button>
                      <span className="text-white font-black text-[10px] w-4 text-center">{qty}</span>
                      <button onClick={() => addToCart(p)} className="w-6 h-7 text-white text-xs flex items-center justify-center hover:bg-black/10">
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
