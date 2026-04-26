'use client';

import { useSimbaStore } from '@/store/useSimbaStore';
import { translateCategory } from '@/lib/translations';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { clsx } from 'clsx';

const CATEGORY_META: Record<string, { image: string; bg: string }> = {
  'Groceries':                     { image: 'https://images.unsplash.com/photo-1543168256-418811576931?w=200&q=80', bg: 'bg-green-50 dark:bg-green-900/20' },
  'Bakery':                        { image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&q=80', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  'Cosmetics & Personal Care':     { image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80', bg: 'bg-pink-50 dark:bg-pink-900/20' },
  'Baby Products':                 { image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=200&q=80', bg: 'bg-sky-50 dark:bg-sky-900/20' },
  'Kitchenware & Electronics':     { image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&q=80', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  'Electronics':                   { image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&q=80', bg: 'bg-slate-50 dark:bg-slate-900/20' },
  'Sports & Wellness':             { image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&q=80', bg: 'bg-teal-50 dark:bg-teal-900/20' },
  'Alcoholic Beverages & Spirits': { image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=200&q=80', bg: 'bg-red-50 dark:bg-red-900/20' },
  'Cleaning & Sanitary':           { image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=200&q=80', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
  'Kitchen Storage':               { image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=200&q=80', bg: 'bg-lime-50 dark:bg-lime-900/20' },
  'Pet Care':                      { image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=200&q=80', bg: 'bg-rose-50 dark:bg-rose-900/20' },
};

interface Props {
  categories: string[];
  onSelect: (cat: string) => void;
}

export default function CategoryGrid({ categories, onSelect }: Props) {
  const { selectedCategory, language } = useSimbaStore();

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
      {categories.map((cat, i) => {
        const meta = CATEGORY_META[cat] ?? { image: 'https://images.unsplash.com/photo-1543168256-418811576931?w=200&q=80', bg: 'bg-gray-50 dark:bg-gray-800' };
        const isActive = selectedCategory === cat;
        const label = translateCategory(cat, language);

        return (
          <motion.button
            key={cat}
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ delay: i * 0.05, duration: 0.25 }}
            whileHover={{ y: -4, scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => onSelect(cat)}
            className={clsx(
              'flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200',
              isActive
                ? 'border-brand shadow-lg shadow-brand/20 bg-brand/5 dark:bg-brand/10'
                : 'border-transparent bg-white dark:bg-gray-900 hover:border-brand/30 hover:shadow-md hover:shadow-black/5'
            )}
          >
            <div className={clsx('w-14 h-14 rounded-xl overflow-hidden relative flex-shrink-0', meta.bg)}>
              <Image src={meta.image} alt={label} fill className="object-cover" sizes="56px" />
            </div>
            <span className={clsx(
              'text-xs font-black text-center leading-tight line-clamp-2 w-full',
              isActive ? 'text-brand' : 'text-gray-800 dark:text-gray-200'
            )}>
              {label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
