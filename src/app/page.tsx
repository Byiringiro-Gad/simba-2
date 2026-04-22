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

// ── Why Simba Section ─────────────────────────────────────────────────────────
function WhySimbaSection() {
  const { language } = useSimbaStore();
  const t = translations[language];

  const stats = [
    { value: '700+', label: t.freshProductsTitle,   sub: t.freshProductsDesc },
    { value: '45',   label: t.fastDeliveryTitle,     sub: t.fastDeliveryDesc,  unit: 'min' },
    { value: '8',    label: t.branches,              sub: t.branchesDesc },
    { value: '100%', label: t.securePaymentTitle,    sub: t.securePaymentDesc },
  ];

  const steps = [
    { n: '1', icon: '🛒', title: language === 'fr' ? 'Choisissez' : language === 'rw' ? 'Hitamo' : 'Browse',        desc: language === 'fr' ? 'Parcourez 700+ produits' : language === 'rw' ? 'Reba ibicuruzwa 700+' : 'Browse 700+ products across all categories' },
    { n: '2', icon: '💳', title: language === 'fr' ? 'Payez'      : language === 'rw' ? 'Ishura'  : 'Pay',           desc: language === 'fr' ? 'MTN MoMo ou Airtel Money' : language === 'rw' ? 'MTN MoMo cyangwa Airtel Money' : 'Pay securely with MTN MoMo or Airtel Money' },
    { n: '3', icon: '🚴', title: language === 'fr' ? 'Recevez'    : language === 'rw' ? 'Bona'    : 'Receive',       desc: language === 'fr' ? 'Livré en 45 minutes' : language === 'rw' ? 'Gutumizwa mu minota 45' : 'Delivered to your door in 45 minutes' },
  ];

  return (
    <div className="space-y-6">

      {/* Live counter bar */}
      <div className="bg-brand-dark rounded-2xl px-5 py-4 flex items-center justify-between gap-4 overflow-hidden relative">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-brand rounded-full" />
          <div className="absolute -left-4 -bottom-8 w-32 h-32 bg-brand rounded-full" />
        </div>
        <div className="relative flex items-center gap-3">
          <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
          <p className="text-white font-black text-sm">
            {language === 'fr' ? '847 commandes livrées aujourd\'hui à Kigali'
              : language === 'rw' ? 'Itumiziwa 847 ryagezweho uyu munsi i Kigali'
              : '847 orders delivered today across Kigali'}
          </p>
        </div>
        <div className="relative flex-shrink-0 text-right">
          <p className="text-brand font-black text-lg leading-none">4.9 ★</p>
          <p className="text-white/40 text-[10px] font-medium">
            {language === 'fr' ? '2,400 avis' : language === 'rw' ? 'Ibitekerezo 2,400' : '2,400 reviews'}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ value, label, sub, unit }) => (
          <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 text-center">
            <p className="font-black text-2xl text-brand-dark dark:text-brand leading-none">
              {value}{unit && <span className="text-sm ml-0.5">{unit}</span>}
            </p>
            <p className="font-black text-sm text-gray-900 dark:text-white mt-1">{label}</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5 leading-tight">{sub}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
        <h3 className="font-black text-gray-900 dark:text-white text-sm mb-4">
          {language === 'fr' ? 'Comment ça marche' : language === 'rw' ? 'Uburyo bikora' : 'How it works'}
        </h3>
        <div className="flex items-start gap-0">
          {steps.map((step, i) => (
            <div key={step.n} className="flex-1 flex flex-col items-center text-center relative">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="absolute top-5 left-1/2 w-full h-0.5 bg-gray-100 dark:bg-gray-800 z-0" />
              )}
              <div className="relative z-10 w-10 h-10 bg-brand-dark rounded-full flex items-center justify-center text-lg mb-2 shadow-md">
                {step.icon}
              </div>
              <p className="font-black text-sm text-gray-900 dark:text-white">{step.title}</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5 leading-tight px-1">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { name: 'Amina K.',    flag: '🇷🇼', text: language === 'fr' ? 'Livraison en 40 min, incroyable !' : language === 'rw' ? 'Byageze mu minota 40, byatangaje!' : 'Delivered in 40 min, incredible!',       stars: 5 },
          { name: 'Jean P.',     flag: '🇷🇼', text: language === 'fr' ? 'Paiement MoMo très facile.' : language === 'rw' ? 'Kwishura na MoMo byoroshye cyane.' : 'MoMo payment is super easy.',                stars: 5 },
          { name: 'Claire M.',   flag: '🇷🇼', text: language === 'fr' ? 'Meilleur supermarché en ligne !' : language === 'rw' ? 'Isoko nziza cyane kuri interineti!' : 'Best online supermarket in Rwanda!',     stars: 5 },
        ].map(({ name, flag, text, stars }) => (
          <div key={name} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: stars }).map((_, i) => (
                <span key={i} className="text-brand text-xs">★</span>
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed mb-3">"{text}"</p>
            <p className="text-sm font-black text-gray-900 dark:text-white">{flag} {name}</p>
          </div>
        ))}
      </div>

      {/* App download CTA */}
      <div className="bg-gradient-to-r from-brand-dark to-gray-900 rounded-2xl p-7 sm:p-8 flex items-center gap-6">
        <div className="flex-1">
          <p className="font-black text-white text-xl sm:text-2xl leading-tight mb-2">
            {language === 'fr' ? 'Téléchargez l\'app Simba' : language === 'rw' ? 'Pakurura porogaramu ya Simba' : 'Get the Simba App'}
          </p>
          <p className="text-white/60 text-sm font-medium mb-5">
            {language === 'fr' ? 'Commandez encore plus vite, suivez en temps réel' : language === 'rw' ? 'Tumiza vuba kurushaho, kurikirana nzima' : 'Order even faster, track your delivery in real time'}
          </p>
          <div className="flex gap-3">
            <a href="https://play.google.com" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white flex-shrink-0"><path d="M3.18 23.76c.3.17.64.24.99.2l12.6-11.53L13.5 9.2 3.18 23.76zm16.7-10.2L17.1 12l-3.6 3.3 3.6 3.3 2.8-1.6c.8-.46.8-1.68-.02-2.14zM3 .44C2.7.6 2.5.94 2.5 1.38v21.24c0 .44.2.78.5.94L14.7 12 3 .44zm10.5 11.1L3.99.24c-.35-.04-.69.03-.99.2L13.5 12l-.0-.46z"/></svg>
              <span className="text-white text-xs font-black">Google Play</span>
            </a>
            <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white flex-shrink-0"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              <span className="text-white text-xs font-black">App Store</span>
            </a>
          </div>
        </div>
        <div className="text-7xl flex-shrink-0 hidden sm:block">📱</div>
      </div>

    </div>
  );
}

