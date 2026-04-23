'use client';

import { useMemo } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations, translateCategory } from '@/lib/translations';
import { getSimbaData, getCategories } from '@/lib/data';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, DollarSign, Zap, Star, ShoppingBag, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCategorySelect: (cat: string) => void;
}

export default function ShopNowPanel({ isOpen, onClose, onCategorySelect }: Props) {
  const { language, addToCart, cart } = useSimbaStore();
  const t = translations[language];
  const allProducts = useMemo(() => getSimbaData().products, []);
  const categories = useMemo(() => getCategories(), []);

  // ── Curated product collections ──────────────────────────────────────────
  const cheapest = useMemo(() =>
    [...allProducts].filter(p => p.inStock).sort((a, b) => a.price - b.price).slice(0, 6),
    [allProducts]
  );

  const expensive = useMemo(() =>
    [...allProducts].filter(p => p.inStock).sort((a, b) => b.price - a.price).slice(0, 6),
    [allProducts]
  );

  const popular = useMemo(() => {
    // Simulate popularity by picking products from varied categories
    const seen = new Set<string>();
    return allProducts.filter(p => {
      if (!p.inStock || seen.has(p.category)) return false;
      seen.add(p.category);
      return true;
    }).slice(0, 6);
  }, [allProducts]);

  const newArrivals = useMemo(() =>
    // Last products in the dataset = newest
    [...allProducts].filter(p => p.inStock).slice(-6).reverse(),
    [allProducts]
  );

  const labels = {
    en: {
      title: 'What are you looking for?',
      sub: 'Browse by price, popularity, or category',
      cheapTitle: '💰 Best Value',
      cheapSub: 'Lowest prices right now',
      expTitle: '✨ Premium Picks',
      expSub: 'Top-shelf products',
      popTitle: '🔥 Most Popular',
      popSub: 'One from every category',
      newTitle: '🆕 New Arrivals',
      newSub: 'Latest additions',
      allCats: 'Browse by Category',
      shopAll: 'Shop All',
      addBtn: '+',
    },
    fr: {
      title: 'Que cherchez-vous ?',
      sub: 'Parcourez par prix, popularité ou catégorie',
      cheapTitle: '💰 Meilleur prix',
      cheapSub: 'Les prix les plus bas',
      expTitle: '✨ Sélection premium',
      expSub: 'Produits haut de gamme',
      popTitle: '🔥 Les plus populaires',
      popSub: 'Un de chaque catégorie',
      newTitle: '🆕 Nouveautés',
      newSub: 'Derniers ajouts',
      allCats: 'Parcourir par catégorie',
      shopAll: 'Tout voir',
      addBtn: '+',
    },
    rw: {
      title: 'Ushaka iki?',
      sub: 'Reba ukurikije igiciro, ibikunzwe cyangwa icyiciro',
      cheapTitle: '💰 Igiciro Gito',
      cheapSub: 'Ibiciro bito cyane',
      expTitle: '✨ Ibicuruzwa Byiza',
      expSub: 'Ibicuruzwa by\'ubwiza',
      popTitle: '🔥 Bikunzwe Cyane',
      popSub: 'Kimwe mu cyiciro cyose',
      newTitle: '🆕 Bishya',
      newSub: 'Byongewe vuba',
      allCats: 'Reba ukurikije icyiciro',
      shopAll: 'Reba Byose',
      addBtn: '+',
    },
  }[language];

  const COLLECTIONS = [
    { key: 'cheap',     title: labels.cheapTitle, sub: labels.cheapSub,  products: cheapest,   icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { key: 'popular',   title: labels.popTitle,   sub: labels.popSub,    products: popular,    icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { key: 'expensive', title: labels.expTitle,   sub: labels.expSub,    products: expensive,  icon: Star,       color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { key: 'new',       title: labels.newTitle,   sub: labels.newSub,    products: newArrivals,icon: Zap,        color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-full sm:max-w-3xl bg-white dark:bg-gray-950 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-brand-dark rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <p className="font-black text-gray-900 dark:text-white text-base">{labels.title}</p>
                  <p className="text-xs text-gray-400">{labels.sub}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6" style={{ scrollbarWidth: 'none' }}>

              {/* ── Product collections ── */}
              {COLLECTIONS.map(col => {
                const Icon = col.icon;
                return (
                  <div key={col.key}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 ${col.bg} rounded-lg flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${col.color}`} />
                        </div>
                        <div>
                          <p className="font-black text-sm text-gray-900 dark:text-white">{col.title}</p>
                          <p className="text-[10px] text-gray-400">{col.sub}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                      {col.products.map(p => {
                        const qty = cart.find(i => i.id === p.id)?.quantity ?? 0;
                        return (
                          <div key={p.id} className="flex-shrink-0 w-32 bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                            <Link href={`/products/${p.id}`} onClick={onClose} className="block relative aspect-square bg-white dark:bg-gray-800">
                              <Image src={p.image} alt={p.name} fill className="object-cover" sizes="128px" />
                            </Link>
                            <div className="p-2">
                              <p className="text-[10px] font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight mb-1">{p.name}</p>
                              <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-brand-dark dark:text-brand">{p.price.toLocaleString()} <span className="text-gray-400 font-normal">RWF</span></p>
                                {qty === 0 ? (
                                  <button
                                    onClick={() => addToCart(p)}
                                    className="w-6 h-6 bg-brand-dark text-white rounded-lg flex items-center justify-center text-xs font-black hover:bg-brand hover:text-gray-900 transition-colors"
                                  >
                                    +
                                  </button>
                                ) : (
                                  <span className="text-[10px] font-black text-brand-dark bg-brand/10 px-1.5 py-0.5 rounded-lg">{qty}×</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* ── Browse by category ── */}
              <div>
                <p className="font-black text-sm text-gray-900 dark:text-white mb-3">{labels.allCats}</p>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => { onCategorySelect(cat); onClose(); }}
                      className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-brand/40 hover:bg-brand-muted transition-all text-left"
                    >
                      <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {translateCategory(cat, language)}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
