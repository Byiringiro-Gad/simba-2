'use client';

import { useState } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import { X, Plus, Minus, Trash2, Smartphone, CheckCircle2, Bike, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { cart, updateQuantity, removeFromCart, clearCart, language } = useSimbaStore();
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'payment' | 'tracking' | 'success'>('cart');
  const [momoNumber, setMomoNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [selectedCarrier, setSelectedCarrier] = useState<'mtn' | 'airtel'>('mtn');
  
  const t = translations[language];
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalPoints = Math.floor(total / 100);

  const handleBack = () => {
    if (checkoutStep === 'details') setCheckoutStep('cart');
    if (checkoutStep === 'payment') setCheckoutStep('details');
  };

  const handleCheckout = () => {
    if (checkoutStep === 'cart') setCheckoutStep('details');
    else if (checkoutStep === 'details') {
        if (!fullName.trim() || !address.trim()) {
            alert('Please fill in all delivery details');
            return;
        }
        setCheckoutStep('payment');
    }
    else if (checkoutStep === 'payment') {
      if (momoNumber.length < 8) {
          alert('Please enter a valid phone number');
          return;
      }
      setCheckoutStep('tracking');
      setTimeout(() => setCheckoutStep('success'), 6000); 
    }
  };

  const handleReset = () => {
    clearCart();
    setCheckoutStep('cart');
    setFullName('');
    setAddress('');
    setMomoNumber('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" 
        onClick={onClose} 
      />
      
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-simba-dark shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-800">
          <div className="flex items-center gap-3">
            {(checkoutStep !== 'cart' && checkoutStep !== 'success' && checkoutStep !== 'tracking') && (
                <button 
                    onClick={handleBack}
                    className="p-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl transition-all hover:scale-110 active:scale-90"
                >
                    <ChevronLeft className="w-5 h-5 stroke-[3px]" />
                </button>
            )}
            <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">
                {checkoutStep === 'success' ? t.success : checkoutStep === 'tracking' ? 'Live Tracking' : t.cart}
                {checkoutStep === 'cart' && <span className="ml-2 text-sm font-normal text-gray-400">({cart.length})</span>}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {cart.length > 0 && checkoutStep === 'cart' && (
                <button 
                    onClick={() => { if(confirm(t.clearCartConfirm)) clearCart() }}
                    className="p-2 hover:bg-red-50 text-red-400 hover:text-red-500 rounded-full transition-colors flex items-center gap-2 text-xs font-bold uppercase"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {checkoutStep === 'cart' && (
              <motion.div 
                key="cart"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col gap-4"
              >
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 opacity-40">
                    <Trash2 className="w-16 h-16 mb-4 text-slate-300 dark:text-slate-600" />
                    <p className="font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{t.emptyCart}</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 group">
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow border border-white dark:border-gray-700">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-sm line-clamp-1 leading-tight text-slate-900 dark:text-white">{item.name}</h4>
                          <p className="text-xs text-simba-primary font-black mt-1">
                            {item.price.toLocaleString()} RWF
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 px-3 py-1.5 shadow-sm">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 text-slate-400 hover:text-red-500 transition-colors"><Minus className="w-3 h-3" /></button>
                            <span className="text-xs font-black w-4 text-center text-slate-900 dark:text-white">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 text-slate-400 hover:text-simba-primary transition-colors"><Plus className="w-3 h-3" /></button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {checkoutStep === 'details' && (
              <motion.div 
                key="details"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex gap-2 mb-6">
                    <button className="flex-1 p-5 rounded-2xl border-2 border-simba-primary bg-simba-primary/5 text-simba-blue dark:text-simba-primary font-black text-xs uppercase tracking-widest shadow-sm">
                        Home Delivery
                    </button>
                    <button className="flex-1 p-5 rounded-2xl border-2 border-slate-100 dark:border-gray-800 text-slate-400 dark:text-gray-500 font-black text-xs uppercase tracking-widest">
                        Store Pickup
                    </button>
                </div>
                <div className="p-4 bg-simba-primary/10 rounded-2xl border border-simba-primary/20">
                  <p className="text-xs font-bold text-simba-blue dark:text-simba-primary uppercase tracking-wider">{t.estimatedTime}: 45-60 {t.mins}</p>
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1 ml-1 block">Full Name *</label>
                    <input 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Jean Pierre" 
                        required
                        className="w-full p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-simba-primary outline-none transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400" 
                    />
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1 ml-1 block">Delivery Address *</label>
                    <textarea 
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Street number, Landmark, or Apartment" 
                        required
                        className="w-full p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-simba-primary outline-none transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400 h-32" 
                    />
                </div>
              </motion.div>
            )}

            {checkoutStep === 'payment' && (
              <motion.div 
                key="payment"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex flex-col gap-4 mb-8">
                    <button 
                        onClick={() => setSelectedCarrier('mtn')}
                        className={`w-full p-5 rounded-2xl font-black flex items-center justify-between transition-all border-2 ${
                            selectedCarrier === 'mtn' 
                            ? "bg-[#FFCC00] text-black border-black/10 shadow-xl scale-[1.02]" 
                            : "bg-gray-50 dark:bg-gray-800 text-slate-400 border-transparent"
                        }`}
                    >
                        <span className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[10px] font-black border border-black/5">MTN</div>
                            MTN MoMo
                        </span>
                        <div className={`w-6 h-6 rounded-full border-4 ${selectedCarrier === 'mtn' ? "border-black bg-black" : "border-slate-200"}`}></div>
                    </button>
                    <button 
                        onClick={() => setSelectedCarrier('airtel')}
                        className={`w-full p-5 rounded-2xl font-black flex items-center justify-between transition-all border-2 ${
                            selectedCarrier === 'airtel' 
                            ? "bg-[#ED1C24] text-white border-white/10 shadow-xl scale-[1.02]" 
                            : "bg-gray-100 dark:bg-gray-800 text-slate-400 border-transparent"
                        }`}
                    >
                        <span className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white text-red-600 rounded-xl flex items-center justify-center text-[10px] font-black">AIRTEL</div>
                            Airtel Money
                        </span>
                        <div className={`w-6 h-6 rounded-full border-4 ${selectedCarrier === 'airtel' ? "border-white bg-white" : "border-slate-200"}`}></div>
                    </button>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 ml-1">{t.phoneNumber} *</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-lg text-slate-400">+250</span>
                    <input 
                      type="tel" 
                      value={momoNumber}
                      onChange={(e) => setMomoNumber(e.target.value)}
                      placeholder={selectedCarrier === 'mtn' ? "78X XXX XXX" : "73X XXX XXX"} 
                      required
                      className="w-full pl-20 p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-simba-primary font-black text-xl tracking-[0.1em] text-slate-900 dark:text-white" 
                    />
                  </div>
                  <p className="text-[10px] text-center text-slate-500 dark:text-slate-400 font-bold px-4">
                    You will receive a {selectedCarrier.toUpperCase()} push notification to authorize this payment of {total.toLocaleString()} RWF.
                  </p>
                </div>
              </motion.div>
            )}

            {checkoutStep === 'tracking' && (
              <motion.div 
                key="tracking"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col h-full"
              >
                <div className="bg-simba-primary/10 p-4 rounded-2xl mb-6 flex items-center gap-3">
                    <div className="w-2 h-2 bg-simba-primary rounded-full animate-ping"></div>
                    <span className="text-xs font-black uppercase tracking-widest text-simba-primary">Live: Order Processing</span>
                </div>
                
                <div className="flex-1 bg-gray-100 dark:bg-gray-900 rounded-3xl relative overflow-hidden min-h-[300px] border dark:border-gray-800">
                    <div className="absolute inset-0 opacity-30 bg-gray-200 dark:bg-gray-800">
                        {/* Simulated Grid Map */}
                        <div className="grid grid-cols-8 h-full">
                            {Array.from({length: 64}).map((_, i) => (
                                <div key={i} className="border border-black/5 dark:border-white/5"></div>
                            ))}
                        </div>
                    </div>
                    
                    <motion.div 
                        animate={{ 
                            x: [20, 100, 200], 
                            y: [250, 150, 50] 
                        }}
                        transition={{ duration: 6, ease: "linear" }}
                        className="absolute bottom-10 left-10 text-simba-primary"
                    >
                        <Bike className="w-10 h-10" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping border-2 border-white"></div>
                    </motion.div>

                    <div className="absolute top-5 right-5 bg-white/80 dark:bg-black/80 backdrop-blur-md p-3 rounded-2xl shadow-xl border dark:border-gray-800">
                        <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Distance</p>
                        <p className="text-xs font-bold">1.2 km away</p>
                    </div>
                </div>

                <div className="mt-6 p-5 bg-gray-50 dark:bg-gray-900 rounded-3xl border dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-lg border dark:border-gray-700">
                            <Bike className="w-6 h-6 text-simba-primary" />
                        </div>
                        <div>
                            <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Courier</p>
                            <p className="text-sm font-bold">Jean Pierre (Simba Rider)</p>
                        </div>
                    </div>
                </div>
              </motion.div>
            )}

            {checkoutStep === 'success' && (
              <motion.div 
                key="success"
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center text-center py-10"
              >
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-green-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
                    <div className="relative w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/40">
                      <CheckCircle2 className="w-12 h-12 text-white" />
                    </div>
                </div>
                <h3 className="text-3xl font-black tracking-tighter mb-2">{t.success}</h3>
                <p className="text-gray-400 font-medium mb-12">Order ID: #SIMB-{Math.floor(Math.random() * 90000 + 10000)}</p>
                <button 
                  onClick={handleReset}
                  className="w-full p-6 bg-simba-dark dark:bg-white dark:text-simba-dark text-white rounded-3xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl"
                >
                  {t.backToStore}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {checkoutStep !== 'success' && checkoutStep !== 'tracking' && cart.length > 0 && (
          <div className="p-8 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 backdrop-blur-md">
            <div className="flex justify-between items-end mb-8">
              <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.total}</span>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-simba-gold/20 rounded-md">
                        <span className="text-[8px] font-black text-simba-blue dark:text-simba-gold">+{totalPoints} POINTS</span>
                    </div>
                  </div>
                  <span className="text-3xl font-black text-simba-dark dark:text-white tracking-tighter">
                    {total.toLocaleString()} <span className="text-sm font-bold text-slate-400">RWF</span>
                  </span>
              </div>
              <div className="text-right">
                  <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Inclusive of VAT</span>
              </div>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full py-6 bg-simba-primary hover:bg-simba-primary/90 text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-simba-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {checkoutStep === 'payment' ? t.payWithMomo : t.checkout}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
