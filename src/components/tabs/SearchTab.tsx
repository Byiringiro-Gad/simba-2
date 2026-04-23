'use client';

import { useState, useMemo } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import { getSimbaData, getCategories } from '@/lib/data';
import { Search, X, SlidersHorizontal, Sparkles, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../ProductCard';
import Image from 'next/image';

export default function SearchTab() {
  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, language, addToCart } = useSimbaStore();
  const t = translations[language];
  const [sort, setSort] = useState('default');
  const [showFilters, setShowFilters] = useState(false);
  const allProducts = useMemo(() => getSimbaData().products, []);
  const categories = useMemo(() => getCategories(), []);

  // ── Groq AI search state ──────────────────────────────────────────────────
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiProducts, setAiProducts] = useState<typeof allProducts>([]);
  const [aiUsed, setAiUsed] = useState(false);
  const [showAiResults, setShowAiResults] = useState(false);

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

  const handleAiSearch = async (q?: string) => {
    const query = (q ?? aiQuery).trim();
    if (!query || aiLoading) return;
    setAiLoading(true);
    setShowAiResults(true);
    setAiMessage('');
    setAiProducts([]);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, language }),
      });
      const data = await res.json();
      if (data.ok) {
        setAiMessage(data.message ?? '');
        setAiProducts(data.products ?? []);
        setAiUsed(data.usedAI ?? false);
      }
    } catch {
      setAiMessage(language === 'fr' ? 'Erreur de recherche. Réessayez.' : language === 'rw' ? 'Ikosa mu gushaka. Gerageza.' : 'Search error. Please try again.');
    }
    setAiLoading(false);
  };

  const aiPlaceholder = t.aiSearchPlaceholder;
  const quickSearches = [t.aiQuick1, t.aiQuick2, t.aiQuick3, t.aiQuick4, t.aiQuick5];

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 pb-24 sm:pb-6 space-y-4">

      {/* ── Groq AI Conversational Search ── */}
      <div className="bg-gradient-to-r from-brand-dark to-gray-800 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-brand" />
          <p className="text-white font-black text-sm">{t.aiSearchTitle}</p>
          <span className="px-2 py-0.5 bg-brand/20 text-brand rounded-full text-[10px] font-black uppercase tracking-wide">
            {t.aiSearchPowered}
          </span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={aiQuery}
            onChange={e => setAiQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAiSearch()}
            placeholder={aiPlaceholder}
            className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm outline-none focus:border-brand transition-colors font-medium"
          />
          <button
            onClick={() => handleAiSearch()}
            disabled={!aiQuery.trim() || aiLoading}
            className="px-4 py-3 bg-brand hover:bg-brand-dark text-gray-900 rounded-xl font-black text-sm transition-all disabled:opacity-50 flex items-center gap-2 flex-shrink-0"
          >
            {aiLoading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Quick searches */}
        {!showAiResults && (
          <div className="flex gap-2 mt-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {quickSearches.map(q => (
              <button key={q} onClick={() => { setAiQuery(q); handleAiSearch(q); }}
                className="flex-shrink-0 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 rounded-full text-xs font-bold transition-colors whitespace-nowrap border border-white/10">
                {q}
              </button>
            ))}
          </div>
        )}

        {/* AI Results */}
        <AnimatePresence>
          {showAiResults && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden">
              {aiLoading ? (
                <div className="flex items-center gap-2 py-2">
                  {[0,1,2].map(i => (
                    <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                      className="w-2 h-2 bg-brand rounded-full" />
                  ))}
                  <span className="text-white/60 text-xs font-medium ml-1">{t.aiSearching}</span>
                </div>
              ) : (
                <>
                  {aiMessage && (
                    <div className="flex items-start gap-2 mb-3">
                      <div className="w-6 h-6 bg-brand rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Sparkles className="w-3 h-3 text-gray-900" />
                      </div>
                      <p className="text-white/90 text-sm font-medium leading-relaxed">{aiMessage}</p>
                    </div>
                  )}
                  {aiProducts.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                      {aiProducts.map(p => (
                        <div key={p.id} className="min-w-[120px] bg-white rounded-xl p-2 flex-shrink-0 shadow-sm">
                          <div className="relative aspect-square rounded-lg overflow-hidden mb-1.5 bg-gray-50">
                            <Image src={p.image} alt={p.name} fill className="object-cover" sizes="120px" />
                          </div>
                          <p className="text-[10px] font-bold text-gray-900 line-clamp-2 leading-tight mb-1">{p.name}</p>
                          <p className="text-[10px] font-black text-brand-dark">{p.price.toLocaleString()} RWF</p>
                          <button onClick={() => addToCart(p)}
                            className="mt-1.5 w-full py-1 bg-brand-dark text-white rounded-lg text-[9px] font-black uppercase tracking-wide hover:bg-brand hover:text-gray-900 transition-colors">
                            + {t.addToCart}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button onClick={() => { setShowAiResults(false); setAiQuery(''); setAiProducts([]); setAiMessage(''); }}
                    className="mt-2 text-white/40 hover:text-white/70 text-xs font-medium transition-colors flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {t.aiClear}
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Regular keyword search ── */}
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-900 rounded-2xl border-2 border-transparent focus-within:border-brand transition-all shadow-sm">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
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
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-4">
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
      <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">
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
