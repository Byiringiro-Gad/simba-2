'use client';

import { useState } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, ChevronDown, X, Check } from 'lucide-react';

export type SortOption = 'default' | 'price_asc' | 'price_desc' | 'name_asc' | 'rating';

interface SortFilterBarProps {
  totalCount: number;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  maxPrice: number;
  inStockOnly: boolean;
  onInStockChange: (v: boolean) => void;
}

const SORT_OPTIONS: { value: SortOption; labelEn: string; labelFr: string; labelRw: string }[] = [
  { value: 'default',    labelEn: 'Featured',        labelFr: 'En vedette',      labelRw: 'Ibikomeye' },
  { value: 'price_asc',  labelEn: 'Price: Low–High', labelFr: 'Prix: Bas–Haut',  labelRw: 'Igiciro: Bito–Bikuru' },
  { value: 'price_desc', labelEn: 'Price: High–Low', labelFr: 'Prix: Haut–Bas',  labelRw: 'Igiciro: Bikuru–Bito' },
  { value: 'name_asc',   labelEn: 'Name A–Z',        labelFr: 'Nom A–Z',         labelRw: 'Izina A–Z' },
  { value: 'rating',     labelEn: 'Top Rated',       labelFr: 'Les mieux notés', labelRw: 'Ibyo abakiriya bakunda' },
];

export default function SortFilterBar({
  totalCount, sort, onSortChange,
  priceRange, onPriceChange, maxPrice,
  inStockOnly, onInStockChange,
}: SortFilterBarProps) {
  const { language } = useSimbaStore();
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [localMax, setLocalMax] = useState(priceRange[1]);

  const L = {
    sort:     language === 'fr' ? 'Trier' : language === 'rw' ? 'Ranga' : 'Sort',
    filter:   language === 'fr' ? 'Filtrer' : language === 'rw' ? 'Gace' : 'Filter',
    items:    language === 'fr' ? 'produits' : language === 'rw' ? 'ibicuruzwa' : 'products',
    price:    language === 'fr' ? 'Fourchette de prix' : language === 'rw' ? 'Igiciro' : 'Price Range',
    inStock:  language === 'fr' ? 'En stock seulement' : language === 'rw' ? 'Biraboneka gusa' : 'In stock only',
    apply:    language === 'fr' ? 'Appliquer' : language === 'rw' ? 'Shyira' : 'Apply',
    clear:    language === 'fr' ? 'Réinitialiser' : language === 'rw' ? 'Siba' : 'Clear',
  };

  const sortLabel = SORT_OPTIONS.find(s => s.value === sort);
  const currentSortLabel = language === 'fr' ? sortLabel?.labelFr : language === 'rw' ? sortLabel?.labelRw : sortLabel?.labelEn;

  const hasFilters = inStockOnly || priceRange[1] < maxPrice;

  return (
    <div className="relative">
      <div className="flex items-center gap-2 py-2">
        {/* Count */}
        <span className="text-xs text-gray-500 font-medium flex-1">{totalCount} {L.items}</span>

        {/* Filter */}
        <div className="relative">
          <button
            onClick={() => { setFilterOpen(o => !o); setSortOpen(false); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-black transition-all ${
              hasFilters
                ? 'bg-brand-dark text-white border-brand-dark'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {L.filter}
            {hasFilters && <span className="w-4 h-4 bg-brand rounded-full text-gray-900 text-[9px] flex items-center justify-center">!</span>}
          </button>
        </div>

        {/* Sort */}
        <div className="relative">
          <button
            onClick={() => { setSortOpen(o => !o); setFilterOpen(false); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-black text-gray-700 dark:text-gray-300 hover:border-gray-300 transition-colors"
          >
            {currentSortLabel}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-[60]" onClick={() => setSortOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 z-[70] overflow-hidden py-1"
                >
                  {SORT_OPTIONS.map(opt => {
                    const label = language === 'fr' ? opt.labelFr : language === 'rw' ? opt.labelRw : opt.labelEn;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => { onSortChange(opt.value); setSortOpen(false); }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        {label}
                        {sort === opt.value && <Check className="w-4 h-4 text-brand" />}
                      </button>
                    );
                  })}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Filter panel */}
      <AnimatePresence>
        {filterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 mb-2 space-y-4">
              {/* Price range */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">{L.price}</label>
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-300">0 – {localMax.toLocaleString()} RWF</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={maxPrice}
                  step={100}
                  value={localMax}
                  onChange={e => setLocalMax(Number(e.target.value))}
                  className="w-full h-2 rounded-full accent-brand cursor-pointer"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-gray-400">0</span>
                  <span className="text-[10px] text-gray-400">{maxPrice.toLocaleString()} RWF</span>
                </div>
              </div>

              {/* In stock */}
              <button
                onClick={() => onInStockChange(!inStockOnly)}
                className={`flex items-center gap-3 w-full p-3 rounded-xl border-2 transition-all ${
                  inStockOnly ? 'border-brand bg-brand-muted text-brand-dark' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                  inStockOnly ? 'bg-brand border-brand' : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {inStockOnly && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-sm font-bold">{L.inStock}</span>
              </button>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => { onPriceChange([0, maxPrice]); onInStockChange(false); setLocalMax(maxPrice); }}
                  className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-black text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> {L.clear}
                </button>
                <button
                  onClick={() => { onPriceChange([0, localMax]); setFilterOpen(false); }}
                  className="flex-1 py-2.5 rounded-xl bg-brand-dark text-white text-sm font-black hover:bg-gray-800 transition-colors"
                >
                  {L.apply}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
