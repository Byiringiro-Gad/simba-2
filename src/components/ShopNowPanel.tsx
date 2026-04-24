'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations, translateCategory } from '@/lib/translations';
import { getSimbaData, getCategories } from '@/lib/data';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronRight, Flame, Sparkles, Tag,
  Clock, Star, ArrowRight, ShoppingBag, Plus, Minus
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCategorySelect: (cat: string) => void;
}

// ── Mini product card for shelves ─────────────────────────────────────────────
function ShelfCard({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addToCart, updateQuantity, cart } = useSimbaStore();
  const qty = cart.find(i => i.id === product.id)?.quantity ?? 0;

  return (
    <div className="flex-shrink-0 w-36 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/products/${product.id}`} onClick={onClose} className="block relative h-32 bg-gray-50 dark:bg-gray-800">
        <Image src={product.image} alt={product.name} fill className="object-cover" sizes="144px" />
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/70 dark:bg-black/60 flex items-center justify-center">
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Out of stock</span>
          </div>
        )}
      </Link>
      <div className="p-2.5">
        <p className="text-[11px] font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight mb-1.5 min-h-[2rem]">{product.name}</p>
        <div className="flex items-center justify-between gap-1">
          <div>
            <p className="text-xs font-black text-gray-900 dark:text-white leading-none">{product.price.toLocaleString()}</p>
            <p className="text-[9px] text-gray-400 font-medium">RWF</p>
          </div>
          {product.inStock && (
            qty === 0 ? (
              <button
                onClick={() => addToCart(product)}
                className="w-7 h-7 bg-brand-dark hover:bg-brand text-white hover:text-gray-900 rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3px]" />
              </button>
            ) : (
              <div className="flex items-center bg-brand-dark rounded-xl overflow-hidden">
                <button onClick={() => updateQuantity(product.id, qty - 1)} className="w-6 h-7 flex items-center justify-center text-white hover:bg-black/10 transition-colors">
                  <Minus className="w-2.5 h-2.5 stroke-[3px]" />
                </button>
                <span className="text-white font-black text-[10px] w-4 text-center">{qty}</span>
                <button onClick={() => addToCart(product)} className="w-6 h-7 flex items-center justify-center text-white hover:bg-black/10 transition-colors">
                  <Plus className="w-2.5 h-2.5 stroke-[3px]" />
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// ── Category visual tile ──────────────────────────────────────────────────────
const CAT_IMAGES: Record<string, { img: string; gradient: string }> = {
  'Groceries':                     { img: 'https://images.unsplash.com/photo-1543168256-418811576931?w=400&q=80', gradient: 'from-green-600/80' },
  'Bakery':                        { img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', gradient: 'from-amber-600/80' },
  'Cosmetics & Personal Care':     { img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80', gradient: 'from-pink-600/80' },
  'Baby Products':                 { img: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80', gradient: 'from-sky-600/80' },
  'Kitchenware & Electronics':     { img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80', gradient: 'from-orange-600/80' },
  'Electronics':                   { img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80', gradient: 'from-slate-600/80' },
  'Sports & Wellness':             { img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80', gradient: 'from-teal-600/80' },
  'Alcoholic Beverages & Spirits': { img: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&q=80', gradient: 'from-red-700/80' },
  'Cleaning & Sanitary':           { img: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&q=80', gradient: 'from-cyan-600/80' },
  'Kitchen Storage':               { img: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&q=80', gradient: 'from-lime-600/80' },
  'Pet Care':                      { img: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&q=80', gradient: 'from-rose-600/80' },
};

// ── Main component ────────────────────────────────────────────────────────────
export default function ShopNowPanel({ isOpen, onClose, onCategorySelect }: Props) {
  const { language } = useSimbaStore();
  const t = translations[language];
  const allProducts = useMemo(() => getSimbaData().products, []);
  const categories = useMemo(() => getCategories(), []);
  const [activeSection, setActiveSection] = useState('deals');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset scroll on open
  useEffect(() => {
    if (isOpen) {
      setActiveSection('deals');
      setTimeout(() => scrollRef.current?.scrollTo({ top: 0 }), 50);
    }
  }, [isOpen]);

  // ── Curated shelves ──────────────────────────────────────────────────────
  const deals = useMemo(() =>
    [...allProducts].filter(p => p.inStock).sort((a, b) => a.price - b.price).slice(0, 10),
    [allProducts]
  );

  const popular = useMemo(() => {
    const seen = new Set<string>();
    const result: Product[] = [];
    for (const p of allProducts) {
      if (p.inStock && !seen.has(p.category)) {
        seen.add(p.category);
        result.push(p);
      }
    }
    return result.slice(0, 10);
  }, [allProducts]);

  const premium = useMemo(() =>
    [...allProducts].filter(p => p.inStock).sort((a, b) => b.price - a.price).slice(0, 10),
    [allProducts]
  );

  const quickPick = useMemo(() =>
    allProducts.filter(p => p.inStock && p.price < 3000).slice(0, 10),
    [allProducts]
  );

  const SECTIONS = [
    { id: 'deals',    icon: Tag,      label: language === 'fr' ? 'Bons plans' : language === 'rw' ? 'Igiciro Gito' : 'Best Deals' },
    { id: 'popular',  icon: Flame,    label: language === 'fr' ? 'Populaires' : language === 'rw' ? 'Bikunzwe' : 'Popular' },
    { id: 'premium',  icon: Star,     label: language === 'fr' ? 'Premium' : language === 'rw' ? 'Byiza' : 'Premium' },
    { id: 'quick',    icon: Clock,    label: language === 'fr' ? 'Rapide' : language === 'rw' ? 'Vuba' : 'Quick Pick' },
    { id: 'cats',     icon: Sparkles, label: language === 'fr' ? 'Catégories' : language === 'rw' ? 'Ibyiciro' : 'Categories' },
  ];

  const SHELVES = [
    {
      id: 'deals',
      icon: Tag,
      color: 'text-green-600',
      bg: 'bg-green-500',
      title: language === 'fr' ? 'Meilleurs prix' : language === 'rw' ? 'Ibiciro Bito' : 'Best Deals',
      sub: language === 'fr' ? 'Les prix les plus bas en ce moment' : language === 'rw' ? 'Ibiciro bito cyane ubu' : 'Lowest prices right now',
      products: deals,
    },
    {
      id: 'popular',
      icon: Flame,
      color: 'text-orange-600',
      bg: 'bg-orange-500',
      title: language === 'fr' ? 'Les plus populaires' : language === 'rw' ? 'Bikunzwe Cyane' : 'Most Popular',
      sub: language === 'fr' ? 'Un produit vedette de chaque rayon' : language === 'rw' ? 'Kimwe mu cyiciro cyose' : 'Top pick from every category',
      products: popular,
    },
    {
      id: 'premium',
      icon: Star,
      color: 'text-purple-600',
      bg: 'bg-purple-500',
      title: language === 'fr' ? 'Sélection premium' : language === 'rw' ? 'Ibicuruzwa Byiza' : 'Premium Selection',
      sub: language === 'fr' ? 'Produits haut de gamme' : language === 'rw' ? 'Ibicuruzwa by\'ubwiza' : 'Top-shelf products',
      products: premium,
    },
    {
      id: 'quick',
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-500',
      title: language === 'fr' ? 'Choix rapide' : language === 'rw' ? 'Gufata Vuba' : 'Quick Pick',
      sub: language === 'fr' ? 'Moins de 3 000 RWF' : language === 'rw' ? 'Munsi ya RWF 3,000' : 'Under 3,000 RWF',
      products: quickPick,
    },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(`shop-section-${id}`);
    if (el && scrollRef.current) {
      const offset = el.offsetTop - 120;
      scrollRef.current.scrollTo({ top: offset, behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-gray-50 dark:bg-gray-950 flex flex-col"
        >
          {/* ── Top bar ── */}
          <div className="flex-shrink-0 bg-brand-dark shadow-lg">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-gray-900" />
                </div>
                <div>
                  <p className="font-black text-white text-sm leading-none">
                    {language === 'fr' ? 'Commencer les achats' : language === 'rw' ? 'Tangira Gucuruza' : 'Start Shopping'}
                  </p>
                  <p className="text-white/50 text-[10px]">
                    {allProducts.filter(p => p.inStock).length}+ {language === 'fr' ? 'produits disponibles' : language === 'rw' ? 'ibicuruzwa biraboneka' : 'products available'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* ── Sticky section pills ── */}
            <div className="flex gap-2 px-4 sm:px-6 pb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {SECTIONS.map(s => {
                const Icon = s.icon;
                const isActive = activeSection === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => scrollToSection(s.id)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                      isActive
                        ? 'bg-brand text-gray-900'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Scrollable content ── */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-5 pb-24 space-y-8">

              {/* ── Product shelves ── */}
              {SHELVES.map((shelf, si) => (
                <section key={shelf.id} id={`shop-section-${shelf.id}`}>
                  {/* Shelf header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 ${shelf.bg} rounded-2xl flex items-center justify-center shadow-sm`}>
                        <shelf.icon className="w-4.5 h-4.5 text-white" />
                      </div>
                      <div>
                        <h2 className="font-black text-gray-900 dark:text-white text-base leading-tight">{shelf.title}</h2>
                        <p className="text-xs text-gray-400 font-medium">{shelf.sub}</p>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal product row */}
                  <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                    {shelf.products.map((p, i) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(i * 0.04, 0.3) }}
                      >
                        <ShelfCard product={p} onClose={onClose} />
                      </motion.div>
                    ))}
                  </div>
                </section>
              ))}

              {/* ── Categories section ── */}
              <section id="shop-section-cats">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 bg-brand-dark rounded-2xl flex items-center justify-center shadow-sm">
                    <Sparkles className="w-4.5 h-4.5 text-brand" />
                  </div>
                  <div>
                    <h2 className="font-black text-gray-900 dark:text-white text-base leading-tight">
                      {language === 'fr' ? 'Toutes les catégories' : language === 'rw' ? 'Ibyiciro Byose' : 'All Categories'}
                    </h2>
                    <p className="text-xs text-gray-400 font-medium">
                      {language === 'fr' ? 'Choisissez votre rayon' : language === 'rw' ? 'Hitamo icyiciro cyawe' : 'Pick your aisle'}
                    </p>
                  </div>
                </div>

                {/* Large visual category tiles — 2 columns */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {categories.map((cat, i) => {
                    const meta = CAT_IMAGES[cat] ?? { img: 'https://images.unsplash.com/photo-1543168256-418811576931?w=400&q=80', gradient: 'from-gray-600/80' };
                    const count = allProducts.filter(p => p.category === cat).length;
                    return (
                      <motion.button
                        key={cat}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.05, 0.4) }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { onCategorySelect(cat); onClose(); }}
                        className="relative h-28 sm:h-36 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow text-left"
                      >
                        {/* Background image */}
                        <Image
                          src={meta.img}
                          alt={translateCategory(cat, language)}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, 33vw"
                        />
                        {/* Gradient overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-t ${meta.gradient} to-transparent`} />
                        {/* Text */}
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="font-black text-white text-sm leading-tight line-clamp-2">
                            {translateCategory(cat, language)}
                          </p>
                          <p className="text-white/70 text-[10px] font-medium mt-0.5">
                            {count} {language === 'fr' ? 'produits' : language === 'rw' ? 'ibicuruzwa' : 'products'}
                          </p>
                        </div>
                        {/* Arrow */}
                        <div className="absolute top-2 right-2 w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <ArrowRight className="w-3 h-3 text-white" />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
