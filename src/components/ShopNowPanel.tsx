'use client';

import { useMemo, useRef, useEffect } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations, translateCategory } from '@/lib/translations';
import { getSimbaData, getCategories } from '@/lib/data';
import { getProductRating } from '@/lib/reviews';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ArrowRight, ShoppingBag, Plus, Minus,
  Tag, TrendingUp, Package, Coffee, Star
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCategorySelect: (cat: string) => void;
}

// ── Mini product card ─────────────────────────────────────────────────────────
function ShelfCard({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addToCart, updateQuantity, cart } = useSimbaStore();
  const qty = cart.find(i => i.id === product.id)?.quantity ?? 0;
  const { avg, count } = getProductRating(product.id);

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
        <p className="text-[11px] font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight mb-1 min-h-[2rem]">{product.name}</p>
        {/* Always show 5 stars — colored if rated, empty if not */}
        <div className="flex gap-0.5 mb-1">
          {[1,2,3,4,5].map(i => (
            <span key={i} className={`text-[9px] ${count > 0 && i <= Math.round(avg) ? 'text-amber-400' : 'text-gray-200 dark:text-gray-700'}`}>★</span>
          ))}
          {count > 0 && <span className="text-[9px] font-bold text-gray-500 ml-0.5">{avg}</span>}
        </div>
        <div className="flex items-center justify-between gap-1">
          <div>
            <p className="text-xs font-black text-gray-900 dark:text-white leading-none">{product.price.toLocaleString()}</p>
            <p className="text-[9px] text-gray-400 font-medium">RWF</p>
          </div>
          {product.inStock && (
            qty === 0 ? (
              <button onClick={() => addToCart(product)}
                className="w-7 h-7 bg-brand-dark hover:bg-brand text-white hover:text-gray-900 rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-sm">
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
  'Groceries':                     { img: 'https://images.unsplash.com/photo-1543168256-418811576931?w=400&q=80', gradient: 'from-green-700/80' },
  'Bakery':                        { img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', gradient: 'from-amber-700/80' },
  'Cosmetics & Personal Care':     { img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80', gradient: 'from-pink-700/80' },
  'Baby Products':                 { img: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80', gradient: 'from-sky-700/80' },
  'Kitchenware & Electronics':     { img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80', gradient: 'from-orange-700/80' },
  'Electronics':                   { img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80', gradient: 'from-slate-700/80' },
  'Sports & Wellness':             { img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80', gradient: 'from-teal-700/80' },
  'Alcoholic Beverages & Spirits': { img: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&q=80', gradient: 'from-red-800/80' },
  'Cleaning & Sanitary':           { img: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&q=80', gradient: 'from-cyan-700/80' },
  'Kitchen Storage':               { img: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&q=80', gradient: 'from-lime-700/80' },
  'Pet Care':                      { img: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&q=80', gradient: 'from-rose-700/80' },
};

// ── Essentials: common weekly items by keyword ────────────────────────────────
const ESSENTIAL_KEYWORDS = ['milk', 'bread', 'oil', 'rice', 'egg', 'flour', 'sugar', 'salt', 'tomato', 'butter'];

export default function ShopNowPanel({ isOpen, onClose, onCategorySelect }: Props) {
  const { language, cart } = useSimbaStore();
  const t = translations[language];
  const allProducts = useMemo(() => getSimbaData().products, []);
  const categories = useMemo(() => getCategories(), []);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) setTimeout(() => scrollRef.current?.scrollTo({ top: 0 }), 50);
  }, [isOpen]);

  // ── Purposeful shelves ────────────────────────────────────────────────────

  // 1. Today's Deals — affordable in-stock items under 2,000 RWF
  const todaysDeals = useMemo(() =>
    allProducts
      .filter(p => p.inStock && p.price <= 2000)
      .sort((a, b) => a.price - b.price)
      .slice(0, 10),
    [allProducts]
  );

  // 2. Highly Rated — top rated products (social proof)
  const highlyRated = useMemo(() =>
    [...allProducts]
      .filter(p => p.inStock)
      .sort((a, b) => getProductRating(b.id).avg - getProductRating(a.id).avg)
      .slice(0, 10),
    [allProducts]
  );

  // 3. Weekly Essentials — common household staples
  const essentials = useMemo(() => {
    const found: Product[] = [];
    for (const kw of ESSENTIAL_KEYWORDS) {
      const match = allProducts.find(p =>
        p.inStock && p.name.toLowerCase().includes(kw) && !found.find(f => f.id === p.id)
      );
      if (match) found.push(match);
    }
    // Fill up to 10 with other in-stock groceries
    if (found.length < 10) {
      const extras = allProducts.filter(p =>
        p.inStock && p.category === 'Groceries' && !found.find(f => f.id === p.id)
      ).slice(0, 10 - found.length);
      found.push(...extras);
    }
    return found;
  }, [allProducts]);

  // 4. Recently Added — last products in the dataset
  const newArrivals = useMemo(() =>
    [...allProducts].filter(p => p.inStock).slice(-10).reverse(),
    [allProducts]
  );

  const cartCount = cart.reduce((a, i) => a + i.quantity, 0);

  const L = {
    title:        language === 'fr' ? 'Que cherchez-vous ?' : language === 'rw' ? 'Ushaka iki?' : 'What are you looking for?',
    sub:          language === 'fr' ? `${allProducts.filter(p=>p.inStock).length}+ produits disponibles` : language === 'rw' ? `Ibicuruzwa ${allProducts.filter(p=>p.inStock).length}+ biraboneka` : `${allProducts.filter(p=>p.inStock).length}+ products available`,
    deals:        language === 'fr' ? "Offres du jour" : language === 'rw' ? "Ibiciro Bito Uyu Munsi" : "Today's Deals",
    dealsSub:     language === 'fr' ? "Moins de 2 000 RWF" : language === 'rw' ? "Munsi ya RWF 2,000" : "Under 2,000 RWF",
    rated:        language === 'fr' ? "Les mieux notés" : language === 'rw' ? "Bikunzwe Cyane" : "Highly Rated",
    ratedSub:     language === 'fr' ? "Choix des clients" : language === 'rw' ? "Ibyo abakiriya bakunda" : "Customer favourites",
    essentials:   language === 'fr' ? "Essentiels de la semaine" : language === 'rw' ? "Ibikenewe Buri Cyumweru" : "Weekly Essentials",
    essentialsSub:language === 'fr' ? "Ce que vous achetez chaque semaine" : language === 'rw' ? "Ibyo ugura buri cyumweru" : "Things you buy every week",
    newLabel:     language === 'fr' ? "Nouveautés" : language === 'rw' ? "Bishya" : "New Arrivals",
    newSub:       language === 'fr' ? "Derniers ajouts au catalogue" : language === 'rw' ? "Byongewe vuba mu rutonde" : "Latest additions to the catalog",
    allCats:      language === 'fr' ? "Toutes les catégories" : language === 'rw' ? "Ibyiciro Byose" : "All Categories",
    allCatsSub:   language === 'fr' ? "Choisissez votre rayon" : language === 'rw' ? "Hitamo icyiciro cyawe" : "Browse by aisle",
    shopCat:      language === 'fr' ? 'Voir' : language === 'rw' ? 'Reba' : 'Shop',
    products:     language === 'fr' ? 'produits' : language === 'rw' ? 'ibicuruzwa' : 'products',
  };

  const SHELVES = [
    { id: 'deals',      icon: Tag,        iconBg: 'bg-green-500',  title: L.deals,      sub: L.dealsSub,      products: todaysDeals,  empty: todaysDeals.length === 0 },
    { id: 'rated',      icon: Star,       iconBg: 'bg-amber-500',  title: L.rated,      sub: L.ratedSub,      products: highlyRated,  empty: highlyRated.length === 0 },
    { id: 'essentials', icon: Coffee,     iconBg: 'bg-blue-500',   title: L.essentials, sub: L.essentialsSub, products: essentials,   empty: essentials.length === 0 },
    { id: 'new',        icon: TrendingUp, iconBg: 'bg-purple-500', title: L.newLabel,   sub: L.newSub,        products: newArrivals,  empty: newArrivals.length === 0 },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[45] bg-gray-50 dark:bg-gray-950 flex flex-col"
          style={{ paddingTop: '4rem' }}  // account for sticky navbar
        >
          {/* Sub-header — sits below main Navbar */}
          <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-brand" />
                <p className="font-black text-gray-900 dark:text-white text-sm">{L.title}</p>
                <span className="text-xs text-gray-400 font-medium hidden sm:block">· {L.sub}</span>
              </div>
              <div className="flex items-center gap-3">
                {cartCount > 0 && (
                  <button onClick={onClose}
                    className="flex items-center gap-2 px-3 py-1.5 bg-brand text-gray-900 rounded-xl text-xs font-black hover:bg-brand-dark hover:text-white transition-colors">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    {cartCount} {language === 'fr' ? 'article(s)' : language === 'rw' ? 'ibintu' : 'item(s)'}
                  </button>
                )}
                <button onClick={onClose}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 transition-colors">
                  <X className="w-3.5 h-3.5" />
                  {language === 'fr' ? 'Fermer' : language === 'rw' ? 'Funga' : 'Close'}
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable content */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-5 pb-24 space-y-8">

              {/* ── Product shelves ── */}
              {SHELVES.filter(s => !s.empty).map((shelf, si) => (
                <section key={shelf.id}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-9 h-9 ${shelf.iconBg} rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0`}>
                      <shelf.icon className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-black text-gray-900 dark:text-white text-base leading-tight">{shelf.title}</h2>
                      <p className="text-xs text-gray-400 font-medium">{shelf.sub}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                    {shelf.products.map((p, i) => (
                      <motion.div key={p.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(i * 0.04, 0.3) }}>
                        <ShelfCard product={p} onClose={onClose} />
                      </motion.div>
                    ))}
                  </div>
                </section>
              ))}

              {/* ── All Categories ── */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 bg-brand-dark rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
                    <Package className="w-4.5 h-4.5 text-brand" />
                  </div>
                  <div>
                    <h2 className="font-black text-gray-900 dark:text-white text-base leading-tight">{L.allCats}</h2>
                    <p className="text-xs text-gray-400 font-medium">{L.allCatsSub}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {categories.map((cat, i) => {
                    const meta = CAT_IMAGES[cat] ?? { img: 'https://images.unsplash.com/photo-1543168256-418811576931?w=400&q=80', gradient: 'from-gray-700/80' };
                    const count = allProducts.filter(p => p.category === cat && p.inStock).length;
                    const label = translateCategory(cat, language);
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
                        <Image src={meta.img} alt={label} fill className="object-cover" sizes="(max-width: 640px) 50vw, 33vw" />
                        <div className={`absolute inset-0 bg-gradient-to-t ${meta.gradient} to-transparent`} />
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="font-black text-white text-sm leading-tight line-clamp-2">{label}</p>
                          <p className="text-white/70 text-[10px] font-medium mt-0.5">{count} {L.products}</p>
                        </div>
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
