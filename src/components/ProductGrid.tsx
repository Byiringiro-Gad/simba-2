'use client';

import { Product } from '@/types';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations, translateCategory } from '@/lib/translations';
import ProductCard from './ProductCard';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchX, SlidersHorizontal, ChevronDown, X, Check } from 'lucide-react';
import { getProductRating } from '@/lib/reviews';
import { clsx } from 'clsx';

interface ProductGridProps {
  products: Product[];
}

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'rating' | 'name-az' | 'name-za';

const MAX_PRICE = 50000;

export default function ProductGrid({ products }: ProductGridProps) {
  const { searchQuery, selectedCategory, language, branchInventory } = useSimbaStore();
  const t = translations[language];

  // ── Filter & sort state ───────────────────────────────────────────────────
  const [sort, setSort] = useState<SortOption>('default');
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const SORT_OPTIONS: { id: SortOption; label: string }[] = [
    { id: 'default',    label: language === 'fr' ? 'Pertinence' : language === 'rw' ? 'Ibirebana' : 'Relevance' },
    { id: 'price-asc',  label: language === 'fr' ? 'Prix croissant' : language === 'rw' ? 'Igiciro Gito' : 'Price: Low to High' },
    { id: 'price-desc', label: language === 'fr' ? 'Prix décroissant' : language === 'rw' ? 'Igiciro Kinini' : 'Price: High to Low' },
    { id: 'rating',     label: language === 'fr' ? 'Mieux notés' : language === 'rw' ? 'Amanota Menshi' : 'Top Rated' },
    { id: 'name-az',    label: language === 'fr' ? 'Nom A–Z' : language === 'rw' ? 'Izina A–Z' : 'Name A–Z' },
    { id: 'name-za',    label: language === 'fr' ? 'Nom Z–A' : language === 'rw' ? 'Izina Z–A' : 'Name Z–A' },
  ];

  const currentSortLabel = SORT_OPTIONS.find(o => o.id === sort)?.label ?? SORT_OPTIONS[0].label;

  // Active filter count for badge
  const activeFilters = (maxPrice < MAX_PRICE ? 1 : 0) + (minRating > 0 ? 1 : 0) + (inStockOnly ? 1 : 0);

  const filteredProducts = useMemo(() => {
    let list = products.filter(p => {
      // Search
      const matchesSearch = !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      // Category
      const matchesCategory = !selectedCategory || p.category === selectedCategory;
      // Price
      const matchesPrice = p.price <= maxPrice;
      // Stock
      const isAvail = branchInventory[p.id]
        ? branchInventory[p.id].isAvailable
        : p.inStock;
      const matchesStock = !inStockOnly || isAvail;
      // Rating
      const { avg } = getProductRating(p.id);
      const matchesRating = avg >= minRating;

      return matchesSearch && matchesCategory && matchesPrice && matchesStock && matchesRating;
    });

    // Sort
    switch (sort) {
      case 'price-asc':  list = [...list].sort((a, b) => a.price - b.price); break;
      case 'price-desc': list = [...list].sort((a, b) => b.price - a.price); break;
      case 'rating':     list = [...list].sort((a, b) => getProductRating(b.id).avg - getProductRating(a.id).avg); break;
      case 'name-az':    list = [...list].sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name-za':    list = [...list].sort((a, b) => b.name.localeCompare(a.name)); break;
    }

    return list;
  }, [products, searchQuery, selectedCategory, sort, maxPrice, minRating, inStockOnly, branchInventory]);

  const resetFilters = () => {
    setMaxPrice(MAX_PRICE);
    setMinRating(0);
    setInStockOnly(false);
    setSort('default');
  };

  const priceLabel = language === 'fr' ? 'Prix max' : language === 'rw' ? 'Igiciro Kinini' : 'Max Price';
  const ratingLabel = language === 'fr' ? 'Note min' : language === 'rw' ? 'Amanota Make' : 'Min Rating';
  const inStockLabel = language === 'fr' ? 'En stock seulement' : language === 'rw' ? 'Biraboneka gusa' : 'In stock only';
  const sortLabel = language === 'fr' ? 'Trier' : language === 'rw' ? 'Gutondeka' : 'Sort';
  const filterLabel = language === 'fr' ? 'Filtrer' : language === 'rw' ? 'Gutoranya' : 'Filter';
  const resetLabel = language === 'fr' ? 'Réinitialiser' : language === 'rw' ? 'Subira aho' : 'Reset';
  const applyLabel = language === 'fr' ? 'Appliquer' : language === 'rw' ? 'Shyira' : 'Apply';

  return (
    <div>
      {/* ── Toolbar: Sort + Filter ── */}
      <div className="flex items-center gap-2 mb-4 sticky top-[7.5rem] z-20 bg-gray-50 dark:bg-gray-950 py-2">
        {/* Result count */}
        <p className="text-xs font-bold text-gray-400 flex-1 truncate">
          {filteredProducts.length} {filteredProducts.length === 1 ? t.item : t.items}
          {selectedCategory ? ` · ${translateCategory(selectedCategory, language)}` : ''}
        </p>

        {/* Sort dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowSortMenu(!showSortMenu); setShowFilters(false); }}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all',
              sort !== 'default'
                ? 'bg-brand-dark text-white border-brand-dark'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
            )}
          >
            {sortLabel}: {currentSortLabel}
            <ChevronDown className={`w-3 h-3 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {showSortMenu && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden py-1"
              >
                {SORT_OPTIONS.map(opt => (
                  <button key={opt.id} onClick={() => { setSort(opt.id); setShowSortMenu(false); }}
                    className={clsx(
                      'w-full flex items-center justify-between px-4 py-2.5 text-sm font-bold transition-colors',
                      sort === opt.id
                        ? 'text-brand-dark dark:text-brand bg-brand-muted dark:bg-brand/10'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    )}>
                    {opt.label}
                    {sort === opt.id && <Check className="w-4 h-4 text-brand" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filter button */}
        <button
          onClick={() => { setShowFilters(!showFilters); setShowSortMenu(false); }}
          className={clsx(
            'relative flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all',
            showFilters || activeFilters > 0
              ? 'bg-brand-dark text-white border-brand-dark'
              : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
          )}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          {filterLabel}
          {activeFilters > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* ── Filter panel ── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-5">

              {/* Price range */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">{priceLabel}</p>
                  <span className="text-xs font-black text-brand-dark dark:text-brand">
                    {maxPrice >= MAX_PRICE
                      ? (language === 'fr' ? 'Tous les prix' : language === 'rw' ? 'Ibiciro byose' : 'All prices')
                      : `≤ ${maxPrice.toLocaleString()} RWF`}
                  </span>
                </div>
                <input
                  type="range"
                  min={500}
                  max={MAX_PRICE}
                  step={500}
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-brand-dark"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>500 RWF</span>
                  <span>{MAX_PRICE.toLocaleString()} RWF</span>
                </div>
                {/* Quick price chips */}
                <div className="flex gap-2 mt-2 flex-wrap">
                  {[2000, 5000, 10000, 20000].map(p => (
                    <button key={p} onClick={() => setMaxPrice(p)}
                      className={clsx('px-2.5 py-1 rounded-full text-[10px] font-black transition-all border',
                        maxPrice === p ? 'bg-brand-dark text-white border-brand-dark' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                      )}>
                      ≤ {p.toLocaleString()}
                    </button>
                  ))}
                  <button onClick={() => setMaxPrice(MAX_PRICE)}
                    className={clsx('px-2.5 py-1 rounded-full text-[10px] font-black transition-all border',
                      maxPrice === MAX_PRICE ? 'bg-brand-dark text-white border-brand-dark' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                    )}>
                    {language === 'fr' ? 'Tous' : language === 'rw' ? 'Byose' : 'All'}
                  </button>
                </div>
              </div>

              {/* Min rating */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">{ratingLabel}</p>
                  <span className="text-xs font-black text-brand-dark dark:text-brand">
                    {minRating === 0
                      ? (language === 'fr' ? 'Toutes les notes' : language === 'rw' ? 'Amanota yose' : 'All ratings')
                      : `${minRating}+ ★`}
                  </span>
                </div>
                <div className="flex gap-2">
                  {[0, 3, 3.5, 4, 4.5].map(r => (
                    <button key={r} onClick={() => setMinRating(r)}
                      className={clsx('flex-1 py-2 rounded-xl text-xs font-black transition-all border',
                        minRating === r ? 'bg-brand-dark text-white border-brand-dark' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                      )}>
                      {r === 0 ? (language === 'fr' ? 'Tous' : language === 'rw' ? 'Byose' : 'All') : `${r}+★`}
                    </button>
                  ))}
                </div>
              </div>

              {/* In stock toggle */}
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">{inStockLabel}</p>
                <button
                  onClick={() => setInStockOnly(!inStockOnly)}
                  className={clsx(
                    'w-12 h-6 rounded-full transition-all relative',
                    inStockOnly ? 'bg-brand-dark' : 'bg-gray-200 dark:bg-gray-700'
                  )}
                >
                  <span className={clsx(
                    'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all',
                    inStockOnly ? 'left-6' : 'left-0.5'
                  )} />
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1 border-t border-gray-100 dark:border-gray-800">
                <button onClick={resetFilters}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  {resetLabel}
                </button>
                <button onClick={() => setShowFilters(false)}
                  className="flex-1 py-2.5 rounded-xl bg-brand-dark text-white text-sm font-black hover:bg-gray-800 transition-colors">
                  {applyLabel} ({filteredProducts.length})
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Product grid ── */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-brand-muted rounded-2xl flex items-center justify-center mb-4">
            <SearchX className="w-8 h-8 text-brand/40" />
          </div>
          <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">{t.noProducts}</h3>
          <p className="text-sm text-gray-400 font-medium mb-3">{t.trySearch}</p>
          {activeFilters > 0 && (
            <button onClick={resetFilters}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-dark text-white rounded-xl text-sm font-black hover:bg-gray-800 transition-colors">
              <X className="w-3.5 h-3.5" />
              {resetLabel}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-3">
          {filteredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
