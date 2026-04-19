'use client';

import { useState } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import { Search, ShoppingCart, Sun, Moon, Languages, Menu, X } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function Navbar() {
  const { 
    language, setLanguage, 
    isDarkMode, toggleDarkMode, 
    cart, searchQuery, setSearchQuery,
    setCartOpen
  } = useSimbaStore();
  
  const t = translations[language];
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-simba-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-simba-gold rounded-full flex items-center justify-center font-bold text-simba-blue text-xl shadow-lg transform hover:scale-110 transition-transform">
              S
            </div>
            <span className="hidden sm:block font-bold text-2xl tracking-tighter text-simba-blue dark:text-simba-gold">
              SIMBA
            </span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4 sm:mx-8 relative">
            <div className="relative z-[60]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-simba-gold transition-all outline-none text-sm"
              />
            </div>

            {/* Smart Discovery Dropdown */}
            <AnimatePresence>
              {isSearchFocused && !searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-gray-800 p-6 z-50 overflow-hidden"
                >
                  <div className="mb-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-4">Trending Categories</p>
                    <div className="flex flex-wrap gap-2">
                        {['Groceries', 'Bakery', 'Electronics', 'Baby Products'].map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setSearchQuery(cat)}
                                className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-full text-xs font-bold hover:bg-simba-gold hover:text-simba-blue transition-colors"
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-4">Popular Searches</p>
                    <div className="space-y-3">
                        {['Fresh Milk', 'Simba Bread', 'Avocado', 'Cooking Oil'].map(item => (
                            <button 
                                key={item}
                                onClick={() => setSearchQuery(item)}
                                className="flex items-center gap-3 w-full text-left text-sm font-medium hover:text-simba-primary transition-colors group"
                            >
                                <div className="w-8 h-8 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-simba-primary/10">
                                    <Search className="w-3 h-3 opacity-40" />
                                </div>
                                {item}
                            </button>
                        ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-simba-gold" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>

            <div className="relative group">
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1">
                <Languages className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="text-xs font-medium uppercase">{language}</span>
              </button>
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] overflow-hidden">
                {(['en', 'fr', 'rw'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={clsx(
                      "w-full text-left px-5 py-3 text-sm font-bold transition-colors hover:bg-gray-50 dark:hover:bg-gray-700",
                      language === lang 
                        ? "text-simba-primary bg-simba-primary/5" 
                        : "text-slate-900 dark:text-slate-200"
                    )}
                  >
                    {lang === 'en' ? 'English' : lang === 'fr' ? 'Français' : 'Kinyarwanda'}
                  </button>
                ))}
              </div>
            </div>

            <button 
              id="cart-icon"
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
            >
              <ShoppingCart className="w-6 h-6 text-gray-700 dark:text-gray-200 group-hover:text-simba-primary transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-simba-accent text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-simba-dark animate-pulse shadow-lg">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
