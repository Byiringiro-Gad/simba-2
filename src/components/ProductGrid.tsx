'use client';

import { Product } from '@/types';
import { useSimbaStore } from '@/store/useSimbaStore';
import ProductCard from './ProductCard';
import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const { searchQuery, selectedCategory, selectedHub } = useSimbaStore();

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Hub Filtering
      const isBakery = product.category.toLowerCase().includes('bakery');
      const isCosmetics = product.category.toLowerCase().includes('cosmetics');
      
      if (selectedHub === 'bakery' && !isBakery) return false;
      if (selectedHub === 'restaurant' && !product.category.toLowerCase().includes('food')) return false;
      if (selectedHub === 'supermarket' && isBakery) return false;

      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory, selectedHub]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4 max-w-7xl mx-auto">
      <AnimatePresence mode="popLayout">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </AnimatePresence>
      
      {filteredProducts.length === 0 && (
        <div className="col-span-full py-20 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No products found matching your search.
          </p>
        </div>
      )}
    </div>
  );
}
