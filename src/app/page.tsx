'use client';

import { getSimbaData, getCategories } from '@/lib/data';
import Navbar from '@/components/Navbar';
import HubSwitcher from '@/components/HubSwitcher';
import CategoryBar from '@/components/CategoryBar';
import ProductGrid from '@/components/ProductGrid';
import CartDrawer from '@/components/CartDrawer';
import { useState, useEffect } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const data = getSimbaData();
  const categories = getCategories();
  const { language, cart, selectedHub, isCartOpen, setCartOpen } = useSimbaStore();
  const t = translations[language];

  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting(t.welcomeMorning);
    else if (hour < 18) setGreeting(t.welcomeAfternoon);
    else setGreeting(t.welcomeEvening);
  }, [language, t.welcomeMorning, t.welcomeAfternoon, t.welcomeEvening]);

  const hubContent = {
    supermarket: {
      title: "FRESHNESS DELIVERED.",
      tag: "Online Supermarket",
      desc: "Shop over 700+ authentic products from Simba and get them delivered in minutes.",
      color: "from-simba-primary to-simba-secondary"
    },
    bakery: {
      title: "FRESHLY BAKED.",
      tag: "Simba Bakery",
      desc: "Warm bread, delicious pastries, and custom cakes baked fresh every single morning.",
      color: "from-amber-500 to-orange-700"
    },
    restaurant: {
      title: "TASTY MEALS.",
      tag: "Simba Restaurant",
      desc: "Authentic Rwandan and International cuisine prepared by our top chefs.",
      color: "from-red-500 to-red-900"
    }
  }[selectedHub as 'supermarket' | 'bakery' | 'restaurant'];

  return (
    <main className="min-h-screen bg-white dark:bg-simba-dark transition-colors duration-300 pb-20 sm:pb-0">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[450px] overflow-hidden bg-simba-dark">
        <AnimatePresence mode="wait">
          <motion.div 
            key={selectedHub}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 opacity-60 bg-gradient-to-br ${hubContent.color}`}
          />
        </AnimatePresence>
        
        <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col justify-center items-start text-white">
          <motion.div
            key={selectedHub + "-content"}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="bg-white/20 backdrop-blur-md text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 inline-block border border-white/30">
              {greeting}
            </span>
            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-[0.9]">
              {hubContent.title}
            </h1>
            <p className="text-xl max-w-lg mb-8 opacity-90 font-medium">
              {hubContent.desc}
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-simba-dark px-10 py-5 rounded-2xl font-black flex items-center gap-2 hover:bg-simba-primary hover:text-white transition-all shadow-2xl group"
              >
                Shop Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="-mt-12 relative z-10">
        <HubSwitcher />
      </div>

      <CategoryBar categories={categories} />
      
      <section id="products-section" className="py-8 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            {t.featuredProducts}
            <div className="h-1 w-12 bg-simba-gold rounded-full"></div>
          </h2>
        </div>
        <ProductGrid products={data.products} />
      </section>

      {/* Mobile Floating Cart Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setCartOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-simba-primary text-white rounded-full shadow-2xl flex items-center gap-2 font-black sm:hidden"
      >
        <ShoppingCart className="w-6 h-6" />
        <span>{cart.length}</span>
      </motion.button>

      <CartDrawer isOpen={isCartOpen} onClose={() => setCartOpen(false)} />
      
      {/* Locations Map Section */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row items-end justify-between mb-8 gap-4">
            <div>
                <h2 className="text-3xl font-black tracking-tighter uppercase mb-1">Our Branches</h2>
                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Spotted across Kigali for your convenience</p>
            </div>
            <div className="flex gap-2">
                <span className="px-3 py-1.5 bg-red-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20">Live Locations</span>
            </div>
        </div>
        
        <div className="w-full h-[380px] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 relative group">
            <iframe 
                src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d63797.83980155694!2d30.0401!3d-1.95!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1ssimba%20supermarket!5e0!3m2!1sen!2srw!4v1713530000000!5m2!1sen!2srw" 
                className="w-full h-full grayscale-[0.1] contrast-[1.1] transition-all duration-700 dark:invert-[0.05]"
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
            />
            {/* Pulsing Red Dot Indicators (Visual Flourish) */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[45%] left-[48%] w-4 h-4 bg-red-500 rounded-full animate-ping opacity-75"></div>
                <div className="absolute top-[40%] left-[52%] w-3 h-3 bg-red-500 rounded-full animate-ping opacity-60"></div>
                <div className="absolute top-[55%] left-[42%] w-3 h-3 bg-red-500 rounded-full animate-ping opacity-60"></div>
            </div>

            {/* Map Overlay Label */}
            <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-simba-dark/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border dark:border-gray-700 transition-transform group-hover:-translate-y-1">
                <p className="text-[9px] font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span> 8 Active Branches
                </p>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="font-black text-2xl mb-4 text-simba-blue dark:text-simba-gold tracking-tighter uppercase">SIMBA</div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Rwanda's most trusted supermarket chain. Providing quality and freshness since inception. Rebuilt for the next generation of shoppers.
            </p>
          </div>
          <div>
            <div className="font-black mb-6 uppercase tracking-[0.2em] text-[10px] text-slate-400">Quick Contact</div>
            <p className="text-slate-600 dark:text-slate-300 font-bold">Kigali City Center, Rwanda</p>
            <p className="text-slate-600 dark:text-slate-300 font-bold">info@simbaonlineshopping.com</p>
            <p className="text-slate-600 dark:text-slate-300 font-bold mt-2">+250 788 000 000</p>
          </div>
          <div className="flex flex-col justify-between">
            <div>
                <div className="font-black mb-6 uppercase tracking-[0.2em] text-[10px] text-slate-400">Social Trust</div>
                <div className="flex gap-4">
                    <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center border dark:border-gray-700 shadow-sm font-black text-xs">IG</div>
                    <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center border dark:border-gray-700 shadow-sm font-black text-xs">FB</div>
                    <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center border dark:border-gray-700 shadow-sm font-black text-xs">WA</div>
                </div>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-8">
                © 2026 Simba Supermarket
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
