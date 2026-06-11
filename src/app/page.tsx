'use client';

import { useMemo, useState } from 'react';
import { getSimbaData, getCategories } from '@/lib/data';
import Navbar from '@/components/Navbar';
import CategorySidebar from '@/components/CategorySidebar';
import CategoryGrid from '@/components/CategoryGrid';
import ProductGrid from '@/components/ProductGrid';
import ProductCard from '@/components/ProductCard';
import CartDrawer from '@/components/CartDrawer';
import BottomNav from '@/components/BottomNav';
import AddressModal from '@/components/AddressModal';
import FavoritesTab from '@/components/tabs/FavoritesTab';
import OrdersTab from '@/components/tabs/OrdersTab';
import AccountTab from '@/components/tabs/AccountTab';
import SearchTab from '@/components/tabs/SearchTab';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import BranchMapModal from '@/components/BranchMapModal';
import ShopNowPanel from '@/components/ShopNowPanel';
import FlashSalesBanner from '@/components/FlashSalesBanner';
import BuyItAgain from '@/components/BuyItAgain';
import TrendingProducts from '@/components/TrendingProducts';
import DealsOfTheDay from '@/components/DealsOfTheDay';
import ScrollReveal, { StaggerReveal, StaggerItem } from '@/components/ScrollReveal';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import {
  ArrowLeft, X,
  Store as StoreIcon, CreditCard, CheckCircle2 as CheckIcon, ShoppingBag as CartIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { SimbaData } from '@/types';
import { SIMBA_BRANCHES, SimbaBranch } from '@/lib/branches';

// ── How it works ─────────────────────────────────────────────────────────────
function HowItWorksSection() {
  const { language } = useSimbaStore();
  const t = translations[language];
  const steps = [
    { icon: CartIcon,   title: t.stepBrowse,     desc: t.stepBrowseDesc },
    { icon: StoreIcon,  title: t.stepPickBranch, desc: t.stepPickBranchDesc },
    { icon: CreditCard, title: t.stepPayDeposit, desc: t.stepPayDepositDesc },
    { icon: CheckIcon,  title: t.stepPickUp,     desc: t.stepPickUpDesc },
  ];
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
      <h3 className="font-black text-gray-900 dark:text-white text-lg mb-6">{t.howItWorks}</h3>
      <StaggerReveal className="grid grid-cols-2 sm:grid-cols-4 gap-4" staggerDelay={0.08}>
        {steps.map((step, i) => (
          <StaggerItem key={i} direction="up">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-brand-muted rounded-2xl flex items-center justify-center mb-3">
                <step.icon className="w-6 h-6 text-brand" />
              </div>
              <p className="font-black text-sm text-gray-900 dark:text-white mb-1">{step.title}</p>
              <p className="text-xs text-gray-400 leading-snug">{step.desc}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerReveal>
    </div>
  );
}

// ── Recently Viewed ──────────────────────────────────────────────────────────
function RecentlyViewedSection({ data }: { data: SimbaData }) {
  const { recentlyViewed, addToCart, cart, updateQuantity, language } = useSimbaStore();
  const t = translations[language];
  if (recentlyViewed.length === 0) return null;
  const products = recentlyViewed
    .map(id => data.products.find(p => p.id === id))
    .filter(Boolean) as SimbaData['products'];
  if (products.length === 0) return null;
  return (
    <section>
      <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">{t.recentlyViewed}</h2>
      <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {products.slice(0, 8).map(p => {
          const qty = cart.find(i => i.id === p.id)?.quantity ?? 0;
          return (
            <div key={p.id} className="flex-shrink-0 w-36 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow">
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

// ── Main ──────────────────────────────────────────────────────────────────────
const BRANCHES = SIMBA_BRANCHES;

export default function Home() {
  const data       = useMemo(() => getSimbaData(), []);
  const categories = useMemo(() => getCategories(),  []);

  const {
    language, isCartOpen, setCartOpen,
    activeTab, setActiveTab, goHome,
    selectedCategory, setSelectedCategory,
    searchQuery,
    cart, isShopNowOpen, setShopNowOpen,
  } = useSimbaStore();

  const t = translations[language];
  const cartCount = cart.reduce((a, i) => a + i.quantity, 0);

  const [sidebarOpen, setSidebarOpen]         = useState(false);
  const [selectedBranchMap, setSelectedBranchMap] = useState<SimbaBranch | null>(null);

  const categoryProducts = useMemo(() =>
    selectedCategory ? data.products.filter(p => p.category === selectedCategory) : [],
    [data.products, selectedCategory]
  );

  const showProducts = !!selectedCategory || !!searchQuery.trim();

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setSidebarOpen(false);
    setShopNowOpen(false);
    setActiveTab('home');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── NAVBAR + SECONDARY CATEGORY BAR ── */}
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      <AnimatePresence mode="wait">

        {activeTab === 'search' && (
          <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SearchTab />
          </motion.div>
        )}
        {activeTab === 'favorites' && (
          <motion.div key="favorites" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <FavoritesTab />
          </motion.div>
        )}
        {activeTab === 'orders' && (
          <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <OrdersTab />
          </motion.div>
        )}
        {activeTab === 'account' && (
          <motion.div key="account" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AccountTab />
          </motion.div>
        )}

        {activeTab === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

            {showProducts ? (
              /* ── PRODUCT / SEARCH VIEW ── */
              <motion.div key="products" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-[6.5rem] z-30">
                  <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
                    <button onClick={() => setSelectedCategory(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl flex-shrink-0">
                      <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <h1 className="font-black text-gray-900 dark:text-white truncate">
                        {selectedCategory ?? `"${searchQuery}"`}
                      </h1>
                      <p className="text-xs text-gray-400">
                        {selectedCategory ? `${categoryProducts.length} ${t.items}` : t.results}
                      </p>
                    </div>
                    {selectedCategory && (
                      <button onClick={() => setSelectedCategory(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-w-screen-xl mx-auto flex">
                  <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-[10rem] h-[calc(100vh-10rem)] overflow-y-auto border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
                    <CategorySidebar categories={categories} onSelect={handleCategorySelect} />
                  </aside>
                  <main className="flex-1 min-w-0 px-4 sm:px-6 py-5 pb-24 sm:pb-8">
                    <ProductGrid products={selectedCategory ? categoryProducts : data.products} />
                  </main>
                </div>
              </motion.div>

            ) : (
              /* ── HOME LANDING ── */
              <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                {/* 1. HERO BANNER — full width,*/}
                <HeroSection onShopNow={() => setShopNowOpen(true)} />

                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-10 space-y-8">

                  {/* Flash Deals — title left, no "View all" (Flash Deals button leads to shop) */}
                  <section>
                    <div className="flex items-end justify-between mb-3">
                      <div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white leading-none">
                          {language === 'fr' ? 'Offres flash' : language === 'rw' ? 'Ibiciro byihuse' : 'Flash Deals'}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          {language === 'fr' ? 'Jusqu\'à 25% de réduction' : language === 'rw' ? 'Kugeza 25% igabanywa' : 'Up to 25% off'}
                        </p>
                      </div>
                    </div>
                    <FlashSalesBanner />
                  </section>

                  {/* 3. SHOP BY CATEGORY */}
                  <ScrollReveal direction="up">
                    <section>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white">{t.shopByCategory}</h2>
                        <button onClick={() => setSidebarOpen(true)} className="text-xs font-black text-brand-dark dark:text-brand hover:underline">
                          {t.viewAll} →
                        </button>
                      </div>
                      <CategoryGrid categories={categories} onSelect={handleCategorySelect} />
                    </section>
                  </ScrollReveal>

                  {/* 4. BUY IT AGAIN — for returning customers */}
                  <BuyItAgain />

                  {/* 5. POPULAR PRODUCTS */}
                  <ScrollReveal direction="up">
                    <section>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-xl font-black text-gray-900 dark:text-white">
                            {language === 'fr' ? 'Produits populaires' : language === 'rw' ? 'Ibicuruzwa bikunzwe' : 'Popular Products'}
                          </h2>
                          <p className="text-sm text-gray-400 mt-0.5">
                            {language === 'fr' ? 'Les plus vendus cette semaine' : language === 'rw' ? 'Ibyaguriwe kenshi' : 'Best sellers this week'}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
                        {data.products.filter(p => p.inStock).slice(0, 10).map((p, i) => (
                          <ProductCard key={p.id} product={p} index={i} />
                        ))}
                      </div>
                    </section>
                  </ScrollReveal>

                  {/* 6. TRENDING NOW */}
                  <ScrollReveal direction="up">
                    <TrendingProducts />
                  </ScrollReveal>

                  {/* 7. RECENTLY VIEWED */}
                  <ScrollReveal direction="up">
                    <RecentlyViewedSection data={data} />
                  </ScrollReveal>

                  {/* 8. DEALS OF THE DAY — countdown timer */}
                  <ScrollReveal direction="up">
                    <DealsOfTheDay />
                  </ScrollReveal>

                  {/* 9. HOW IT WORKS */}
                  <ScrollReveal direction="up">
                    <HowItWorksSection />
                  </ScrollReveal>

                  {/* 10. BRANCHES */}
                  <ScrollReveal direction="up">
                    <section>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-xl font-black text-gray-900 dark:text-white">{t.branches}</h2>
                          <p className="text-sm text-gray-400 mt-0.5">{t.branchesDesc}</p>
                        </div>
                        <Link href="/about" className="text-xs font-black text-brand-dark dark:text-brand hover:underline">
                          {language === 'fr' ? 'Voir tout' : language === 'rw' ? 'Reba byose' : 'View all'} →
                        </Link>
                      </div>
                      <div className="w-full h-56 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 relative mb-4">
                        <iframe
                          src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d31898.5!2d30.0588!3d-1.9441!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2srw!4v1713530000000!5m2!1sen!2srw"
                          className="w-full h-full" style={{ border: 0 }}
                          allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                          title="Simba Supermarket Kigali"
                        />
                        <div className="absolute bottom-3 right-3 bg-white/95 dark:bg-gray-900/95 px-3 py-2 rounded-xl shadow-lg border dark:border-gray-700">
                          <p className="text-[10px] font-black text-red-600 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                            {BRANCHES.length} {t.activePickupBranches}
                          </p>
                        </div>
                      </div>
                      <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2" staggerDelay={0.04}>
                        {BRANCHES.map((b, i) => (
                          <StaggerItem key={b.id} direction="up">
                            <button
                              onClick={() => setSelectedBranchMap(b)}
                              className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-brand/40 hover:shadow-sm transition-all text-left w-full"
                            >
                              <div className="w-8 h-8 bg-brand/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-brand font-black text-xs">{i + 1}</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{b.name}</p>
                                <p className="text-xs text-gray-400 truncate">{b.area}</p>
                              </div>
                              <span className="text-[10px] font-black text-brand-dark dark:text-brand bg-brand/10 px-2 py-1 rounded-lg flex-shrink-0">
                                {language === 'fr' ? 'Voir' : language === 'rw' ? 'Reba' : 'View'}
                              </span>
                            </button>
                          </StaggerItem>
                        ))}
                      </StaggerReveal>
                    </section>
                  </ScrollReveal>

                  {/* 11. FOOTER */}
                  <Footer />

                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category sidebar drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80]"
              onClick={() => setSidebarOpen(false)} />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed left-0 top-0 h-full w-72 bg-white dark:bg-gray-950 z-[90] shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="font-black text-gray-900 dark:text-white">{t.categories}</h2>
                <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
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
      <ShopNowPanel isOpen={isShopNowOpen} onClose={() => setShopNowOpen(false)} onCategorySelect={handleCategorySelect} />
    </div>
  );
}
