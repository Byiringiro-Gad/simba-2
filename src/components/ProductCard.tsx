import { useState } from 'react';
import { Product } from '@/types';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import { Plus, ShoppingBasket, Check, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

import Link from 'next/link';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, language } = useSimbaStore();
  const [isAdded, setIsAdded] = useState(false);
  const [flyData, setFlyData] = useState<{ x: number; y: number } | null>(null);
  const t = translations[language];

  const handleAddToCart = (e: React.MouseEvent) => {
    if (!product.inStock) return;
    
    // Calculate Fly coordinates using global screen space
    const cartElement = document.getElementById('cart-icon');
    const imgElement = e.currentTarget.closest('.group')?.querySelector('img');

    if (cartElement && imgElement) {
      const cartRect = cartElement.getBoundingClientRect();
      const imgRect = imgElement.getBoundingClientRect();
      
      setFlyData({
        x: cartRect.left - imgRect.left + (cartRect.width / 2),
        y: cartRect.top - imgRect.top + (cartRect.height / 2)
      });
    }

    setIsAdded(true);
    addToCart(product);
    
    // Reset animations
    setTimeout(() => {
      setIsAdded(false);
      setFlyData(null);
    }, 1000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all border border-gray-100 dark:border-gray-800 group relative"
    >
      {/* Flying Ghost Image */}
      <AnimatePresence>
        {flyData && (
          <motion.div
            initial={{ 
              scale: 1, 
              x: 0, 
              y: 0, 
              opacity: 1,
              borderRadius: '2rem'
            }}
            animate={{ 
              scale: 0.05, 
              x: flyData.x, 
              y: flyData.y, 
              opacity: 0.8,
              rotate: 720,
              borderRadius: '100%'
            }}
            transition={{ 
                duration: 1, 
                ease: [0.45, 0, 0.55, 1],
            }}
            className="absolute inset-2 z-[9999] pointer-events-none"
          >
             <div className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-2xl ring-4 ring-simba-gold">
                <Image src={product.image} alt="" fill className="object-cover" />
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 dark:bg-gray-800 m-2 rounded-[2rem]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="bg-white/90 dark:bg-black/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-sm border border-black/5 dark:border-white/5">
                {product.category.split(' ')[0]}
            </span>
          </div>
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px] flex flex-col items-center justify-center gap-2">
              <span className="bg-white text-black px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl">
                Restocking Soon
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-5 pt-2">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-bold text-sm line-clamp-2 min-h-[40px] text-gray-900 dark:text-gray-100 hover:text-simba-primary transition-colors leading-tight mb-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-end justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-xl font-black text-simba-dark dark:text-white tracking-tighter">
              {product.price.toLocaleString()} <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-widest uppercase ml-0.5">RWF</span>
            </span>
            <div className="flex items-center gap-1.5 mt-1">
                <ShoppingBasket className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Per {product.unit || 'Unit'}
                </span>
            </div>
            {/* Loyalty Points Badge */}
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-simba-gold/10 dark:bg-simba-gold/20 border border-simba-gold/30 rounded-lg">
                <div className="w-3 h-3 bg-simba-gold rounded-full flex items-center justify-center text-[6px] text-simba-blue font-black">S</div>
                <span className="text-[8px] font-black text-simba-blue dark:text-simba-gold uppercase tracking-tighter">
                  Earn {Math.floor(product.price / 100)} Points
                </span>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={
              `relative p-4 rounded-2xl transition-all ${
                isAdded 
                ? 'bg-green-500 text-white' 
                : product.inStock 
                  ? 'bg-simba-dark dark:bg-white text-white dark:text-simba-dark hover:shadow-xl active:bg-simba-primary' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-300 cursor-not-allowed'
              }`
            }
          >
            <AnimatePresence mode="wait">
              {isAdded ? (
                <motion.div key="check" initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
                    <Check className="w-5 h-5 stroke-[4px]" />
                </motion.div>
              ) : (
                <motion.div key="plus" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Plus className="w-5 h-5 stroke-[3px]" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
