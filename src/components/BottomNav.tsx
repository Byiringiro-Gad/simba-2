'use client';

import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import { Home, Search, Heart, ClipboardList, User, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

export default function BottomNav() {
  const { activeTab, setActiveTab, favorites, orders, cart, language, user, setAuthOpen, setCartOpen, isCartOpen } = useSimbaStore();
  const t = translations[language];
  const cartCount = cart.reduce((a, i) => a + i.quantity, 0);

  const TABS = [
    { id: 'home',      icon: Home,          label: t.home },
    { id: 'search',    icon: Search,        label: t.search },
    { id: 'cart',      icon: ShoppingCart,  label: t.cart,    isCart: true },
    { id: 'orders',    icon: ClipboardList, label: t.orders },
    { id: 'account',   icon: User,          label: t.account },
  ] as const;

  const badges: Partial<Record<string, number>> = {
    cart:    cartCount,
    orders:  orders.filter(o => o.status === 'processing').length,
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 sm:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around px-1 py-1">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id && !isCartOpen;
          const badge = badges[tab.id];

          // Cart tab — opens drawer
          if (tab.id === 'cart') {
            return (
              <button
                key="cart"
                onClick={() => setCartOpen(true)}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 relative"
              >
                <div className="relative">
                  <div className={clsx(
                    'w-10 h-10 rounded-2xl flex items-center justify-center transition-all',
                    cartCount > 0 ? 'bg-brand shadow-md shadow-brand/30' : 'bg-gray-100 dark:bg-gray-800'
                  )}>
                    <ShoppingCart className={clsx('w-5 h-5', cartCount > 0 ? 'text-gray-900' : 'text-gray-500 dark:text-gray-400')} />
                  </div>
                  <AnimatePresence>
                    {cartCount > 0 && (
                      <motion.span
                        key={cartCount}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-gray-950"
                      >
                        {cartCount > 9 ? '9+' : cartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <span className={clsx('text-[10px] font-bold', cartCount > 0 ? 'text-brand-dark dark:text-brand' : 'text-gray-400')}>
                  {t.cart}
                </span>
              </button>
            );
          }

          // Protected tabs — require login
          if ((tab.id === 'account' || tab.id === 'orders') && !user) {
            return (
              <button
                key={tab.id}
                onClick={() => setAuthOpen(true)}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5"
              >
                <Icon className="w-6 h-6 text-gray-400" />
                <span className="text-[10px] font-bold text-gray-400">{tab.label}</span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 relative"
            >
              <div className="relative">
                <Icon className={clsx('w-6 h-6 transition-colors', isActive ? 'text-brand' : 'text-gray-400')} />
                {badge && badge > 0 ? (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                    {badge}
                  </span>
                ) : null}
              </div>
              <span className={clsx('text-[10px] font-bold transition-colors', isActive ? 'text-brand' : 'text-gray-400')}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-brand rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

  const TABS = [
    { id: 'home',      icon: Home,          label: t.home },
    { id: 'search',    icon: Search,        label: t.search },
    { id: 'favorites', icon: Heart,         label: t.saved },
    { id: 'orders',    icon: ClipboardList, label: t.orders },
    { id: 'account',   icon: User,          label: t.account },
  ] as const;

  const badges: Partial<Record<typeof TABS[number]['id'], number>> = {
    favorites: favorites.length,
    orders: orders.filter(o => o.status === 'processing').length,
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 sm:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center justify-around px-2 py-2">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const badge = badges[tab.id];

          // Protected tabs — require login
          if ((tab.id === 'account' || tab.id === 'orders' || tab.id === 'favorites') && !user) {
            return (
              <button
                key={tab.id}
                onClick={() => setAuthOpen(true)}
                className="flex flex-col items-center gap-1 px-3 py-1"
              >
                <Icon className="w-6 h-6 text-gray-400" />
                <span className="text-xs font-bold text-gray-400">{tab.label}</span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center gap-1 px-3 py-1 relative"
            >
              <div className="relative">
                <Icon className={clsx(
                  'w-6 h-6 transition-colors',
                  isActive ? 'text-brand' : 'text-gray-400'
                )} />
                {badge && badge > 0 ? (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                    {badge}
                  </span>
                ) : null}
              </div>
              <span className={clsx(
                'text-xs font-bold transition-colors',
                isActive ? 'text-brand' : 'text-gray-400'
              )}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-brand rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
