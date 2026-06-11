'use client';

import { Product } from '@/types';
import { useSimbaStore } from '@/store/useSimbaStore';
import { useCompareStore } from '@/store/useCompareStore';
import { translations } from '@/lib/translations';
import { Plus, Minus, Heart, BarChart2 } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { clsx } from 'clsx';
import { getProductRating, getStockCount } from '@/lib/reviews';
import { useState, useEffect, useRef } from 'react';
import { toast } from './Toast';

interface ProductCardProps {
  product: Product;
  index?: number;
  viewMode?: 'grid' | 'list';
}

export default function ProductCard({ product, index = 0, viewMode = 'grid' }: ProductCardProps) {
  const { addToCart, updateQuantity, cart, toggleFavorite, favorites, language, branchInventory } = useSimbaStore();
  const { addToCompare, removeFromCompare, isInCompare, compareList, setCompareOpen } = useCompareStore();
  const t = translations[language];
  const lang = language as 'en' | 'fr' | 'rw';

  const cartItem = cart.find(i => i.id === product.id);
  const quantity = cartItem?.quantity ?? 0;
  const isFav = favorites.includes(product.id);
  const inCompare = isInCompare(product.id);
  const { avg, count } = getProductRating(product.id);
  const prevQty = useRef(quantity);
  const [floats, setFloats] = useState<number[]>([]);
  const [displayName, setDisplayName] = useState(product.name);

  useEffect(() => {
    if (language === 'en') { setDisplayName(product.name); return; }
    fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: product.name, targetLang: language }),
    })
      .then(r => r.json())
      .then(d => { if (d.ok && d.translated) setDisplayName(d.translated); })
      .catch(() => {});
  }, [product.name, language]);

  const branchStock = branchInventory[product.id];
  const isAvailable = branchStock ? branchStock.isAvailable : product.inStock;
  const stockLeft = branchStock
    ? (branchStock.stockCount <= 5 && branchStock.stockCount > 0 ? branchStock.stockCount : null)
    : getStockCount(product.id);

  const triggerFloat = () => {
    const id = Date.now();
    setFloats(f => [...f, id]);
    setTimeout(() => setFloats(f => f.filter(x => x !== id)), 900);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!isAvailable) return;
    addToCart(product); triggerFloat();
  };
  const handleInc = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    updateQuantity(product.id, quantity + 1); triggerFloat();
  };
  const handleDec = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    updateQuantity(product.id, quantity - 1);
  };
  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    toggleFavorite(product.id);
  };
  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (inCompare) {
      removeFromCompare(product.id);
    } else {
      const added = addToCompare(product);
      if (!added) {
        toast.error(lang === 'fr' ? 'Maximum 3 produits' : lang === 'rw' ? 'Ntarenze 3' : 'Max 3 products to compare');
        return;
      }
      if (compareList.length >= 1) setCompareOpen(true);
    }
  };

  // ── LIST MODE ──────────────────────────────────────────────────────────────
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-20px' }}
        transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
        className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200 flex items-center gap-4 p-3"
      >
        {/* Image */}
        <Link href={`/products/${product.id}`} className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800">
          <Image
            src={product.image} alt={product.name} fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="80px"
          />
          {!isAvailable && (
            <div className="absolute inset-0 bg-white/70 dark:bg-black/70 flex items-center justify-center">
              <span className="text-[8px] font-black text-gray-700 dark:text-gray-300 uppercase">Out</span>
            </div>
          )}
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex gap-0.5 mb-0.5">
            {[1,2,3,4,5].map(i => (
              <span key={i} className={`text-[10px] ${count > 0 && i <= Math.round(avg) ? 'text-amber-500' : 'text-gray-200 dark:text-gray-700'}`}>★</span>
            ))}
            {count > 0 && <span className="text-[10px] text-gray-400 ml-0.5">({count})</span>}
          </div>
          <Link href={`/products/${product.id}`}>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug hover:text-brand transition-colors line-clamp-1">
              {displayName}
            </h3>
          </Link>
          <p className="text-xs text-gray-400 mt-0.5">{product.category} · per {product.unit || 'unit'}</p>
          {stockLeft !== null && isAvailable && (
            <p className="text-[10px] font-black text-red-500 mt-0.5">{t.onlyLeft} {stockLeft} {t.leftInStock}</p>
          )}
        </div>

        {/* Price + actions */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="text-right">
            <p className="text-base font-black text-gray-900 dark:text-white leading-none">{product.price.toLocaleString()}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase">RWF</p>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Compare */}
            <button
              onClick={handleCompare}
              className={clsx(
                'w-7 h-7 rounded-lg flex items-center justify-center transition-all',
                inCompare ? 'bg-brand text-gray-900' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-brand/20 hover:text-brand'
              )}
              title={inCompare ? 'Remove from compare' : 'Add to compare'}
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>

            {/* Fav */}
            <button onClick={handleFav}
              className="w-7 h-7 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <Heart className={clsx('w-3.5 h-3.5 transition-all', isFav ? 'fill-red-500 text-red-500' : 'text-gray-400')} />
            </button>

            {/* Cart */}
            <AnimatePresence mode="wait">
              {quantity === 0 ? (
                <motion.button
                  key="add"
                  initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={handleAdd} disabled={!isAvailable}
                  className={clsx(
                    'h-7 px-3 rounded-xl text-xs font-black flex items-center gap-1 transition-all',
                    isAvailable
                      ? 'bg-brand-dark text-white hover:bg-brand hover:text-gray-900'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-300 cursor-not-allowed'
                  )}
                >
                  <Plus className="w-3 h-3" />
                  {lang === 'fr' ? 'Ajouter' : lang === 'rw' ? 'Ongeraho' : 'Add'}
                </motion.button>
              ) : (
                <motion.div
                  key="controls"
                  initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="flex items-center bg-brand-dark rounded-xl overflow-hidden shadow-sm"
                >
                  <button onClick={handleDec} className="w-7 h-7 flex items-center justify-center text-white hover:bg-black/10 transition-colors">
                    <Minus className="w-3 h-3 stroke-[3px]" />
                  </button>
                  <span className="text-white font-black text-xs w-5 text-center select-none">{quantity}</span>
                  <button onClick={handleInc} className="w-7 h-7 flex items-center justify-center text-white hover:bg-black/10 transition-colors">
                    <Plus className="w-3 h-3 stroke-[3px]" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── GRID MODE (default) ────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.06, 0.4), ease: [0.25, 0.1, 0.25, 1] }}
      className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:border-gray-200 dark:hover:border-gray-700 hover:-translate-y-1 transition-all duration-200 flex flex-col"
    >
      {/* Floating +1 */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
        <AnimatePresence>
          {floats.map(id => (
            <motion.div
              key={id}
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 0, y: -50, scale: 1.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute bottom-12 right-6 text-brand font-black text-sm"
            >
              +1
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Image */}
      <Link href={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-800">
        <Image
          src={product.image} alt={product.name} fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />

        {/* Fav + Compare overlay buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
          <motion.button whileTap={{ scale: 1.4 }} onClick={handleFav}
            className="w-7 h-7 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm"
            aria-label={isFav ? 'Remove from favourites' : 'Save'}>
            <Heart className={clsx('w-3.5 h-3.5 transition-all duration-200', isFav ? 'fill-red-500 text-red-500' : 'text-gray-400')} />
          </motion.button>

          <motion.button whileTap={{ scale: 1.2 }} onClick={handleCompare}
            className={clsx(
              'w-7 h-7 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm transition-all',
              inCompare
                ? 'bg-brand text-gray-900'
                : 'bg-white/90 dark:bg-gray-900/90 text-gray-400 hover:text-brand'
            )}
            aria-label={inCompare ? 'Remove from compare' : 'Add to compare'}>
            <BarChart2 className="w-3.5 h-3.5" />
          </motion.button>
        </div>

        {stockLeft !== null && isAvailable && (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-black uppercase tracking-wide shadow-sm"
          >
            {t.onlyLeft} {stockLeft} {t.leftInStock}
          </motion.div>
        )}

        {!isAvailable && (
          <div className="absolute inset-0 bg-white/70 dark:bg-black/70 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              {t.outOfStock}
            </span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <div className="flex items-center gap-1 mb-1">
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(i => (
              <span key={i} className={`text-[10px] ${count > 0 && i <= Math.round(avg) ? 'text-amber-500' : 'text-gray-200 dark:text-gray-700'}`}>★</span>
            ))}
          </div>
          {count > 0 && <span className="text-[10px] text-gray-400">({count})</span>}
        </div>

        <Link href={`/products/${product.id}`}>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug mb-1 hover:text-brand transition-colors min-h-[2rem]">
            {displayName}
          </h3>
        </Link>
        <p className="text-xs text-gray-400 font-medium mb-2">per {product.unit || 'unit'}</p>

        <div className="mt-auto flex items-center justify-between gap-1">
          <div>
            <p className="text-base font-black text-gray-900 dark:text-white leading-none">{product.price.toLocaleString()}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">RWF</p>
          </div>

          <AnimatePresence mode="wait">
            {quantity === 0 ? (
              <motion.button
                key="add"
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }} whileTap={{ scale: 0.88 }}
                transition={{ duration: 0.12 }}
                onClick={handleAdd} disabled={!isAvailable}
                className={clsx(
                  'w-8 h-8 rounded-xl flex items-center justify-center transition-all',
                  isAvailable
                    ? 'bg-brand-dark hover:bg-brand text-white shadow-sm hover:shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-300 cursor-not-allowed'
                )}
              >
                <Plus className="w-4 h-4 stroke-[2.5px]" />
              </motion.button>
            ) : (
              <motion.div
                key="controls"
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }} transition={{ duration: 0.12 }}
                className="flex items-center bg-brand-dark rounded-xl overflow-hidden shadow-sm"
              >
                <button onClick={handleDec} className="w-7 h-8 flex items-center justify-center text-white hover:bg-black/10 transition-colors active:bg-black/20">
                  <Minus className="w-3 h-3 stroke-[3px]" />
                </button>
                <motion.span
                  key={quantity}
                  initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className="text-white font-black text-xs w-4 text-center select-none"
                >
                  {quantity}
                </motion.span>
                <button onClick={handleInc} className="w-7 h-8 flex items-center justify-center text-white hover:bg-black/10 transition-colors active:bg-black/20">
                  <Plus className="w-3 h-3 stroke-[3px]" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
