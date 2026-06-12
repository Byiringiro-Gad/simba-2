'use client';

import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ChevronRight, Clock } from 'lucide-react';

export default function MiniCartBar() {
  const { cart, setCartOpen, language, appliedPromo, promoDiscount } = useSimbaStore();
  const pathname = usePathname();
  const t = translations[language];

  const isStaffPage = pathname.startsWith('/admin') || pathname.startsWith('/branch') || pathname.startsWith('/staff');
  if (isStaffPage) return null;

  const itemCount = cart.reduce((a, i) => a + i.quantity, 0);
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = appliedPromo ? Math.floor(subtotal * (promoDiscount / 100)) : 0;
  const total = subtotal - discount;

  const L = {
    items: language === 'fr' ? (itemCount === 1 ? 'article' : 'articles') : language === 'rw' ? 'ibintu' : (itemCount === 1 ? 'item' : 'items'),
    checkout: language === 'fr' ? 'Voir le panier' : language === 'rw' ? 'Reba Agosho' : 'View Cart',
    ready: language === 'fr' ? 'Prêt en ~30 min' : language === 'rw' ? 'Bitegurwa ~30 min' : 'Ready in ~30 min',
    saved: language === 'fr' ? `Économisé: ${discount.toLocaleString()} RWF` : language === 'rw' ? `Wagabanyije: ${discount.toLocaleString()} RWF` : `Saved: ${discount.toLocaleString()} RWF`,
  };

  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="fixed bottom-24 sm:bottom-32 left-1/2 -translate-x-1/2 z-[58] hidden sm:flex items-center gap-4 px-5 py-3.5 bg-gray-900 dark:bg-white rounded-2xl shadow-2xl border border-white/10 dark:border-gray-200 max-w-xl w-[calc(100vw-3rem)]"
          style={{ backdropFilter: 'blur(16px)' }}
        >
          {/* Cart icon + count */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-gray-900" />
            </div>
            <motion.span
              key={itemCount}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-gray-900 dark:border-white"
            >
              {itemCount > 9 ? '9+' : itemCount}
            </motion.span>
          </div>

          {/* Summary */}
          <div className="flex-1 min-w-0">
            <p className="text-white dark:text-gray-900 font-black text-sm leading-none">
              {itemCount} {L.items} · {total.toLocaleString()} RWF
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1 text-white/60 dark:text-gray-500 text-[10px]">
                <Clock className="w-2.5 h-2.5" /> {L.ready}
              </span>
              {discount > 0 && (
                <span className="text-green-400 dark:text-green-600 text-[10px] font-bold">{L.saved}</span>
              )}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-dark text-gray-900 rounded-xl font-black text-sm transition-all flex-shrink-0 shadow-brand-md"
          >
            {L.checkout}
            <ChevronRight className="w-4 h-4 stroke-[2.5px]" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
