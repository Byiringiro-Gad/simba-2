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
import Image from 'next/image';
import Link from 'next/link';
import { SimbaData } from '@/types';
import { SIMBA_BRANCHES, SimbaBranch } from '@/lib/branches';
import HeroSection from '@/components/HeroSection';
import BranchMapModal from '@/components/BranchMapModal';
import ShopNowPanel from '@/components/ShopNowPanel';

// ── Why Simba Section — How it works only (stats are in hero) ────────────────
function HowItWorksSection() {
  const { language } = useSimbaStore();
  const t = translations[language];

  const steps = [
    { icon: '🛒', title: t.stepBrowse,      desc: t.stepBrowseDesc },
    { icon: '🏪', title: t.stepPickBranch,  desc: t.stepPickBranchDesc },
    { icon: '💳', title: t.stepPayDeposit,  desc: t.stepPayDepositDesc },
    { icon: '✅', title: t.stepPickUp,      desc: t.stepPickUpDesc },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
      <h3 className="font-black text-gray-900 dark:text-white text-base mb-5">{t.howItWorks}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-brand-muted rounded-2xl flex items-center justify-center text-2xl mb-3">
              {step.icon}
            </div>
            <p className="font-black text-sm text-gray-900 dark:text-white mb-1">{step.title}</p>
            <p className="text-xs text-gray-400 font-medium leading-snug">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Branch locations ─────────────────────────────────────────────────────────
const BRANCHES = SIMBA_BRANCHES;

// ── Recently Viewed Section ───────────────────────────────────────────────────
function RecentlyViewedSection({ data }: { data: SimbaData }) {
  const { recentlyViewed, addToCart, cart, updateQuantity, language } = useSimbaStore();
  const t = translations[language];
  if (recentlyViewed.length === 0) return null;
  const products = recentlyViewed.map(id => data.products.find(p => p.id === id)).filter(Boolean) as SimbaData['products'];
  if (products.length === 0) return null;
  return (
    <section>
      <h2 className="text-base font-black text-gray-900 dark:text-white mb-3">{t.recentlyViewed}</h2>
      <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {products.slice(0, 8).map(p => {
          const qty = cart.find(i => i.id === p.id)?.quantity ?? 0;
          return (
            <div key={p.id} className="flex-shrink-0 w-36 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <Link href={`/products/${p.id}`} className="block relative aspect-square bg-gray-50 dark:bg-gray-800">
                <Image src={p.image} alt={p.name} fill className="object-cover" sizes="144px" />
              </Link>
              <div className="p-2.5">
                <p className="text-[11px] font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight mb-1">{p.name}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black text-gray-900 dark:text-white">{p.price.toLocaleString()} <span className="text-[9px] text-gray-400">RWF</span></p>
                  {qty === 0 ? (
                    <button onClick={() => addToCart(p)} className="w-6 h-6 bg-brand-dark text-white rounded-lg flex items-center justify-center text-xs font-black hover:bg-brand hover:text-gray-900 transition-colors">+</button>
                  ) : (
                    <div className="flex items-center bg-brand-dark rounded-lg overflow-hidden">
                      <button onClick={() => updateQuantity(p.id, qty - 1)} className="w-5 h-6 text-white text-xs flex items-center justify-center hover:bg-black/10">−</button>
                      <span className="text-white text-[10px] font-black w-4 text-center">{qty}</span>
                      <button onClick={() => updateQuantity(p.id, qty + 1)} className="w-5 h-6 text-white text-xs flex items-center justify-center hover:bg-black/10">+</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

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
  // branch map modal
  const [selectedBranchMap, setSelectedBranchMap] = useState<SimbaBranch | null>(null);
  // shop now panel
  const [shopNowOpen, setShopNowOpen] = useState(false);

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
              >
                {/* ── HERO — first thing user sees ── */}
                <HeroSection onShopNow={() => {
                  setShopNowOpen(true);
                }} />

                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 pb-24 sm:pb-10 space-y-8">

                {/* Category grid */}
                <section id="categories-section">
                  <h2 className="text-base font-black text-gray-900 dark:text-white mb-4">
                    {t.shopByCategory}
                  </h2>
                  <CategoryGrid
                    categories={categories}
                    onSelect={handleCategorySelect}
                  />
                </section>

                {/* ── HOW IT WORKS ── */}
                <HowItWorksSection />

                {/* ── Recently Viewed ── */}
                <RecentlyViewedSection data={data} />

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

                  {/* Map — centered on Kigali showing all Simba branches */}
                  <div className="w-full h-64 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 relative mb-4">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m56!1m12!1m3!1d31898.5!2d30.0588!3d-1.9441!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m41!3e0!4m5!1s0x19dca42446b3b0b5%3A0x4e3e3e3e3e3e3e3e!2sKN%204%20Ave%2C%20Kigali!3m2!1d-1.9441!2d30.0588!4m5!1s0x19dca4244!2sKN%205%20Rd%2C%20Kigali!3m2!1d-1.9500!2d30.0601!4m5!1s0x19dca5!2sKG%20541%20St%2C%20Kigali!3m2!1d-1.9380!2d30.0712!4m5!1s0x19dca6!2sKimironko%2C%20Kigali!3m2!1d-1.9270!2d30.1020!4m5!1s0x19dca7!2sKG%20192%20St%2C%20Kigali!3m2!1d-1.9310!2d30.0890!4m5!1s0x19dca8!2sNyamirambo%2C%20Kigali!3m2!1d-1.9780!2d30.0420!5e0!3m2!1sen!2srw!4v1713530000000!5m2!1sen!2srw"
                      className="w-full h-full"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Simba Supermarket Locations"
                    />
                    <div className="absolute bottom-3 right-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg border dark:border-gray-700">
                      <p className="text-[10px] font-black text-red-600 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                        {BRANCHES.length} {t.activePickupBranches}
                      </p>
                    </div>
                  </div>

                  {/* Branch list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {BRANCHES.map((b, i) => (
                      <button
                        key={b.id}
                        onClick={() => setSelectedBranchMap(b)}
                        className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-brand/40 hover:shadow-sm transition-all text-left w-full"
                      >
                        <div className="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-red-500 font-black text-xs">{i + 1}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{b.name}</p>
                          <p className="text-xs text-gray-400 truncate">{b.area}</p>
                        </div>
                        <span className="text-[10px] font-black text-brand-dark dark:text-brand bg-brand/10 px-2 py-1 rounded-lg flex-shrink-0">
                          {language === 'fr' ? 'Voir' : language === 'rw' ? 'Reba' : 'View'}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-gray-100 dark:border-gray-800 pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 relative">
                          <img src="/simbaheaderM.png" alt="Simba" style={{ position: 'absolute', height: '100%', width: 'auto', maxWidth: 'none', left: 0, top: 0 }} />
                        </div>
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
                        {/* Official website */}
                        <a href="https://www.simbaonlineshopping.com" target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-dark text-white text-xs font-bold hover:opacity-80 transition-opacity" title="Official Website">
                          🌐 simbaonlineshopping.com
                        </a>
                      </div>
                      <p className="text-[10px] text-gray-400">{t.copyright}</p>
                    </div>
                  </div>
                </footer>
                </div>{/* end inner wrapper */}
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
      <BranchMapModal branch={selectedBranchMap} onClose={() => setSelectedBranchMap(null)} />
      <ShopNowPanel
        isOpen={shopNowOpen}
        onClose={() => setShopNowOpen(false)}
        onCategorySelect={handleCategorySelect}
      />
    </div>
  );
}
