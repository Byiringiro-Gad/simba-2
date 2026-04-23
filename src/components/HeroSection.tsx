'use client';

import { useState, useEffect } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';

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
