'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';

const BANNERS = [
  {
    id: 1,
    title: 'Free Delivery',
    subtitle: 'On your first 3 orders',
    badge: 'NEW USER',
    bg: 'from-[#0F172A] to-[#1E3A8A]',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80',
    code: 'WELCOME',
  },
  {
    id: 2,
    title: '15% Off Groceries',
    subtitle: 'Use code SIMBA10 at checkout',
    badge: 'LIMITED',
    bg: 'from-amber-600 to-orange-700',
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&q=80',
    code: 'SIMBA10',
  },
  {
    id: 3,
    title: 'Fresh Bakery Daily',
    subtitle: 'Baked fresh every morning',
    badge: 'DAILY',
    bg: 'from-rose-600 to-pink-800',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',
    code: null,
  },
];

export default function PromoBanner() {
  const [current, setCurrent] = useState(0);
  const { applyPromo, language } = useSimbaStore();
  const t = translations[language];

  useEffect(() => {
    const timer = setInterval(() => setCurrent(c => (c + 1) % BANNERS.length), 4500);
    return () => clearInterval(timer);
  }, []);

  const banner = BANNERS[current];

  return (
    <div className="relative h-56 sm:h-72 rounded-2xl overflow-hidden group cursor-pointer"
      onClick={() => banner.code && applyPromo(banner.code)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={banner.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          className={`absolute inset-0 bg-gradient-to-r ${banner.bg}`}
        >
          <div className="absolute right-0 top-0 bottom-0 w-2/5 opacity-25">
            <Image src={banner.image} alt="" fill className="object-cover" />
          </div>
          <div className="relative h-full flex flex-col justify-center px-6 sm:px-10">
            <span className="inline-block px-3 py-1 bg-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-3 self-start">
              {banner.badge}
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-white leading-tight mb-2">{banner.title}</h3>
            <p className="text-white/80 text-sm sm:text-base font-medium mb-5">{banner.subtitle}</p>
            <button
              onClick={() => banner.code && applyPromo(banner.code)}
              className="self-start px-5 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-black hover:bg-gray-100 transition-colors shadow-lg"
            >
              {t.shopNow}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Arrows */}
      <button onClick={e => { e.stopPropagation(); setCurrent(c => (c - 1 + BANNERS.length) % BANNERS.length); }}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronLeft className="w-4 h-4 text-white" />
      </button>
      <button onClick={e => { e.stopPropagation(); setCurrent(c => (c + 1) % BANNERS.length); }}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight className="w-4 h-4 text-white" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
        {BANNERS.map((_, i) => (
          <button key={i} onClick={e => { e.stopPropagation(); setCurrent(i); }}
            className={`h-1 rounded-full transition-all ${i === current ? 'w-5 bg-white' : 'w-1 bg-white/40'}`} />
        ))}
      </div>
    </div>
  );
}
