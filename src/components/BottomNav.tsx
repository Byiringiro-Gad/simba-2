
'use client';

import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import { Home, Search, Heart, ClipboardList, User, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

export default function BottomNav() {
  const {
    activeTab, setActiveTab, favorites, orders, cart,
    language, user, setAuthOpen, setCartOpen, isCartOpen,
  } = useSimbaStore();
  const t = translations[language];
  const cartCount = cart.reduce((a, i) => a + i.quantity, 0);

  const TABS = [
    { id: 'home',    icon: Home,          label: t.home },
    { id: 'search',  icon: Search,        label: t.search },
    { id: 'orders',  icon: ClipboardList, label: t.orders },
    { id: 'account', icon: User,          label: t.account },
  ] as const;

  const badges: Partial<Record<string, number>> = {
    orders: orders.filter(o => o.status === 'processing').length,
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 sm:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around px-1 py-1">

        {/* Home */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 relative"
        >
          <Home className={clsx('w-6 h-6 transition-colors', activeTab === 'home' ? 'text-brand' : 'text-gray-400')} />
          <span className={clsx('text-[10px] font-bold', activeTab === 'home' ? 'text-brand' : 'text-gray-400')}>{t.home}</span>
          {activeTab === 'home' && <motion.div layoutId="nav-dot" className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-brand rounded-full" />}
        </button>

        {/* Search */}
        <button
          onClick={() => setActiveTab('search')}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 relative"
        >
          <Search className={clsx('w-6 h-6 transition-colors', activeTab === 'search' ? 'text-brand' : 'text-gray-400')} />
          <span className={clsx('text-[10px] font-bold', activeTab === 'search' ? 'text-brand' : 'text-gray-400')}>{t.search}</span>
          {activeTab === 'search' && <motion.div layoutId="nav-dot" className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-brand rounded-full" />}
        </button>

        {/* Cart — center, prominent */}
        <button
          onClick={() => setCartOpen(true)}
          className="flex flex-col items-center gap-0.5 px-2 py-1 relative"
        >
          <div className={clsx(
            'w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm',
            cartCount > 0 ? 'bg-brand shadow-brand/30' : 'bg-gray-100 dark:bg-gray-800'
          )}>
            <ShoppingCart className={clsx('w-5 h-5', cartCount > 0 ? 'text-gray-900' : 'text-gray-500 dark:text-gray-400')} />
          </div>
          <AnimatePresence>
            {cartCount > 0 && (
              <motion.span
                key={cartCount}
                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                className="absolute top-0 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-gray-950"
              >
                {cartCount > 9 ? '9+' : cartCount}
              </motion.span>
            )}
          </AnimatePresence>
          <span className={clsx('text-[10px] font-bold', cartCount > 0 ? 'text-brand-dark dark:text-brand' : 'text-gray-400')}>
            {t.cart}
          </span>
        </button>

        {/* Orders */}
        <button
          onClick={() => user ? setActiveTab('orders') : setAuthOpen(true)}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 relative"
        >
          <div className="relative">
            <ClipboardList className={clsx('w-6 h-6 transition-colors', activeTab === 'orders' && user ? 'text-brand' : 'text-gray-400')} />
            {(badges.orders ?? 0) > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                {badges.orders}
              </span>
            )}
          </div>
          <span className={clsx('text-[10px] font-bold', activeTab === 'orders' && user ? 'text-brand' : 'text-gray-400')}>{t.orders}</span>
          {activeTab === 'orders' && user && <motion.div layoutId="nav-dot" className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-brand rounded-full" />}
        </button>

        {/* Account */}
        <button
          onClick={() => user ? setActiveTab('account') : setAuthOpen(true)}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 relative"
        >
          <User className={clsx('w-6 h-6 transition-colors', activeTab === 'account' && user ? 'text-brand' : 'text-gray-400')} />
          <span className={clsx('text-[10px] font-bold', activeTab === 'account' && user ? 'text-brand' : 'text-gray-400')}>{t.account}</span>
          {activeTab === 'account' && user && <motion.div layoutId="nav-dot" className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-brand rounded-full" />}
        </button>

      </div>
    </nav>
  );
}
