'use client';

import { useState } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations, translateCategory } from '@/lib/translations';
import { getSimbaData } from '@/lib/data';
import { clsx } from 'clsx';
import { LayoutGrid, Apple, Croissant, Sparkles, Baby, Home, Zap, Dumbbell, Wine, ShoppingBag, Beef, Milk, ChevronDown, ChevronRight } from 'lucide-react';

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

// Map subcategoryId numbers to human-readable names
const SUBCATEGORY_NAMES: Record<number, string> = {
  // Groceries (id range 1x)
  1:  'Fresh Produce',
  2:  'Dairy & Eggs',
  3:  'Grains & Cereals',
  4:  'Oils & Condiments',
  5:  'Snacks & Confectionery',
  6:  'Beverages',
  7:  'Canned & Preserved',
  8:  'Frozen Foods',
  // Bakery
  9:  'Bread & Rolls',
  10: 'Cakes & Pastries',
  11: 'Flour & Baking',
  // Cosmetics
  12: 'Skincare',
  13: 'Hair Care',
  14: 'Fragrances',
  // Baby
  15: 'Baby Food',
  16: 'Diapers & Wipes',
  17: 'Baby Clothing',
  // Kitchenware / Electronics
  18: 'Cookware',
  19: 'Small Appliances',
  20: 'Storage & Organisation',
  // Sports
  21: 'Exercise Equipment',
  22: 'Sports Nutrition',
  23: 'Outdoor & Recreation',
  // Beverages
  24: 'Soft Drinks',
  25: 'Juices',
  26: 'Water',
  // Cleaning
  27: 'Surface Cleaners',
  28: 'Laundry',
  29: 'Disinfectants',
  // Alcohol
  30: 'Beer & Cider',
  31: 'Wine',
  32: 'Spirits',
  // Pet
  33: 'Pet Food',
  34: 'Pet Accessories',
};

interface Props {
  categories: string[];
  onSelect?: (cat: string) => void;
}

export default function CategorySidebar({ categories, onSelect }: Props) {
  const { selectedCategory, setSelectedCategory, language } = useSimbaStore();
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const t = translations[language];

  // Build subcategory map from product data
  const allProducts = getSimbaData().products;
  const subMap: Record<string, { id: number; name: string; count: number }[]> = {};
  for (const cat of categories) {
    const subcatMap = new Map<number, number>();
    for (const p of allProducts) {
      if (p.category === cat && p.subcategoryId) {
        subcatMap.set(p.subcategoryId, (subcatMap.get(p.subcategoryId) ?? 0) + 1);
      }
    }
    subMap[cat] = Array.from(subcatMap.entries())
      .map(([id, count]) => ({
        id,
        name: SUBCATEGORY_NAMES[id] ?? `Group ${id}`,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }

  const handleSelect = (cat: string | null) => {
    setSelectedCategory(cat);
    onSelect?.(cat ?? '');
  };

  const toggleExpand = (cat: string) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  return (
    <nav className="py-3 px-2 space-y-0.5">
      {/* All categories */}
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
        const subs = subMap[cat] ?? [];
        const isExpanded = expandedCats.has(cat);
        const productCount = allProducts.filter(p => p.category === cat).length;

        return (
          <div key={cat}>
            {/* Category row */}
            <div className={clsx(
              'flex items-center rounded-xl transition-all',
              isActive ? 'bg-brand shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-gray-900'
            )}>
              {/* Main category button */}
              <button
                onClick={() => handleSelect(isActive ? null : cat)}
                className={clsx(
                  'flex-1 flex items-center gap-3 px-4 py-3 text-sm font-bold text-left transition-colors',
                  isActive ? 'text-white' : 'text-gray-700 dark:text-gray-300 hover:text-brand dark:hover:text-brand'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate flex-1">{label}</span>
                <span className={clsx(
                  'text-[10px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0',
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                )}>
                  {productCount}
                </span>
              </button>

              {/* Expand/collapse button — only if has subcategories */}
              {subs.length > 1 && (
                <button
                  onClick={() => toggleExpand(cat)}
                  className={clsx(
                    'px-2 py-3 flex-shrink-0 transition-colors',
                    isActive ? 'text-white/70 hover:text-white' : 'text-gray-400 hover:text-brand'
                  )}
                  aria-label={isExpanded ? 'Collapse' : 'Expand'}
                >
                  {isExpanded
                    ? <ChevronDown className="w-3.5 h-3.5" />
                    : <ChevronRight className="w-3.5 h-3.5" />
                  }
                </button>
              )}
            </div>

            {/* Subcategory list */}
            {isExpanded && subs.length > 1 && (
              <div className="ml-4 mt-0.5 mb-1 space-y-0.5 border-l-2 border-brand/20 pl-3">
                {subs.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => handleSelect(cat)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-brand/10 hover:text-brand dark:hover:text-brand transition-colors text-left"
                  >
                    <span className="truncate">{sub.name}</span>
                    <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">{sub.count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
