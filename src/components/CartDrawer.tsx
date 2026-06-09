'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import {
  X, Plus, Minus, Trash2, CheckCircle2, ChevronLeft, ChevronRight,
  MapPin, Clock, ShieldCheck, Package, Tag, Gift, Store, Smartphone, Star
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckoutStep } from '@/types';
import type { PaymentMethod } from '@/types';
import type { Language } from '@/types';
import { toast } from './Toast';
import { getBranchById, PICKUP_DEPOSIT_RWF } from '@/lib/branches';
import { PAYMENT_METHODS, PAYMENT_METHOD_THEMES, getPaymentMethodLabel, getPaymentMethodNote, getPaymentMethodSubLabel } from '@/lib/paymentMethods';

const BASE_DEPOSIT = PICKUP_DEPOSIT_RWF; // 500 RWF base

// ── Generate pickup time slots from now+30min to 9pm in 30-min steps ─────────
function generatePickupSlots(): { value: string; label: string }[] {
  const slots: { value: string; label: string }[] = [];
  const now = new Date();

  // Earliest pickup = now + 30 min (prep time), rounded up to next 30-min mark
  const earliest = new Date(now.getTime() + 30 * 60 * 1000);
  const mins = earliest.getMinutes();
  const roundedMins = mins <= 30 ? 30 : 60;
  earliest.setMinutes(roundedMins, 0, 0);
  if (roundedMins === 60) {
    earliest.setHours(earliest.getHours() + 1);
    earliest.setMinutes(0);
  }

  // Store closes at 21:00
  const closing = new Date(now);
  closing.setHours(21, 0, 0, 0);

  // If it's past 8:30pm, no more slots today — offer tomorrow 8am
  if (earliest >= closing) {
    const tomorrow8am = new Date(now);
    tomorrow8am.setDate(tomorrow8am.getDate() + 1);
    tomorrow8am.setHours(8, 0, 0, 0);
    const tomorrowLabel = tomorrow8am.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    for (let t = new Date(tomorrow8am); t.getHours() < 21; t.setMinutes(t.getMinutes() + 30)) {
      const h = t.getHours();
      const m = t.getMinutes();
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 === 0 ? 12 : h % 12;
      const mStr = m === 0 ? '00' : '30';
      const value = t.toISOString();
      const label = `${tomorrowLabel} · ${h12}:${mStr} ${ampm}`;
      slots.push({ value, label });
    }
    return slots;
  }

  const cursor = new Date(earliest);
  while (cursor < closing) {
    const h = cursor.getHours();
    const m = cursor.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    const mStr = m === 0 ? '00' : '30';

    // Friendly label for the first slot
    const isFirst = slots.length === 0;
    const diffMins = Math.round((cursor.getTime() - now.getTime()) / 60000);
    const label = isFirst
      ? `⚡ Soonest · ${h12}:${mStr} ${ampm} (~${diffMins} min)`
      : `${h12}:${mStr} ${ampm}`;

    slots.push({ value: cursor.toISOString(), label });
    cursor.setMinutes(cursor.getMinutes() + 30);
  }

  return slots;
}

