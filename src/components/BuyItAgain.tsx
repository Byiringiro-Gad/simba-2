'use client';

import { useMemo } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { getSimbaData } from '@/lib/data';
import { motion } from 'framer-motion';
import { RefreshCw, Plus, Minus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function BuyItAgain() {
  const { orders, cart, addToCart, updateQuantity, language } = useSimbaStore();
  const { products } = useMemo(() => getSimbaData(), []);

  const frequentItems = useMemo(() => {
    const freq: Record<number, { count: number; lastDate: string; name: string; image: string; price: number }> = {};

    for (const order of orders) {
      for (const item of order.items) {
        if (!freq[item.id]) {
          freq[item.id] = { count: 0, lastDate: order.date, name: item.name, image: item.image, price: item.price };
        }
        freq[item.id].count++;
      }
    }

    return Object.entries(freq)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([id, data]) => {
        const product = products.find((p) => p.id === Number(id));
        return product ? { ...product, orderCount: data.count } : null;
      })
      .filter(Boolean) as Array<typeof products[0] & { orderCount: number }>;
  }, [orders, products]);

  if (frequentItems.length === 0) return null;

  const copy = {
    en: {
      title: 'Reorder',
      sub: 'Your usual items, ready in one tap',
      ordered: 'times ordered',
      add: 'Add',
    },
    fr: {
      title: 'Racheter',
      sub: 'Vos achats habituels, prets en un clic',
      ordered: 'fois commande',
      add: 'Ajouter',
    },
    rw: {
      title: 'Ongera kugura',
      sub: 'Ibyo ugura kenshi, byiteguye mu kanda imwe',
      ordered: 'inshuro zatumijwe',
      add: 'Ongeraho',
    },
  } as const;

  const L = copy[language];

  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl bg-green-500">
          <RefreshCw className="h-4 w-4 text-white" />
        </div>
        <div>
          <h2 className="text-base font-black leading-tight text-gray-900 dark:text-white">{L.title}</h2>
          <p className="text-xs font-medium text-gray-400">{L.sub}</p>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {frequentItems.map((p, i) => {
          const qty = cart.find((c) => c.id === p.id)?.quantity ?? 0;

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="w-36 flex-shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <Link href={`/products/${p.id}`} className="relative block h-28 bg-gray-50 dark:bg-gray-800">
                <Image src={p.image} alt={p.name} fill className="object-cover" sizes="144px" />
                <div className="absolute bottom-1.5 left-1.5 rounded-full bg-green-500 px-1.5 py-0.5 text-[9px] font-black text-white">
                  {p.orderCount} {L.ordered}
                </div>
              </Link>
              <div className="p-2.5">
                <p className="mb-1.5 min-h-[2rem] line-clamp-2 text-[11px] font-bold leading-tight text-gray-900 dark:text-white">
                  {p.name}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-gray-900 dark:text-white">
                    {p.price.toLocaleString()} <span className="text-[9px] font-medium text-gray-400">RWF</span>
                  </span>
                  {qty === 0 ? (
                    <button
                      onClick={() => addToCart(p)}
                      className="flex h-7 w-7 items-center justify-center rounded-xl bg-brand-dark text-white transition-all hover:bg-brand hover:text-gray-900"
                    >
                      <Plus className="h-3.5 w-3.5 stroke-[2.5px]" />
                    </button>
                  ) : (
                    <div className="flex items-center overflow-hidden rounded-xl bg-brand-dark">
                      <button
                        onClick={() => updateQuantity(p.id, qty - 1)}
                        className="flex h-7 w-6 items-center justify-center text-xs text-white transition-colors hover:bg-black/10"
                      >
                        <Minus className="h-2.5 w-2.5 stroke-[2.5px]" />
                      </button>
                      <span className="w-4 text-center text-[10px] font-black text-white">{qty}</span>
                      <button
                        onClick={() => addToCart(p)}
                        className="flex h-7 w-6 items-center justify-center text-xs text-white transition-colors hover:bg-black/10"
                      >
                        <Plus className="h-2.5 w-2.5 stroke-[2.5px]" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
