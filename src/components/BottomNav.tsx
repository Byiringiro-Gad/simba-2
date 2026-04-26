'use client';

import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import { Home, Search, Heart, ClipboardList, User, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export default function BottomNav() {
  const { activeTab, setActiveTab, favorites, orders, language, user, setAuthOpen } = useSimbaStore();
  const t = translations[language];

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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 sm:hidden">
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
