'use client';

import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import {
  User, MapPin, ClipboardList, Heart,
  Star, LogOut, LogIn,
  Package, ShoppingBag, ChevronRight,
  Phone, Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import ReferralCard from '@/components/ReferralCard';

export default function AccountTab() {
  const {
    language,
    orders, favorites, cart,
    addresses, selectedAddressId,
    setAddressModalOpen, setActiveTab,
    user, setAuthOpen, logout,
  } = useSimbaStore();

  const t = translations[language];
  const selectedAddress = addresses.find(a => a.id === selectedAddressId);
  const totalPoints = orders.reduce((a, o) => a + Math.floor(o.total / 100), 0);
  const totalSpent = orders.reduce((a, o) => a + o.total, 0);
  const processingOrders = orders.filter(o => o.status === 'processing').length;

  const tier = totalPoints >= 500 ? 'Gold' : totalPoints >= 200 ? 'Silver' : 'Bronze';
  const tierNext = totalPoints >= 500 ? null : totalPoints >= 200 ? 500 : 200;
  const tierProgress = totalPoints >= 500 ? 100
    : totalPoints >= 200 ? Math.round(((totalPoints - 200) / 300) * 100)
    : Math.round((totalPoints / 200) * 100);

  // Not logged in — show a clean sign-in prompt
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 pb-24 sm:pb-12 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          {/* Icon */}
          <div className="w-20 h-20 bg-brand-dark rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <User className="w-10 h-10 text-brand" />
          </div>

          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
            {t.myAccount}
          </h2>
          <p className="text-gray-400 text-sm font-medium mb-8 leading-relaxed">
            Sign in to track your orders, save favourites, earn loyalty points and manage your deliveries.
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-2 gap-3 mb-8 text-left">
            {[
              { icon: Package,    label: 'Track Orders',      desc: 'Real-time delivery updates' },
              { icon: Heart,      label: 'Saved Items',       desc: 'Your favourite products' },
              { icon: Star,       label: 'Loyalty Points',    desc: 'Earn on every purchase' },
              { icon: MapPin,     label: 'Saved Addresses',   desc: 'Faster checkout' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                <div className="w-8 h-8 bg-brand/10 rounded-xl flex items-center justify-center mb-2">
                  <Icon className="w-4 h-4 text-brand-dark" />
                </div>
                <p className="font-black text-xs text-gray-900 dark:text-white">{label}</p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">{desc}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setAuthOpen(true)}
            className="w-full py-4 bg-brand-dark text-white rounded-2xl font-black text-sm hover:bg-gray-800 transition-colors shadow-lg flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Sign In or Create Account
          </button>
        </motion.div>
      </div>
    );
  }

  // Logged in — clean dashboard
  return (
    <div className="max-w-screen-sm mx-auto px-4 sm:px-6 py-5 pb-24 sm:pb-8 space-y-4">

      {/* ── Profile hero ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-brand-dark rounded-3xl overflow-hidden"
      >
        {/* Top section */}
        <div className="px-6 pt-6 pb-4 flex items-center gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 bg-brand rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <span className="font-black text-2xl text-gray-900">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-black text-lg text-white leading-tight truncate">{user.name}</h2>
            <p className="text-white/50 text-xs font-medium truncate">{user.email}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors flex-shrink-0"
            title="Sign out"
          >
            <LogOut className="w-4 h-4 text-white/70" />
          </button>
        </div>

        {/* Loyalty bar */}
        <div className="mx-4 mb-4 bg-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-brand" />
              <span className="text-white font-black text-sm">{totalPoints.toLocaleString()} pts</span>
            </div>
            <span className={clsx(
              'px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider',
              tier === 'Gold' ? 'bg-yellow-400/20 text-yellow-300' :
              tier === 'Silver' ? 'bg-gray-300/20 text-gray-300' :
              'bg-amber-600/20 text-amber-400'
            )}>
              {tier}
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${tierProgress}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-full bg-brand rounded-full"
            />
          </div>
          {tierNext && (
            <p className="text-white/40 text-xs font-medium mt-1.5">
              {tierNext - totalPoints} pts to {tier === 'Bronze' ? 'Silver' : 'Gold'}
            </p>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10">
          {[
            { label: t.orders,      value: orders.length },
            { label: t.savedItems,  value: favorites.length },
            { label: 'Spent',       value: `${Math.round(totalSpent / 1000)}K` },
          ].map(({ label, value }) => (
            <div key={label} className="py-4 text-center">
              <p className="font-black text-white text-lg leading-none">{value}</p>
              <p className="text-white/40 text-xs font-medium mt-1 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Active order banner ── */}
      {processingOrders > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setActiveTab('orders')}
          className="w-full flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl text-left"
        >
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-black text-sm text-green-800 dark:text-green-300">
              {processingOrders} order{processingOrders > 1 ? 's' : ''} on the way
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">Tap to track</p>
          </div>
          <ChevronRight className="w-4 h-4 text-green-500" />
        </motion.button>
      )}

      {/* ── Quick actions ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { icon: ClipboardList, label: t.orders,     tab: 'orders'    as const, count: orders.length },
          { icon: Heart,         label: t.saved,      tab: 'favorites' as const, count: favorites.length },
          { icon: ShoppingBag,   label: t.cart,       tab: null,                 count: cart.length },
        ].map(({ icon: Icon, label, tab, count }) => (
          <button
            key={label}
            onClick={() => tab ? setActiveTab(tab) : null}
            className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-brand/30 hover:shadow-sm transition-all"
          >
            <div className="relative">
              <Icon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-brand-dark text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{label}</span>
          </button>
        ))}
      </motion.div>

      {/* ── Referral card ── */}
      <ReferralCard />

      {/* ── Settings ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
      >
        {[
          {
            icon: MapPin,
            label: t.deliveryAddresses,
            sub: selectedAddress?.full ?? t.noAddressYet,
            action: () => setAddressModalOpen(true),
          },
          {
            icon: Phone,
            label: t.contactUs,
            sub: t.contactPhone,
            action: () => window.open('https://wa.me/250788000000', '_blank'),
          },
          {
            icon: Shield,
            label: t.aboutSimba,
            sub: t.aboutSimbaDesc,
            action: () => window.open('https://www.simbaonlineshopping.com', '_blank'),
          },
        ].map((item, i, arr) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={item.action}
              className={clsx(
                'w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left',
                i < arr.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''
              )}
            >
              <Icon className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.sub}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
            </button>
          );
        })}
      </motion.div>

      <p className="text-center text-[10px] text-gray-400 pb-2">{t.copyright}</p>
    </div>
  );
}
