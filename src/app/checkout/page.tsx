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
import { ArrowLeft, MapPin, Clock, CheckCircle2, Package, Minus, Plus, Trash2, ChevronRight, ShieldCheck, Store, AlertCircle, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import type { PaymentMethod } from '@/types';
import { getPaymentMethodLabel, getPaymentMethodNote, getPaymentMethodSubLabel } from '@/lib/paymentMethods';

const ORDER_MINIMUM = 1000;

function isValidRwandaPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, '');
  return /^(?:250)?7[2389]\d{7}$/.test(digits);
}

type Step = 'cart' | 'details' | 'payment' | 'success';

export default function CheckoutPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, language, user, pickupBranchId, setPickupBranchModalOpen, pickupSlot, setPickupSlot, appliedPromo, promoDiscount, placeOrder, setAuthOpen } = useSimbaStore();
  const t = translations[language];
  const isFr = language === 'fr';
  const isRw = language === 'rw';
  const [step, setStep] = useState<Step>('cart');
  const [fullName, setFullName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mtn');
  const [orderId, setOrderId] = useState('');
  const [placing, setPlacing] = useState(false);
  const [depositAmount] = useState(PICKUP_DEPOSIT_RWF);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const selectedBranch = getBranchById(pickupBranchId);
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const discountAmount = Math.floor(subtotal * (promoDiscount / 100));
  const orderTotal = subtotal - discountAmount;
  const totalPoints = Math.floor(orderTotal / 100);
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => { if (!fullName && user?.name) setFullName(user.name); }, [user?.name]);

  const handlePlaceOrder = async () => {
    if (!user) { setAuthOpen(true); return; }
    if (!fullName.trim() || !selectedBranch) { toast.error(t.selectBranch); return; }
    if (paymentMethod !== 'cod' && !isValidRwandaPhone(contactPhone)) {
      toast.error(isFr ? 'Entrez un numéro rwandais valide (ex. 078 XXX XXX)' : isRw ? 'Injiza nimero y\'u Rwanda yemewe' : 'Enter a valid Rwandan number (e.g. 078 XXX XXX)');
      return;
    }
    setPlacing(true);
    const id = 'SIMB-' + Math.floor(Math.random() * 90000 + 10000);
    const effDeposit = paymentMethod === 'cod' ? 0 : depositAmount;
    try {
      const { ordersApi } = await import('@/lib/api');
      await ordersApi.place({ id, userId: user?.id, customerName: fullName.trim(), customerPhone: paymentMethod === 'cod' ? '' : `+250${contactPhone}`, pickupBranch: selectedBranch?.name ?? '', pickupSlot, paymentMethod, depositAmount: effDeposit, items: cart, subtotal, deliveryFee: 0, discount: discountAmount, total: orderTotal, promoCode: appliedPromo ?? null, deliveryNotes: deliveryNotes.trim() || undefined });
      placeOrder({ id, items: cart, total: orderTotal, pickupBranch: selectedBranch?.name ?? '', pickupSlot, depositAmount: effDeposit });
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
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand/10 rounded-full mb-8">
          <span className="text-sm font-black text-brand-dark dark:text-brand">+{totalPoints} {t.loyaltyPointsEarned}</span>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-6 text-left">
          <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
            {isFr ? 'Prochaines étapes' : isRw ? 'Ibikurikira' : 'Next Steps'}
          </p>
          <div className="space-y-3">
            {[
              { icon: paymentMethod === 'card' ? '💳' : '📱', en: getPaymentMethodNote(paymentMethod, 'en'), fr: getPaymentMethodNote(paymentMethod, 'fr'), rw: getPaymentMethodNote(paymentMethod, 'rw') },
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
        <Link href="/" className="block w-full py-4 bg-brand text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-dark transition-colors active:scale-[0.98] shadow-lg shadow-brand/20">
          {t.backToStore}
        </Link>
        <button
          onClick={() => window.print()}
          className="mt-3 w-full py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl font-black text-sm hover:border-brand hover:text-brand-dark transition-colors flex items-center justify-center gap-2"
        >
          <Printer className="w-4 h-4" />
          {isFr ? 'Imprimer le reçu' : isRw ? 'Fotokorera urupapuro' : 'Print Receipt'}
        </button>
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
                    {cart.length > 0 && <button onClick={() => setShowClearConfirm(true)} className="text-white/60 hover:text-white text-xs font-bold">{isFr ? 'Vider' : isRw ? 'Siba' : 'Clear'}</button>}
                  </div>
                  {showClearConfirm && (
                    <div className="flex items-center justify-between px-5 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
                      <p className="text-sm font-bold text-red-700 dark:text-red-400">{isFr ? 'Supprimer tous les articles ?' : isRw ? 'Gukura ibintu byose?' : 'Remove all items?'}</p>
                      <div className="flex gap-2">
                        <button onClick={() => setShowClearConfirm(false)} className="px-3 py-1 text-xs font-black text-gray-600 bg-white border border-gray-200 rounded-lg">{isFr ? 'Annuler' : 'Cancel'}</button>
                        <button onClick={() => { clearCart(); setShowClearConfirm(false); }} className="px-3 py-1 text-xs font-black text-white bg-red-500 rounded-lg">{isFr ? 'Vider' : 'Clear'}</button>
                      </div>
                    </div>
                  )}
                  {cart.length > 0 && subtotal < ORDER_MINIMUM && (
                    <div className="mx-4 mt-3 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                      <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                        {isFr ? `Minimum 1 000 RWF. Ajoutez encore ${(ORDER_MINIMUM - subtotal).toLocaleString()} RWF.` : isRw ? `Imeze nkeya ni RWF 1 000. Ongeraho RWF ${(ORDER_MINIMUM - subtotal).toLocaleString()}.` : `Minimum order is 1,000 RWF. Add ${(ORDER_MINIMUM - subtotal).toLocaleString()} RWF more.`}
                      </p>
                    </div>
                  )}
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
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-400 mb-2">{isFr ? 'Notes de livraison (facultatif)' : isRw ? 'Amabwiriza (ntabigomba)' : 'Delivery Notes (optional)'}</label>
                    <textarea value={deliveryNotes} onChange={e => setDeliveryNotes(e.target.value.slice(0, 300))} placeholder={isFr ? 'Ex: Articles fragiles...' : isRw ? 'Urugero: ...' : 'e.g. Fragile items, special packaging...'} rows={2} className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-brand outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400 resize-none" />
                    <p className="text-[10px] text-gray-400 text-right">{deliveryNotes.length}/300</p>
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
                    <label className="block text-xs font-black uppercase text-gray-400 mb-3">{t.paymentMethod}</label>
                    <div className="space-y-3">
                      {(['mtn', 'airtel', 'card', 'cod'] as const).map(option => {
                        const isActive = paymentMethod === option;
                        const PAY_CFG = {
                          mtn:    { bg: '#FFCC00', text: '#111', border: '#FFCC00', label: 'MTN' },
                          airtel: { bg: '#E31837', text: '#fff', border: '#E31837', label: 'AIRTEL' },
                          card:   { bg: '#1e293b', text: '#fff', border: '#1e293b', label: 'CARD' },
                          cod:    { bg: '#16a34a', text: '#fff', border: '#16a34a', label: 'CASH' },
                        } as const;
                        const c = PAY_CFG[option];
                        return (
                          <button key={option} type="button" onClick={() => setPaymentMethod(option)}
                            style={isActive ? { backgroundColor: c.bg, color: c.text, borderColor: c.border } : { borderColor: c.border + '44' }}
                            className={clsx('w-full p-4 rounded-2xl flex items-center justify-between border-2 transition-all', isActive ? 'shadow-lg' : 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200')}>
                            <span className="flex items-center gap-3">
                              <span style={{ backgroundColor: c.bg, color: c.text }} className="w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black shadow flex-shrink-0">{c.label}</span>
                              <span className="text-left">
                                <p className="font-black text-sm">{getPaymentMethodLabel(option, language)}</p>
                                <p className={clsx('text-[10px] mt-0.5', isActive ? 'opacity-60' : 'text-gray-400 dark:text-gray-500')}>{getPaymentMethodSubLabel(option, language)}</p>
                              </span>
                            </span>
                            <span style={isActive ? { borderColor: c.text, backgroundColor: c.text } : {}} className={clsx('w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all', isActive ? '' : 'border-gray-300 dark:border-gray-600')} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {paymentMethod === 'cod' && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl">
                      <p className="text-sm font-bold text-green-800 dark:text-green-300">
                        {isFr ? `Paiement total de ${orderTotal.toLocaleString()} RWF en espèces au retrait.` : isRw ? `Wishura amafaranga yose ${orderTotal.toLocaleString()} RWF igihe ugiye gufata.` : `Pay the full ${orderTotal.toLocaleString()} RWF in cash at pickup.`}
                      </p>
                    </div>
                  )}
                  {paymentMethod !== 'cod' && (
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-400 mb-2">{t.phoneNumber} *</label>
                    <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus-within:border-brand">
                      <span className="font-black text-gray-500">+250</span>
                      <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />
                      <input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value.replace(/\D/g,'').slice(0,9))} placeholder={paymentMethod === 'mtn' ? '78X XXX XXX' : paymentMethod==='airtel' ? '73X XXX XXX' : '7XX XXX XXX'} className="flex-1 bg-transparent outline-none font-black text-lg tracking-widest text-gray-900 dark:text-white placeholder:text-gray-300 placeholder:font-normal placeholder:text-sm" />
                      {contactPhone.length >= 9 && isValidRwandaPhone(contactPhone) && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
                      {contactPhone.length >= 9 && !isValidRwandaPhone(contactPhone) && <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                    </div>
                    {contactPhone.length >= 9 && !isValidRwandaPhone(contactPhone) && (
                      <p className="text-[11px] text-red-500 font-bold mt-1">{isFr ? 'Numéro invalide. Ex: 078 XXX XXX' : 'Invalid number. e.g. 078 XXX XXX'}</p>
                    )}
                    <p className="text-[11px] text-gray-400 mt-2 text-center">{getPaymentMethodNote(paymentMethod, language)}</p>
                  </div>
                  )}
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
                    if (step === 'cart') { if (!user) { setAuthOpen(true); return; } if (cart.length === 0 || subtotal < ORDER_MINIMUM) return; setStep('details'); }
                    else if (step === 'details') { if (!fullName.trim() || !selectedBranch) { toast.error(t.selectBranch); return; } setStep('payment'); }
                  }}
                  disabled={step === 'cart' && (cart.length === 0 || subtotal < ORDER_MINIMUM)}
                  className="w-full py-4 bg-brand-dark text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 transition-all">
                  {step === 'cart' ? (isFr ? 'Continuer' : isRw ? 'Komeza' : 'Continue') : (isFr ? 'Passer au paiement' : isRw ? 'Jya kwishura' : 'Go to Payment')}
                </button>
              ) : (
                <button onClick={handlePlaceOrder} disabled={placing || (paymentMethod !== 'cod' && !isValidRwandaPhone(contactPhone))}
                  className="w-full py-4 bg-brand-dark text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                  {placing ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{isFr ? 'Traitement...' : isRw ? 'Gutegereza...' : 'Processing...'}</> : paymentMethod === 'cod' ? (isFr ? `Confirmer — Payer au retrait` : isRw ? `Emeza — Wishure ugifata` : `Confirm — Pay at Pickup`) : `${getPaymentMethodLabel(paymentMethod, language)} — ${depositAmount.toLocaleString()} RWF`}
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
                  <span className="px-2 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black">Card</span>
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
