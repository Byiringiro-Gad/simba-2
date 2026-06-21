'use client';

import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import { getSimbaData } from '@/lib/data';
import { Heart, ShoppingCart, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '../ProductCard';
import { useMemo } from 'react';
import { toast } from '@/components/Toast';

export default function FavoritesTab() {
  const { favorites, language, user, setAuthOpen, addToCart, cart } = useSimbaStore();
  const t = translations[language];
  const lang = language as 'en' | 'fr' | 'rw';
  const allProducts = useMemo(() => getSimbaData().products, []);
  const favProducts = allProducts.filter(p => favorites.includes(p.id));

  // One-click: add all favourites not already in cart
  const handleAddAll = () => {
    const notInCart = favProducts.filter(p => !cart.find(c => c.id === p.id));
    if (notInCart.length === 0) {
      toast.info(lang === 'fr' ? 'Tous les articles sont déjà dans votre panier' : lang === 'rw' ? 'Ibintu byose biri mu gitebo' : 'All items already in cart');
      return;
    }
    notInCart.forEach(p => addToCart(p));
    toast.success(
      lang === 'fr' ? `${notInCart.length} article(s) ajouté(s) au panier` :
      lang === 'rw' ? `Ibintu ${notInCart.length} byongewe mu gitebo` :
      `${notInCart.length} item${notInCart.length > 1 ? 's' : ''} added to cart`
    );
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-3xl flex items-center justify-center mb-4">
          <Heart className="w-10 h-10 text-red-300" />
        </div>
        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">{t.savedItemsTitle}</h3>
        <p className="text-sm text-gray-400 mb-6">{t.signInToTrack}</p>
        <button
          onClick={() => setAuthOpen(true)}
          className="px-6 py-3 bg-brand-dark text-white rounded-2xl font-black text-sm hover:bg-gray-800 transition-colors"
        >
          {t.signInOrCreate}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 pb-28 sm:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center">
            <Heart className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white">{t.savedItemsTitle}</h1>
            <p className="text-sm text-gray-400">{favProducts.length} {favProducts.length !== 1 ? t.items : t.item}</p>
          </div>
        </div>

        {/* Add all to cart — one-click move */}
        {favProducts.length > 0 && (
          <button
            onClick={handleAddAll}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-dark hover:bg-gray-800 text-white rounded-2xl font-black text-xs transition-all shadow-sm"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {lang === 'fr' ? 'Tout ajouter' : lang === 'rw' ? 'Ongeraho Byose' : 'Add All to Cart'}
          </button>
        )}
      </div>

      {favProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-3xl flex items-center justify-center mb-4">
            <Heart className="w-10 h-10 text-red-300" />
          </div>
          <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">{t.noFavorites}</h3>
          <p className="text-sm text-gray-400">{t.noFavoritesSub}</p>
        </div>
      ) : (
        <>
          {/* Quick-add bar for items not yet in cart */}
          {favProducts.some(p => !cart.find(c => c.id === p.id)) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3 mb-4 bg-brand/5 dark:bg-brand/10 border border-brand/20 rounded-2xl"
            >
              <ShoppingBag className="w-4 h-4 text-brand flex-shrink-0" />
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 flex-1">
                {lang === 'fr' ? 'Cliquez sur le bouton + pour ajouter ou utilisez "Tout ajouter"' :
                 lang === 'rw' ? 'Kanda + kugira ngo wongere cyangwa ukoresha "Ongeraho Byose"' :
                 'Tap + on any item to add it, or use "Add All to Cart"'}
              </p>
            </motion.div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {favProducts.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
