'use client';

import { useSimbaStore } from '@/store/useSimbaStore';
import { translations, translateCategory } from '@/lib/translations';
import { clsx } from 'clsx';
import { LayoutGrid, Apple, Croissant, Sparkles, Baby, Home, Zap, Dumbbell, Wine, ShoppingBag, Beef, Milk } from 'lucide-react';

const ICONS: Record<string, any> = {
  'Groceries':                     Apple,
  'Bakery':                        Croissant,
  'Cosmetics & Personal Care':     Sparkles,
  'Baby Products':                 Baby,
  'Kitchenware & Electronics':     Home,
  'Electronics':                   Zap,
  'Sports & Wellness':             Dumbbell,
  'Alcoholic Beverages & Spirits': Wine,
  'Cleaning & Sanitary':           Milk,
  'Kitchen Storage':               Beef,
  'Pet Care':                      ShoppingBag,
};

interface Props {
  categories: string[];
  onSelect?: (cat: string) => void;
}

export default function CategorySidebar({ categories, onSelect }: Props) {
  const { selectedCategory, setSelectedCategory, language } = useSimbaStore();
  const t = translations[language];

  const handleSelect = (cat: string | null) => {
    setSelectedCategory(cat);
    onSelect?.(cat ?? '');
  };

  return (
    <nav className="py-3 px-2 space-y-0.5">
      <button
        onClick={() => handleSelect(null)}
        className={clsx(
          'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all',
          !selectedCategory
            ? 'bg-brand text-white shadow-sm'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-brand dark:hover:text-brand'
        )}
      >
        <LayoutGrid className="w-4 h-4 flex-shrink-0" />
        <span>{t.allCategories}</span>
      </button>

      {categories.map(cat => {
        const Icon = ICONS[cat] ?? ShoppingBag;
        const isActive = selectedCategory === cat;
        const label = translateCategory(cat, language);
        return (
          <button
            key={cat}
            onClick={() => handleSelect(isActive ? null : cat)}
            className={clsx(
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left',
              isActive
                ? 'bg-brand text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-brand dark:hover:text-brand'
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

const ICONS: Record<string, any> = {
  'Groceries':                     Apple,
  'Bakery':                        Croissant,
  'Cosmetics & Personal Care':     Sparkles,
  'Baby Products':                 Baby,
  'Kitchenware & Electronics':     Home,   // pots, pans, appliances
  'Electronics':                   Zap,
  'Sports & Wellness':             Dumbbell,
  'Alcoholic Beverages & Spirits': Wine,
  'Cleaning & Sanitary':           Milk,   // closest available icon
  'Kitchen Storage':               Beef,   // containers/storage
  'Pet Care':                      ShoppingBag,
};

interface Props {
  categories: string[];
  onSelect?: (cat: string) => void;
}

export default function CategorySidebar({ categories, onSelect }: Props) {
  const { selectedCategory, setSelectedCategory, language } = useSimbaStore();
  const t = translations[language];

  const handleSelect = (cat: string | null) => {
    setSelectedCategory(cat);
    onSelect?.(cat ?? '');
  };

  return (
    <nav className="py-3 px-2 space-y-0.5">
      {/* All */}
      <button
        onClick={() => handleSelect(null)}
        className={clsx(
          'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all',
          !selectedCategory
            ? 'bg-brand text-white shadow-sm'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-brand dark:hover:text-brand'
        )}
      >
        <LayoutGrid className="w-4 h-4 flex-shrink-0" />
        <span>{t.allCategories}</span>
      </button>

      {/* Categories */}
      {categories.map(cat => {
        const Icon = ICONS[cat] ?? ShoppingBag;
        const isActive = selectedCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => handleSelect(isActive ? null : cat)}
            className={clsx(
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left',
              isActive
                ? 'bg-brand text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-brand dark:hover:text-brand'
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{cat}</span>
          </button>
        );
      })}
    </nav>
  );
}
