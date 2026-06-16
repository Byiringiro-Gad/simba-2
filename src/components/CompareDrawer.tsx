'use client';

import { useSimbaStore } from '@/store/useSimbaStore';
import { useCompareStore } from '@/store/useCompareStore';
import { translations } from '@/lib/translations';
import { X, Plus, Star, ShoppingCart, BarChart2, Check, Minus as MinusIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

const FEATURES = [
  { key: 'price',    label: { en: 'Price', fr: 'Prix', rw: 'Igiciro' } },
  { key: 'category', label: { en: 'Category', fr: 'Catégorie', rw: 'Ubwoko' } },
  { key: 'unit',     label: { en: 'Unit', fr: 'Unité', rw: 'Igipimo' } },
  { key: 'stock',    label: { en: 'Availability', fr: 'Disponibilité', rw: 'Uboneka' } },
  { key: 'rating',   label: { en: 'Rating', fr: 'Note', rw: 'Inyito' } },
] as const;

export default function CompareDrawer() {
  const { language, addToCart, cart, updateQuantity } = useSimbaStore();
  const { compareList, removeFromCompare, clearCompare, isCompareOpen, setCompareOpen } = useCompareStore();
  const t = translations[language];
  const lang = language as 'en' | 'fr' | 'rw';

  if (!isCompareOpen || compareList.length === 0) return null;

  const getBestPrice = () => {
    const prices = compareList.map(p => p.price);
    return Math.min(...prices);
  };

  const bestPrice = getBestPrice();

  return (
    <AnimatePresence>
      {isCompareOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
            onClick={() => setCompareOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[201] bg-white dark:bg-gray-950 rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-brand" />
                <h2 className="font-black text-gray-900 dark:text-white text-lg">
                  {lang === 'fr' ? 'Comparer les produits' : lang === 'rw' ? 'Gereranya ibicuruzwa' : 'Compare Products'}
                </h2>
                <span className="px-2 py-0.5 bg-brand/10 text-brand rounded-full text-xs font-black">
                  {compareList.length}/3
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearCompare}
                  className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  {lang === 'fr' ? 'Tout effacer' : lang === 'rw' ? 'Siba byose' : 'Clear all'}
                </button>
                <button
                  onClick={() => setCompareOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Scrollable compare table */}
            <div className="flex-1 overflow-auto">
              <div className="min-w-[600px]">
                {/* Product columns header */}
                <div className="grid gap-0" style={{ gridTemplateColumns: `160px repeat(${compareList.length}, 1fr)` }}>
                  {/* Empty top-left cell */}
                  <div className="p-4 border-r border-gray-100 dark:border-gray-800" />

                  {/* Product cards */}
                  {compareList.map(product => {
                    const qty = cart.find(i => i.id === product.id)?.quantity ?? 0;
                    const isBest = product.price === bestPrice && compareList.length > 1;
                    return (
                      <div key={product.id} className="p-3 border-r last:border-r-0 border-gray-100 dark:border-gray-800 relative">
                        {isBest && (
                          <div className="absolute top-2 right-2 px-2 py-0.5 bg-green-500 text-white text-[9px] font-black rounded-full uppercase tracking-wide">
                            {lang === 'fr' ? 'Meilleur prix' : lang === 'rw' ? 'Igiciro cyiza' : 'Best price'}
                          </div>
                        )}
                        <button
                          onClick={() => removeFromCompare(product.id)}
                          className="absolute top-2 left-2 w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 transition-colors z-10"
                        >
                          <X className="w-3 h-3" />
                        </button>

                        <Link href={`/products/${product.id}`} onClick={() => setCompareOpen(false)}>
                          <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 mb-2 mt-2">
                            <Image src={product.image} alt={product.name} fill className="object-cover hover:scale-105 transition-transform" sizes="200px" />
                          </div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight mb-1 hover:text-brand transition-colors">
                            {product.name}
                          </p>
                        </Link>

                        {/* Add to cart */}
                        {qty === 0 ? (
                          <button
                            onClick={() => addToCart(product)}
                            disabled={!product.inStock}
                            className={clsx(
                              'w-full py-1.5 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all mt-1',
                              product.inStock
                                ? 'bg-brand text-gray-900 hover:bg-brand-dark hover:text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                            )}
                          >
                            <ShoppingCart className="w-3 h-3" />
                            {product.inStock ? (lang === 'fr' ? 'Ajouter' : lang === 'rw' ? 'Ongeraho' : 'Add') : t.outOfStock}
                          </button>
                        ) : (
                          <div className="flex items-center justify-center gap-1 mt-1">
                            <button onClick={() => updateQuantity(product.id, qty - 1)}
                              className="w-7 h-7 bg-brand-dark text-white rounded-lg flex items-center justify-center text-xs hover:bg-brand hover:text-gray-900 transition-colors">
                              <MinusIcon className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-black text-gray-900 dark:text-white w-5 text-center">{qty}</span>
                            <button onClick={() => updateQuantity(product.id, qty + 1)}
                              className="w-7 h-7 bg-brand-dark text-white rounded-lg flex items-center justify-center text-xs hover:bg-brand hover:text-gray-900 transition-colors">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Feature rows */}
                {FEATURES.map((feature, fi) => (
                  <div
                    key={feature.key}
                    className={clsx(
                      'grid border-t border-gray-100 dark:border-gray-800',
                      fi % 2 === 0 ? 'bg-gray-50/60 dark:bg-gray-900/40' : 'bg-white dark:bg-gray-950'
                    )}
                    style={{ gridTemplateColumns: `160px repeat(${compareList.length}, 1fr)` }}
                  >
                    {/* Label */}
                    <div className="p-4 border-r border-gray-100 dark:border-gray-800 flex items-center">
                      <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                        {feature.label[lang] ?? feature.label.en}
                      </span>
                    </div>

                    {/* Values */}
                    {compareList.map(product => {
                      let value: React.ReactNode = null;

                      if (feature.key === 'price') {
                        const isBest = product.price === bestPrice && compareList.length > 1;
                        value = (
                          <span className={clsx('font-black text-sm', isBest ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white')}>
                            {product.price.toLocaleString()} <span className="text-xs font-bold text-gray-400">RWF</span>
                            {isBest && <Check className="w-3.5 h-3.5 text-green-500 inline ml-1" />}
                          </span>
                        );
                      } else if (feature.key === 'category') {
                        value = <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{product.category}</span>;
                      } else if (feature.key === 'unit') {
                        value = <span className="text-xs font-bold text-gray-700 dark:text-gray-300 capitalize">{product.unit || '—'}</span>;
                      } else if (feature.key === 'stock') {
                        value = product.inStock
                          ? <span className="inline-flex items-center gap-1 text-xs font-black text-green-600 dark:text-green-400"><Check className="w-3.5 h-3.5" />{lang === 'fr' ? 'En stock' : lang === 'rw' ? 'Biraboneka' : 'In stock'}</span>
                          : <span className="text-xs font-black text-red-500">{t.outOfStock}</span>;
                      } else if (feature.key === 'rating') {
                        const rating = product.rating ?? 0;
                        value = (
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="text-xs font-black text-gray-900 dark:text-white">{rating > 0 ? rating.toFixed(1) : '—'}</span>
                          </span>
                        );
                      }

                      return (
                        <div key={product.id} className="p-4 border-r last:border-r-0 border-gray-100 dark:border-gray-800 flex items-center">
                          {value}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
