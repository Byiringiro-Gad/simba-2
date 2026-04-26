'use client';

import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import { getSimbaData } from '@/lib/data';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '../ProductCard';
import { useMemo } from 'react';

export default function FavoritesTab() {
  const { favorites, language, user, setAuthOpen } = useSimbaStore();
  const t = translations[language];
  const allProducts = useMemo(() => getSimbaData().products, []);
  const favProducts = allProducts.filter(p => favorites.includes(p.id));

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
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center">
          <Heart className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white">{t.savedItemsTitle}</h1>
          <p className="text-sm text-gray-400">{favProducts.length} {favProducts.length !== 1 ? t.items : t.item}</p>
        </div>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {favProducts.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
