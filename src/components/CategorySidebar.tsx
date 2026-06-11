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

// Map subcategoryId numbers to human-readable names — derived from actual product data
const SUBCATEGORY_NAMES: Record<number, string> = {
  13:  'Kitchen Tools',
  15:  'Fitness Equipment',
  16:  'Toys & Games',
  19:  'Electric Appliances',
  22:  'Pantry Staples',
  27:  'Cognac & Brandy',
  29:  'Pet Shampoos',
  58:  'Baby Formula',
  61:  'Bread & Baguettes',
  62:  'Canned Meats',
  65:  'Olive Oils',
  66:  'Fresh Milk',
  67:  'Flour & Baking',
  70:  'Sauces & Condiments',
  71:  'Rice',
  72:  'Spices & Peppers',
  73:  'Sugar & Sweeteners',
  74:  'Coffee & Tea',
  76:  'Syrups & Spreads',
  77:  'Nuts & Dried Fruits',
  97:  'Disposables',
  98:  'Feminine Hygiene',
  99:  'Diapers',
  103: 'Cloths & Mops',
  105: 'Toilet & Surface Cleaners',
  131: 'Honey',
  148: 'Irons',
  165: 'Coffee Makers',
  166: 'Food Containers',
  167: 'Cups & Mugs',
  168: 'Water Bottles',
  176: 'Brushes & Mops',
  177: 'Toilet Brushes',
  187: 'Foil & Paper Products',
  195: 'Frying Pans',
  197: 'Knives',
  198: 'Spoons & Spatulas',
  199: 'Glasses & Cups',
  204: 'Shampoos & Body Wash',
  205: 'Body Creams & Lotions',
  208: 'Men\'s Grooming',
  211: 'Hair Care',
  214: 'Body Lotions',
  215: 'Extensions & Adapters',
  220: 'Kettles',
  234: 'Whisky',
  235: 'Beer',
  236: 'Gin',
  237: 'Wine & Champagne',
  238: 'Liqueurs',
  244: 'Fabric Softeners',
  245: 'Hand Wash',
  246: 'Toilet Paper',
  247: 'Kitchen Towels',
  258: 'Jams & Preserves',
  259: 'Margarine & Spreads',
  260: 'Hazelnut Spreads',
  264: 'Stationery',
  266: 'Exercise Books',
  277: 'Travel Accessories',
  346: 'Canned Vegetables',
  347: 'Pickles & Condiments',
  348: 'Olives',
  349: 'Chocolate',
  354: 'Pet Food',
  362: 'Blenders',
  366: 'Sweets & Candy',
  367: 'Chewing Gum & Lollipops',
  368: 'Canned Corn',
  371: 'Sausages',
  372: 'Tuna & Sardines',
  373: 'Yeast',
  379: 'Petroleum Jelly & Vaseline',
  400: 'Deodorants',
  406: 'Lip Care & Glycerine',
  412: 'Paper & Office',
  414: 'Candles & Air Fresheners',
  449: 'Oats & Muesli',
  468: 'Coffee Appliances',
  471: 'Meat & Poultry',
  473: 'Tobacco',
  478: 'Instant Noodles',
  486: 'Paper Plates & Juice',
  493: 'Energy Drinks',
  503: 'UHT Milk',
  530: 'Bread Baskets',
  576: 'Office Supplies',
  579: 'Baby Wipes & Cotton',
  580: 'Batteries',
  581: 'Razors & Shavers',
  663: 'Fresh Vegetables',
  664: 'Fresh Fruits',
  666: 'Eggs',
  669: 'Baking Chocolate',
  670: 'Hot Drinks Mix',
  671: 'Vinegar',
  672: 'Spice Blends',
  673: 'Salt',
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
