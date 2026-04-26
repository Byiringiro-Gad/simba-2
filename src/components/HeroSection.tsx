'use client';

import { useState, useEffect, useRef } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { ShoppingBag, ChevronLeft, ChevronRight, Zap, Users } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    bg: 'from-[#0F172A] to-[#1E3A8A]',
    accent: '#3B82F6',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&q=80',
    en: { headline: 'Fresh groceries,\nready in 20 min.', sub: 'Order online, pick up at your nearest Simba branch in Kigali. Pay with MTN MoMo or Airtel Money.' },
    fr: { headline: 'Courses fraîches,\nprêtes en 20 min.', sub: 'Commandez en ligne, retirez à votre agence Simba la plus proche. Payez avec MTN MoMo ou Airtel Money.' },
    rw: { headline: 'Ibicuruzwa bishya,\nbikitegurwa mu minota 20.', sub: 'Tumiza kuri interineti, fata ku ishami rya Simba riri hafi yawe. Wishura na MTN MoMo cyangwa Airtel Money.' },
  },
  {
    id: 2,
    bg: 'from-amber-700 to-orange-900',
    accent: '#F59E0B',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&q=80',
    en: { headline: 'Freshly baked\nevery morning.', sub: 'Baguettes, croissants, cakes — baked fresh daily at Simba Bakery. Order ahead, pick up warm.' },
    fr: { headline: 'Fraîchement cuit\nchaque matin.', sub: 'Baguettes, croissants, gâteaux — cuits frais chaque jour à la boulangerie Simba. Commandez à l\'avance.' },
    rw: { headline: 'Bishyushye buri\ngitondo.', sub: 'Baguette, croissant, imikate — bitera buri munsi kuri Simba Bakery. Tumiza mbere, ufate bishyushye.' },
  },
  {
    id: 3,
    bg: 'from-emerald-800 to-teal-900',
    accent: '#10B981',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&q=80',
    en: { headline: '700+ products,\n9 branches in Kigali.', sub: 'From groceries to electronics — everything you need at Simba. Choose your branch, we\'ll have it ready.' },
    fr: { headline: '700+ produits,\n9 agences à Kigali.', sub: 'Des courses à l\'électronique — tout ce dont vous avez besoin chez Simba. Choisissez votre agence.' },
    rw: { headline: 'Ibicuruzwa 700+,\namashami 9 i Kigali.', sub: 'Kuva ku biribwa kugeza ku bikoresho — byose kuri Simba. Hitamo ishami ryawe, tuzabikitegurira.' },
  },
];

// Floating particle
function Particle({ delay, x, size }: { delay: number; x: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-white/10 pointer-events-none"
      style={{ width: size, height: size, left: `${x}%`, bottom: -size }}
      animate={{ y: [-size, -500], opacity: [0, 0.6, 0] }}
      transition={{ duration: 4 + Math.random() * 3, delay, repeat: Infinity, ease: 'easeOut' }}
    />
  );
}

// Live order ticker
const TICKER_ITEMS = [
  'Jean Pierre just ordered from Remera',
  'Marie ordered Fresh Milk × 3',
  'Someone in Kimironko picked up their order',
  'Amina ordered Baguette from Kacyiru',
  'New order at Nyamirambo branch',
  'Patrick ordered Cooking Oil × 2',
];

