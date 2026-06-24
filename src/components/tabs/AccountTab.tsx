'use client';

import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import {
  User, MapPin, ClipboardList, Heart,
  Star, LogOut, LogIn, Package, ShoppingBag,
  ChevronRight, Shield, Moon, Sun,
  Globe, FileText, Lock, HelpCircle, MessageCircle,
  Award,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import ReferralCard from '@/components/ReferralCard';
import Link from 'next/link';
import Image from 'next/image';

// ── Loyalty Wallet Card ──────────────────────────────────────────────────────
function LoyaltyWallet() {
  const { orders, language } = useSimbaStore();

  const totalPoints = orders.reduce((a, o) => a + Math.floor(o.total / 100), 0);
  const tier = totalPoints >= 500 ? 'Gold' : totalPoints >= 200 ? 'Silver' : 'Bronze';
  const tierNext = totalPoints >= 500 ? null : totalPoints >= 200 ? 500 : 200;
  const tierProgress = totalPoints >= 500 ? 100
    : totalPoints >= 200 ? Math.round(((totalPoints - 200) / 300) * 100)
    : Math.round((totalPoints / 200) * 100);

  const tierColors = {
    Bronze: { bg: 'from-amber-600 to-amber-800', badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300', bar: 'bg-amber-400' },
    Silver: { bg: 'from-slate-500 to-slate-700',  badge: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',     bar: 'bg-slate-300' },
    Gold:   { bg: 'from-yellow-500 to-amber-600', badge: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300', bar: 'bg-yellow-400' },
  }[tier];

  const L = {
    wallet:   language === 'fr' ? 'Portefeuille fidélité' : language === 'rw' ? 'Amafaranga y\'ubudahemuka' : 'Loyalty Wallet',
    pts:      language === 'fr' ? 'points' : language === 'rw' ? 'amanota' : 'points',
    nextTier: language === 'fr' ? `pts pour atteindre` : language === 'rw' ? `amanota kugera ku` : `pts to reach`,
    how:      language === 'fr' ? '1 pt = 100 RWF dépensés' : language === 'rw' ? '1 pt = RWF 100 wishyuye' : '1 pt earned per 100 RWF spent',
    tiers:    {
      Bronze: language === 'fr' ? 'Bronze' : language === 'rw' ? 'Umuringa'  : 'Bronze',
      Silver: language === 'fr' ? 'Argent' : language === 'rw' ? 'Ifeza'     : 'Silver',
      Gold:   language === 'fr' ? 'Or'     : language === 'rw' ? 'Zahabu'    : 'Gold',
    },
  };

  return (
    <div className={`bg-gradient-to-br ${tierColors.bg} rounded-3xl overflow-hidden p-5 text-white`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-white/80" />
          <p className="font-black text-sm">{L.wallet}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${tierColors.badge}`}>
          {L.tiers[tier]}
        </span>
      </div>

      {/* Points display */}
      <div className="mb-4">
        <p className="text-4xl font-black leading-none">{totalPoints.toLocaleString()}</p>
        <p className="text-white/60 text-sm font-medium mt-1">{L.pts}</p>
      </div>

      {/* Progress to next tier */}
      {tierNext && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-white/60">{L.how}</span>
            <span className="text-xs font-bold text-white/80">{tierNext - totalPoints} {L.nextTier} {tier === 'Bronze' ? L.tiers.Silver : L.tiers.Gold}</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${tierProgress}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className={`h-full ${tierColors.bar} rounded-full`}
            />
          </div>
        </div>
      )}

      {/* Tier levels */}
      <div className="flex gap-2 mt-4">
        {(['Bronze', 'Silver', 'Gold'] as const).map((t) => (
          <div key={t} className={`flex-1 py-2 rounded-xl text-center text-[10px] font-black uppercase tracking-wider transition-all ${
            tier === t ? 'bg-white/25 text-white' : 'bg-white/10 text-white/40'
          }`}>
            {L.tiers[t]}
            <div className="text-[9px] font-medium mt-0.5 text-white/50">
              {t === 'Bronze' ? '0–199' : t === 'Silver' ? '200–499' : '500+'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AccountTab() {
  const {
    language, setLanguage,
    orders, favorites, cart,
    addresses, selectedAddressId,
    setAddressModalOpen, setActiveTab,
    user, setAuthOpen, logout,
    isDarkMode, toggleDarkMode,
  } = useSimbaStore();

  const t = translations[language];
  const selectedAddress = addresses.find(a => a.id === selectedAddressId);
  const totalSpent = orders.reduce((a, o) => a + o.total, 0);
  const processingOrders = orders.filter(o => o.status === 'processing').length;

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 pb-24 sm:pb-12 flex flex-col items-center text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
          {/* Store photo banner */}
          <div className="relative w-full h-36 rounded-3xl overflow-hidden mb-6">
            <Image
              src="/store-images/store-5.jpg"
              alt="Simba Supermarket"
              fill
              className="object-cover"
              sizes="400px"
            />
            <div className="absolute inset-0 bg-brand-dark/70 flex flex-col items-center justify-center gap-2">
              <div className="w-14 h-14 bg-brand rounded-3xl flex items-center justify-center shadow-xl">
                <User className="w-7 h-7 text-gray-900" />
              </div>
              <p className="text-white font-black text-sm">Simba Supermarket</p>
            </div>
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{t.myAccount}</h2>
          <p className="text-gray-400 text-sm font-medium mb-8 leading-relaxed">{t.signInToTrack}</p>

          <div className="grid grid-cols-2 gap-3 mb-8 text-left">
            {[
              { icon: Package,   label: t.trackOrders,          desc: t.trackOrdersDesc },
              { icon: Heart,     label: t.savedItemsBenefit,    desc: t.savedItemsBenefitDesc },
              { icon: Star,      label: t.loyaltyPointsBenefit, desc: t.loyaltyPointsBenefitDesc },
              { icon: MapPin,    label: t.savedAddresses,       desc: t.savedAddressesDesc },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                <div className="w-8 h-8 bg-brand/10 rounded-xl flex items-center justify-center mb-2">
                  <Icon className="w-4 h-4 text-brand-dark" />
                </div>
                <p className="font-black text-xs text-gray-900 dark:text-white">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
            ))}
          </div>

          <button onClick={() => setAuthOpen(true)}
            className="w-full py-4 bg-brand-dark text-white rounded-2xl font-black text-sm hover:bg-gray-800 transition-colors shadow-lg flex items-center justify-center gap-2">
            <LogIn className="w-4 h-4" />
            {t.signInOrCreate}
          </button>

          {/* Legal links even when logged out */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link href="/privacy" className="text-xs text-gray-400 hover:text-brand-dark transition-colors">
              {language === 'fr' ? 'Confidentialité' : language === 'rw' ? 'Ibanga' : 'Privacy'}
            </Link>
            <span className="text-gray-300">·</span>
            <Link href="/terms" className="text-xs text-gray-400 hover:text-brand-dark transition-colors">
              {language === 'fr' ? 'Conditions' : language === 'rw' ? 'Amategeko' : 'Terms'}
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Logged in ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-screen-sm mx-auto px-4 sm:px-6 py-5 pb-28 sm:pb-8 space-y-4">

      {/* Profile header — real store photo background */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl overflow-hidden relative">
        {/* Store photo */}
        <div className="absolute inset-0">
          <Image
            src="/store-images/store-4.jpg"
            alt="Simba Supermarket"
            fill
            className="object-cover"
            sizes="600px"
            priority
          />
          {/* Dark overlay so text stays readable */}
          <div className="absolute inset-0 bg-brand-dark/85" />
        </div>

        {/* Content on top of image */}
        <div className="relative z-10">
          <div className="px-6 pt-6 pb-4 flex items-center gap-4">
            <div className="w-14 h-14 bg-brand rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="font-black text-2xl text-gray-900">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-black text-lg text-white leading-tight truncate">{user.name}</h2>
              <p className="text-white/50 text-xs font-medium truncate">{user.email}</p>
              {user.phone && <p className="text-white/40 text-xs font-medium">{user.phone}</p>}
            </div>
            <button onClick={logout} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors" title="Sign out">
              <LogOut className="w-4 h-4 text-white/70" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10">
            {[
              { label: t.orders,     value: orders.length },
              { label: t.savedItems, value: favorites.length },
              { label: t.spent,      value: `${Math.round(totalSpent / 1000)}K RWF` },
            ].map(({ label, value }) => (
              <div key={label} className="py-4 text-center">
                <p className="font-black text-white text-lg leading-none">{value}</p>
                <p className="text-white/40 text-xs font-medium mt-1 uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Active order banner */}
      {processingOrders > 0 && (
        <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          onClick={() => setActiveTab('orders')}
          className="w-full flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl text-left">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-black text-sm text-green-800 dark:text-green-300">{processingOrders} {t.ordersOnTheWay}</p>
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">{t.tapToTrack}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-green-500" />
        </motion.button>
      )}

      {/* Quick actions */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-3 gap-3">
        {[
          { icon: ClipboardList, label: t.orders,  tab: 'orders'    as const, count: orders.length },
          { icon: Heart,         label: t.saved,   tab: 'favorites' as const, count: favorites.length },
          { icon: ShoppingBag,   label: t.cart,    tab: null,                 count: cart.length },
        ].map(({ icon: Icon, label, tab, count }) => (
          <button key={label} onClick={() => tab ? setActiveTab(tab) : null}
            className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-brand/30 hover:shadow-sm transition-all">
            <div className="relative">
              <Icon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-brand-dark text-white text-[9px] font-black rounded-full flex items-center justify-center">{count}</span>
              )}
            </div>
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{label}</span>
          </button>
        ))}
      </motion.div>

      {/* Loyalty Wallet */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <LoyaltyWallet />
      </motion.div>

      {/* Referral card */}
      <ReferralCard />

      {/* Settings */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">

        {/* Dark mode toggle */}
        <button onClick={toggleDarkMode}
          className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left border-b border-gray-100 dark:border-gray-800">
          {isDarkMode ? <Moon className="w-5 h-5 text-gray-400" /> : <Sun className="w-5 h-5 text-gray-400" />}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-gray-900 dark:text-white">{isDarkMode ? t.lightMode : t.darkMode}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{isDarkMode ? t.switchToLight : t.switchToDark}</p>
          </div>
          <div className={clsx('w-11 h-6 rounded-full transition-all relative', isDarkMode ? 'bg-brand' : 'bg-gray-200 dark:bg-gray-700')}>
            <span className={clsx('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all', isDarkMode ? 'left-5' : 'left-0.5')} />
          </div>
        </button>

        {/* Language */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4 mb-3">
            <Globe className="w-5 h-5 text-gray-400" />
            <p className="font-bold text-sm text-gray-900 dark:text-white">{t.language}</p>
          </div>
          <div className="flex gap-2">
            {([
              { code: 'en' as const, label: 'English' },
              { code: 'fr' as const, label: 'Français' },
              { code: 'rw' as const, label: 'Kinyarwanda' },
            ]).map(l => (
              <button key={l.code} onClick={() => setLanguage(l.code)}
                className={clsx('flex-1 py-2 rounded-xl text-xs font-black transition-all border', language === l.code
                  ? 'bg-brand-dark text-white border-brand-dark'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300')}>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Settings items */}
        {[
          { icon: User,          label: language === 'fr' ? 'Modifier le profil' : language === 'rw' ? 'Hindura Umwirondoro' : 'Edit Profile', sub: user.email, href: '/profile' },
          { icon: MapPin,        label: t.deliveryAddresses, sub: selectedAddress?.full ?? t.noAddressYet, href: '/profile' },
          { icon: MessageCircle, label: t.contactUs,         sub: '+250 788 386 386', action: () => window.open('https://wa.me/250788386386', '_blank') },
          { icon: HelpCircle,    label: 'FAQ',               sub: language === 'fr' ? 'Questions fréquentes' : language === 'rw' ? 'Ibibazo byinshi' : 'Frequently asked questions', href: '/faq' },
          { icon: Shield,        label: t.aboutSimba,        sub: t.aboutSimbaDesc, href: '/about' },
        ].map((item, i, arr) => {
          const Icon = item.icon;
          const isLast = i === arr.length - 1;
          const cls = clsx('w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left', !isLast && 'border-b border-gray-100 dark:border-gray-800');
          const content = (
            <>
              <Icon className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.sub}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
            </>
          );
          if ('href' in item && item.href) {
            return <Link key={item.label} href={item.href} className={cls}>{content}</Link>;
          }
          return <button key={item.label} onClick={item.action} className={cls}>{content}</button>;
        })}
      </motion.div>

      {/* Legal links */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {[
          { icon: FileText, label: language === 'fr' ? 'Conditions d\'utilisation' : language === 'rw' ? 'Amategeko y\'ikoreshwa' : 'Terms of Service', href: '/terms' },
          { icon: Lock,     label: language === 'fr' ? 'Politique de confidentialité' : language === 'rw' ? 'Politiki y\'Ibanga' : 'Privacy Policy', href: '/privacy' },
        ].map((item, i, arr) => {
          const Icon = item.icon;
          const isLast = i === arr.length - 1;
          const cls = clsx('w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left', !isLast && 'border-b border-gray-100 dark:border-gray-800');
          return (
            <Link key={item.label} href={item.href} className={cls}>
              <Icon className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-gray-900 dark:text-white">{item.label}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
            </Link>
          );
        })}
      </motion.div>

      {/* Sign out */}
      <button onClick={logout}
        className="w-full py-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
        <LogOut className="w-4 h-4" />
        {t.signOut}
      </button>

      <p className="text-center text-[10px] text-gray-400 pb-2">{t.copyright}</p>
    </div>
  );
}
