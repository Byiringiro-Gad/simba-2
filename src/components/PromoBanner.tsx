'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { useSimbaStore } from '@/store/useSimbaStore';

const MESSAGES = [
  {
    id: 1,
    bg: 'bg-brand-dark',
    en: 'New customers get 15% off — use code WELCOME at checkout',
    fr: 'Nouveaux clients : 15% de réduction — code WELCOME',
    rw: 'Abakiriya bashya bagabanyirizwa 15% — kode WELCOME',
    code: 'WELCOME',
    cta: { en: 'Apply', fr: 'Appliquer', rw: 'Shyira' },
  },
  {
    id: 2,
    bg: 'bg-orange-600',
    en: 'Save 10% on your order today — use code SIMBA10',
    fr: 'Économisez 10% sur votre commande — code SIMBA10',
    rw: 'Igabanya 10% ku itumizwa ryawe — kode SIMBA10',
    code: 'SIMBA10',
    cta: { en: 'Apply', fr: 'Appliquer', rw: 'Shyira' },
  },
  {
    id: 3,
    bg: 'bg-emerald-700',
    en: 'Free pickup at 9 branches across Kigali — order online in minutes',
    fr: 'Retrait gratuit dans 9 agences à Kigali — commandez en quelques minutes',
    rw: 'Gufata ubuntu mu mashami 9 i Kigali — tumiza vuba',
    code: null,
    cta: { en: 'Shop now', fr: 'Acheter', rw: 'Gura' },
  },
];

export default function PromoBanner() {
  const { applyPromo, language, setShopNowOpen } = useSimbaStore();
  const [idx, setIdx] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % MESSAGES.length), 5000);
    return () => clearInterval(t);
  }, []);

  if (dismissed) return null;

  const msg = MESSAGES[idx];
  const text = msg[language as 'en' | 'fr' | 'rw'] ?? msg.en;
  const cta  = msg.cta[language as 'en' | 'fr' | 'rw'] ?? msg.cta.en;

  const handleCta = () => {
    if (msg.code) applyPromo(msg.code);
    else setShopNowOpen(true);
  };

  return (
    <div className={`${msg.bg} relative`}>
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-3">
        {/* Cycling dot */}
        <div className="flex gap-1 flex-shrink-0 items-center">
          {MESSAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`rounded-full transition-all ${i === idx ? 'w-3 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'}`}
              aria-label={`Message ${i + 1}`}
            />
          ))}
        </div>

        {/* Message */}
        <p className="text-white text-xs sm:text-sm font-medium flex-1 text-center truncate">{text}</p>

        {/* CTA + close */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleCta}
            className="flex items-center gap-1 px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white text-xs font-black rounded-lg transition-colors border border-white/20"
          >
            {cta} <ChevronRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="w-5 h-5 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
