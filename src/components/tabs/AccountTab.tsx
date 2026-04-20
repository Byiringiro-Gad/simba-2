'use client';

import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import {
  User, MapPin, ClipboardList, Heart, Moon, Sun,
  Languages, ChevronRight, Star, Gift, Phone, Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export default function AccountTab() {
  const { language, setLanguage, isDarkMode, toggleDarkMode, orders, favorites, addresses, selectedAddressId, setAddressModalOpen } = useSimbaStore();
  const t = translations[language];
  const selectedAddress = addresses.find(a => a.id === selectedAddressId);
  const totalPoints = orders.reduce((a, o) => a + Math.floor(o.total / 100), 0);

  const sections = [
    {
      title: t.myAccount,
      items: [
        { icon: MapPin, label: t.deliveryAddresses, sub: selectedAddress?.full ?? 'No address', action: () => setAddressModalOpen(true) },
        { icon: ClipboardList, label: t.orderHistory, sub: `${orders.length} ${orders.length !== 1 ? t.items : t.item}`, action: () => {} },
        { icon: Heart, label: t.savedItems, sub: `${favorites.length} ${favorites.length !== 1 ? t.items : t.item}`, action: () => {} },
      ]
    },
    {
      title: t.preferences,
      items: [
        { icon: isDarkMode ? Sun : Moon, label: isDarkMode ? t.lightMode : t.darkMode, sub: isDarkMode ? t.switchToLight : t.switchToDark, action: toggleDarkMode },
      ]
    },
    {
      title: t.support,
      items: [
        { icon: Phone, label: t.contactUs, sub: '+250 788 000 000', action: () => {} },
        { icon: Info, label: t.aboutSimba, sub: t.aboutSimbaDesc, action: () => {} },
      ]
    },
  ];

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 pb-24 sm:pb-6">
      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-brand to-brand-dark rounded-3xl p-6 mb-6 text-white"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="font-black text-xl">{t.guestUser}</h2>
            <p className="text-white/70 text-sm font-medium">Kigali, Rwanda</p>
          </div>
        </div>
        {/* Loyalty points */}
        <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-4">
          <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center">
            <Star className="w-5 h-5 text-brand" />
          </div>
          <div>
            <p className="text-white/70 text-xs font-bold uppercase tracking-wider">{t.loyaltyPoints}</p>
            <p className="font-black text-2xl text-brand-accent">{totalPoints.toLocaleString()}</p>
          </div>
          <div className="ml-auto">
            <span className="px-3 py-1.5 bg-brand-accent text-brand rounded-full text-[10px] font-black uppercase tracking-wider">
              {totalPoints >= 500 ? t.gold : totalPoints >= 200 ? t.silver : t.bronze}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Language selector */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-4 mb-4"
      >
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 px-1">{t.language}</p>
        <div className="flex gap-2">
          {(['en', 'fr', 'rw'] as const).map(lang => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={clsx(
                'flex-1 py-2.5 rounded-xl text-sm font-black transition-all',
                language === lang
                  ? 'bg-brand text-white shadow-md shadow-brand/20'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-brand-muted hover:text-brand'
              )}
            >
              {lang === 'en' ? '🇬🇧 EN' : lang === 'fr' ? '🇫🇷 FR' : '🇷🇼 RW'}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Settings sections */}
      {sections.map((section, si) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 + si * 0.05 }}
          className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-4"
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-5 pt-4 pb-2">{section.title}</p>
          {section.items.map((item, ii) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={item.action}
                className={clsx(
                  'w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left',
                  ii < section.items.length - 1 ? 'border-b border-gray-50 dark:border-gray-800' : ''
                )}
              >
                <div className="w-10 h-10 bg-brand-muted rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-900 dark:text-white">{item.label}</p>
                  <p className="text-xs text-gray-400 truncate font-medium">{item.sub}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </button>
            );
          })}
        </motion.div>
      ))}

      <p className="text-center text-xs text-gray-400 font-bold mt-4">{t.copyright}</p>
    </div>
  );
}
