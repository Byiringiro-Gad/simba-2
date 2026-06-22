'use client';

import { useSimbaStore } from '@/store/useSimbaStore';
import { translateCategory } from '@/lib/translations';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

// Emoji-based icons avoid external image dependencies and render instantly
const CATEGORY_META: Record<string, { emoji: string; bg: string; color: string }> = {
  'Groceries':                     { emoji: '🛒', bg: 'bg-green-50 dark:bg-green-900/20',   color: 'text-green-700 dark:text-green-300' },
  'Bakery':                        { emoji: '🍞', bg: 'bg-amber-50 dark:bg-amber-900/20',   color: 'text-amber-700 dark:text-amber-300' },
  'Cosmetics & Personal Care':     { emoji: '💄', bg: 'bg-pink-50 dark:bg-pink-900/20',     color: 'text-pink-700 dark:text-pink-300' },
  'Baby Products':                 { emoji: '🍼', bg: 'bg-sky-50 dark:bg-sky-900/20',       color: 'text-sky-700 dark:text-sky-300' },
  'Kitchenware & Electronics':     { emoji: '🍳', bg: 'bg-orange-50 dark:bg-orange-900/20', color: 'text-orange-700 dark:text-orange-300' },
  'Electronics':                   { emoji: '📱', bg: 'bg-slate-50 dark:bg-slate-900/20',   color: 'text-slate-700 dark:text-slate-300' },
  'Sports & Wellness':             { emoji: '⚽', bg: 'bg-teal-50 dark:bg-teal-900/20',     color: 'text-teal-700 dark:text-teal-300' },
  'Alcoholic Beverages & Spirits': { emoji: '🍾', bg: 'bg-red-50 dark:bg-red-900/20',       color: 'text-red-700 dark:text-red-300' },
  'Cleaning & Sanitary':           { emoji: '🧹', bg: 'bg-cyan-50 dark:bg-cyan-900/20',     color: 'text-cyan-700 dark:text-cyan-300' },
  'Kitchen Storage':               { emoji: '📦', bg: 'bg-lime-50 dark:bg-lime-900/20',     color: 'text-lime-700 dark:text-lime-300' },
  'Pet Care':                      { emoji: '🐾', bg: 'bg-rose-50 dark:bg-rose-900/20',     color: 'text-rose-700 dark:text-rose-300' },
};

interface Props {
  categories: string[];
  onSelect: (cat: string) => void;
}

export default function CategoryGrid({ categories, onSelect }: Props) {
  const { selectedCategory, language } = useSimbaStore();

  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-11 gap-2 sm:gap-3">
      {categories.map((cat, i) => {
        const meta = CATEGORY_META[cat] ?? { emoji: '🛍️', bg: 'bg-gray-50 dark:bg-gray-800', color: 'text-gray-700 dark:text-gray-300' };
        const isActive = selectedCategory === cat;
        const label = translateCategory(cat, language);

        return (
          <motion.button
            key={cat}
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.22 }}
            whileHover={{ y: -3, scale: 1.04 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => onSelect(cat)}
            className={clsx(
              'flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border-2 transition-all duration-200 min-h-[80px] justify-center',
              isActive
                ? 'border-brand shadow-md shadow-brand/20 bg-brand/5 dark:bg-brand/10'
                : 'border-transparent bg-white dark:bg-gray-900 hover:border-brand/30 hover:shadow-sm'
            )}
          >
            <div className={clsx(
              'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform',
              meta.bg,
              isActive && 'scale-110'
            )}>
              <span className="text-2xl leading-none" role="img" aria-label={label}>{meta.emoji}</span>
            </div>
            <span className={clsx(
              'text-[10px] font-black text-center leading-tight line-clamp-2 w-full',
              isActive ? 'text-brand' : 'text-gray-700 dark:text-gray-300'
            )}>
              {label}
            </span>
            {isActive && (
              <motion.div
                layoutId="cat-indicator"
                className="w-4 h-0.5 bg-brand rounded-full"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
