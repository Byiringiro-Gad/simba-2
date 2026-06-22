
'use client';

import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import { Home, Search, ShoppingCart, ClipboardList, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

export default function BottomNav() {
  const {
    activeTab, setActiveTab, orders, cart,
    language, user, setAuthOpen, setCartOpen, goHome,
  } = useSimbaStore();
  const t = translations[language];
  const cartCount = cart.reduce((a, i) => a + i.quantity, 0);
  const processingCount = orders.filter(o => o.status === 'processing').length;

  const TABS = [
    { id: 'home',    icon: Home,          label: t.home,    onTap: () => goHome() },
    { id: 'search',  icon: Search,        label: t.search,  onTap: () => setActiveTab('search') },
    { id: 'orders',  icon: ClipboardList, label: t.orders,  onTap: () => user ? setActiveTab('orders') : setAuthOpen(true), badge: processingCount },
    { id: 'account', icon: User,          label: t.account, onTap: () => user ? setActiveTab('account') : setAuthOpen(true) },
  ] as const;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 sm:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-stretch h-16">

        {/* Home, Search, Orders, Account — equal quarters */}
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id && (tab.id !== 'orders' || !!user) && (tab.id !== 'account' || !!user);
          const badge = 'badge' in tab ? tab.badge : 0;

          return (
            <button
              key={tab.id}
              onClick={tab.onTap}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative min-h-[44px] active:bg-gray-50 dark:active:bg-gray-900 transition-colors"
              aria-label={tab.label}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-active-bg"
                  className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-7 bg-brand/10 dark:bg-brand/15 rounded-xl"
                />
              )}
              <div className="relative z-10">
                <Icon className={clsx(
                  'w-5 h-5 transition-all duration-200',
                  isActive ? 'text-brand stroke-[2.5px]' : 'text-gray-400 dark:text-gray-500'
                )} />
                {(badge ?? 0) > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white dark:border-gray-950">
                    {(badge ?? 0) > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span className={clsx(
                'text-[10px] font-bold relative z-10 transition-colors duration-200',
                isActive ? 'text-brand' : 'text-gray-400 dark:text-gray-500'
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* Cart — centre prominent button */}
        <button
          onClick={() => setCartOpen(true)}
          className="flex-none flex flex-col items-center justify-center px-4 relative min-h-[44px] active:opacity-80 transition-opacity"
          aria-label={t.cart}
        >
          <div className={clsx(
            'w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm',
            cartCount > 0
              ? 'bg-brand shadow-brand/30 shadow-md'
              : 'bg-gray-100 dark:bg-gray-800'
          )}>
            <ShoppingCart className={clsx(
              'w-5 h-5 transition-colors',
              cartCount > 0 ? 'text-gray-900' : 'text-gray-500 dark:text-gray-400'
            )} />
          </div>
          <AnimatePresence>
            {cartCount > 0 && (
              <motion.span
                key={cartCount}
                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                className="absolute top-1 right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-gray-950"
              >
                {cartCount > 9 ? '9+' : cartCount}
              </motion.span>
            )}
          </AnimatePresence>
          <span className={clsx(
            'text-[10px] font-bold mt-0.5',
            cartCount > 0 ? 'text-brand-dark dark:text-brand' : 'text-gray-400'
          )}>
            {t.cart}
          </span>
        </button>

      </div>
    </nav>
  );
}
