'use client';

import { useParams, useRouter } from 'next/navigation';
import { getSimbaData, getRelatedProducts } from '@/lib/data';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import {
  ChevronLeft, Plus, Minus, ShieldCheck, Truck,
  RefreshCcw, Star, Package, Tag
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import ProductCard from '@/components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { language, addToCart, updateQuantity, cart, isCartOpen, setCartOpen } = useSimbaStore();
  const t = translations[language];

  const data = useMemo(() => getSimbaData(), []);
  const product = data.products.find(p => p.id === Number(id));
  const related = product ? getRelatedProducts(product, 8) : [];

  const cartItem = cart.find(item => item.id === product?.id);
  const quantity = cartItem?.quantity ?? 0;

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 text-center px-4">
          <Package className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Product not found</h2>
          <Link href="/" className="text-brand font-bold hover:underline">{t.backToStore}</Link>
        </div>
      </div>
    );
  }

  const points = Math.floor(product.price / 100);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-gray-500 hover:text-brand transition-colors font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            {t.backToStore}
          </button>
          <span className="text-gray-300 dark:text-gray-700">/</span>
          <span className="text-gray-400 font-medium truncate">{product.category}</span>
          <span className="text-gray-300 dark:text-gray-700">/</span>
          <span className="text-gray-900 dark:text-white font-bold truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative aspect-square rounded-3xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm"
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {!product.inStock && (
              <div className="absolute inset-0 bg-white/70 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center">
                <span className="bg-gray-900 text-white px-5 py-2.5 rounded-full font-black uppercase tracking-widest text-sm">
                  {t.outOfStock}
                </span>
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col"
          >
            {/* Category + stock */}
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-brand/10 text-brand rounded-full text-xs font-black uppercase tracking-wider">
                {product.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                product.inStock
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              }`}>
                {product.inStock ? t.inStock : t.outOfStock}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight mb-2">
              {product.name}
            </h1>

            <p className="text-sm text-gray-400 font-medium mb-4">
              {t.perUnit} {product.unit || 'unit'}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-black text-gray-900 dark:text-white">
                {product.price.toLocaleString()}
              </span>
              <span className="text-base font-bold text-gray-400 uppercase tracking-wider">RWF</span>
            </div>

            {/* Loyalty points */}
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-brand/10 dark:bg-brand/20 rounded-xl mb-6 self-start">
              <Star className="w-4 h-4 text-brand" />
              <span className="text-xs font-black text-brand">
                {t.earnPoints} {points} {t.points} on this item
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
              High-quality {product.name} sourced directly from Simba Supermarket.
              Available per {product.unit}. Order now for fast delivery across Kigali.
            </p>

            {/* Add to cart / quantity */}
            <div className="flex items-center gap-3 mb-6">
              {quantity === 0 ? (
                <button
                  onClick={() => product.inStock && addToCart(product)}
                  disabled={!product.inStock}
                  className="flex-1 py-4 bg-brand hover:bg-brand/90 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-brand/20 disabled:shadow-none flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5 stroke-[2.5px]" />
                  {t.addToCart}
                </button>
              ) : (
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center gap-3 bg-brand rounded-2xl overflow-hidden shadow-lg shadow-brand/20">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="w-12 h-12 flex items-center justify-center text-white hover:bg-black/10 transition-colors"
                    >
                      <Minus className="w-4 h-4 stroke-[3px]" />
                    </button>
                    <span className="text-white font-black text-lg w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="w-12 h-12 flex items-center justify-center text-white hover:bg-black/10 transition-colors"
                    >
                      <Plus className="w-4 h-4 stroke-[3px]" />
                    </button>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Subtotal</p>
                    <p className="font-black text-gray-900 dark:text-white">{(product.price * quantity).toLocaleString()} RWF</p>
                  </div>
                </div>
              )}
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 py-5 border-t border-gray-100 dark:border-gray-800">
              {[
                { icon: ShieldCheck, label: 'Authentic' },
                { icon: Truck, label: 'Fast Delivery' },
                { icon: RefreshCcw, label: 'Easy Return' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 text-center">
                  <div className="w-10 h-10 bg-gray-50 dark:bg-gray-900 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-brand" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</span>
                </div>
              ))}
            </div>

            {/* Delivery info */}
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800">
              <Truck className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-black text-green-700 dark:text-green-400 uppercase tracking-wide">{t.estimatedTime}</p>
                <p className="text-sm font-bold text-green-800 dark:text-green-300">45 – 60 {t.mins} across Kigali</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">{t.relatedProducts}</h2>
              <button
                onClick={() => { router.push('/'); }}
                className="flex items-center gap-1 text-sm font-bold text-brand hover:underline"
              >
                {t.viewAll} <ChevronLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {related.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
