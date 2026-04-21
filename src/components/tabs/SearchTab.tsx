'use client';

import { useState, useMemo } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import { getSimbaData, getCategories } from '@/lib/data';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../ProductCard';
import { GridSkeleton } from '../ProductSkeleton';

export default function SearchTab() {
  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, language } = useSimbaStore();
  const t = translations[language];
  const [sort, setSort] = useState('default');
  const [showFilters, setShowFilters] = useState(false);
  const allProducts = useMemo(() => getSimbaData().products, []);
  const categories = useMemo(() => getCategories(), []);

  const SORT_OPTIONS = [
    { id: 'default',    label: t.relevance },
    { id: 'price-asc',  label: t.priceLowHigh },
    { id: 'price-desc', label: t.priceHighLow },
    { id: 'name',       label: t.nameAZ },
  ];

  const results = useMemo(() => {
    let list = allProducts.filter(p => {
      const matchQ = !searchQuery.trim() || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchC = !selectedCategory || p.category === selectedCategory;
      return matchQ && matchC;
    });
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [allProducts, searchQuery, selectedCategory, sort]);

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 pb-24 sm:pb-6">
      {/* Search input */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-900 rounded-2xl border-2 border-transparent focus-within:border-brand transition-all shadow-sm">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            autoFocus
            className="flex-1 bg-transparent outline-none text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-3 rounded-2xl border-2 transition-all flex items-center gap-2 font-bold text-sm ${showFilters ? 'border-brand bg-brand-muted text-brand' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500'}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:block">{t.filter}</span>
        </button>
      </div>

      {/* Filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-4">
              {/* Sort */}
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{t.sortBy}</p>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map(opt => (
                    <button key={opt.id} onClick={() => setSort(opt.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${sort === opt.id ? 'bg-brand text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-brand-muted hover:text-brand'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Category filter */}
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{t.category}</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSelectedCategory(null)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${!selectedCategory ? 'bg-brand text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-brand-muted hover:text-brand'}`}>
                    {t.allCategories}
                  </button>
                  {categories.map(cat => (
                    <button key={cat} onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedCategory === cat ? 'bg-brand text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-brand-muted hover:text-brand'}`}>
                      {cat.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count */}
      <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
        {results.length} {t.results}
        {searchQuery ? ` for "${searchQuery}"` : ''}
      </p>

      {/* Grid */}
      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="w-12 h-12 text-gray-200 dark:text-gray-700 mb-4" />
          <p className="font-black text-gray-900 dark:text-white mb-1">{t.noProducts}</p>
          <p className="text-sm text-gray-400">{t.trySearch}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {results.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.3) }}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
