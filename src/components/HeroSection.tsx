'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import Image from 'next/image';

const SLIDES = [
  {
    id: 1,
    bg: '#1a237e',
    bgGrad: 'linear-gradient(135deg, #1a237e 0%, #283593 60%, #1565c0 100%)',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&q=85',
    badge: { en: 'Online Pickup · Kigali', fr: 'Retrait en ligne · Kigali', rw: 'Gufata kuri interineti · Kigali' },
    eyebrow: { en: 'Order online. Ready in 20–45 min.', fr: 'Commandez en ligne. Prêt en 20–45 min.', rw: 'Tumiza kuri interineti. Bitegurwa mu minota 20–45.' },
    headline: { en: 'Shop smarter.\nPick up at any\nof our 9 branches.', fr: 'Achetez mieux.\nRetrait dans\nnos 9 agences.', rw: 'Gura neza.\nFata mu mashami\nacu 9.' },
    cta: { en: 'Shop now', fr: 'Acheter maintenant', rw: 'Gura ubu' },
    ctaAction: 'shop',
  },
  {
    id: 2,
    bg: '#bf360c',
    bgGrad: 'linear-gradient(135deg, #bf360c 0%, #e64a19 60%, #ff6d00 100%)',
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=900&q=85',
    badge: { en: 'Fresh every day', fr: 'Frais chaque jour', rw: 'Bishya buri munsi' },
    eyebrow: { en: '700+ products across Groceries, Bakery, Cosmetics & more', fr: '700+ produits : Épicerie, Boulangerie, Cosmétiques...', rw: 'Ibicuruzwa 700+: Ibiribwa, Ufu, Kwiyitaho...' },
    headline: { en: 'Everything you\nneed, every day.', fr: 'Tout ce dont\nvous avez besoin.', rw: 'Byose\nukeneye.' },
    cta: { en: 'Browse products', fr: 'Voir les produits', rw: 'Reba ibicuruzwa' },
    ctaAction: 'shop',
  },
  {
    id: 3,
    bg: '#1b5e20',
    bgGrad: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 60%, #388e3c 100%)',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=900&q=85',
    badge: { en: 'Simba Supermarket', fr: 'Simba Supermarket', rw: 'Simba Supermarket' },
    eyebrow: { en: 'Pay 500 RWF deposit with MTN MoMo · Airtel Money · Card', fr: 'Dépôt de 500 RWF via MTN MoMo · Airtel Money · Carte', rw: 'Inguzanyo ya 500 RWF: MTN MoMo · Airtel Money · Ikarita' },
    headline: { en: 'Your branch,\nyour pickup\nwindow.', fr: 'Votre agence,\nvotre créneau\nde retrait.', rw: 'Ishami ryawe,\nigihe\ncyo gufata.' },
    cta: { en: 'Choose branch', fr: 'Choisir une agence', rw: 'Hitamo ishami' },
    ctaAction: 'branch',
  },
];

export default function HeroSection({ onShopNow }: { onShopNow: () => void }) {
  const { language, setPickupBranchModalOpen } = useSimbaStore();
  const t = translations[language];
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent(c => (c + 1) % SLIDES.length), []);
  const prev = useCallback(() => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [paused, next]);

  const slide = SLIDES[current];
  const lang  = language as 'en' | 'fr' | 'rw';

  const handleCta = () => {
    if (slide.ctaAction === 'branch') setPickupBranchModalOpen(true);
    else onShopNow();
  };

  return (
    <section className="w-full bg-gray-100 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
      <div
        className="relative w-full overflow-hidden"
        style={{ height: 'clamp(180px, 22vw, 260px)' }}
      >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
          style={{ background: slide.bgGrad }}
        >
          {/* Right image panel — exactly like Walmart */}
          <div className="absolute right-0 top-0 bottom-0 w-[45%] sm:w-[42%]">
            <Image
              src={slide.image}
              alt=""
              fill
              className="object-cover"
              sizes="45vw"
              priority={slide.id === 1}
            />
            {/* Gradient fade left edge of image */}
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(to right, ${slide.bg}, transparent 40%)` }}
            />
          </div>

          {/* Left content — text block */}
          <div className="relative z-10 h-full flex flex-col justify-center px-4 sm:px-8 lg:px-16 max-w-screen-xl mx-auto">
            <div className="max-w-[55%] sm:max-w-[50%]">
              <p className="text-white/65 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1 leading-none">
                {slide.eyebrow[lang] ?? slide.eyebrow.en}
              </p>

              <motion.h1
                key={slide.id + '-h'}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="font-black text-white whitespace-pre-line leading-[1.1] mb-4"
                style={{ fontSize: 'clamp(1.25rem, 2.8vw, 2.25rem)' }}
              >
                {slide.headline[lang] ?? slide.headline.en}
              </motion.h1>

              <button
                onClick={handleCta}
                className="inline-flex items-center px-5 py-2.5 bg-white text-gray-900 hover:bg-gray-50 font-black text-sm rounded-full shadow-md transition-all"
              >
                {slide.cta[lang] ?? slide.cta.en}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls — bottom right, exact Walmart layout: ‹ ⏸ › */}
      <div className="absolute bottom-3 right-4 z-20 flex items-center gap-1">
        <button
          onClick={prev}
          className="w-7 h-7 bg-black/25 hover:bg-black/45 rounded-full flex items-center justify-center transition-colors border border-white/20"
          aria-label="Previous"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={() => setPaused(p => !p)}
          className="w-7 h-7 bg-black/25 hover:bg-black/45 rounded-full flex items-center justify-center transition-colors border border-white/20"
          aria-label={paused ? 'Play' : 'Pause'}
        >
          {paused
            ? <Play className="w-3 h-3 text-white fill-white ml-0.5" />
            : <Pause className="w-3 h-3 text-white" />
          }
        </button>
        <button
          onClick={next}
          className="w-7 h-7 bg-black/25 hover:bg-black/45 rounded-full flex items-center justify-center transition-colors border border-white/20"
          aria-label="Next"
        >
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Dot indicators — bottom center */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
    </section>
  );
}
