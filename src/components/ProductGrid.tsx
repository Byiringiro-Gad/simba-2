'use client';

import { Product } from '@/types';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import ProductCard from './ProductCard';
import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchX } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const { searchQuery, selectedCategory, language } = useSimbaStore();
  const t = translations[language];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = !searchQuery.trim() ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-brand-muted rounded-2xl flex items-center justify-center mb-4">
          <SearchX className="w-8 h-8 text-brand/40" />
        </div>
        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">{t.noProducts}</h3>
        <p className="text-sm text-gray-400 font-medium">{t.trySearch}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Result count */}
      <div className="pb-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          {filteredProducts.length} {filteredProducts.length === 1 ? t.item : t.items}
          {selectedCategory ? ` · ${selectedCategory}` : ''}
          {searchQuery ? ` · "${searchQuery}"` : ''}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18, delay: Math.min(index * 0.02, 0.25) }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

