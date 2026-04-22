'use client';

import { useState } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import {
  X, Plus, Minus, Trash2, CheckCircle2, Bike,
  ChevronLeft, ChevronRight, MapPin, Clock, ShieldCheck,
  Package, Tag, Gift
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckoutStep } from '@/types';
import { toast } from './Toast';

const DELIVERY_FEE = 1000;

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const {
    cart, updateQuantity, removeFromCart, clearCart, language,
    addresses, selectedAddressId, user,
    appliedPromo, promoDiscount, applyPromo, removePromo,
    placeOrder, scheduledDelivery, setScheduledDelivery,
  } = useSimbaStore();

  const [step, setStep] = useState<CheckoutStep>('cart');
  const [momoNumber, setMomoNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [carrier, setCarrier] = useState<'mtn' | 'airtel'>('mtn');
  const [promoInput, setPromoInput] = useState('');
  const [orderId, setOrderId] = useState('');

  const t = translations[language];
  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  const subtotal = cart.reduce((a, i) => a + i.price * i.quantity, 0);
  const discountAmount = Math.floor(subtotal * (promoDiscount / 100));
  const total = subtotal - discountAmount + DELIVERY_FEE;
  const totalPoints = Math.floor(total / 100);
  const itemCount = cart.reduce((a, i) => a + i.quantity, 0);

  const handleApplyPromo = () => {
    if (!promoInput.trim()) return;
    const ok = applyPromo(promoInput.trim());
    if (ok) {
      toast.success(`Promo applied! ${promoDiscount || PROMO_PREVIEW[promoInput.toUpperCase()]}% off`);
      setPromoInput('');
    } else {
      toast.error('Invalid promo code');
    }
  };

  const handleNext = async () => {
    if (step === 'cart') {
      setStep('details');
    } else if (step === 'details') {
      if (!fullName.trim() || !address.trim()) {
        toast.error('Please fill in all delivery details');
        return;
      }
      setStep('payment');
    } else if (step === 'payment') {
      if (momoNumber.length < 8) {
        toast.error('Please enter a valid phone number');
        return;
      }

      const id = `SIMB-${Math.floor(Math.random() * 90000 + 10000)}`;

      try {
        // Save order to backend database
        const { ordersApi } = await import('@/lib/api');
        const result = await ordersApi.place({
          id,
          userId: user?.id,
          customerName: fullName.trim(),
          customerPhone: `+250${momoNumber}`,
          deliveryAddress: address.trim(),
          deliverySlot: scheduledDelivery,
          paymentMethod: carrier,
          items: cart,
          subtotal,
          deliveryFee: DELIVERY_FEE,
          discount: discountAmount,
          total,
          promoCode: appliedPromo ?? null,
        });

        if (!result.ok) throw new Error(result.error ?? 'Failed');

        // Save to local store for order history tab
        placeOrder({
          id,
          items: cart,
          total,
          customerName: fullName.trim(),
          customerPhone: `+250${momoNumber}`,
          customerAddress: address.trim(),
        });

        setOrderId(id);
        setStep('tracking');
        setTimeout(() => setStep('success'), 5000);

      } catch (err: any) {
        console.error('[Order]', err.message);
        toast.error('Could not place order. Please check your connection and try again.');
      }
    }
  };

  const handleBack = () => {
    if (step === 'details') setStep('cart');
    if (step === 'payment') setStep('details');
  };

  const handleReset = () => {
    clearCart();
    setStep('cart');
    setFullName('');
    setAddress('');
    setMomoNumber('');
    setOrderId('');
    onClose();
  };

  const canProceed = () => {
    if (step === 'cart') return cart.length > 0;
    if (step === 'details') return fullName.trim().length > 0 && address.trim().length > 0;
    if (step === 'payment') return momoNumber.length >= 8;
    return false;
  };

  const stepLabels: Record<CheckoutStep, string> = {
    cart: t.cart, details: t.deliveryDetails, payment: t.paymentMethod,
    tracking: 'Live Tracking', success: t.success,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="absolute right-0 top-0 h-full w-full max-w-[420px] bg-white dark:bg-gray-950 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-brand text-white">
              <div className="flex items-center gap-3">
                {(step === 'details' || step === 'payment') && (
                  <button onClick={handleBack} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                    <ChevronLeft className="w-4 h-4 stroke-[2.5px]" />
                  </button>
                )}
                <div>
                  <h2 className="font-black text-base">{stepLabels[step]}</h2>
                  {step === 'cart' && cart.length > 0 && (
                    <p className="text-white/70 text-xs font-medium">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {step === 'cart' && cart.length > 0 && (
                  <button onClick={() => { clearCart(); toast.info('Cart cleared'); }}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Step indicator */}
            {['cart', 'details', 'payment'].includes(step) && (
              <div className="flex items-center gap-1 px-5 py-3 bg-brand-muted dark:bg-brand/10 border-b border-brand/10">
                {(['cart', 'details', 'payment'] as CheckoutStep[]).map((s, i) => {
                  const steps = ['cart', 'details', 'payment'];
                  const currentIdx = steps.indexOf(step);
                  const isDone = currentIdx > i;
                  const isCurrent = step === s;
                  return (
                    <div key={s} className="flex items-center gap-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${
                        isCurrent ? 'bg-brand text-white' : isDone ? 'bg-brand-success text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                      }`}>
                        {isDone ? '✓' : i + 1}
                      </div>
                      {i < 2 && <div className={`h-0.5 w-8 rounded-full transition-colors ${isDone ? 'bg-brand-success' : 'bg-gray-200 dark:bg-gray-700'}`} />}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">

                {/* CART */}
                {step === 'cart' && (
                  <motion.div key="cart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-3">
                    {cart.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-brand-muted rounded-3xl flex items-center justify-center mb-4">
                          <Package className="w-10 h-10 text-brand/30" />
                        </div>
                        <p className="font-black text-gray-900 dark:text-white mb-1">{t.emptyCart}</p>
                        <p className="text-sm text-gray-400">Add items to get started</p>
                      </div>
                    ) : (
                      <>
                        {cart.map(item => (
                          <div key={item.id} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                              <Image src={item.image} alt={item.name} fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <div>
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 leading-snug">{item.name}</h4>
                                <p className="text-xs font-black text-brand mt-0.5">{item.price.toLocaleString()} RWF</p>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                    <Minus className="w-3 h-3 stroke-[3px]" />
                                  </button>
                                  <span className="text-sm font-black text-gray-900 dark:text-white w-5 text-center">{item.quantity}</span>
                                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-brand hover:bg-brand-muted transition-colors">
                                    <Plus className="w-3 h-3 stroke-[3px]" />
                                  </button>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-black text-gray-900 dark:text-white">{(item.price * item.quantity).toLocaleString()} RWF</span>
                                  <button onClick={() => removeFromCart(item.id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Promo code */}
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Gift className="w-4 h-4 text-brand" />
                            <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Promo Code</p>
                          </div>
                          {appliedPromo ? (
                            <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-green-600" />
                                <span className="font-black text-green-700 dark:text-green-400 text-sm">{appliedPromo}</span>
                                <span className="text-xs text-green-600 font-bold">−{promoDiscount}%</span>
                              </div>
                              <button onClick={removePromo} className="text-green-600 hover:text-red-500 transition-colors">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={promoInput}
                                onChange={e => setPromoInput(e.target.value.toUpperCase())}
                                onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                                placeholder="Enter code (e.g. SIMBA10)"
                                className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-bold outline-none focus:border-brand transition-colors text-gray-900 dark:text-white placeholder:text-gray-400 placeholder:font-normal uppercase"
                              />
                              <button onClick={handleApplyPromo} className="px-4 py-2.5 bg-brand text-white rounded-xl text-sm font-black hover:bg-brand-dark transition-colors">
                                Apply
                              </button>
                            </div>
                          )}
                          <p className="text-[10px] text-gray-400 mt-2 font-medium">Try: SIMBA10 · WELCOME · KIGALI5</p>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {/* DETAILS */}
                {step === 'details' && (
                  <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="p-4 space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800">
                      <Clock className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-black text-green-700 dark:text-green-400 uppercase tracking-wide">{t.estimatedTime}</p>
                        <p className="text-sm font-bold text-green-800 dark:text-green-300">45 – 60 {t.mins}</p>
                      </div>
                    </div>

                    {selectedAddress && (
                      <div className="flex items-center gap-3 p-4 bg-brand-muted rounded-2xl border border-brand/20">
                        <MapPin className="w-5 h-5 text-brand flex-shrink-0" />
                        <div>
                          <p className="text-xs font-black text-brand uppercase tracking-wide">{selectedAddress.label}</p>
                          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{selectedAddress.full}</p>
                        </div>
                      </div>
                    )}

                    {/* Delivery time */}
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Delivery Time
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {([
                          { id: 'asap', icon: '⚡', label: 'ASAP', sub: '30–45 min' },
                          { id: 'morning', icon: '🌅', label: 'Morning', sub: '8–12pm' },
                          { id: 'afternoon', icon: '☀️', label: 'Afternoon', sub: '12–5pm' },
                          { id: 'evening', icon: '🌙', label: 'Evening', sub: '5–9pm' },
                        ] as const).map(slot => (
                          <button key={slot.id} type="button"
                            onClick={() => setScheduledDelivery(slot.id)}
                            className={`flex flex-col items-center gap-0.5 py-2.5 px-1 rounded-xl border-2 text-center transition-all ${
                              scheduledDelivery === slot.id
                                ? 'border-brand bg-brand-muted'
                                : 'border-gray-100 dark:border-gray-800 hover:border-gray-200'
                            }`}>
                            <span className="text-base">{slot.icon}</span>
                            <span className={`text-xs font-black ${scheduledDelivery === slot.id ? 'text-brand-dark' : 'text-gray-700 dark:text-gray-300'}`}>{slot.label}</span>
                            <span className="text-[10px] text-gray-400">{slot.sub}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder={t.namePlaceholder}
                      className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-brand outline-none transition-all font-bold text-sm text-gray-900 dark:text-white placeholder:text-gray-400 placeholder:font-normal" />
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{t.address} *</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                        <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder={t.addressPlaceholder} rows={3}
                          className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-brand outline-none transition-all font-bold text-sm text-gray-900 dark:text-white placeholder:text-gray-400 placeholder:font-normal resize-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <ShieldCheck className="w-4 h-4 text-brand flex-shrink-0" />
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">Secure Delivery</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <Bike className="w-4 h-4 text-brand flex-shrink-0" />
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">Live Tracking</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* PAYMENT */}
                {step === 'payment' && (
                  <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="p-4 space-y-4">
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Select Provider</label>
                      {[
                        { id: 'mtn', label: 'MTN MoMo', sub: 'Mobile Money Rwanda', activeBg: 'bg-[#FFCC00]', activeText: 'text-black', activeBorder: 'border-[#FFCC00]' },
                        { id: 'airtel', label: 'Airtel Money', sub: 'Airtel Rwanda', activeBg: 'bg-[#ED1C24]', activeText: 'text-white', activeBorder: 'border-[#ED1C24]' },
                      ].map(opt => (
                        <button key={opt.id} onClick={() => setCarrier(opt.id as 'mtn' | 'airtel')}
                          className={`w-full p-4 rounded-2xl font-bold flex items-center justify-between transition-all border-2 ${
                            carrier === opt.id ? `${opt.activeBg} ${opt.activeText} ${opt.activeBorder} shadow-lg` : 'bg-gray-50 dark:bg-gray-900 text-gray-500 border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                          }`}>
                          <span className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[10px] font-black shadow-sm text-gray-800">{opt.id.toUpperCase()}</div>
                            <div className="text-left">
                              <p className="font-black text-sm">{opt.label}</p>
                              <p className="text-[10px] opacity-60">{opt.sub}</p>
                            </div>
                          </span>
                          <div className={`w-5 h-5 rounded-full border-2 transition-colors ${carrier === opt.id ? (opt.id === 'mtn' ? 'border-black bg-black' : 'border-white bg-white') : 'border-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{t.phoneNumber} *</label>
                      <div className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus-within:border-brand transition-all">
                        <span className="font-black text-gray-500 text-sm flex-shrink-0">+250</span>
                        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />
                        <input type="tel" value={momoNumber} onChange={e => setMomoNumber(e.target.value.replace(/\D/g, '').slice(0, 9))}
                          placeholder={carrier === 'mtn' ? '78X XXX XXX' : '73X XXX XXX'}
                          className="flex-1 bg-transparent outline-none font-black text-lg tracking-widest text-gray-900 dark:text-white placeholder:text-gray-300 placeholder:font-normal placeholder:text-sm placeholder:tracking-normal" />
                      </div>
                      <p className="text-[11px] text-gray-400 font-medium mt-2 text-center">
                        You'll receive a {carrier.toUpperCase()} push notification to confirm {total.toLocaleString()} RWF
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* TRACKING */}
                {step === 'tracking' && (
                  <motion.div key="tracking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-brand-muted rounded-2xl">
                      <div className="w-2.5 h-2.5 bg-brand rounded-full animate-ping" />
                      <span className="text-sm font-black text-brand uppercase tracking-wide">Order Confirmed — Processing</span>
                    </div>
                    <div className="relative h-56 bg-gray-100 dark:bg-gray-900 rounded-2xl overflow-hidden border dark:border-gray-800">
                      <div className="absolute inset-0 opacity-20">
                        <div className="grid grid-cols-8 h-full">
                          {Array.from({ length: 64 }).map((_, i) => <div key={i} className="border border-gray-400 dark:border-gray-600" />)}
                        </div>
                      </div>
                      <motion.div animate={{ x: [20, 80, 160, 220], y: [180, 120, 60, 20] }} transition={{ duration: 5, ease: 'linear' }} className="absolute text-brand">
                        <Bike className="w-8 h-8 drop-shadow-lg" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping border border-white" />
                      </motion.div>
                      <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-3 rounded-xl shadow-lg border dark:border-gray-700">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">ETA</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white">
                          {scheduledDelivery === 'asap' ? '~45 min' : scheduledDelivery === 'morning' ? '8am–12pm' : scheduledDelivery === 'afternoon' ? '12pm–5pm' : '5pm–9pm'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border dark:border-gray-800">
                      <div className="w-12 h-12 bg-brand-muted rounded-2xl flex items-center justify-center">
                        <Bike className="w-6 h-6 text-brand" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Your Rider</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Jean Pierre • Simba Rider</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* SUCCESS */}
                {step === 'success' && (
                  <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center text-center py-12 px-6">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-green-400 blur-3xl opacity-20 rounded-full" />
                      <div className="relative w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/30">
                        <CheckCircle2 className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{t.success}</h3>
                    <p className="text-gray-400 font-medium mb-2">Order ID: #{orderId}</p>
                    <div className="flex items-center gap-2 px-4 py-2 bg-brand/20 rounded-full mb-8">
                      <span className="text-sm font-black text-amber-700 dark:text-brand">+{totalPoints} loyalty points earned!</span>
                    </div>
                    <button onClick={handleReset} className="w-full py-4 bg-brand hover:bg-brand-dark text-white rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-brand/20">
                      {t.backToStore}
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Footer */}
            {['cart', 'details', 'payment'].includes(step) && cart.length > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">{t.subtotal}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{subtotal.toLocaleString()} RWF</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 font-bold">Promo ({appliedPromo})</span>
                      <span className="font-bold text-green-600">−{discountAmount.toLocaleString()} RWF</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">{t.deliveryFee}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{DELIVERY_FEE.toLocaleString()} RWF</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span className="font-black text-gray-900 dark:text-white">{t.total}</span>
                    <span className="font-black text-lg text-gray-900 dark:text-white">{total.toLocaleString()} RWF</span>
                  </div>
                </div>
                <button onClick={handleNext} disabled={!canProceed()}
                  className="w-full py-4 bg-brand hover:bg-brand-dark disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-brand/20 disabled:shadow-none flex items-center justify-center gap-2">
                  {step === 'payment' ? t.payWithMomo : t.checkout}
                  {canProceed() && <ChevronRight className="w-4 h-4 stroke-[3px]" />}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Promo preview for toast message
const PROMO_PREVIEW: Record<string, number> = { 'SIMBA10': 10, 'WELCOME': 15, 'KIGALI5': 5 };


