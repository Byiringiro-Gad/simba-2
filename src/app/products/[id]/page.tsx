'use client';

import { useParams, useRouter } from 'next/navigation';
import { getSimbaData } from '@/lib/data';
import Navbar from '@/components/Navbar';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import { ChevronLeft, ShoppingCart, ShieldCheck, Truck, RefreshCcw, Zap, Plus } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { language, addToCart } = useSimbaStore();
  const t = translations[language];
  
  const data = getSimbaData();
  const product = data.products.find(p => p.id === Number(id));

  if (!product) return <div>Product not found</div>;

  return (
    <main className="min-h-screen bg-white dark:bg-simba-dark">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-simba-blue mb-8 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          {t.backToStore}
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-square rounded-3xl overflow-hidden bg-gray-50 dark:bg-gray-900 border dark:border-gray-800 shadow-2xl"
          >
            <Image 
              src={product.image} 
              alt={product.name} 
              fill 
              className="object-cover"
              priority
            />
          </motion.div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-6">
              <span className="text-sm font-bold text-simba-blue dark:text-simba-gold uppercase tracking-widest opacity-70">
                {product.category}
              </span>
              <h1 className="text-4xl font-black mt-2 mb-4 tracking-tight dark:text-white">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-simba-blue dark:text-white">
                  {product.price.toLocaleString()} RWF
                </span>
                {product.inStock ? (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                    In Stock
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed text-lg">
              High-quality {product.name} sourced directly from Simba Supermarket. 
              Available in {product.unit} units. Order now for fast delivery in Kigali.
            </p>

            <button
              onClick={() => product.inStock && addToCart(product)}
              disabled={!product.inStock}
              className="w-full py-5 bg-simba-gold hover:bg-simba-yellow text-simba-blue rounded-2xl font-black text-xl shadow-2xl shadow-simba-gold/20 transition-all active:scale-95 flex items-center justify-center gap-3 mb-8"
            >
              <ShoppingCart className="w-6 h-6" />
              {t.addToCart}
            </button>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 py-8 border-t dark:border-gray-800 mb-12">
              <div className="flex flex-col items-center text-center gap-2">
                <ShieldCheck className="w-6 h-6 text-simba-blue dark:text-simba-gold" />
                <span className="text-[10px] font-bold uppercase opacity-60">Authentic</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <Truck className="w-6 h-6 text-simba-blue dark:text-simba-gold" />
                <span className="text-[10px] font-bold uppercase opacity-60">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <RefreshCcw className="w-6 h-6 text-simba-blue dark:text-simba-gold" />
                <span className="text-[10px] font-bold uppercase opacity-60">Easy Return</span>
              </div>
            </div>

            {/* Frequently Bought Together */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-[2rem] border dark:border-gray-800">
                <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-simba-gold" /> Frequently Bought Together
                </h3>
                <div className="flex flex-col gap-4">
                    {data.products
                        .filter(p => p.category === product.category && p.id !== product.id)
                        .slice(0, 2)
                        .map(bundle => (
                            <div key={bundle.id} className="flex items-center gap-4 bg-white dark:bg-simba-dark p-3 rounded-2xl border dark:border-gray-800 group hover:border-simba-gold transition-colors">
                                <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                                    <Image src={bundle.image} alt={bundle.name} fill className="object-cover" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold line-clamp-1">{bundle.name}</p>
                                    <p className="text-[10px] font-black text-simba-primary">{bundle.price.toLocaleString()} RWF</p>
                                </div>
                                <button 
                                    onClick={() => addToCart(bundle)}
                                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-simba-primary hover:text-white transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    }
                </div>
                <div className="mt-4 pt-4 border-t dark:border-gray-800 flex justify-between items-center">
                    <p className="text-[10px] font-bold opacity-40 uppercase">Bundle Price</p>
                    <p className="text-sm font-black text-simba-blue dark:text-white">
                        {(product.price + data.products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 2).reduce((acc, p) => acc + p.price, 0)).toLocaleString()} RWF
                    </p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
