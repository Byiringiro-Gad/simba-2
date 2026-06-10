'use client';

import { useMemo } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { getSimbaData } from '@/lib/data';
import { motion } from 'framer-motion';
import { ShoppingBasket, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CartSuggestions() {
  const { cart, addToCart, language } = useSimbaStore();
  const { products } = useMemo(() => getSimbaData(), []);

  // Suggestions based on cart categories — find products from same/complementary categories
  const suggestions = useMemo(() => {
    if (cart.length === 0) return [];
    const cartCategories = Array.from(new Set(cart.map(i => i.category)));
    const cartIds = new Set(cart.map(i => i.id));

    // Find products in same categories not already in cart
    const same = products
      .filter(p => p.inStock && !cartIds.has(p.id) && cartCategories.includes(p.category))
      .slice(0, 6);

    if (same.length >= 4) return same;

    // Fill with affordable in-stock products
    const extra = products
      .filter(p => p.inStock && !cartIds.has(p.id) && !same.find(s => s.id === p.id))
      .sort((a, b) => a.price - b.price)
      .slice(0, 6 - same.length);

    return [...same, ...extra];
  }, [cart, products]);

  if (suggestions.length === 0) return null;

  const L = {
    title: language === 'fr' ? 'Complétez votre panier' : language === 'rw' ? 'Uzuza Agosho Ryawe' : 'Complete Your Basket',
    sub: language === 'fr' ? 'Vous aimerez aussi' : language === 'rw' ? 'Uzakunda nanone' : 'You might also like',
    add: language === 'fr' ? 'Ajouter' : language === 'rw' ? 'Ongeraho' : 'Add',
  };

  return (
    <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-2 mb-3">
        <ShoppingBasket className="w-4 h-4 text-brand" />
        <div>
          <p className="text-xs font-black text-gray-900 dark:text-white">{L.title}</p>
          <p className="text-[10px] text-gray-400">{L.sub}</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {suggestions.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex-shrink-0 flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 w-44"
          >
            <Link href={`/products/${p.id}`} className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <Image src={p.image} alt={p.name} fill className="object-cover" sizes="40px" />
            </Link>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-gray-800 dark:text-gray-200 line-clamp-2 leading-tight">{p.name}</p>
              <p className="text-[10px] font-black text-gray-900 dark:text-white mt-0.5">{p.price.toLocaleString()} <span className="font-medium text-gray-400">RWF</span></p>
            </div>
            <button
              onClick={() => addToCart(p)}
              className="w-7 h-7 bg-brand-dark hover:bg-brand text-white rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5px]" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
