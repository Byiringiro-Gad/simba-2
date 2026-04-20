'use client';

import { useMemo, useState } from 'react';
import { getSimbaData, getCategories } from '@/lib/data';
import Navbar from '@/components/Navbar';
import CategorySidebar from '@/components/CategorySidebar';
import CategoryGrid from '@/components/CategoryGrid';
import ProductGrid from '@/components/ProductGrid';
import PromoBanner from '@/components/PromoBanner';
import CartDrawer from '@/components/CartDrawer';
import BottomNav from '@/components/BottomNav';
import AddressModal from '@/components/AddressModal';
import FavoritesTab from '@/components/tabs/FavoritesTab';
import OrdersTab from '@/components/tabs/OrdersTab';
import AccountTab from '@/components/tabs/AccountTab';
import SearchTab from '@/components/tabs/SearchTab';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import { ArrowLeft, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const data = useMemo(() => getSimbaData(), []);
  const categories = useMemo(() => getCategories(), []);
  const {
    language, isCartOpen, setCartOpen,
    activeTab, selectedCategory, setSelectedCategory, searchQuery,
  } = useSimbaStore();
  const t = translations[language];

  // sidebar drawer state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // products for the selected category
  const categoryProducts = useMemo(() => {
    if (!selectedCategory) return [];
    return data.products.filter(p => p.category === selectedCategory);
  }, [data.products, selectedCategory]);

  // are we showing the product view?
  const showProducts = !!selectedCategory || !!searchQuery.trim();

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setSidebarOpen(false);
  };

  const handleBack = () => {
    setSelectedCategory(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      <AnimatePresence mode="wait">

        {/* ── SEARCH TAB ── */}
        {activeTab === 'search' && (
          <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SearchTab />
          </motion.div>
        )}

        {/* ── FAVORITES TAB ── */}
        {activeTab === 'favorites' && (
          <motion.div key="favorites" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <FavoritesTab />
          </motion.div>
        )}

        {/* ── ORDERS TAB ── */}
        {activeTab === 'orders' && (
          <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <OrdersTab />
          </motion.div>
        )}

        {/* ── ACCOUNT TAB ── */}
        {activeTab === 'account' && (
          <motion.div key="account" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AccountTab />
          </motion.div>
        )}

        {/* ── HOME TAB ── */}
        {activeTab === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

            {/* ── PRODUCT VIEW (category selected or search active) ── */}
            {showProducts ? (
              <motion.div
                key="products"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Product page header */}
                <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-16 z-30">
                  <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
                    <button
                      onClick={handleBack}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors flex-shrink-0"
                    >
                      <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <h1 className="font-black text-gray-900 dark:text-white truncate">
                        {selectedCategory ?? `"${searchQuery}"`}
                      </h1>
                      <p className="text-xs text-gray-400 font-medium">
                        {selectedCategory
                          ? `${categoryProducts.length} ${t.items}`
                          : t.results}
                      </p>
                    </div>
                    {selectedCategory && (
                      <button
                        onClick={handleBack}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Two-column layout: sidebar + grid */}
                <div className="max-w-screen-xl mx-auto flex">
                  {/* Left sidebar — desktop only */}
                  <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-[7.5rem] h-[calc(100vh-7.5rem)] overflow-y-auto border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
                    <CategorySidebar
                      categories={categories}
                      onSelect={handleCategorySelect}
                    />
                  </aside>

                  {/* Products */}
                  <main className="flex-1 min-w-0 px-4 sm:px-6 py-5 pb-24 sm:pb-8">
                    <ProductGrid
                      products={selectedCategory ? categoryProducts : data.products}
                    />
                  </main>
                </div>
              </motion.div>
            ) : (
              /* ── LANDING VIEW (no category selected) ── */
              <motion.div
                key="landing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 pb-24 sm:pb-10 space-y-8"
              >
                {/* Promo banner */}
                <PromoBanner />

                {/* Category grid — Getir style */}
                <section>
                  <h2 className="text-base font-black text-gray-900 dark:text-white mb-4">
                    {t.shopByCategory}
                  </h2>
                  <CategoryGrid
                    categories={categories}
                    onSelect={handleCategorySelect}
                  />
                </section>

                {/* Branches map */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-base font-black text-gray-900 dark:text-white">{t.branches}</h2>
                      <p className="text-xs text-gray-400 mt-0.5">{t.branchesDesc}</p>
                    </div>
                    <span className="px-3 py-1 bg-red-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest">
                      {t.liveBranches}
                    </span>
                  </div>
                  <div className="w-full h-56 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 relative">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d63797.83980155694!2d30.0401!3d-1.95!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1ssimba%20supermarket!5e0!3m2!1sen!2srw!4v1713530000000!5m2!1sen!2srw"
                      className="w-full h-full" style={{ border: 0 }}
                      allowFullScreen loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Simba Supermarket Locations"
                    />
                    <div className="absolute bottom-3 right-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg border dark:border-gray-700">
                      <p className="text-[9px] font-black text-red-600 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                        {t.activeBranches}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-gray-100 dark:border-gray-800 pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 bg-brand rounded-lg flex items-center justify-center font-black text-white text-xs">S</div>
                        <span className="font-black text-gray-900 dark:text-white">SIMBA</span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">{t.aboutSimbaDesc}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{t.contact}</p>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">{t.contactAddress}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">{t.contactEmail}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">{t.contactPhone}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{t.followUs}</p>
                      <div className="flex gap-2 mb-3">
                        {/* Facebook — confirmed active */}
                        <a href="https://www.facebook.com/search/top?q=simba%20supermarket%20rwanda" target="_blank" rel="noopener noreferrer"
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity overflow-hidden bg-[#1877F2]" title="Facebook">
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        </a>
                        {/* Instagram */}
                        <a href="https://www.instagram.com/explore/tags/simbasupermarket/" target="_blank" rel="noopener noreferrer"
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity overflow-hidden bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45]" title="Instagram">
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                        </a>
                        {/* X / Twitter — confirmed active with #SimbaSupermarket */}
                        <a href="https://twitter.com/search?q=%23SimbaSupermarket" target="_blank" rel="noopener noreferrer"
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity overflow-hidden bg-black" title="X (Twitter)">
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </a>
                        {/* WhatsApp */}
                        <a href="https://wa.me/250788000000" target="_blank" rel="noopener noreferrer"
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity overflow-hidden bg-[#25D366]" title="WhatsApp">
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        </a>
                        {/* YouTube */}
                        <a href="https://www.youtube.com/@simbasupermarket" target="_blank" rel="noopener noreferrer"
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity overflow-hidden bg-[#FF0000]" title="YouTube">
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                        </a>
                        {/* TikTok */}
                        <a href="https://www.tiktok.com/search?q=simba+supermarket+rwanda" target="_blank" rel="noopener noreferrer"
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity overflow-hidden bg-black" title="TikTok">
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/></svg>
                        </a>
                      </div>
                      <p className="text-[10px] text-gray-400">{t.copyright}</p>
                    </div>
                  </div>
                </footer>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CATEGORY SIDEBAR DRAWER ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80]"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed left-0 top-0 h-full w-72 bg-white dark:bg-gray-950 z-[90] shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="font-black text-gray-900 dark:text-white">{t.categories}</h2>
                <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <CategorySidebar categories={categories} onSelect={handleCategorySelect} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BottomNav />
      <AddressModal />
      <CartDrawer isOpen={isCartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
