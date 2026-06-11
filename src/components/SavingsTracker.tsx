'use client';

import { useSimbaStore } from '@/store/useSimbaStore';
import { motion } from 'framer-motion';
import { PiggyBank } from 'lucide-react';

export default function SavingsTracker() {
  const { cart, appliedPromo, promoDiscount, language } = useSimbaStore();

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountAmount = appliedPromo ? Math.floor(subtotal * (promoDiscount / 100)) : 0;
  const loyaltyPoints = Math.floor(subtotal / 100);

  if (subtotal === 0) return null;

  const L = {
    saved: language === 'fr' ? 'Économies' : language === 'rw' ? 'Ibyagabanyijwe' : 'Your Savings',
    points: language === 'fr' ? 'pts fidélité à gagner' : language === 'rw' ? 'amanota uzakora' : 'loyalty pts to earn',
    potential: language === 'fr' ? 'Économisez jusqu\'à' : language === 'rw' ? 'Basha kuzigama' : 'Save up to',
    withPromo: language === 'fr' ? 'avec un code promo' : language === 'rw' ? 'ukoresheje code ya promo' : 'with a promo code',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-4 my-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800"
    >
      <div className="flex items-center gap-2">
        <PiggyBank className="w-4 h-4 text-green-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          {discountAmount > 0 ? (
            <p className="text-xs font-black text-green-700 dark:text-green-400">
              {L.saved}: {discountAmount.toLocaleString()} RWF · +{loyaltyPoints} {L.points}
            </p>
          ) : (
            <p className="text-xs font-bold text-green-700 dark:text-green-400">
              +{loyaltyPoints} {L.points}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
