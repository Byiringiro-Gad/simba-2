'use client';

import { useState, useRef, useEffect } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import { getSimbaData } from '@/lib/data';
import { Search, ShoppingCart, ChevronDown, MapPin, X, Sun, Moon, Languages, Menu, User, LogOut, ChevronRight, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { clsx } from 'clsx';
import { getBranchById } from '@/lib/branches';

const POPULAR = ['Fresh Milk', 'Bread', 'Avocado', 'Cooking Oil', 'Rice', 'Eggs', 'Juice', 'Yogurt'];

export default function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const {
    language, setLanguage, isDarkMode, toggleDarkMode,
    cart, searchQuery, setSearchQuery, setCartOpen,
    pickupBranchId, setPickupBranchModalOpen,
    activeTab, setActiveTab,
    user, setAuthOpen, logout,
  } = useSimbaStore();

  const t = translations[language];
  const cartCount = cart.reduce((a, i) => a + i.quantity, 0);
  const selectedBranch = getBranchById(pickupBranchId);

  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState<ReturnType<typeof getSimbaData>['products']>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchQuery.trim().length < 2) { setResults([]); return; }
    const data = getSimbaData();
    setResults(data.products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 7));
  }, [searchQuery]);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-brand-dark shadow-lg shadow-black/30">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 h-16">

          {/* Logo */}
          <Link href="/" onClick={() => setActiveTab('home')} className="flex items-center gap-2 flex-shrink-0">
            {/* Show only the circular icon — crop the text side out */}
            <div
              className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0"
              style={{ position: 'relative' }}
            >
              <img
                src="/simbaheaderM.png"
                alt="Simba"
                style={{
                  position: 'absolute',
                  height: '100%',
                  width: 'auto',
                  maxWidth: 'none',
                  left: 0,
                  top: 0,
                }}
              />
            </div>
            <span className="hidden sm:block font-black text-xl text-white tracking-tight leading-none">
              SIMBA
              <span className="block text-[10px] font-medium text-white/60 tracking-widest uppercase">Online Supermarket</span>
            </span>
          </Link>

          {/* Menu / categories button */}
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors flex-shrink-0"
              aria-label="Open categories"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
          )}

          {/* Pickup branch selector */}
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

          {/* Search */}
          <div ref={searchRef} className="flex-1 relative">
            <div className={clsx(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white transition-all',
              focused ? 'ring-2 ring-brand' : ''
            )}>
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onFocus={() => setFocused(true)}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400 font-medium"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="p-0.5 hover:bg-gray-100 rounded-full">
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              )}
            </div>

            {/* Dropdown */}
            <AnimatePresence>
              {focused && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                >
                  {results.length > 0 ? (
                    <>
                      <div className="px-4 pt-3 pb-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t.searchResults}</p>
                      </div>
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
                          <span className="text-sm font-black text-brand flex-shrink-0">{p.price.toLocaleString()} RWF</span>
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
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Dark mode */}
            <button onClick={toggleDarkMode} className="p-2 rounded-xl hover:bg-white/10 transition-colors" aria-label="Toggle theme">
              {isDarkMode ? <Sun className="w-5 h-5 text-brand" /> : <Moon className="w-5 h-5 text-white/80" />}
            </button>

            {/* Language */}
            <div className="relative group">
              <button className="p-2 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-1">
                <Languages className="w-4 h-4 text-white/80" />
                <span className="text-xs font-black text-white uppercase">{language}</span>
              </button>
              <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] overflow-hidden py-1">
                {(['en', 'fr', 'rw'] as const).map(lang => (
                  <button key={lang} onClick={() => setLanguage(lang)}
                    className={clsx('w-full text-left px-4 py-2.5 text-sm font-bold transition-colors',
                      language === lang ? 'text-brand bg-brand-muted' : 'text-gray-700 hover:bg-gray-50'
                    )}>
                    {lang === 'en' ? '🇬🇧 English' : lang === 'fr' ? '🇫🇷 Français' : '🇷🇼 Kinyarwanda'}
                  </button>
                ))}
              </div>
            </div>

            {/* User / Login */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                  <div className="w-6 h-6 bg-brand rounded-full flex items-center justify-center font-black text-gray-900 text-xs flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-xs font-bold text-white max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                </button>
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] overflow-hidden py-1">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <p className="font-black text-sm text-gray-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <button onClick={() => setActiveTab('account')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <User className="w-4 h-4" /> {t.myAccount}
                  </button>
                  <button onClick={() => setActiveTab('orders')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <ChevronRight className="w-4 h-4" /> {t.myOrders}
                  </button>
                  <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                    <Link href="/branch/login"
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-brand-dark dark:text-brand hover:bg-brand-muted dark:hover:bg-brand/10 transition-colors">
                      <Store className="w-4 h-4" /> Branch Staff Portal
                    </Link>
                    <button onClick={logout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <LogOut className="w-4 h-4" /> {t.signOut}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white text-xs font-black"
              >
                <User className="w-4 h-4" />
                {t.signIn}
              </button>
            )}

            {/* Cart */}
            <button
              id="cart-icon"
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 px-3 py-2 bg-brand hover:bg-brand-dark text-gray-900 rounded-xl transition-all font-black text-sm ml-1 shadow-brand-md"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:block">{cartCount > 0 ? `${cartCount} item${cartCount > 1 ? 's' : ''}` : t.cart}</span>
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
  );
}


