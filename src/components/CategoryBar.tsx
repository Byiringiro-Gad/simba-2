'use client';

import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { LayoutGrid, Apple, Beef, Beaker, Baby, Gift, Dumbbell, Home, Car } from 'lucide-react';

const categoryIcons: Record<string, any> = {
  "Groceries": Apple,
  "Bakery": Beef,
  "Cosmetics & Personal Care": Beaker,
  "Baby Products": Baby,
  "Household & Kitchenware": Home,
  "Electronics": Car,
  "Sports & Wellness": Dumbbell,
  "Alcoholic Beverages & Spirits": Gift,
};

interface CategoryBarProps {
  categories: string[];
}

export default function CategoryBar({ categories }: CategoryBarProps) {
  const { selectedCategory, setSelectedCategory, language } = useSimbaStore();
  const t = translations[language];

  // Duplicate categories for seamless loop
  const duplicatedCategories = [...categories, ...categories, ...categories];

  return (
    <div className="sticky top-16 z-40 w-full bg-white/90 dark:bg-simba-dark/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 py-6 overflow-hidden group">
      {/* Infinite Marquee Container */}
      <motion.div 
        className="flex gap-4 items-center whitespace-nowrap"
        animate={{
          x: [0, -2000],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop"
        }}
        whileHover={{ animationPlayState: 'paused' }}
      >
        {/* All Categories Button */}
        <button
            onClick={() => setSelectedCategory(null)}
            className={clsx(
              "flex items-center gap-3 px-8 py-4 rounded-[2rem] text-sm font-black transition-all border-2",
              !selectedCategory 
                ? "bg-simba-blue text-white border-simba-blue shadow-2xl shadow-simba-blue/30 scale-110" 
                : "bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-500 border-transparent hover:border-simba-gold hover:text-simba-blue dark:hover:text-simba-gold"
            )}
          >
            <LayoutGrid className="w-5 h-5" />
            {t.allCategories}
        </button>

        {duplicatedCategories.map((category, index) => {
          const Icon = categoryIcons[category] || Apple;
          const isActive = selectedCategory === category;

          return (
            <button
              key={`${category}-${index}`}
              onClick={() => setSelectedCategory(category)}
              className={clsx(
                "flex items-center gap-3 px-8 py-4 rounded-[2rem] text-sm font-black transition-all border-2 whitespace-nowrap",
                isActive 
                  ? "bg-simba-gold text-simba-blue border-simba-gold shadow-2xl shadow-simba-gold/30 scale-110 z-10" 
                  : "bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-500 border-transparent hover:border-simba-gold hover:text-simba-blue dark:hover:text-simba-gold"
              )}
            >
              <Icon className="w-5 h-5" />
              {category}
            </button>
          );
        })}
      </motion.div>

      {/* Glassmorphic Fades */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white dark:from-simba-dark to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white dark:from-simba-dark to-transparent z-20 pointer-events-none" />
      
      {/* Interaction Hint */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none">
        <span className="text-[8px] font-black uppercase tracking-[0.3em]">Pause on Hover to Select</span>
      </div>
    </div>
  );
}
