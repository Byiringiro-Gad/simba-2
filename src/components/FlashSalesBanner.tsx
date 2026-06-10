'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { getSimbaData } from '@/lib/data';
import { motion } from 'framer-motion';
import { Zap, X, Clock, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

function getKigaliHour(now = new Date()) {
  return Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Africa/Kigali',
      hour: '2-digit',
      hour12: false,
    }).format(now)
  );
}

function getFlashProducts(seed: number) {
  const { products } = getSimbaData();
  const shuffled = [...products.filter((p) => p.inStock && p.price > 500)]
    .sort((a, b) => ((a.id * 7 + seed * 13) % 97) - ((b.id * 7 + seed * 13) % 97));

  return shuffled.slice(0, 6).map((p) => ({
    ...p,
    discount: 10 + ((p.id + seed) % 4) * 5,
  }));
}

function getCountdown(now = new Date()) {
  const kigaliNow = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Kigali' }));
  const h = kigaliNow.getHours();
  const nextSlot = (Math.floor(h / 4) + 1) * 4;
  const next = new Date(kigaliNow);
  next.setHours(nextSlot, 0, 0, 0);
  return Math.max(0, next.getTime() - kigaliNow.getTime());
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

type ClockState = {
  seed: number;
  ms: number | null;
};

export default function FlashSalesBanner() {
  const { addToCart, updateQuantity, cart, language } = useSimbaStore();
  const [visible, setVisible] = useState(true);
  const [clock, setClock] = useState<ClockState>({ seed: 0, ms: null });
  const flashProducts = useMemo(() => getFlashProducts(clock.seed), [clock.seed]);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setClock({
        seed: Math.floor(getKigaliHour(now) / 4),
        ms: getCountdown(now),
      });
    };

    updateClock();
    const t = setInterval(updateClock, 1000);
    return () => clearInterval(t);
  }, []);

  const countdownUnits =
    clock.ms === null
      ? ['--', '--', '--']
      : [
          pad(Math.floor(clock.ms / 3600000)),
          pad(Math.floor((clock.ms % 3600000) / 60000)),
          pad(Math.floor((clock.ms % 60000) / 1000)),
        ];

  if (!visible || flashProducts.length === 0) return null;

  const L = {
    title: language === 'fr' ? 'Offres flash' : language === 'rw' ? 'Ibiciro byihuse' : 'Flash deals',
    sub: language === 'fr' ? 'Expire dans' : language === 'rw' ? 'Birangira mu' : 'Ends in',
    off: language === 'fr' ? 'de reduction' : language === 'rw' ? 'igabanyijwe' : 'off',
    add: language === 'fr' ? 'Ajouter' : language === 'rw' ? 'Ongeraho' : 'Add',
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-orange-500"
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)',
          backgroundSize: '12px 12px',
        }}
      />

      <div className="relative px-4 py-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-1.5 backdrop-blur-sm">
              <Zap className="h-4 w-4 fill-yellow-300 text-yellow-300" />
              <span className="text-sm font-black text-white">{L.title}</span>
            </div>
            <div className="hidden items-center gap-1.5 sm:flex">
              <Clock className="h-3.5 w-3.5 text-white/70" />
              <span className="text-xs font-medium text-white/80">{L.sub}</span>
              <div className="ml-1 flex items-center gap-0.5">
                {countdownUnits.map((unit, i) => (
                  <span key={i}>
                    <span className="rounded-lg bg-black/30 px-1.5 py-0.5 font-mono text-xs font-black text-white">{unit}</span>
                    {i < 2 && <span className="mx-0.5 text-xs text-white/70">:</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => setVisible(false)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-black/20 transition-colors hover:bg-black/30"
          >
            <X className="h-3.5 w-3.5 text-white" />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {flashProducts.map((p, i) => {
            const qty = cart.find((c) => c.id === p.id)?.quantity ?? 0;
            const discountedPrice = Math.round(p.price * (1 - p.discount / 100));

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="w-32 flex-shrink-0 overflow-hidden rounded-2xl bg-white shadow-lg"
              >
                <Link href={`/products/${p.id}`} className="relative block h-24 bg-gray-50">
                  <Image src={p.image} alt={p.name} fill className="object-cover" sizes="128px" />
                  <div className="absolute left-1.5 top-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-black text-white">
                    -{p.discount}% {L.off}
                  </div>
                </Link>

                <div className="p-2">
                  <p className="mb-1 min-h-[2rem] text-[10px] font-bold leading-tight text-gray-700 line-clamp-2">{p.name}</p>
                  <div className="mb-1.5 flex items-end gap-1">
                    <span className="text-sm font-black text-gray-900">{discountedPrice.toLocaleString()}</span>
                    <span className="text-[9px] text-gray-400 line-through">{p.price.toLocaleString()}</span>
                  </div>

                  {qty === 0 ? (
                    <button
                      onClick={() => addToCart(p)}
                      className="flex w-full items-center justify-center gap-1 rounded-lg bg-red-500 py-1 text-[10px] font-black text-white transition-colors hover:bg-red-600"
                    >
                      <ShoppingCart className="h-2.5 w-2.5" /> {L.add}
                    </button>
                  ) : (
                    <div className="flex items-center justify-between overflow-hidden rounded-lg bg-red-500">
                      <button
                        onClick={() => updateQuantity(p.id, qty - 1)}
                        className="flex h-6 w-6 items-center justify-center text-xs font-black text-white transition-colors hover:bg-black/10"
                      >
                        -
                      </button>
                      <span className="text-[10px] font-black text-white">{qty}</span>
                      <button
                        onClick={() => addToCart(p)}
                        className="flex h-6 w-6 items-center justify-center text-xs font-black text-white transition-colors hover:bg-black/10"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