export default function HeroSection({ onShopNow }: { onShopNow: () => void }) {
  const { language } = useSimbaStore();
  const [current, setCurrent] = useState(0);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [showTicker, setShowTicker] = useState(false);
  const [liveCount, setLiveCount] = useState(247);

  // Auto-advance slides
  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  // Live order counter — increments randomly
  useEffect(() => {
    const t = setInterval(() => {
      setLiveCount(c => c + Math.floor(Math.random() * 3));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  // Ticker — show a new notification every 4s
  useEffect(() => {
    const t = setInterval(() => {
      setShowTicker(false);
      setTimeout(() => {
        setTickerIdx(i => (i + 1) % TICKER_ITEMS.length);
        setShowTicker(true);
      }, 400);
    }, 4000);
    setShowTicker(true);
    return () => clearInterval(t);
  }, []);

  const slide = SLIDES[current];
  const content = slide[language as 'en' | 'fr' | 'rw'] ?? slide.en;
  const t = translations[language];

  return (
    <section className="relative overflow-hidden" style={{ minHeight: '420px' }}>
      {/* Animated gradient background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className={`absolute inset-0 bg-gradient-to-br ${slide.bg}`}
        >
          {/* Background image with parallax feel */}
          <motion.div
            className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20"
            initial={{ x: 30 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img src={slide.image} alt="" className="w-full h-full object-cover" />
          </motion.div>

          {/* Radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.07)_0%,transparent_60%)]" />
        </motion.div>
      </AnimatePresence>

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <Particle key={i} delay={i * 0.7} x={10 + i * 11} size={6 + (i % 3) * 6} />
      ))}

      {/* Content */}
      <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 pt-14 pb-12">
        <div className="max-w-xl">

          {/* Eyebrow with live pulse */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full mb-5"
          >
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white/90 text-xs font-black uppercase tracking-widest">{t.heroEyebrow}</span>
          </motion.div>

          {/* Headline */}
          <AnimatePresence mode="wait">
            <motion.h1
              key={slide.id + '-headline'}
              initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
              transition={{ duration: 0.5 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 whitespace-pre-line"
            >
              {content.headline}
            </motion.h1>
          </AnimatePresence>

          {/* Sub */}
          <AnimatePresence mode="wait">
            <motion.p
              key={slide.id + '-sub'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-white/70 text-base sm:text-lg font-medium leading-relaxed mb-8 max-w-lg"
            >
              {content.sub}
            </motion.p>
          </AnimatePresence>

          {/* CTA */}
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: `0 0 30px ${slide.accent}60` }}
            whileTap={{ scale: 0.97 }}
            onClick={onShopNow}
            className="inline-flex items-center gap-3 px-8 py-4 bg-brand hover:bg-brand-dark text-gray-900 font-black text-base rounded-2xl shadow-lg transition-all"
          >
            <ShoppingBag className="w-5 h-5" />
            {t.heroCta}
          </motion.button>

          {/* Live stats row */}
          <div className="flex items-center gap-4 mt-6">
            <motion.div
              className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full"
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="w-3.5 h-3.5 text-brand" />
              <span className="text-white text-xs font-black">
                <motion.span
                  key={liveCount}
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="inline-block"
                >
                  {liveCount.toLocaleString()}
                </motion.span>
                {' '}orders today
              </span>
            </motion.div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full">
              <Users className="w-3.5 h-3.5 text-green-400" />
              <span className="text-white text-xs font-black">9 branches open</span>
            </div>
          </div>
        </div>

        {/* Slide controls */}
        <div className="absolute bottom-6 right-4 sm:right-6 flex items-center gap-3">
          <button onClick={() => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length)}
            className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <div className="flex gap-1.5">
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-brand' : 'w-1.5 bg-white/30'}`} />
            ))}
          </div>
          <button onClick={() => setCurrent(c => (c + 1) % SLIDES.length)}
            className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Live activity ticker — bottom left */}
      <div className="absolute bottom-4 left-4 sm:left-6 max-w-[260px]">
        <AnimatePresence mode="wait">
          {showTicker && (
            <motion.div
              key={tickerIdx}
              initial={{ opacity: 0, x: -20, y: 4 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.35 }}
              className="flex items-center gap-2 px-3 py-2 bg-black/40 backdrop-blur-md rounded-xl border border-white/10"
            >
              <span className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0 animate-pulse" />
              <span className="text-white/90 text-xs font-medium truncate">{TICKER_ITEMS[tickerIdx]}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

const SLIDES = [
  {
    id: 1,
    bg: 'from-[#0F172A] to-[#1E3A8A]',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&q=80',
    en: { headline: 'Fresh groceries,\nready in 20 min.', sub: 'Order online, pick up at your nearest Simba branch in Kigali. Pay with MTN MoMo or Airtel Money.' },
    fr: { headline: 'Courses fraîches,\nprêtes en 20 min.', sub: 'Commandez en ligne, retirez à votre agence Simba la plus proche. Payez avec MTN MoMo ou Airtel Money.' },
    rw: { headline: 'Ibicuruzwa bishya,\nbikitegurwa mu minota 20.', sub: 'Tumiza kuri interineti, fata ku ishami rya Simba riri hafi yawe. Wishura na MTN MoMo cyangwa Airtel Money.' },
  },
  {
    id: 2,
    bg: 'from-amber-700 to-orange-900',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&q=80',
    en: { headline: 'Freshly baked\nevery morning.', sub: 'Baguettes, croissants, cakes — baked fresh daily at Simba Bakery. Order ahead, pick up warm.' },
    fr: { headline: 'Fraîchement cuit\nchaque matin.', sub: 'Baguettes, croissants, gâteaux — cuits frais chaque jour à la boulangerie Simba. Commandez à l\'avance.' },
    rw: { headline: 'Bishyushye buri\ngitondo.', sub: 'Baguette, croissant, imikate — bitera buri munsi kuri Simba Bakery. Tumiza mbere, ufate bishyushye.' },
  },
  {
    id: 3,
    bg: 'from-emerald-800 to-teal-900',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&q=80',
    en: { headline: '700+ products,\n9 branches in Kigali.', sub: 'From groceries to electronics — everything you need at Simba. Choose your branch, we\'ll have it ready.' },
    fr: { headline: '700+ produits,\n9 agences à Kigali.', sub: 'Des courses à l\'électronique — tout ce dont vous avez besoin chez Simba. Choisissez votre agence.' },
    rw: { headline: 'Ibicuruzwa 700+,\namashami 9 i Kigali.', sub: 'Kuva ku biribwa kugeza ku bikoresho — byose kuri Simba. Hitamo ishami ryawe, tuzabikitegurira.' },
  },
];

export default function HeroSection({ onShopNow }: { onShopNow: () => void }) {
  const { language } = useSimbaStore();
  const [current, setCurrent] = useState(0);

  // Auto-advance every 5 seconds
  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const slide = SLIDES[current];
  const content = slide[language as 'en' | 'fr' | 'rw'] ?? slide.en;
  const t = translations[language];
  const cta = t.heroCta;
  const eyebrow = t.heroEyebrow;

  return (
    <section className="relative overflow-hidden" style={{ minHeight: '420px' }}>
      {/* Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className={`absolute inset-0 bg-gradient-to-r ${slide.bg}`}
        >
          {/* Background image */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20">
            <img src={slide.image} alt="" className="w-full h-full object-cover" />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 pt-14 pb-12">
        <div className="max-w-xl">

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full mb-5"
          >
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white/90 text-xs font-black uppercase tracking-widest">{eyebrow}</span>
          </motion.div>

          {/* Headline — animates per slide */}
          <AnimatePresence mode="wait">
            <motion.h1
              key={slide.id + '-headline'}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 whitespace-pre-line"
            >
              {content.headline}
            </motion.h1>
          </AnimatePresence>

          {/* Sub */}
          <AnimatePresence mode="wait">
            <motion.p
              key={slide.id + '-sub'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-white/70 text-base sm:text-lg font-medium leading-relaxed mb-8 max-w-lg"
            >
              {content.sub}
            </motion.p>
          </AnimatePresence>

          {/* CTA */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onShopNow}
            className="inline-flex items-center gap-3 px-8 py-4 bg-brand hover:bg-brand-dark text-gray-900 font-black text-base rounded-2xl shadow-lg shadow-brand/30 transition-all"
          >
            <ShoppingBag className="w-5 h-5" />
            {cta}
          </motion.button>
        </div>

        {/* Slide controls */}
        <div className="absolute bottom-6 right-4 sm:right-6 flex items-center gap-3">
          <button onClick={() => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length)}
            className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <div className="flex gap-1.5">
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${i === current ? 'w-6 bg-brand' : 'w-1.5 bg-white/30'}`} />
            ))}
          </div>
          <button onClick={() => setCurrent(c => (c + 1) % SLIDES.length)}
            className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </section>
  );
}
