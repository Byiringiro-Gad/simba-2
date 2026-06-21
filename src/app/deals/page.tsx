'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { getSimbaData } from '@/lib/data';
import { Product } from '@/types';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import BottomNav from '@/components/BottomNav';
import CartDrawer from '@/components/CartDrawer';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Tag, Clock, Percent, ArrowLeft, Flame, Star } from 'lucide-react';
import Link from 'next/link';

function pad(n: number) { return String(n).padStart(2, '0'); }

interface DealProduct extends Product {
  originalPrice: number;
  discountPct: number;
  dealTag?: string;
}

function useCountdown(targetMs: number) {
  const [ms, setMs] = useState(() => Math.max(0, targetMs - Date.now()));
  useEffect(() => {
    const t = setInterval(() => setMs(Math.max(0, targetMs - Date.now())), 1000);
    return () => clearInterval(t);
  }, [targetMs]);
  const h = pad(Math.floor(ms / 3600000));
  const m = pad(Math.floor((ms % 3600000) / 60000));
  const s = pad(Math.floor((ms % 60000) / 1000));
  return { h, m, s, expired: ms === 0 };
}

// Get midnight in Kigali time
function getMidnightKigali() {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Kigali' }));
  const midnight = new Date(now);
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);
  return midnight.getTime();
}

// Deterministic discount seeding from product id
function getDealDiscount(id: number): number {
  const pool = [5, 8, 10, 12, 15, 18, 20, 25];
  return pool[id % pool.length];
}

