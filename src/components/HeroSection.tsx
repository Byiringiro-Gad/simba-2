'use client';

import { useState, useEffect } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, MapPin, Clock, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1400&q=85',
    overlay: 'from-[#0F172A]/90 via-[#0F172A]/70 to-transparent',
    badge: { en: "Kigali's Trusted Supermarket", fr: 'Le supermarché de confiance à Kigali', rw: 'Isoko yizewe i Kigali' },
    en: { headline: 'Shop smart.\nPick up fast.', sub: 'Order from 700+ products and collect at any of our 9 Kigali branches in 20–45 minutes.' },
    fr: { headline: 'Achetez malin.\nRetrait rapide.', sub: "Commandez parmi 700+ produits et retirez dans l'une de nos 9 agences à Kigali en 20–45 min." },
    rw: { headline: 'Gura neza.\nFata vuba.', sub: 'Tumiza mu bicuruzwa 700+ maze ufate mu mashami 9 ya Simba i Kigali mu minota 20–45.' },
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1400&q=85',
    overlay: 'from-amber-900/90 via-orange-900/70 to-transparent',
    badge: { en: 'Fresh Every Day', fr: 'Frais chaque jour', rw: 'Bishya buri munsi' },
    en: { headline: 'Groceries,\nbakery & more.', sub: 'From fresh milk and bread to household essentials — everything under one roof at Simba.' },
    fr: { headline: 'Épicerie,\nboulangerie & plus.', sub: 'Du lait frais et du pain aux produits ménagers — tout sous un même toit chez Simba.' },
    rw: { headline: 'Ibiribwa,\nimikate & ibindi.', sub: "Kuva ku mata n'umugati kugeza ku bintu byo mu rugo — byose aha hantu hamwe kuri Simba." },
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&q=85',
    overlay: 'from-emerald-900/90 via-teal-900/70 to-transparent',
    badge: { en: '9 Branches Open Now', fr: '9 agences ouvertes', rw: 'Amashami 9 afunguye' },
    en: { headline: 'Your branch.\nYour schedule.', sub: 'Choose from Remera, Kimironko, Kacyiru, Nyamirambo and 5 more. Pay with MTN MoMo, Airtel or card.' },
    fr: { headline: 'Votre agence.\nVos horaires.', sub: 'Choisissez parmi Remera, Kimironko, Kacyiru, Nyamirambo et 5 autres. Payez MTN MoMo, Airtel ou carte.' },
    rw: { headline: 'Ishami ryawe.\nAmasaha yawe.', sub: "Hitamo hagati ya Remera, Kimironko, Kacyiru, Nyamirambo n'ibindi 5. Wishura na MTN MoMo, Airtel cyangwa ikarita." },
  },
];

const TRUST_ITEMS = [
  { icon: Clock,       en: 'Ready in 20–45 min',      fr: 'Prêt en 20–45 min',         rw: 'Bitegurwa mu minota 20–45' },
  { icon: MapPin,      en: '9 branches in Kigali',     fr: '9 agences à Kigali',         rw: 'Amashami 9 i Kigali' },
  { icon: Shield,      en: '100% authentic products',  fr: 'Produits authentiques',      rw: 'Ibicuruzwa nyakuri' },
  { icon: ShoppingBag, en: 'Pickup only',              fr: 'Retrait uniquement',          rw: 'Gufata gusa' },
];

export default function HeroSection({ onShopNow }: { onShopNow: () => void }) {
  const { language, setPickupBranchModalOpen } = useSimbaStore();
  const t = translations[language];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 7000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[current];
  const content = slide[language as 'en' | 'fr' | 'rw'] ?? slide.en;
  const badge   = slide.badge[language as 'en' | 'fr' | 'rw'] ?? slide.badge.en;

  return (
    <section className="relative overflow-hidden bg-[#0F172A]" style={{ minHeight: 'min(480px, 85vw)' }}>

      {/* Background image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.85 }}
          className="absolute inset-0"
        >
          <Image
            src={slide.image}
            alt="Simba Supermarket"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlay}`} />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 pt-12 pb-10">
        <div className="max-w-2xl">

          {/* Badge */}
          <motion.div
            key={slide.id + '-b'}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 bg-brand rounded-full"
          >
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-gray-900 text-xs font-black uppercase tracking-widest">{badge}</span>
          </motion.div>

          {/* Headline */}
          <AnimatePresence mode="wait">
            <motion.h1
              key={slide.id + '-h'}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-3 whitespace-pre-line"
            >
              {content.headline}
            </motion.h1>
          </AnimatePresence>

          {/* Sub-text */}
          <AnimatePresence mode="wait">
            <motion.p
              key={slide.id + '-p'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, delay: 0.08 }}
              className="text-white/75 text-base sm:text-lg font-medium leading-relaxed mb-8 max-w-lg"
            >
              {content.sub}
            </motion.p>
          </AnimatePresence>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onShopNow}
              className="flex items-center gap-2.5 px-7 py-3.5 bg-brand hover:bg-brand-dark text-white font-black text-base rounded-2xl shadow-brand-lg transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
              {t.heroCta}
            </motion.button>
            <button
              onClick={() => setPickupBranchModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-2xl border border-white/25 backdrop-blur-sm transition-all"
            >
              <MapPin className="w-4 h-4" />
              {language === 'fr' ? 'Choisir une agence' : language === 'rw' ? 'Hitamo ishami' : 'Choose branch'}
            </button>
          </div>
        </div>

        {/* Slide controls */}
        <div className="absolute bottom-10 right-4 sm:right-6 flex items-center gap-2.5">
          <button
            onClick={() => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length)}
            className="w-9 h-9 bg-white/15 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors border border-white/20"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <div className="flex gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 h-1.5 bg-brand' : 'w-1.5 h-1.5 bg-white/40'}`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrent(c => (c + 1) % SLIDES.length)}
            className="w-9 h-9 bg-white/15 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors border border-white/20"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Trust bar */}
      <div className="relative z-10 bg-white/10 backdrop-blur-md border-t border-white/10">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="flex items-center overflow-x-auto gap-0 py-3" style={{ scrollbarWidth: 'none' }}>
            {TRUST_ITEMS.map(({ icon: Icon, en, fr, rw: rw_ }, i) => {
              const label = language === 'fr' ? fr : language === 'rw' ? rw_ : en;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-2 flex-shrink-0 px-4 py-1.5 ${i < TRUST_ITEMS.length - 1 ? 'border-r border-white/20' : ''}`}
                >
                  <Icon className="w-4 h-4 text-brand flex-shrink-0" />
                  <span className="text-white/90 text-xs font-semibold whitespace-nowrap">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