// ── Branch locations ─────────────────────────────────────────────────────────
const BRANCHES = [
  { name: 'City Center (Union Trade)',  address: '1 KN 4 Ave, Kigali' },
  { name: 'KN 5 Rd Branch',            address: 'KN 5 Rd, Kigali' },
  { name: 'KG 541 St Branch',          address: 'KG 541 St, Kigali' },
  { name: 'Kimironko Branch',          address: '342F+3V5, Kimironko, Kigali' },
  { name: 'KG 192 St Branch',          address: 'KG 192 St, Kigali' },
  { name: 'Nyamirambo Branch',         address: '23H4+26V, Kigali' },
  { name: 'KK 35 Ave Branch',          address: 'KK 35 Ave, Kigali' },
  { name: 'Branch 8',                  address: '24G3+MCV, Kigali' },
  { name: 'Branch 9',                  address: '24J3+Q3, Kigali' },
  { name: 'Gisenyi Branch',            address: '8754+P7W, Gisenyi' },
];

// ── Recently Viewed Section ───────────────────────────────────────────────────
function RecentlyViewedSection({ data }: { data: SimbaData }) {
  const { recentlyViewed, addToCart, cart, updateQuantity, language } = useSimbaStore();
  if (recentlyViewed.length === 0) return null;
  const products = recentlyViewed.map(id => data.products.find(p => p.id === id)).filter(Boolean) as SimbaData['products'];
  if (products.length === 0) return null;
  const label = language === 'fr' ? 'Récemment consultés' : language === 'rw' ? 'Byabonwe vuba' : 'Recently Viewed';
  return (
    <section>
      <h2 className="text-base font-black text-gray-900 dark:text-white mb-3">{label}</h2>
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

                {/* ── WHY SIMBA — Stats + Trust + App CTA ── */}
                <WhySimbaSection />

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
                        {t.activeBranches}
                      </p>
                    </div>
                  </div>

                  {/* Branch list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {BRANCHES.map((b, i) => (
                      <a
                        key={i}
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Simba Supermarket ' + b.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-brand/40 hover:shadow-sm transition-all"
                      >
                        <div className="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-red-500 font-black text-xs">{i + 1}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{b.name}</p>
                          <p className="text-xs text-gray-400 truncate">{b.address}</p>
                        </div>
                      </a>
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
