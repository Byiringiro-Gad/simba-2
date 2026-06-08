'use client';

import { useState, useRef, useEffect } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import { getSimbaData } from '@/lib/data';
import { Search, ShoppingCart, MapPin, X, Globe, Menu, User, LogOut, ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { clsx } from 'clsx';
import { getBranchById } from '@/lib/branches';

const POPULAR = ['Fresh Milk', 'Bread', 'Avocado', 'Cooking Oil', 'Rice', 'Eggs', 'Juice', 'Yogurt'];

export default function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const {
    language, setLanguage,
    cart, searchQuery, setSearchQuery,
    pickupBranchId, setPickupBranchModalOpen,
    setActiveTab,
    user, logout, setCartOpen,
  } = useSimbaStore();

  const t = translations[language];
  const cartCount = cart.reduce((a, i) => a + i.quantity, 0);
  const selectedBranch = getBranchById(pickupBranchId);

  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState<ReturnType<typeof getSimbaData>['products']>([]);
  const [langOpen, setLangOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const langBtnRef = useRef<HTMLButtonElement>(null);
  const loginBtnRef = useRef<HTMLDivElement>(null);

  const [aiMessage, setAiMessage] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Position state for fixed dropdowns
  const [langPos, setLangPos] = useState({ top: 0, right: 0 });
  const [loginPos, setLoginPos] = useState({ top: 0, right: 0 });
  const [searchPos, setSearchPos] = useState({ top: 0, left: 0, width: 0 });

  // Update dropdown positions when opened
  const openLang = () => {
    if (langBtnRef.current) {
      const r = langBtnRef.current.getBoundingClientRect();
      setLangPos({ top: r.bottom + 4, right: window.innerWidth - r.right });
    }
    setLangOpen(o => !o);
    setLoginOpen(false);
  };

  const openLogin = () => {
    if (loginBtnRef.current) {
      const r = loginBtnRef.current.getBoundingClientRect();
      setLoginPos({ top: r.bottom + 4, right: window.innerWidth - r.right });
    }
    setLoginOpen(o => !o);
    setLangOpen(false);
  };

  const openSearch = () => {
    if (searchRef.current) {
      const r = searchRef.current.getBoundingClientRect();
      setSearchPos({ top: r.bottom + 4, left: r.left, width: r.width });
    }
    setFocused(true);
  };

  // Recalculate search dropdown position on resize
  useEffect(() => {
    if (!focused) return;
    const update = () => {
      if (searchRef.current) {
        const r = searchRef.current.getBoundingClientRect();
        setSearchPos({ top: r.bottom + 4, left: r.left, width: r.width });
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
        if (d.ok) {
          setResults(d.products ?? []);
          setAiMessage(d.message ?? '');
        }
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

  return (
    <>
      <header className="sticky top-0 z-50 bg-brand-dark shadow-lg shadow-black/30">
        <div className="max-w-screen-xl mx-auto px-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3 h-16 w-full">

            {/* Logo */}
            <Link href="/" onClick={() => setActiveTab('home')} className="flex items-center gap-2 flex-shrink-0">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0" style={{ position: 'relative' }}>
                <img
                  src="/simbaheaderM.png"
                  alt="Simba"
                  style={{ position: 'absolute', height: '100%', width: 'auto', maxWidth: 'none', left: 0, top: 0 }}
                />
              </div>
              <span className="hidden sm:block font-black text-xl text-white tracking-tight leading-none">
                SIMBA
                <span className="block text-[10px] font-medium text-white/60 tracking-widest uppercase">Online Supermarket</span>
              </span>
            </Link>

            {/* Menu button */}
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors flex-shrink-0"
                aria-label="Open categories"
              >
                <Menu className="w-5 h-5 text-white" />
              </button>
            )}

            {/* Pickup branch selector — desktop only */}
            <button
              onClick={() => setPickupBranchModalOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors flex-shrink-0 max-w-[220px]"
            >
              <MapPin className="w-4 h-4 text-brand flex-shrink-0" />
              <div className="text-left min-w-0">
                <p className="text-[9px] text-white/60 font-bold uppercase tracking-wider leading-none mb-0.5">{t.pickUpAt}</p>
                <p className="text-xs text-white font-bold truncate leading-none">
                  {selectedBranch?.name ?? t.selectBranchShort}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-white/60 flex-shrink-0" />
            </button>

            {/* Search bar */}
            <div ref={searchRef} className="flex-1 min-w-0">
              <div className={clsx(
                'flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl bg-white transition-all w-full',
                focused ? 'ring-2 ring-brand' : ''
              )}>
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onFocus={openSearch}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={language === 'fr' ? '🤖 Recherche IA' : language === 'rw' ? '🤖 Shakisha na AI' : '🤖 AI Search'}
                  className="flex-1 min-w-0 bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400 font-medium"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="p-0.5 hover:bg-gray-100 rounded-full flex-shrink-0">
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">

              {/* Language */}
              <button
                ref={langBtnRef}
                onClick={openLang}
                className="flex items-center gap-1 p-2 rounded-xl hover:bg-white/10 transition-colors"
                title="Change language"
              >
                <Globe className="w-5 h-5 text-white/80" />
                <span className="hidden sm:block text-[10px] font-black text-white/60 uppercase">{language}</span>
              </button>

              {/* Login / User */}
              <div ref={loginBtnRef}>
                {user ? (
                  <button
                    onClick={openLogin}
                    className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <div className="w-7 h-7 bg-brand rounded-full flex items-center justify-center font-black text-gray-900 text-sm flex-shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-xs font-bold text-white max-w-[70px] truncate">{user.name.split(' ')[0]}</span>
                  </button>
                ) : (
                  <button
                    onClick={openLogin}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white text-xs font-black"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:block">{t.signIn}</span>
                  </button>
                )}
              </div>

              {/* Cart */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative flex items-center gap-2 px-3 py-2.5 bg-brand hover:bg-brand-dark text-gray-900 rounded-xl transition-all font-black text-sm min-h-[44px]"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="hidden sm:block">
                  {cartCount > 0 ? `${cartCount} item${cartCount > 1 ? 's' : ''}` : t.cart}
                </span>
                {cartCount > 0 && (
                  <span className="sm:hidden absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-brand">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Fixed dropdowns — rendered outside header so never clipped ── */}

      {/* Search dropdown */}
      <AnimatePresence>
        {focused && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            style={{ position: 'fixed', top: searchPos.top, left: searchPos.left, width: searchPos.width, zIndex: 9999 }}
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
          >
            {aiLoading ? (
              <div className="px-4 py-4 flex items-center gap-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <p className="text-xs text-gray-400 font-medium">{t.aiSearching}</p>
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="px-4 pt-3 pb-1 flex items-center gap-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex-1">{t.searchResults}</p>
                  {aiMessage && <span className="text-[9px] px-2 py-0.5 bg-brand/10 text-brand-dark rounded-full font-black">AI</span>}
                </div>
                {aiMessage && (
                  <div className="px-4 pb-2">
                    <p className="text-xs text-gray-600 font-medium leading-snug">{aiMessage}</p>
                  </div>
                )}
                {results.map(p => (
                  <button
                    key={p.id}
                    onMouseDown={() => { setSearchQuery(p.name); setFocused(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image src={p.image} alt={p.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{p.name}</p>
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
                      className="px-3 py-1.5 bg-brand-muted text-brand rounded-full text-xs font-bold hover:bg-brand hover:text-white transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-gray-400">{t.noResultsFor} &quot;{searchQuery}&quot;</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Language dropdown */}
      <AnimatePresence>
        {langOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
              onClick={() => setLangOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
              style={{ position: 'fixed', top: langPos.top, right: langPos.right, zIndex: 9999 }}
              className="w-44 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden py-1"
            >
              {[
                { code: 'en' as const, flag: '🇬🇧', label: 'English' },
                { code: 'fr' as const, flag: '🇫🇷', label: 'Français' },
                { code: 'rw' as const, flag: '🇷🇼', label: 'Kinyarwanda' },
              ].map(lang => (
                <button key={lang.code} onClick={() => { setLanguage(lang.code); setLangOpen(false); }}
                  className={clsx('w-full text-left px-4 py-3 text-sm font-bold transition-colors flex items-center gap-2',
                    language === lang.code
                      ? 'text-brand-dark bg-brand-muted dark:bg-brand/10'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  )}>
                  <span>{lang.flag}</span> {lang.label}
                  {language === lang.code && <span className="ml-auto text-[10px] text-brand-dark font-black">✓</span>}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sign in / User dropdown */}
      <AnimatePresence>
        {loginOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
              onClick={() => setLoginOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
              style={{ position: 'fixed', top: loginPos.top, right: loginPos.right, zIndex: 9999 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
            >
              {user ? (
                <div className="w-52 py-1">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <p className="font-black text-sm text-gray-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <button onClick={() => { setActiveTab('account'); setLoginOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <User className="w-4 h-4" /> {t.myAccount}
                  </button>
                  <button onClick={() => { setActiveTab('orders'); setLoginOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <ChevronRight className="w-4 h-4" /> {t.myOrders}
                  </button>
                  <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                    <button onClick={() => { logout(); setLoginOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <LogOut className="w-4 h-4" /> {t.signOut}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-64 p-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2 py-1.5">
                    {language === 'fr' ? 'Choisir un compte' : language === 'rw' ? 'Hitamo konti' : 'Choose account type'}
                  </p>
                  {[
                    { href: '/customer', icon: '🛒', label: language === 'fr' ? 'Client / Acheteur' : language === 'rw' ? 'Umukiriya' : 'Customer / Buyer', sub: language === 'fr' ? 'Commander et suivre vos achats' : language === 'rw' ? 'Gutumiza no gukurikirana' : 'Order and track purchases' },
                    { href: '/branch',   icon: '🏪', label: language === 'fr' ? 'Personnel agence'  : language === 'rw' ? "Abakozi b'ishami" : 'Branch Staff / Manager',  sub: language === 'fr' ? 'Gérer les commandes' : language === 'rw' ? 'Gucunga itumiziwa' : 'Manage branch orders' },
                    { href: '/admin',   icon: '⚙️', label: language === 'fr' ? 'Administrateur'    : language === 'rw' ? 'Umuyobozi' : 'Admin / HQ',                    sub: language === 'fr' ? 'Accès complet' : language === 'rw' ? 'Uburenganzira bwose' : 'Full system access' },
                  ].map(item => (
                    <Link key={item.href} href={item.href} onClick={() => setLoginOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <span className="text-xl flex-shrink-0">{item.icon}</span>
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
