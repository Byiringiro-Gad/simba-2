'use client';

import Link from 'next/link';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import PickupBranchModal from '@/components/PickupBranchModal';
import { ShoppingCart, ArrowLeft } from 'lucide-react';

export default function CheckoutPage() {
  const { cart, isCartOpen, setCartOpen, language } = useSimbaStore();
  const t = translations[language];
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const isFr = language === 'fr';
  const isRw = language === 'rw';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 py-8 pb-24">

        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {isFr ? 'Retour au magasin' : isRw? 'Subira + Gucuruza' : 'Back to Store'}
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-brand-dark rounded-2xl flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-brand" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              {isFr ? 'Commande' : isRw ? 'Gutumiza' : 'Checkout'}
            </h1>
            <p className="text-sm text-gray-400">{itemCount} {t.items} &middot; {subtotal.toLocaleString()} RWF</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 text-center">
              <div className="w-16 h-16 bg-brand-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-brand" />
              </div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                {isFr ? 'Votre panier' : isRw ? 'Igitebo Cyawe' : 'Your Cart'}
              </h2>
              <p className="text-gray-400 text-sm mb-1">{itemCount} {t.items}</p>
              <p className="text-xs text-gray-400 mb-6">
                {isFr ? 'Sélectionnez une agence Simba · Payez 500 RWF de dépôt via MTN MoMo ou Airtel Money · Retirez la commande en 20-45 min' : isRw ? 'Hitamo ishami rya Simba ana MTN MoMo cyangwa Airtel Money - Fata mu minota 20-45' : 'Select a Simba branch · Pay 500 RWF deposit via MTN MoMo or Airtel Money B· Pick up in 20-45 min'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setCartOpen(true)}
                  className="px-8 py-4 bg-brand-dark text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors"
                >
                  {isFr ? 'Passer la commande' : isRw ? 'Gutumiza' : 'Proceed to Checkout'}
                </button>
                <Link href="/" className="px-8 py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  {isFr ? 'Continuer les achats' : isRw ? 'Komeza Gucuruza' : 'Continue Shopping'}
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <h3 className="font-black text-gray-900 dark:text-white mb-4">
                {isFr ? 'Comment commander' : isRw ? 'Uburyo bwo Gutumiza' : 'How to Order'}
              </h3>
              <div className="space-y-4">
                {[
                  { icon: '🏪', en: 'Select Branch', fr: 'Choisir une agence', rw:'hitamo Ishami', en2: 'Pick your nearest Simba branch in Kigali', fr2: 'Choisissez votre agence Simba la plus proche', rw2: 'Hitamo ishami rya Simba riri hafi yawe' },
                  { icon: '💳', en: 'Pay Deposit', fr: 'Payer le dépôt', rw:'Wishura Inguzanyo', en2: '500 RWF via MTN MoMo or Airtel Money', fr2: '500 RWF via MTN MoMo ou Airtel Money', rw2: '500 RWF na MTN MoMo cyangwa Airtel Money' },
                  { icon: '✅', en: 'Pick Up', fr: 'Retirer', rw:'Gufata', en2: 'Ready in 20-45 minutes at your branch', fr2: 'Prêt en 20-45 minutes à votre agence', rw2: 'Bitegurwa mu minota 20-45 ku ishami ryawe' },
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-brand-muted rounded-xl flex items-center justify-center flex-shrink-0 text-base">{s.icon}</div>
                    <div>
                      <p className="font-black text-sm text-gray-900 dark:text-white">{isFr ? s.fr : isRw ? s.rw : s.en}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{isFr ? s.fr2 : isRw ? s.rw2 : s.en2}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-brand-dark rounded-2xl p-5">
              <p className="font-black text-white mb-1">
                {isFr ? 'Dépôt requis: 500 RWF' : isRw? 'Inguzanyo: 500 RWF' : 'Deposit required: 500 RWF'}
              </p>
              <p className="text-white/60 text-xs">
                {isFr ? 'MTN MoMo ou Airtel Money' : isRw ? 'MTN MoMo cyangwa Airtel Money' : 'MTN MoMo or Airtel Money'}
              </p>
              <div className="flex gap-2 mt-3">
                <span className="px-3 py-1.5 bg-yellow-400 text-black rounded-xl text-xs font-black">MTN MoMo</span>
                <span className="px-3 py-1.5 bg-red-500 text-white rounded-xl text-xs font-black">Airtel Money</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CartDrawer isOpen={isCartOpen} onClose={() => setCartOpen(false)} />
      <PickupBranchModal />
    </div>
  );
}