// ── Success step with branch review ──────────────────────────────────────────
function SuccessStep({ orderId, selectedBranch, totalPoints, t, onReset, pickupBranchId, language, depositAmount, paymentMethod }: {
  orderId: string;
  selectedBranch: ReturnType<typeof getBranchById>;
  totalPoints: number;
  t: any;
  onReset: () => void;
  pickupBranchId: string;
  language: Language;
  depositAmount: number;
  paymentMethod: PaymentMethod;
}) {
  const { submitBranchReview } = useSimbaStore();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    if (!rating || !selectedBranch) return;
    setSubmitting(true);
    await submitBranchReview({
      branchId: pickupBranchId,
      branchName: selectedBranch.name,
      orderId,
      rating,
      comment: comment.trim() || undefined,
    });
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center text-center py-8 px-6">
      {/* Success icon */}
      <div className="relative mb-5">
        <div className="absolute inset-0 bg-green-400 blur-3xl opacity-20 rounded-full" />
        <div className="relative w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/30">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
      </div>
      <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">{t.success}</h3>
      <p className="text-gray-400 font-medium mb-1">{t.orderIdLabel}: #{orderId}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        {t.pickupConfirmedAt} {selectedBranch?.name}. {t.depositPaid}: {depositAmount.toLocaleString()} RWF
      </p>
      <p className="text-xs text-gray-400 mb-4">
        {getPaymentMethodNote(paymentMethod, language)}
      </p>
      <div className="flex items-center gap-2 px-4 py-2 bg-brand/20 rounded-full mb-6">
        <span className="text-sm font-black text-amber-700 dark:text-brand">+{totalPoints} {t.loyaltyPointsEarned}</span>
      </div>

      {/* Branch review — pre-pickup rating (optional) */}
      {!submitted ? (
        <div className="w-full bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 mb-5 text-left">
          <p className="font-black text-sm text-gray-900 dark:text-white mb-0.5">
            {t.rateExperience}
          </p>
          <p className="text-xs text-gray-400 mb-3">
            {language === 'fr' ? 'Notez votre expérience après le retrait' : language === 'rw' ? 'Tanga igitekerezo nyuma yo gufata' : 'Rate after you pick up your order'} · {selectedBranch?.name}
          </p>
          <div className="flex gap-1 mb-3 justify-center">
            {[1,2,3,4,5].map(i => (
              <button key={i} type="button"
                onClick={() => setRating(i)}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(0)}
                className="transition-transform hover:scale-110">
                <Star className={`w-8 h-8 transition-colors ${
                  (hover || rating) >= i ? 'fill-brand text-brand' : 'text-gray-200 dark:text-gray-700'
                }`} />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder={t.commentPlaceholder}
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-brand transition-colors text-gray-900 dark:text-white placeholder:text-gray-400 resize-none mb-3"
              />
              <button onClick={handleSubmitReview} disabled={submitting}
                className="w-full py-2.5 bg-brand-dark text-white rounded-xl font-black text-sm hover:bg-gray-800 transition-colors disabled:opacity-50">
                {submitting ? '...' : t.submitReview}
              </button>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="w-full flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 mb-5">
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
          <p className="text-sm font-bold text-green-700 dark:text-green-400">{t.reviewSubmitted}</p>
        </div>
      )}

      <button onClick={onReset}
        className="w-full py-4 bg-brand hover:bg-brand-dark text-white rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-brand/20">
        {t.backToStore}
      </button>
    </motion.div>
  );
}

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    language,
    user,
    pickupBranchId,
    setPickupBranchModalOpen,
    appliedPromo,
    promoDiscount,
    applyPromo,
    removePromo,
    placeOrder,
    setAuthOpen,
  } = useSimbaStore();

  const [step, setStep] = useState<CheckoutStep>('cart');
  const [contactPhone, setContactPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mtn');
  const [promoInput, setPromoInput] = useState('');
  const [orderId, setOrderId] = useState('');
  const [depositAmount, setDepositAmount] = useState(BASE_DEPOSIT);
  const [fulfillmentType, setFulfillmentType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Dynamic pickup time slots — generated fresh each time the drawer opens
  const pickupSlots = useMemo(() => generatePickupSlots(), [isOpen]);
  const [pickupTime, setPickupTime] = useState('');
  // Set default to first slot whenever drawer opens
  useEffect(() => {
    if (isOpen && pickupSlots.length > 0) {
      setPickupTime(pickupSlots[0].value);
    }
  }, [isOpen, pickupSlots]);

  const selectedBranch = getBranchById(pickupBranchId);

  const t = translations[language];

  useEffect(() => {
    if (!fullName.trim() && user?.name) {
      setFullName(user.name);
    }
  }, [user?.name]);

  // Dynamic deposit — higher for flagged (no-show) customers
  useEffect(() => {
    if (!user?.id) { setDepositAmount(BASE_DEPOSIT); return; }
    const url = `/api/branch/flag?userId=${user.id}${user.phone ? `&phone=${encodeURIComponent(user.phone)}` : ''}`;
    fetch(url)
      .then(r => r.json())
      .then(d => {
        if (d.ok && d.flags >= 2) setDepositAmount(1000);
        else if (d.ok && d.flags === 1) setDepositAmount(750);
        else setDepositAmount(BASE_DEPOSIT);
      })
      .catch(() => setDepositAmount(BASE_DEPOSIT));
  }, [user?.id]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = Math.floor(subtotal * (promoDiscount / 100));
  const orderTotal = subtotal - discountAmount;
  const totalPoints = Math.floor(orderTotal / 100);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleApplyPromo = () => {
    if (!promoInput.trim()) return;
    const ok = applyPromo(promoInput.trim());
    if (ok) {
      toast.success(t.promoApplied);
      setPromoInput('');
    } else {
      toast.error(t.promoInvalid);
    }
  };

  const handleNext = async () => {
    if (step === 'cart') {
      // Gate: must be logged in to proceed to checkout
      if (!user) {
        setAuthOpen(true);
        return;
      }
      setStep('details');
      return;
    }

    if (step === 'details') {
      if (!fullName.trim() || !selectedBranch) {
        toast.error(t.selectBranch);
        return;
      }
      setStep('payment');
      return;
    }

    if (step === 'payment') {
      if (contactPhone.length < 8) {
        toast.error(t.phoneNumber + ' — ' + t.phonePlaceholder);
        return;
      }

      const id = `SIMB-${Math.floor(Math.random() * 90000 + 10000)}`;

      try {
        const { ordersApi } = await import('@/lib/api');
        const result = await ordersApi.place({
          id,
          userId: user?.id,
          customerName: fullName.trim(),
          customerPhone: `+250${contactPhone}`,
          pickupBranch: selectedBranch?.name ?? '',
          pickupSlot: pickupTime,
          paymentMethod,
          depositAmount: depositAmount,
          items: cart,
          subtotal,
          deliveryFee: 0,
          discount: discountAmount,
          total: orderTotal,
          promoCode: appliedPromo ?? null,
        });

        if (!result.ok) throw new Error(result.error ?? 'Failed');

        placeOrder({
          id,
          items: cart,
          total: orderTotal,
          pickupBranch: selectedBranch?.name ?? '',
          pickupSlot: pickupTime as any,
          depositAmount: depositAmount,
        });

        setOrderId(id);
        setStep('tracking');
        setTimeout(() => setStep('success'), 4000);
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
    setFullName(user?.name ?? '');
    setContactPhone('');
    setPaymentMethod('mtn');
    setOrderId('');
    setFulfillmentType('pickup');
    setDeliveryAddress('');
    setPickupTime(pickupSlots[0]?.value ?? '');
    onClose();
  };

  const canProceed = () => {
    if (step === 'cart') return cart.length > 0;
    if (step === 'details') return fullName.trim().length > 0 && !!selectedBranch;
    if (step === 'payment') return contactPhone.length >= 8;
    return false;
  };

  const stepLabels: Record<CheckoutStep, string> = {
    cart: t.cart,
    details: t.pickupDetails,
    payment: t.paymentMethod,
    tracking: t.branchPrep,
    success: t.success,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — separate from drawer, covers full screen */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer — slides in from right, full height */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 z-[101] w-full sm:max-w-[420px] bg-white dark:bg-gray-950 shadow-2xl flex flex-col"
            style={{ height: '100dvh' }}
          >
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
                  <button
                    onClick={() => {
                      clearCart();
                      toast.info(t.cartCleared);
                    }}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {['cart', 'details', 'payment'].includes(step) && (
              <div className="flex items-center gap-1 px-5 py-3 bg-brand-muted dark:bg-brand/10 border-b border-brand/10">
                {(['cart', 'details', 'payment'] as CheckoutStep[]).map((currentStep, index) => {
                  const steps = ['cart', 'details', 'payment'];
                  const currentIdx = steps.indexOf(step);
                  const isDone = currentIdx > index;
                  const isCurrent = step === currentStep;
                  return (
                    <div key={currentStep} className="flex items-center gap-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${
                        isCurrent ? 'bg-brand text-white' : isDone ? 'bg-brand-success text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                      }`}>
                        {isDone ? '✓' : index + 1}
                      </div>
                      {index < 2 && <div className={`h-0.5 w-8 rounded-full transition-colors ${isDone ? 'bg-brand-success' : 'bg-gray-200 dark:bg-gray-700'}`} />}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {step === 'cart' && (
                  <motion.div key="cart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-3">
                    {cart.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-brand-muted rounded-3xl flex items-center justify-center mb-4">
                          <Package className="w-10 h-10 text-brand/30" />
                        </div>
                        <p className="font-black text-gray-900 dark:text-white mb-1">{t.emptyCart}</p>
                        <p className="text-sm text-gray-400">{t.emptyCartSub}</p>
                      </div>
                    ) : (
                      <>
                        {cart.map((item) => (
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

                        {/* Sign-in nudge for guests */}
                        {!user && (
                          <button
                            onClick={() => setAuthOpen(true)}
                            className="w-full flex items-center gap-3 p-3 bg-brand-dark rounded-2xl text-left hover:bg-gray-800 transition-colors"
                          >
                            <div className="w-8 h-8 bg-brand rounded-xl flex items-center justify-center flex-shrink-0">
                              <span className="text-gray-900 font-black text-sm">→</span>
                            </div>
                            <div className="flex-1">
                              <p className="font-black text-sm text-white">
                                {language === 'fr' ? 'Connectez-vous pour commander' : language === 'rw' ? 'Injira kugira ngo utumize' : 'Sign in to place your order'}
                              </p>
                              <p className="text-white/60 text-xs font-medium">
                                {language === 'fr' ? 'Créez un compte ou connectez-vous' : language === 'rw' ? 'Fungura konti cyangwa injira' : 'Create an account or log in'}
                              </p>
                            </div>
                          </button>
                        )}

                        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Gift className="w-4 h-4 text-brand" />
                            <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">{t.promoCodeLabel}</p>
                          </div>
                          {appliedPromo ? (
                            <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-green-600" />
                                <span className="font-black text-green-700 dark:text-green-400 text-sm">{appliedPromo}</span>
                                <span className="text-xs text-green-600 font-bold">-{promoDiscount}%</span>
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
                                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                                onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                                placeholder={t.enterPromoCode}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-bold outline-none focus:border-brand transition-colors text-gray-900 dark:text-white placeholder:text-gray-400 placeholder:font-normal uppercase"
                              />
                              <button onClick={handleApplyPromo} className="px-4 py-2.5 bg-brand text-white rounded-xl text-sm font-black hover:bg-brand-dark transition-colors">
                                {t.applyBtn}
                              </button>
                            </div>
                          )}
                          <p className="text-[10px] text-gray-400 mt-2 font-medium">{t.promoTryHint}</p>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {step === 'details' && (
                  <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="p-4 space-y-4">

                    <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800">
                      <Clock className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-black text-green-700 dark:text-green-400 uppercase tracking-wide">{t.branchPrepTime}</p>
                        <p className="text-sm font-bold text-green-800 dark:text-green-300">{t.pickupReadyIn}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5" /> {t.pickupBranch}
                      </p>
                      <button type="button" onClick={() => setPickupBranchModalOpen(true)}
                        className="w-full flex items-start gap-3 p-4 bg-brand-muted rounded-2xl border border-brand/20 text-left hover:border-brand/40 transition-colors">
                        <MapPin className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-gray-900 dark:text-white">{selectedBranch?.name ?? t.selectBranch}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{selectedBranch?.area ?? t.chooseBranchDesc}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                        <Clock className="w-3 h-3 inline-block mr-1" />{t.pickupTime} *
                      </label>
                      <div className="relative">
                        <select
                          value={pickupTime}
                          onChange={e => setPickupTime(e.target.value)}
                          className="w-full appearance-none px-4 py-3.5 pr-10 rounded-2xl bg-brand-muted border-2 border-brand/20 focus:border-brand outline-none transition-all font-bold text-sm text-gray-900 dark:text-white dark:bg-gray-900 dark:border-brand/30 cursor-pointer"
                        >
                          {pickupSlots.map(slot => (
                            <option key={slot.value} value={slot.value}>{slot.label}</option>
                          ))}
                        </select>
                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand rotate-90 pointer-events-none" />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
                        ⚡ {language === 'fr' ? 'Prêt en 20-45 min après commande' : language === 'rw' ? 'Bitegurwa mu minota 20-45' : 'Ready 20–45 min after ordering'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{t.pickupName} *</label>
                      <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                        placeholder={t.namePlaceholder}
                        className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-brand outline-none transition-all font-bold text-sm text-gray-900 dark:text-white placeholder:text-gray-400 placeholder:font-normal" />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <ShieldCheck className="w-4 h-4 text-brand flex-shrink-0" />
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">{t.depositProtects}</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <Store className="w-4 h-4 text-brand flex-shrink-0" />
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">{t.branchReceivesOrder}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 'payment' && (
                  <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="p-4 space-y-4">
                    <div className="p-4 rounded-2xl bg-brand-muted border border-brand/20">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">{t.depositDueNow}</p>
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-2xl font-black text-gray-900 dark:text-white">{depositAmount.toLocaleString()} RWF</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {t.depositNote}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Branch</p>
                          <p className="text-sm font-black text-gray-900 dark:text-white">{selectedBranch?.name}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">{t.paymentMethod}</label>
                      {PAYMENT_METHODS.map((option) => {
                        const theme = PAYMENT_METHOD_THEMES[option];
                        const isActive = paymentMethod === option;
                        return (
                          <button
                            key={option}
                            onClick={() => setPaymentMethod(option)}
                            className={`w-full p-4 rounded-2xl font-bold flex items-center justify-between transition-all border-2 ${
                              isActive
                                ? `${theme.activeBg} ${theme.activeText} ${theme.activeBorder} shadow-lg`
                                : 'bg-gray-50 dark:bg-gray-900 text-gray-500 border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black shadow-sm ${isActive ? `${theme.badgeBg} ${theme.badgeText}` : 'bg-white text-gray-800'}`}>
                                {option.toUpperCase()}
                              </div>
                              <div className="text-left">
                                <p className="font-black text-sm">{getPaymentMethodLabel(option, language)}</p>
                                <p className="text-[10px] opacity-60">{getPaymentMethodSubLabel(option, language)}</p>
                              </div>
                            </span>
                            <div className={`w-5 h-5 rounded-full border-2 transition-colors ${
                              isActive ? (option === 'mtn' ? 'border-black bg-black' : option === 'airtel' ? 'border-white bg-white' : 'border-white bg-white') : 'border-gray-300'
                            }`} />
                          </button>
                        );
                      })}
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{t.phoneNumber} *</label>
                      <div className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus-within:border-brand transition-all">
                        <span className="font-black text-gray-500 text-sm flex-shrink-0">+250</span>
                        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />
                        <input
                          type="tel"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                          placeholder={paymentMethod === 'card' ? '7XX XXX XXX' : paymentMethod === 'mtn' ? '78X XXX XXX' : '73X XXX XXX'}
                          className="flex-1 bg-transparent outline-none font-black text-lg tracking-widest text-gray-900 dark:text-white placeholder:text-gray-300 placeholder:font-normal placeholder:text-sm placeholder:tracking-normal"
                        />
                      </div>
                      <p className="text-[11px] text-gray-400 font-medium mt-2 text-center">
                        {getPaymentMethodNote(paymentMethod, language)}
                      </p>
                    </div>
                  </motion.div>
                )}

                {step === 'tracking' && (
                  <motion.div key="tracking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-brand-muted rounded-2xl">
                      <div className="w-2.5 h-2.5 bg-brand rounded-full animate-ping" />
                      <span className="text-sm font-black text-brand uppercase tracking-wide">{t.orderConfirmedSending}</span>
                    </div>

                    <div className="relative h-56 bg-gray-100 dark:bg-gray-900 rounded-2xl overflow-hidden border dark:border-gray-800 p-5">
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-brand" />
                        <div className="absolute -bottom-12 -left-8 w-40 h-40 rounded-full bg-brand-dark" />
                      </div>
                      <div className="relative h-full flex flex-col justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-brand-dark rounded-2xl flex items-center justify-center">
                            <Store className="w-6 h-6 text-brand" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t.preparingAt}</p>
                            <p className="text-sm font-black text-gray-900 dark:text-white">{selectedBranch?.name}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            {t.depositConfirmed}
                          </div>
                          <div className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                            {t.branchPreparing}
                          </div>
                          <div className="flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400">
                            <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700" />
                            {t.pickupTime}: {pickupTime ? new Date(pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border dark:border-gray-800">
                      <div className="w-12 h-12 bg-brand-muted rounded-2xl flex items-center justify-center">
                        <Smartphone className="w-6 h-6 text-brand" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t.pickupWindow}</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {pickupTime ? new Date(pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </p>
                      </div>
                    </div>

                    {/* Manual continue button — don't rely only on setTimeout */}
                    <button
                      onClick={() => setStep('success')}
                      className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      {language === 'fr' ? 'Voir la confirmation' : language === 'rw' ? 'Reba Inyandiko' : 'View Order Confirmation'}
                    </button>
                  </motion.div>
                )}

                {step === 'success' && (
                  <SuccessStep
                    orderId={orderId}
                    selectedBranch={selectedBranch}
                    totalPoints={totalPoints}
                    t={t}
                    onReset={handleReset}
                    pickupBranchId={pickupBranchId}
                    language={language}
                    depositAmount={depositAmount}
                    paymentMethod={paymentMethod}
                  />
                )}
              </AnimatePresence>
            </div>

            {['cart', 'details', 'payment'].includes(step) && cart.length > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">{t.subtotal}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{subtotal.toLocaleString()} RWF</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 font-bold">{t.promoCode} ({appliedPromo})</span>
                      <span className="font-bold text-green-600">-{discountAmount.toLocaleString()} RWF</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">{t.depositDueNow}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{depositAmount.toLocaleString()} RWF</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span className="font-black text-gray-900 dark:text-white">{t.total}</span>
                    <span className="font-black text-lg text-gray-900 dark:text-white">{orderTotal.toLocaleString()} RWF</span>
                  </div>
                </div>
                <button onClick={handleNext} disabled={!canProceed()} className="w-full py-4 bg-brand hover:bg-brand-dark disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-brand/20 disabled:shadow-none flex items-center justify-center gap-2">
                  {step === 'payment'
                    ? `${getPaymentMethodLabel(paymentMethod, language)} — ${depositAmount.toLocaleString()} RWF`
                    : step === 'details'
                    ? t.checkout
                    : !user
                    ? (language === 'fr' ? 'Connexion pour commander' : language === 'rw' ? 'Injira Utumize' : 'Sign in to Checkout')
                    : t.checkout}
                  {canProceed() && <ChevronRight className="w-4 h-4 stroke-[3px]" />}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const PROMO_PREVIEW: Record<string, number> = {
  SIMBA10: 10,
  WELCOME: 15,
  KIGALI5: 5,
};
