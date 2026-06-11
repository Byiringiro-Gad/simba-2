'use client';

import { useEffect, useState } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { motion } from 'framer-motion';
import { Zap, Clock, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface FlashProduct {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  inStock: boolean;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function getCountdownToNextHour() {
  const now = new Date();
  const ms = (60 - now.getMinutes()) * 60000 - now.getSeconds() * 1000 - now.getMilliseconds();
  return Math.max(0, ms);
}

export default function FlashSalesBanner() {
  const { addToCart, updateQuantity, cart, language } = useSimbaStore();
  const [products, setProducts] = useState<FlashProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [endsAt, setEndsAt] = useState<string | null>(null);

  // Fetch real flash deals from admin-configured promotions
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/promos?type=flash');
        const data = await res.json();
        if (data.ok && Array.isArray(data.flashDeals) && data.flashDeals.length > 0) {
          setProducts(data.flashDeals);
          setEndsAt(data.endsAt ?? null);
        } else {
          setProducts([]);
        }
      } catch {
        setProducts([]);
      }
      setLoading(false);
    };
    load();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!endsAt && products.length === 0) return;
    const tick = () => {
      if (endsAt) {
        const ms = Math.max(0, new Date(endsAt).getTime() - Date.now());
        setCountdown(ms);
      } else {
        setCountdown(getCountdownToNextHour());
      }
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [endsAt, products.length]);

  const countdownUnits = countdown === null
    ? ['--', '--', '--']
    : [
        pad(Math.floor(countdown / 3600000)),
        pad(Math.floor((countdown % 3600000) / 60000)),
        pad(Math.floor((countdown % 60000) / 1000)),
      ];

  const L = {
    title:   language === 'fr' ? 'Offres flash' : language === 'rw' ? 'Ibiciro byihuse' : 'Flash Deals',
    sub:     language === 'fr' ? 'Expire dans' : language === 'rw' ? 'Birangira mu' : 'Ends in',
    off:     language === 'fr' ? 'de réduction' : language === 'rw' ? 'igabanyijwe' : 'off',
    add:     language === 'fr' ? 'Ajouter' : language === 'rw' ? 'Ongeraho' : 'Add',
    none:    language === 'fr' ? 'Aucune offre flash en ce moment' : language === 'rw' ? 'Nta biciro byihuse ubu' : 'No flash deals right now',
    noneSub: language === 'fr' ? "L'administrateur peut en configurer depuis le panneau admin" : language === 'rw' ? 'Umuyobozi ashobora gubishyiraho' : 'The admin can configure deals from the admin panel',
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-orange-500 px-4 py-5">
        <div className="flex gap-3 overflow-x-auto">
          {[1,2,3,4].map(i => (
            <div key={i} className="w-32 flex-shrink-0 h-44 rounded-2xl bg-white/20 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-red-200 dark:border-red-900/40 px-6 py-8 text-center">
        <Zap className="w-8 h-8 text-red-300 mx-auto mb-2" />
        <p className="text-sm font-black text-gray-500 dark:text-gray-400">{L.none}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{L.noneSub}</p>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-orange-500"
    >
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)', backgroundSize: '12px 12px' }} />

      <div className="relative px-4 py-3">
        <div className="mb-3 flex items-center gap-3">
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

        <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {products.map((p, i) => {
            const qty = cart.find(c => c.id === p.id)?.quantity ?? 0;
            return (
              <motion.div key={p.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="w-32 flex-shrink-0 overflow-hidden rounded-2xl bg-white shadow-lg">
                <Link href={`/products/${p.id}`} className="relative block h-24 bg-gray-50">
                  <Image src={p.image} alt={p.name} fill className="object-cover" sizes="128px" />
                  <div className="absolute left-1.5 top-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-black text-white">
                    -{p.discount}% {L.off}
                  </div>
                </Link>
                <div className="p-2">
                  <p className="mb-1 min-h-[2rem] text-[10px] font-bold leading-tight text-gray-700 line-clamp-2">{p.name}</p>
                  <div className="mb-1.5 flex items-end gap-1">
                    <span className="text-sm font-black text-gray-900">{p.price.toLocaleString()}</span>
                    <span className="text-[9px] text-gray-400 line-through">{p.originalPrice.toLocaleString()}</span>
                  </div>
                  {qty === 0 ? (
                    <button onClick={() => addToCart({ id: p.id, name: p.name, price: p.price, image: p.image, inStock: p.inStock, category: '', unit: '', subcategoryId: 0 } as any)}
                      className="flex w-full items-center justify-center gap-1 rounded-lg bg-red-500 py-1 text-[10px] font-black text-white hover:bg-red-600 transition-colors">
                      <ShoppingCart className="h-2.5 w-2.5" /> {L.add}
                    </button>
                  ) : (
                    <div className="flex items-center justify-between overflow-hidden rounded-lg bg-red-500">
                      <button onClick={() => updateQuantity(p.id, qty - 1)} className="flex h-6 w-6 items-center justify-center text-xs font-black text-white hover:bg-black/10">-</button>
                      <span className="text-[10px] font-black text-white">{qty}</span>
                      <button onClick={() => updateQuantity(p.id, qty + 1)} className="flex h-6 w-6 items-center justify-center text-xs font-black text-white hover:bg-black/10">+</button>
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
