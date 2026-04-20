'use client';

import { Product } from '@/types';
import { useSimbaStore } from '@/store/useSimbaStore';
import { Plus, Minus, Heart } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { clsx } from 'clsx';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, updateQuantity, cart, toggleFavorite, favorites } = useSimbaStore();

  const cartItem = cart.find(i => i.id === product.id);
  const quantity = cartItem?.quantity ?? 0;
  const isFav = favorites.includes(product.id);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!product.inStock) return;
    addToCart(product);
  };
  const handleInc = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    updateQuantity(product.id, quantity + 1);
  };
  const handleDec = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    updateQuantity(product.id, quantity - 1);
  };
  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    toggleFavorite(product.id);
  };

  return (
    <div className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200 flex flex-col">
      {/* Image */}
      <Link href={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-800">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />

        {/* Favorite button */}
        <button
          onClick={handleFav}
          className="absolute top-2 right-2 w-7 h-7 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform z-10"
          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={clsx('w-3.5 h-3.5 transition-colors', isFav ? 'fill-red-500 text-red-500' : 'text-gray-400')} />
        </button>

        {/* Out of stock */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/70 dark:bg-black/70 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug mb-1 hover:text-brand transition-colors min-h-[2rem]">
            {product.name}
          </h3>
        </Link>
        <p className="text-[10px] text-gray-400 font-medium mb-2">per {product.unit || 'unit'}</p>

        <div className="mt-auto flex items-center justify-between gap-1">
          <div>
            <p className="text-sm font-black text-gray-900 dark:text-white leading-none">
              {product.price.toLocaleString()}
            </p>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">RWF</p>
          </div>

          {/* Quantity control */}
          <AnimatePresence mode="wait">
            {quantity === 0 ? (
              <motion.button
                key="add"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.12 }}
                onClick={handleAdd}
                disabled={!product.inStock}
                className={clsx(
                  'w-8 h-8 rounded-xl flex items-center justify-center transition-all',
                  product.inStock
                    ? 'bg-brand hover:bg-brand-dark text-white active:scale-95 shadow-sm shadow-brand/30'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-300 cursor-not-allowed'
                )}
              >
                <Plus className="w-4 h-4 stroke-[2.5px]" />
              </motion.button>
            ) : (
              <motion.div
                key="controls"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="flex items-center bg-brand rounded-xl overflow-hidden shadow-sm shadow-brand/30"
              >
                <button onClick={handleDec} className="w-7 h-8 flex items-center justify-center text-white hover:bg-black/10 transition-colors">
                  <Minus className="w-3 h-3 stroke-[3px]" />
                </button>
                <span className="text-white font-black text-xs w-4 text-center select-none">{quantity}</span>
                <button onClick={handleInc} className="w-7 h-8 flex items-center justify-center text-white hover:bg-black/10 transition-colors">
                  <Plus className="w-3 h-3 stroke-[3px]" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