export default function DealsPage() {
  const { language, isCartOpen, setCartOpen } = useSimbaStore();
  const lang = language as 'en' | 'fr' | 'rw';
  const midnightMs = useMemo(() => getMidnightKigali(), []);
  const countdown = useCountdown(midnightMs);

  // Load DB-configured deals, fall back to seeded deals from product data
  const [dbDeals, setDbDeals] = useState<DealProduct[]>([]);
  const [dbLoading, setDbLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/promos?type=daily')
      .then(r => r.json())
      .then(d => {
        if (d.ok && Array.isArray(d.deals) && d.deals.length > 0) {
          setDbDeals(d.deals.map((p: any) => ({
            ...p,
            originalPrice: p.originalPrice ?? Math.round(p.price * 1.2),
            discountPct: p.discount ?? 10,
            dealTag: 'Deal of the Day',
          })));
        }
      })
      .catch(() => {})
      .finally(() => setDbLoading(false));
  }, []);

  // Deterministic fallback deals from product data (always show something)
  const fallbackDeals = useMemo<DealProduct[]>(() => {
    const all = getSimbaData().products.filter(p => p.inStock && p.image);
    // Pick a stable set based on today's date seed
    const today = new Date().toDateString();
    const seed = today.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const shuffled = [...all].sort((a, b) => ((a.id * 31 + seed) % 997) - ((b.id * 31 + seed) % 997));
    return shuffled.slice(0, 20).map(p => {
      const pct = getDealDiscount(p.id + seed);
      return {
        ...p,
        originalPrice: Math.round(p.price / (1 - pct / 100)),
        discountPct: pct,
        dealTag: pct >= 20 ? '🔥 Hot Deal' : pct >= 15 ? '⭐ Top Pick' : '💰 Save',
      };
    });
  }, []);

  const flashDeals = useMemo<DealProduct[]>(() => {
    const all = getSimbaData().products.filter(p => p.inStock);
    const today = new Date().toDateString();
    const seed = today.split('').reduce((a, c) => a + c.charCodeAt(0), 17);
    const shuffled = [...all].sort((a, b) => ((a.id * 17 + seed) % 499) - ((b.id * 17 + seed) % 499));
    return shuffled.slice(0, 8).map(p => ({
      ...p,
      originalPrice: Math.round(p.price / 0.75),
      discountPct: 25,
      dealTag: '⚡ Flash',
    }));
  }, []);

  const dealsToShow = dbDeals.length > 0 ? dbDeals : fallbackDeals;

  const L = {
    title:      { en: 'Deals & Promotions', fr: 'Offres & Promotions', rw: 'Ibiciro Bihanitse' },
    sub:        { en: 'Best prices updated daily · Kigali', fr: 'Meilleurs prix mis à jour chaque jour · Kigali', rw: 'Ibiciro byiza bisubirwamo buri munsi · Kigali' },
    endsIn:     { en: 'Deals end in', fr: 'Offres se terminent dans', rw: 'Birangira mu' },
    flash:      { en: 'Flash Deals', fr: 'Offres Flash', rw: 'Ibiciro Byihuse' },
    flashSub:   { en: 'Limited time · 25% off', fr: 'Temps limité · 25% de réduction', rw: 'Igihe gito · 25% igabanywa' },
    daily:      { en: 'Deals of the Day', fr: 'Offres du Jour', rw: 'Ibiciro Byo Uyu Munsi' },
    dailySub:   { en: 'Refreshes at midnight Kigali time', fr: 'Se renouvelle à minuit heure de Kigali', rw: 'Bisubirwamo saa sita nijoro igihe cya Kigali' },
    back:       { en: '← Back to Store', fr: '← Retour à la boutique', rw: '← Subira ku iduka' },
    badge:      { en: 'off', fr: 'de réduction', rw: 'igabanywa' },
    was:        { en: 'Was', fr: 'Était', rw: 'Byari' },
    save:       { en: 'Save', fr: 'Économiser', rw: 'Bungabunga' },
  };
  const t = (k: keyof typeof L) => L[k][lang];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-5 pb-28 sm:pb-10">

        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-400 hover:text-brand-dark dark:hover:text-brand transition-colors mb-5">
          <ArrowLeft className="w-4 h-4" /> {t('back')}
        </Link>

        {/* Hero banner */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 p-6 sm:p-8 mb-8"
        >
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'repeating-linear-gradient(45deg,white 0,white 1px,transparent 0,transparent 50%)', backgroundSize: '14px 14px' }} />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-yellow-300" />
                <span className="text-white/80 text-xs font-black uppercase tracking-widest">{t('title')}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">{t('title')}</h1>
              <p className="text-white/70 text-sm mt-1">{t('sub')}</p>
            </div>

            {/* Countdown */}
            <div className="flex-shrink-0 bg-black/20 backdrop-blur-sm rounded-2xl px-5 py-4 text-center">
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-2">{t('endsIn')}</p>
              <div className="flex items-center gap-1.5">
                {[countdown.h, countdown.m, countdown.s].map((unit, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className="bg-white/20 text-white font-mono font-black text-xl px-2.5 py-1.5 rounded-xl min-w-[2.5rem] text-center">
                      {unit}
                    </span>
                    {i < 2 && <span className="text-white/60 font-black text-lg">:</span>}
                  </span>
                ))}
              </div>
              <div className="flex justify-between mt-1 px-1">
                {['HRS', 'MIN', 'SEC'].map(u => (
                  <span key={u} className="text-white/40 text-[9px] font-black uppercase tracking-widest">{u}</span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Flash deals strip */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-red-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-black text-gray-900 dark:text-white text-lg leading-tight">{t('flash')}</h2>
              <p className="text-xs text-gray-400">{t('flashSub')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-2 sm:gap-3">
            {flashDeals.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow">
                {/* Discount badge */}
                <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                  -{p.discountPct}% {t('badge')}
                </div>
                <ProductCard product={p} index={i} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Daily deals */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Tag className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-black text-gray-900 dark:text-white text-lg leading-tight">{t('daily')}</h2>
              <p className="text-xs text-gray-400">{t('dailySub')}</p>
            </div>
          </div>

          {dbLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-56 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
              {dealsToShow.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="relative">
                  {/* Discount badge overlay */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="bg-purple-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full block">
                      -{p.discountPct}% {t('badge')}
                    </span>
                  </div>
                  <ProductCard product={p} index={i} />
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Savings note */}
        <div className="mt-8 p-4 bg-brand/5 dark:bg-brand/10 rounded-2xl border border-brand/10 flex items-center gap-3">
          <Percent className="w-5 h-5 text-brand flex-shrink-0" />
          <p className="text-xs font-bold text-gray-600 dark:text-gray-300">
            {lang === 'fr'
              ? 'Les prix indiqués sont déjà réduits. Les offres sont valables jusqu\'à minuit, heure de Kigali.'
              : lang === 'rw'
              ? 'Ibiciro bigaragara ni ibyo bigabanyijweho. Ibintu birangirizwa saa sita nijoro igihe cya Kigali.'
              : 'Displayed prices are already discounted. Deals reset at midnight Kigali time daily.'}
          </p>
        </div>
      </div>

      <BottomNav />
      <CartDrawer isOpen={isCartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
