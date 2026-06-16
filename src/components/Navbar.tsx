'use client';

import { useState, useRef, useEffect } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import { getSimbaData, getCategories } from '@/lib/data';
import {
  Search, ShoppingCart, MapPin, X, Globe, Menu,
  User, LogOut, ChevronDown, Moon, Sun,
  Store, Settings, Heart, ClipboardList,
  Home, ShoppingBag, HelpCircle, Phone, ChevronRight,
  Grid3x3,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { clsx } from 'clsx';
import { getBranchById } from '@/lib/branches';
import { translateCategory } from '@/lib/translations';

const POPULAR = ['Fresh Milk', 'Bread', 'Cooking Oil', 'Rice', 'Eggs', 'Juice', 'Yogurt', 'Avocado'];

export default function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const {
    language, setLanguage,
    cart, searchQuery, setSearchQuery,
    pickupBranchId, setPickupBranchModalOpen,
    setActiveTab, user, logout, setCartOpen,
    setSelectedCategory, isDarkMode, toggleDarkMode,
    setShopNowOpen, goHome,
  } = useSimbaStore();

  const t = translations[language];
  const cartCount = cart.reduce((a, i) => a + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const selectedBranch = getBranchById(pickupBranchId);
  const categories = getCategories();

  const [focused,     setFocused]     = useState(false);
  const [results,     setResults]     = useState<ReturnType<typeof getSimbaData>['products']>([]);
  const [aiLoading,   setAiLoading]   = useState(false);
  const [aiMessage,   setAiMessage]   = useState('');
  const [langOpen,    setLangOpen]    = useState(false);
  const [loginOpen,   setLoginOpen]   = useState(false);
  const [catOpen,     setCatOpen]     = useState(false);

  const searchRef   = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLInputElement>(null);
  const langBtnRef  = useRef<HTMLButtonElement>(null);
  const loginBtnRef = useRef<HTMLDivElement>(null);
  const catBtnRef   = useRef<HTMLButtonElement>(null);

  const [langPos,   setLangPos]   = useState({ top: 0, right: 0 });
  const [loginPos,  setLoginPos]  = useState({ top: 0, right: 0 });
  const [catPos,    setCatPos]    = useState({ top: 0, left: 0 });
  const [searchPos, setSearchPos] = useState({ top: 0, left: 0, width: 0 });

  const openLang = () => {
    if (langBtnRef.current) {
      const r = langBtnRef.current.getBoundingClientRect();
      setLangPos({ top: r.bottom + 2, right: window.innerWidth - r.right });
    }
    setLangOpen(o => !o);
    setLoginOpen(false);
    setCatOpen(false);
  };

  const openLogin = () => {
    if (loginBtnRef.current) {
      const r = loginBtnRef.current.getBoundingClientRect();
      setLoginPos({ top: r.bottom + 2, right: window.innerWidth - r.right });
    }
    setLoginOpen(o => !o);
    setLangOpen(false);
    setCatOpen(false);
  };

  const openCat = () => {
    if (catBtnRef.current) {
      const r = catBtnRef.current.getBoundingClientRect();
      setCatPos({ top: r.bottom + 2, left: r.left });
    }
    setCatOpen(o => !o);
    setLangOpen(false);
    setLoginOpen(false);
  };

  const openSearch = () => {
    if (searchRef.current) {
      const r = searchRef.current.getBoundingClientRect();
      setSearchPos({ top: r.bottom + 2, left: r.left, width: r.width });
    }
    setFocused(true);
  };

  useEffect(() => {
    if (!focused) return;
    const update = () => {
      if (searchRef.current) {
        const r = searchRef.current.getBoundingClientRect();
        setSearchPos({ top: r.bottom + 2, left: r.left, width: r.width });
      }
    };
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [focused]);

  useEffect(() => {
    if (searchQuery.trim().length < 2) { setResults([]); setAiMessage(''); return; }
    setAiLoading(true);
    setResults([]);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery.trim(), language }),
        });
        const d = await res.json();
        if (d.ok) { setResults(d.products ?? []); setAiMessage(d.message ?? ''); }
      } catch {
        const data = getSimbaData();
        setResults(data.products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 7));
      }
      setAiLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, language]);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const closeAll = () => { setLangOpen(false); setLoginOpen(false); setCatOpen(false); };

  const L = (en: string, fr: string, rw: string) =>
    language === 'fr' ? fr : language === 'rw' ? rw : en;

  return (
    <>
      <div className="sticky top-0 z-50">

        {/* ── UTILITY BAR: FAQ · Contact · About · Language ── */}
        <div className="bg-brand-dark border-b border-white/10 hidden sm:block">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-end h-8 gap-4">
              {/* Right: page links */}
              <div className="flex items-center">
                <Link href="/about"
                  className="px-3 py-1 text-[11px] font-semibold text-white/70 hover:text-white transition-colors whitespace-nowrap">
                  {L('About Us', 'À propos', 'Ibyerekeye twe')}
                </Link>
                <Link href="/faq"
                  className="px-3 py-1 text-[11px] font-semibold text-white/70 hover:text-white transition-colors whitespace-nowrap flex items-center gap-1">
                  <HelpCircle className="w-3 h-3" /> FAQ
                </Link>
                <Link href="/contact"
                  className="px-3 py-1 text-[11px] font-semibold text-white/70 hover:text-white transition-colors whitespace-nowrap flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {L('Contact', 'Contact', 'Twandikire')}
                </Link>
              </div>
              {/* Right: language select switcher */}
              <div className="flex items-center gap-1 border-l border-white/10 pl-4 h-full">
                <Globe className="w-3 h-3 text-white/50 mr-1" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="bg-transparent text-[11px] font-bold text-white outline-none cursor-pointer hover:text-white/80 transition-colors appearance-none"
                >
                  <option value="en" className="text-gray-900 font-bold">EN</option>
                  <option value="fr" className="text-gray-900 font-bold">FR</option>
                  <option value="rw" className="text-gray-900 font-bold">RW</option>
                </select>
                <ChevronDown className="w-2.5 h-2.5 text-white/50 ml-0.5" />
              </div>
            </div>
          </div>
        </div>

        {/* ── MAIN BAR: Logo + Branch + Search + Cart ── */}
        <div className="bg-[#FF6600] shadow-md">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-3 h-14">

              {/* Logo */}
              <Link
                href="/"
                onClick={() => goHome()}
                className="flex items-center gap-2 flex-shrink-0"
              >
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
                  <Image src="/simba-icon.png" alt="Simba" width={32} height={32} className="object-contain" />
                </div>
                <div className="hidden lg:block leading-none">
                  <p className="font-black text-white text-[13px] leading-none">Simba Supermarket</p>
                  <p className="text-white/70 text-[10px] leading-none mt-0.5">Online Shopping · Kigali</p>
                </div>
              </Link>

              {/* Branch selector */}
              <button
                onClick={() => setPickupBranchModalOpen(true)}
                className="hidden sm:flex flex-col items-start px-2.5 py-1 bg-white/15 hover:bg-white/25 rounded-lg transition-colors flex-shrink-0 min-w-[120px] max-w-[175px]"
              >
                <span className="text-white/60 text-[9px] font-bold uppercase leading-none">{t.pickUpAt}</span>
                <span className="text-white text-[11px] font-black leading-tight mt-0.5 truncate w-full flex items-center gap-1">
                  {selectedBranch?.name.replace('Simba Supermarket ', '') ?? t.selectBranchShort}
                  <ChevronDown className="w-2.5 h-2.5 flex-shrink-0" />
                </span>
              </button>

              {/* Search bar — full width pill */}
              <div ref={searchRef} className="flex-1 min-w-0">
                <div className={clsx(
                  'flex items-center rounded-full bg-white overflow-hidden h-10 transition-all',
                  focused ? 'ring-2 ring-white/60 shadow-lg' : ''
                )}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onFocus={openSearch}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && setFocused(false)}
                    placeholder={L('Search products...', 'Rechercher des produits...', 'Shakisha ibicuruzwa...')}
                    className="flex-1 min-w-0 bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400 font-medium px-4"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="px-2 flex items-center hover:bg-gray-100">
                      <X className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  )}
                  <button
                    onClick={() => setFocused(false)}
                    className="h-full px-4 bg-brand-dark hover:bg-gray-800 flex items-center justify-center transition-colors flex-shrink-0 rounded-r-full"
                    aria-label="Search"
                  >
                    <Search className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* ── Right side: dark mode + account + cart ── */}
              <div className="flex items-center gap-1 flex-shrink-0">

                {/* Dark mode */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode
                    ? <Sun className="w-5 h-5 text-white" />
                    : <Moon className="w-5 h-5 text-white" />
                  }
                </button>

                {/* Account / Sign in */}
                <div ref={loginBtnRef}>
                  {user ? (
                    <button
                      onClick={openLogin}
                      className="flex flex-col items-center px-2 py-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center font-black text-brand text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden sm:block text-[9px] text-white/70 mt-0.5 max-w-[52px] truncate leading-none">
                        {user.name.split(' ')[0]}
                      </span>
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className="flex flex-col items-center px-2 py-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <User className="w-5 h-5 text-white" />
                      <span className="hidden sm:block text-[9px] text-white/70 mt-0.5 leading-none">
                        {language === 'fr' ? 'Compte' : language === 'rw' ? 'Konti' : 'Sign in'}
                      </span>
                    </Link>
                  )}
                </div>

                {/* Cart */}
                <button
                  onClick={() => setCartOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/10 rounded-lg transition-colors ml-1"
                >
                  <div className="relative flex-shrink-0">
                    <ShoppingCart className="w-6 h-6 text-white" />
                    {cartCount > 0 && (
                      <motion.span
                        key={cartCount}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-1.5 w-5 h-5 bg-yellow-400 text-gray-900 text-[10px] font-black rounded-full flex items-center justify-center"
                      >
                        {cartCount > 9 ? '9+' : cartCount}
                      </motion.span>
                    )}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-[9px] text-white/60 leading-none">
                      {cartCount === 0
                        ? L('Empty', 'Vide', 'Ubusa')
                        : `${cartCount} ${cartCount === 1 ? t.item : t.items}`}
                    </p>
                    <p className="text-sm font-black text-white leading-tight">
                      {cartCount > 0 ? `${cartTotal.toLocaleString()} RWF` : t.cart}
                    </p>
                  </div>
                </button>

                {/* Mobile hamburger */}
                {onMenuClick && (
                  <button
                    onClick={onMenuClick}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors sm:hidden"
                    aria-label="Menu"
                  >
                    <Menu className="w-5 h-5 text-white" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Secondary nav: Categories drawer + quick links ── */}
          <div className="bg-[#E05500] border-t border-white/10 hidden md:block">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
              <div className="flex items-center">

                {/* Browse Categories */}
                <button
                  onClick={onMenuClick}
                  className="flex items-center gap-2 px-4 py-2.5 text-white font-black text-xs bg-white/15 hover:bg-white/25 transition-colors flex-shrink-0 whitespace-nowrap border-r border-white/15"
                >
                  <Grid3x3 className="w-3.5 h-3.5" />
                  {L('Browse Categories', 'Parcourir les rayons', 'Reba Ibyiciro')}
                </button>

                {/* Home */}
                <button
                  onClick={() => goHome()}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-white/90 hover:text-white hover:bg-white/10 transition-colors text-xs font-semibold whitespace-nowrap"
                >
                  <Home className="w-3.5 h-3.5" />
                  {L('Home', 'Accueil', 'Ahabanza')}
                </button>

                {/* Shop */}
                <button
                  onClick={() => setShopNowOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-white/90 hover:text-white hover:bg-white/10 transition-colors text-xs font-semibold whitespace-nowrap"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  {L('Shop', 'Boutique', 'Kugura')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FIXED DROPDOWNS ── */}

      {/* Browse Categories megadropdown */}
      <AnimatePresence>
        {catOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={closeAll} />
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              style={{ position: 'fixed', top: catPos.top, left: catPos.left, zIndex: 9999, minWidth: 280, maxWidth: 380 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {L('Browse Categories', 'Parcourir les rayons', 'Reba Ibyiciro')}
                </p>
              </div>
              <div className="py-1 max-h-80 overflow-y-auto">
                {categories.map(cat => {
                  const label = translateCategory(cat, language);
                  return (
                    <button
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); setActiveTab('home'); closeAll(); }}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-brand-muted dark:hover:bg-brand/10 hover:text-brand-dark dark:hover:text-brand transition-colors"
                    >
                      <span>{label}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
              {/* Quick links at bottom */}
              <div className="border-t border-gray-100 dark:border-gray-800 p-3 flex flex-wrap gap-2">
                {[
                  { label: L('All Products', 'Tous les produits', 'Ibicuruzwa byose'), action: () => { setActiveTab('search'); closeAll(); } },
                  { label: 'FAQ', action: () => closeAll() },
                  { label: L('About', 'À propos', 'Ibyerekeye'), action: () => closeAll() },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-full hover:bg-brand hover:text-white transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search dropdown */}
      <AnimatePresence>
        {focused && (
          <motion.div
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            style={{ position: 'fixed', top: searchPos.top, left: searchPos.left, width: searchPos.width, zIndex: 9999 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
          >
            {aiLoading ? (
              <div className="px-4 py-4 flex items-center gap-3">
                <div className="flex gap-1">
                  {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
                </div>
                <p className="text-xs text-gray-400">{t.aiSearching}</p>
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="px-4 pt-3 pb-1 flex items-center gap-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex-1">{t.searchResults}</p>
                  {aiMessage && <span className="text-[9px] px-2 py-0.5 bg-brand/10 text-brand-dark rounded-full font-black">AI</span>}
                </div>
                {aiMessage && <p className="px-4 pb-2 text-xs text-gray-600 dark:text-gray-400">{aiMessage}</p>}
                {results.map(p => (
                  <button key={p.id} onMouseDown={() => { setSearchQuery(p.name); setFocused(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                      <Image src={p.image} alt={p.name} fill className="object-cover" sizes="40px" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.category}</p>
                    </div>
                    <span className="text-sm font-black text-brand-dark flex-shrink-0">{p.price.toLocaleString()} RWF</span>
                  </button>
                ))}
              </>
            ) : searchQuery.length < 2 ? (
              <div className="p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">{t.popularSearches}</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR.map(s => (
                    <button key={s} onMouseDown={() => { setSearchQuery(s); setFocused(false); }}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-bold hover:bg-brand hover:text-white transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="px-4 py-6 text-center text-sm text-gray-400">{t.noResultsFor} &quot;{searchQuery}&quot;</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Language dropdown */}
      <AnimatePresence>
        {langOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={closeAll} />
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
              style={{ position: 'fixed', top: langPos.top, right: langPos.right, zIndex: 9999 }}
              className="w-44 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden py-1">
              {([
                { code: 'en' as const, label: 'English' },
                { code: 'fr' as const, label: 'Français' },
                { code: 'rw' as const, label: 'Kinyarwanda' },
              ]).map(l => (
                <button key={l.code} onClick={() => { setLanguage(l.code); closeAll(); }}
                  className={clsx('w-full text-left px-4 py-3 text-sm font-bold transition-colors flex items-center justify-between',
                    language === l.code
                      ? 'text-brand-dark bg-brand-muted dark:bg-brand/10'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800')}>
                  {l.label}
                  {language === l.code && <span className="text-[10px] font-black text-brand-dark">✓</span>}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Account dropdown */}
      <AnimatePresence>
        {loginOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={closeAll} />
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
              style={{ position: 'fixed', top: loginPos.top, right: loginPos.right, zIndex: 9999 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              {user ? (
                <div className="w-52 py-1">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <p className="font-black text-sm text-gray-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <button onClick={() => { setActiveTab('account'); closeAll(); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <User className="w-4 h-4" /> {t.myAccount}
                  </button>
                  <button onClick={() => { setActiveTab('orders'); closeAll(); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <ClipboardList className="w-4 h-4" /> {t.myOrders}
                  </button>
                  <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                    <button onClick={() => { logout(); closeAll(); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <LogOut className="w-4 h-4" /> {t.signOut}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-56 p-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2 py-1.5">
                    {L('My Account', 'Mon compte', 'Konti yanjye')}
                  </p>
                  {[
                    { href: '/customer', icon: ShoppingBag, label: L('Customer', 'Client', 'Umukiriya'),    sub: L('Order and track', 'Commander et suivre', 'Gutumiza no gukurikirana') },
                    { href: '/branch',   icon: Store,       label: L('Branch Staff', 'Personnel agence', "Abakozi b'ishami"), sub: L('Manage orders', 'Gérer les commandes', 'Gucunga itumiziwa') },
                    { href: '/admin',    icon: Settings,    label: 'Admin',                                  sub: L('Full access', 'Accès complet', 'Uburenganzira bwose') },
                  ].map(item => (
                    <Link key={item.href} href={item.href} onClick={closeAll}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="w-8 h-8 bg-brand-muted rounded-xl flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 text-brand" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-sm text-gray-900 dark:text-white">{item.label}</p>
                        <p className="text-[10px] text-gray-400 truncate">{item.sub}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
