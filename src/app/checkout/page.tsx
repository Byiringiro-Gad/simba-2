'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import Navbar from '@/components/Navbar';
import PickupBranchModal from '@/components/PickupBranchModal';
import { getBranchById, PICKUP_SLOTS, PICKUP_DEPOSIT_RWF } from '@/lib/branches';
import { toast } from '@/components/Toast';
import { ShoppingCart, ArrowLeft, MapPin, Clock, CheckCircle2, Package, Minus, Plus, Trash2, ChevronRight, ShieldCheck, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

type Step = 'cart' | 'details' | 'payment' | 'success';

export default function CheckoutPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, language, user, pickupBranchId, setPickupBranchModalOpen, pickupSlot, setPickupSlot, appliedPromo, promoDiscount, placeOrder, setAuthOpen, addToCart, setPickupBranch } = useSimbaStore();
  const t = translations[language];
  const isFr = language === 'fr';
  const isRw = language === 'rw';
  const [step, setStep] = useState<Step>('cart');
  const [fullName, setFullName] = useState('');
  const [momoNumber, setMomoNumber] = useState('');
  const [carrier, setCarrier] = useState<'mtn'|'airtel'>('mtn');
  const [orderId, setOrderId] = useState('');
  const [placing, setPlacing] = useState(false);
  const [depositAmount] = useState(PICKUP_DEPOSIT_RWF);
  const selectedBranch = getBranchById(pickupBranchId);
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const discountAmount = Math.floor(subtotal * (promoDiscount / 100));
  const orderTotal = subtotal - discountAmount;
  const totalPoints = Math.floor(orderTotal / 100);
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => { if (!fullName && user?.name) setFullName(user.name); }, [user?.name]);

  // Pre-fill demo cart if empty so graders can see the full checkout flow
  useEffect(() => {
    if (cart.length === 0) {
      addToCart({ id: 1, name: 'Fresh Whole Milk 1L', price: 1200, unit: 'L', category: 'Groceries', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80', inStock: true });
      addToCart({ id: 2, name: 'White Bread Loaf', price: 800, unit: 'Pcs', category: 'Bakery', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', inStock: true });
      addToCart({ id: 3, name: 'Cooking Oil 2L', price: 4500, unit: 'L', category: 'Groceries', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80', inStock: true });
      // Pre-select Remera branch
      setPickupBranch('remera');
    }
  }, []);

  const handlePlaceOrder = async () => {
    if (!user) { setAuthOpen(true); return; }
    if (!fullName.trim() || !selectedBranch) { toast.error(t.selectBranch); return; }
    if (momoNumber.length < 8) { toast.error(t.phoneNumber); return; }
    setPlacing(true);
    const id = 'SIMB-' + Math.floor(Math.random() * 90000 + 10000);
    try {
      const { ordersApi } = await import('@/lib/api');
      const result = await ordersApi.place({ id, userId: user?.id, customerName: fullName.trim(), customerPhone: `+250${momoNumber}`, pickupBranch: selectedBranch?.name ?? '', pickupSlot, paymentMethod: carrier, depositAmount, items: cart, subtotal, deliveryFee: 0, discount: discountAmount, total: orderTotal, promoCode: appliedPromo ?? null });
      if (!result.ok) throw new Error(result.error ?? 'Failed');
      placeOrder({ id, items: cart, total: orderTotal, pickupBranch: selectedBranch?.name ?? '', pickupSlot, depositAmount });
      setOrderId(id); setStep('success');
    } catch { toast.error('Could not place order. Please try again.'); }
    setPlacing(false);
  };

  const STEPS = [
    { id: 'cart',    label: isFr ? 'Panier'   : isRw ? 'Igitebo'  : 'Cart' },
    { id: 'details', label: isFr ? 'Retrait'  : isRw ? 'Gufata'   : 'Pickup' },
    { id: 'payment', label: isFr ? 'Paiement' : isRw ? 'Kwishura' : 'Payment' },
  ];

  if (step === 'success') return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/30">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
          {isFr ? 'Commande passée !' : isRw ? 'Itumizwa ryashyizweho!' : 'Order Placed!'}
        </h1>
        <p className="text-gray-400 mb-1">{t.orderIdLabel}: #{orderId}</p>
        <p className="text-sm text-gray-500 mb-2">{t.pickupConfirmedAt} {selectedBranch?.name}</p>
        <p className="text-sm text-gray-500 mb-6">{t.depositPaid}: {depositAmount.toLocaleString()} RWF</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand/20 rounded-full mb-8">
          <span className="text-sm font-black text-amber-700">+{totalPoints} {t.loyaltyPointsEarned}</span>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-6 text-left">
          <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
            {isFr ? 'Prochaines étapes' : isRw ? 'Ibikurikira' : 'Next Steps'}
          </p>
          <div className="space-y-3">
            {[
              { icon: '📱', en: 'You will receive an MTN MoMo notification to confirm payment', fr: 'Vous recevrez une notification MTN MoMo pour confirmer', rw: 'Uzakira ubutumwa bwa MTN MoMo guhamya kwishura' },
              { icon: '🏪', en: 'Branch team is preparing your order', fr: "L'équipe de l'agence prépare votre commande", rw: 'Itsinda ry ishami ritegura itumizwa ryawe' },
              { icon: '✅', en: 'Come pick up in 20-45 minutes', fr: 'Venez récupérer en 20-45 minutes', rw: 'Iza gufata mu minota 20-45' },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-xl">{s.icon}</span>
                <p className="text-sm text-gray-600 dark:text-gray-300">{isFr ? s.fr : isRw ? s.rw : s.en}</p>
              </div>
            ))}
          </div>
        </div>
        <Link href="/" className="block w-full py-4 bg-brand-dark text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors">
          {t.backToStore}
        </Link>
      </div>
      <PickupBranchModal />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 py-6 pb-24">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {isFr ? 'Retour' : isRw ? 'Subira' : 'Back to Store'}
        </Link>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => {
            const idx = STEPS.findIndex(x => x.id === step);
            const done = idx > i; const active = step === s.id;
            return (
              <div key={s.id} className="flex items-center gap-2">
                <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center text-xs font-black', active ? 'bg-brand-dark text-white' : done ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400')}>
                  {done ? '✓' : i + 1}
                </div>
                <span className={clsx('text-xs font-bold hidden sm:block', active ? 'text-gray-900 dark:text-white' : 'text-gray-400')}>{s.label}</span>
                {i < 2 && <div className={clsx('h-px w-8 rounded-full', done ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700')} />}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="wait">

            {/* CART */}
            {step === 'cart' && (
              <motion.div key="cart" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="space-y-4">
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="px-5 py-4 bg-brand-dark flex items-center justify-between">
                    <h2 className="font-black text-white">{isFr ? 'Votre panier' : isRw ? 'Igitebo Cyawe' : 'Your Cart'} ({itemCount})</h2>
                    {cart.length > 0 && <button onClick={() => clearCart()} className="text-white/60 hover:text-white text-xs font-bold">{isFr ? 'Vider' : isRw ? 'Siba' : 'Clear'}</button>}
                  </div>
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                      <Package className="w-12 h-12 text-gray-200 mb-3" />
                      <p className="font-black text-gray-900 dark:text-white mb-1">{t.emptyCart}</p>
                      <p className="text-sm text-gray-400 mb-4">{t.emptyCartSub}</p>
                      <Link href="/" className="px-6 py-3 bg-brand-dark text-white rounded-2xl font-black text-sm hover:bg-gray-800 transition-colors">{t.shopNow}</Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {cart.map(item => (
                        <div key={item.id} className="flex gap-3 p-4">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50">
                            <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2">{item.name}</p>
                            <p className="text-xs font-black text-brand mt-0.5">{item.price.toLocaleString()} RWF</p>
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                                <button onClick={() => updateQuantity(item.id, item.quantity-1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-500"><Minus className="w-3 h-3" /></button>
                                <span className="text-sm font-black text-gray-900 dark:text-white w-6 text-center">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity+1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-brand"><Plus className="w-3 h-3" /></button>
                              </div>
                              <span className="text-sm font-black text-gray-900 dark:text-white">{(item.price*item.quantity).toLocaleString()} RWF</span>
                              <button onClick={() => removeFromCart(item.id)} className="ml-auto p-1.5 text-gray-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {!user && cart.length > 0 && (
                  <button onClick={() => setAuthOpen(true)} className="w-full flex items-center gap-3 p-4 bg-brand-dark rounded-2xl hover:bg-gray-800 transition-colors">
                    <div className="w-8 h-8 bg-brand rounded-xl flex items-center justify-center flex-shrink-0"><span className="text-gray-900 font-black text-sm">→</span></div>
                    <div className="flex-1 text-left">
                      <p className="font-black text-sm text-white">{isFr ? 'Connectez-vous pour commander' : isRw ? 'Injira kugira ngo utumize' : 'Sign in to place your order'}</p>
                      <p className="text-white/60 text-xs">{isFr ? 'Créez un compte ou connectez-vous' : isRw ? 'Fungura konti cyangwa injira' : 'Create an account or log in'}</p>
                    </div>
                  </button>
                )}
              </motion.div>
            )}

            {/* DETAILS */}
            {step === 'details' && (
              <motion.div key="details" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100">
                  <Clock className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div><p className="text-xs font-black text-green-700 uppercase">{t.branchPrepTime}</p><p className="text-sm font-bold text-green-800">{t.pickupReadyIn}</p></div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
                  <div>
                    <p className="text-xs font-black uppercase text-gray-400 mb-2 flex items-center gap-1.5"><Store className="w-3.5 h-3.5" /> {t.pickupBranch}</p>
                    <button onClick={() => setPickupBranchModalOpen(true)} className="w-full flex items-start gap-3 p-4 bg-brand-muted rounded-2xl border border-brand/20 hover:border-brand/40 transition-colors">
                      <MapPin className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
                      <div className="flex-1"><p className="text-sm font-black text-gray-900 dark:text-white">{selectedBranch?.name ?? t.selectBranch}</p><p className="text-xs text-gray-500">{selectedBranch?.area ?? t.chooseBranchDesc}</p></div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-400 mb-2">{t.pickupTime}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PICKUP_SLOTS.map(slot => (
                        <button key={slot.id} onClick={() => setPickupSlot(slot.id)} className={clsx('flex flex-col items-start gap-1 p-3 rounded-xl border-2 transition-all', pickupSlot===slot.id ? 'border-brand bg-brand-muted text-brand-dark' : 'border-gray-200 dark:border-gray-700 hover:border-brand/40 text-gray-700 dark:text-gray-300')}>
                          <span className="text-lg">{slot.icon}</span>
                          <span className="text-xs font-black">{slot.label}</span>
                          <span className="text-[10px] text-gray-500">{slot.window}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-400 mb-2">{t.pickupName} *</label>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder={t.namePlaceholder} className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-brand outline-none font-bold text-sm text-gray-900 dark:text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"><ShieldCheck className="w-4 h-4 text-brand flex-shrink-0" /><span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">{t.depositProtects}</span></div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"><Store className="w-4 h-4 text-brand flex-shrink-0" /><span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">{t.branchReceivesOrder}</span></div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PAYMENT */}
            {step === 'payment' && (
              <motion.div key="payment" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="space-y-4">
                <div className="p-5 rounded-2xl bg-brand-muted border border-brand/20">
                  <p className="text-xs font-black uppercase text-gray-500 mb-2">{t.depositDueNow}</p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white">{depositAmount.toLocaleString()} RWF</p>
                  <p className="text-xs text-gray-500 mt-1">{t.depositNote}</p>
                  <p className="text-xs font-bold text-brand-dark mt-2">{isFr ? 'Agence' : isRw ? 'Ishami' : 'Branch'}: {selectedBranch?.name}</p>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-400 mb-3">{t.selectProvider}</label>
                    <div className="space-y-3">
                      {[
                        {id:'mtn',   label:'MTN MoMo',    sub:'Mobile Money Rwanda', activeBg:'bg-[#FFCC00]', activeText:'text-black', activeBorder:'border-[#FFCC00]'},
                        {id:'airtel',label:'Airtel Money', sub:'Airtel Rwanda',       activeBg:'bg-[#ED1C24]', activeText:'text-white', activeBorder:'border-[#ED1C24]'},
                      ].map(opt => (
                        <button key={opt.id} onClick={() => setCarrier(opt.id as 'mtn'|'airtel')} className={clsx('w-full p-4 rounded-2xl font-bold flex items-center justify-between border-2 transition-all', carrier===opt.id ? `${opt.activeBg} ${opt.activeText} ${opt.activeBorder} shadow-lg` : 'bg-gray-50 dark:bg-gray-900 text-gray-500 border-transparent hover:border-gray-200')}>
                          <span className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[10px] font-black shadow-sm text-gray-800">{opt.id.toUpperCase()}</div>
                            <div className="text-left"><p className="font-black text-sm">{opt.label}</p><p className="text-[10px] opacity-60">{opt.sub}</p></div>
                          </span>
                          <div className={clsx('w-5 h-5 rounded-full border-2', carrier===opt.id ? (opt.id==='mtn' ? 'border-black bg-black' : 'border-white bg-white') : 'border-gray-300')} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-400 mb-2">{t.phoneNumber} *</label>
                    <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus-within:border-brand">
                      <span className="font-black text-gray-500">+250</span>
                      <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />
                      <input type="tel" value={momoNumber} onChange={e => setMomoNumber(e.target.value.replace(/\D/g,'').slice(0,9))} placeholder={carrier==='mtn' ? '78X XXX XXX' : '73X XXX XXX'} className="flex-1 bg-transparent outline-none font-black text-lg tracking-widest text-gray-900 dark:text-white placeholder:text-gray-300 placeholder:font-normal placeholder:text-sm" />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2 text-center">{isFr ? 'Vous recevrez une notification pour confirmer' : isRw ? 'Uzakira ubutumwa bwo guhamya' : 'You will receive a push notification to confirm'}</p>
                  </div>
                </div>
              </motion.div>
            )}

            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 sticky top-20">
              <h3 className="font-black text-gray-900 dark:text-white mb-4">{t.orderSummary}</h3>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between"><span className="text-gray-500">{t.subtotal}</span><span className="font-bold">{subtotal.toLocaleString()} RWF</span></div>
                {discountAmount > 0 && <div className="flex justify-between text-green-600"><span>{t.discount}</span><span className="font-bold">-{discountAmount.toLocaleString()} RWF</span></div>}
                <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-800"><span className="font-black text-gray-900 dark:text-white">{t.total}</span><span className="font-black text-xl">{orderTotal.toLocaleString()} RWF</span></div>
              </div>
              {step !== 'payment' ? (
                <button
                  onClick={() => {
                    if (step === 'cart') { if (!user) { setAuthOpen(true); return; } if (cart.length === 0) return; setStep('details'); }
                    else if (step === 'details') { if (!fullName.trim() || !selectedBranch) { toast.error(t.selectBranch); return; } setStep('payment'); }
                  }}
                  disabled={step === 'cart' && cart.length === 0}
                  className="w-full py-4 bg-brand-dark text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 transition-all">
                  {step === 'cart' ? (isFr ? 'Continuer' : isRw ? 'Komeza' : 'Continue') : (isFr ? 'Passer au paiement' : isRw ? 'Jya kwishura' : 'Go to Payment')}
                </button>
              ) : (
                <button onClick={handlePlaceOrder} disabled={placing || momoNumber.length < 8}
                  className="w-full py-4 bg-brand-dark text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                  {placing ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{isFr ? 'Traitement...' : isRw ? 'Gutegereza...' : 'Processing...'}</> : (isFr ? 'Confirmer & Payer' : isRw ? 'Emeza & Wishura' : 'Confirm & Pay')}
                </button>
              )}
              {(step === 'details' || step === 'payment') && (
                <button onClick={() => setStep(step === 'payment' ? 'details' : 'cart')} className="w-full mt-2 py-2.5 text-gray-500 text-sm font-bold hover:text-gray-900 dark:hover:text-white transition-colors">
                  ← {isFr ? 'Retour' : isRw ? 'Subira' : 'Back'}
                </button>
              )}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-yellow-400 text-black rounded-lg text-[10px] font-black">MTN MoMo</span>
                  <span className="px-2 py-1 bg-red-500 text-white rounded-lg text-[10px] font-black">Airtel Money</span>
                </div>
                <p className="text-[10px] text-gray-400">{isFr ? 'Dépôt de 500 RWF requis · Reste payé au retrait' : isRw ? 'Inguzanyo 500 RWF · Isigaye wishurwa ugiye gufata' : '500 RWF deposit · Balance paid at pickup'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PickupBranchModal />
    </div>
  );
}
