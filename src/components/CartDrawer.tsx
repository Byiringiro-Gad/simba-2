'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import {
  X, Plus, Minus, Trash2, CheckCircle2, ChevronLeft, ChevronRight,
  MapPin, Clock, ShieldCheck, Package, Tag, Gift, Store, Smartphone, Star,
  AlertCircle, RefreshCw, Bookmark, Printer,
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckoutStep } from '@/types';
import type { PaymentMethod } from '@/types';
import type { Language } from '@/types';
import { toast } from './Toast';
import CartSuggestions from './CartSuggestions';
import SavingsTracker from './SavingsTracker';
import { getBranchById, PICKUP_DEPOSIT_RWF } from '@/lib/branches';
import {
  PAYMENT_METHODS, PAYMENT_METHOD_THEMES,
  getPaymentMethodLabel, getPaymentMethodNote, getPaymentMethodSubLabel,
} from '@/lib/paymentMethods';

const BASE_DEPOSIT = PICKUP_DEPOSIT_RWF; // 500 RWF

const ORDER_MINIMUM = 1000;

function isValidRwandaPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, '');
  // Accept 07XXXXXXXX, 7XXXXXXXX, +2507XXXXXXXX, 2507XXXXXXXX
  return /^(?:250)?7[2389]\d{7}$/.test(digits);
}

// ── Generate pickup time slots in Kigali time ─────────────────────────────────
function generatePickupSlots(): { value: string; label: string }[] {
  const slots: { value: string; label: string }[] = [];

  // Use Kigali time (UTC+2)
  const kigaliNow = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Africa/Kigali' })
  );

  // Earliest = now + 30 min, rounded up to next :00 or :30
  const earliest = new Date(kigaliNow.getTime() + 30 * 60 * 1000);
  const m = earliest.getMinutes();
  if (m > 0 && m <= 30) {
    earliest.setMinutes(30, 0, 0);
  } else if (m > 30) {
    earliest.setHours(earliest.getHours() + 1, 0, 0, 0);
  } else {
    earliest.setSeconds(0, 0);
  }

  const CLOSING_HOUR = 21; // 9 PM

  const fmt12 = (d: Date) => {
    const h = d.getHours();
    const min = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    const mStr = min === 0 ? '00' : '30';
    return `${h12}:${mStr} ${ampm}`;
  };

  const todayClosing = new Date(kigaliNow);
  todayClosing.setHours(CLOSING_HOUR, 0, 0, 0);

  // No slots today — use tomorrow 8 AM
  if (earliest >= todayClosing) {
    const tomorrow = new Date(kigaliNow);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);
    const tomorrowClosing = new Date(tomorrow);
    tomorrowClosing.setHours(CLOSING_HOUR, 0, 0, 0);
    const dayLabel = tomorrow.toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    });
    const cursor = new Date(tomorrow);
    while (cursor < tomorrowClosing) {
      slots.push({ value: cursor.toISOString(), label: `${dayLabel}, ${fmt12(cursor)}` });
      cursor.setMinutes(cursor.getMinutes() + 30);
    }
    return slots;
  }

  // Today's slots
  const cursor = new Date(earliest);
  let first = true;
  while (cursor < todayClosing) {
    const diffMins = Math.round((cursor.getTime() - kigaliNow.getTime()) / 60000);
    const label = first
      ? `Today, ${fmt12(cursor)} (ready in ~${diffMins} min)`
      : `Today, ${fmt12(cursor)}`;
    slots.push({ value: cursor.toISOString(), label });
    first = false;
    cursor.setMinutes(cursor.getMinutes() + 30);
  }

  // Add first slot of tomorrow as a convenience option
  const tomorrow = new Date(kigaliNow);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(8, 0, 0, 0);
  const dayLabel = tomorrow.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
  slots.push({ value: tomorrow.toISOString(), label: `${dayLabel}, 8:00 AM` });

  return slots;
}

// ── Order success step with branch review ─────────────────────────────────────
function SuccessStep({
  orderId, selectedBranch, totalPoints, t, onReset,
  pickupBranchId, language, depositAmount, paymentMethod,
  orderItems, orderTotal, pickupSlot, orderDate,
}: {
  orderId: string;
  selectedBranch: ReturnType<typeof getBranchById>;
  totalPoints: number;
  t: any;
  onReset: () => void;
  pickupBranchId: string;
  language: Language;
  depositAmount: number;
  paymentMethod: PaymentMethod;
  orderItems: any[];
  orderTotal: number;
  pickupSlot: string;
  orderDate: string;
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
    <motion.div
      key="success"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center text-center py-8 px-6"
    >
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
        {t.pickupConfirmedAt} {selectedBranch?.name}.
        <br />
        {t.depositPaid}: {depositAmount.toLocaleString()} RWF
      </p>
      <p className="text-xs text-gray-400 mb-4">
        {getPaymentMethodNote(paymentMethod, language)}
      </p>

      {/* Loyalty points */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-brand/10 rounded-full mb-6">
        <Star className="w-4 h-4 text-brand" />
        <span className="text-sm font-black text-brand-dark dark:text-brand">
          +{totalPoints} {t.loyaltyPointsEarned}
        </span>
      </div>

      {/* Branch review */}
      {!submitted ? (
        <div className="w-full bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 mb-5 text-left">
          <p className="font-black text-sm text-gray-900 dark:text-white mb-0.5">{t.rateExperience}</p>
          <p className="text-xs text-gray-400 mb-3">
            {language === 'fr'
              ? 'Notez après votre retrait'
              : language === 'rw'
              ? 'Tanga igitekerezo nyuma yo gufata'
              : 'Rate after picking up'}{' '}
            · {selectedBranch?.name}
          </p>
          <div className="flex gap-1.5 mb-3 justify-center">
            {[1, 2, 3, 4, 5].map(i => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i)}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(0)}
                className="transition-transform hover:scale-110"
                aria-label={`${i} star`}
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    (hover || rating) >= i ? 'fill-brand text-brand' : 'text-gray-200 dark:text-gray-700'
                  }`}
                />
              </button>
            ))}
          </div>
          <AnimatePresence>
            {rating > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder={t.commentPlaceholder}
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-brand transition-colors text-gray-900 dark:text-white placeholder:text-gray-400 resize-none mb-3"
                />
                <button
                  onClick={handleSubmitReview}
                  disabled={submitting}
                  className="w-full py-2.5 bg-brand-dark text-white rounded-xl font-black text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {submitting ? '...' : t.submitReview}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="w-full flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 mb-5">
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
          <p className="text-sm font-bold text-green-700 dark:text-green-400">{t.reviewSubmitted}</p>
        </div>
      )}

      <button
        onClick={onReset}
        className="w-full py-4 bg-brand hover:bg-brand-dark text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-brand/20"
      >
        {t.backToStore}
      </button>

      <button
        onClick={() => window.print()}
        className="w-full mt-2 py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl font-black text-sm hover:border-brand hover:text-brand-dark dark:hover:text-brand transition-colors flex items-center justify-center gap-2"
      >
        <Printer className="w-4 h-4" />
        {language === 'fr' ? 'Imprimer le reçu' : language === 'rw' ? 'Fotokorera urupapuro' : 'Print Receipt'}
      </button>

      {/* Hidden receipt — shown only during print */}
      <div className="receipt-print-area" style={{ visibility: 'hidden', position: 'absolute', pointerEvents: 'none', height: 0, overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ fontWeight: 900, fontSize: '20px' }}>🛒 Simba Supermarket</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Kigali, Rwanda · simbaonlineshopping.com</div>
        </div>
        <hr style={{ margin: '12px 0' }} />
        <div style={{ fontSize: '13px', marginBottom: '8px' }}><strong>Order ID:</strong> #{orderId}</div>
        <div style={{ fontSize: '13px', marginBottom: '8px' }}><strong>Date:</strong> {orderDate}</div>
        <div style={{ fontSize: '13px', marginBottom: '8px' }}><strong>Branch:</strong> {selectedBranch?.name}</div>
        <div style={{ fontSize: '13px', marginBottom: '16px' }}><strong>Pickup:</strong> {pickupSlot}</div>
        <hr style={{ margin: '12px 0' }} />
        <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items</div>
        {orderItems.map((item: any, i: number) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
            <span>{item.name} ×{item.quantity}</span>
            <span>{(item.price * item.quantity).toLocaleString()} RWF</span>
          </div>
        ))}
        <hr style={{ margin: '12px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
          <span>Subtotal</span><span>{orderTotal.toLocaleString()} RWF</span>
        </div>
        {depositAmount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px', color: '#16a34a' }}>
            <span>Deposit paid</span><span>-{depositAmount.toLocaleString()} RWF</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 900, marginTop: '8px' }}>
          <span>Balance due at pickup</span>
          <span>{Math.max(0, orderTotal - depositAmount).toLocaleString()} RWF</span>
        </div>
        <hr style={{ margin: '16px 0' }} />
        <div style={{ fontSize: '11px', color: '#888', textAlign: 'center' }}>
          Payment: {paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod.toUpperCase()} · Thank you for shopping at Simba!
        </div>
      </div>
    </motion.div>
  );
}

// ── Main CartDrawer ────────────────────────────────────────────────────────────
export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const {
    cart, updateQuantity, removeFromCart, clearCart,
    language, user, pickupBranchId, setPickupBranchModalOpen,
    appliedPromo, promoDiscount, applyPromo, removePromo,
    placeOrder, setAuthOpen,
    savedItems, saveForLater, moveToCart, removeSavedItem,
  } = useSimbaStore();

  const t = translations[language];

  const [step, setStep] = useState<CheckoutStep>('cart');
  const [contactPhone, setContactPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mtn');
  const [promoInput, setPromoInput] = useState('');
  const [orderId, setOrderId] = useState('');
  const [depositAmount, setDepositAmount] = useState(BASE_DEPOSIT);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [recurringOrder, setRecurringOrder] = useState<'none' | 'weekly' | 'biweekly' | 'monthly'>('none');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Generate pickup slots fresh every time the drawer opens
  const pickupSlots = useMemo(() => generatePickupSlots(), [isOpen]);
  const [pickupTime, setPickupTime] = useState('');

  // Set default to first slot whenever drawer opens
  useEffect(() => {
    if (isOpen && pickupSlots.length > 0) {
      setPickupTime(pickupSlots[0].value);
    }
  }, [isOpen, pickupSlots]);

  // Auto-fill name from user
  useEffect(() => {
    if (!fullName.trim() && user?.name) {
      setFullName(user.name);
    }
  }, [user?.name]);

  // Reset to cart step when drawer closes
  useEffect(() => {
    if (!isOpen) {
      // Small delay to prevent the step state from resetting before the
      // closing animation finishes.
      const t = setTimeout(() => {
        if (step !== 'success') setStep('cart');
      }, 400);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Dynamic deposit based on no-show history
  useEffect(() => {
    if (!user?.id) { setDepositAmount(BASE_DEPOSIT); return; }
    fetch(`/api/branch/flag?userId=${user.id}${user.phone ? `&phone=${encodeURIComponent(user.phone)}` : ''}`)
      .then(r => r.json())
      .then(d => {
        if (d.ok && d.flags >= 2) setDepositAmount(1000);
        else if (d.ok && d.flags === 1) setDepositAmount(750);
        else setDepositAmount(BASE_DEPOSIT);
      })
      .catch(() => setDepositAmount(BASE_DEPOSIT));
  }, [user?.id]);

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountAmount = Math.floor(subtotal * (promoDiscount / 100));
  const orderTotal = subtotal - discountAmount;
  const totalPoints = Math.floor(orderTotal / 100);
  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const selectedBranch = getBranchById(pickupBranchId);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    const ok = await applyPromo(promoInput.trim());
    if (ok) {
      toast.success(t.promoApplied);
      setPromoInput('');
    } else {
      toast.error(t.promoInvalid);
    }
  };

  const handleNext = async () => {
    // Step 1: cart → require login
    if (step === 'cart') {
      if (!user) { setAuthOpen(true); return; }
      setStep('details');
      return;
    }

    // Step 2: details → validate branch + name
    if (step === 'details') {
      if (!fullName.trim()) {
        toast.error(language === 'fr' ? 'Entrez votre nom' : language === 'rw' ? 'Injiza izina ryawe' : 'Please enter your name');
        return;
      }
      if (!selectedBranch) {
        toast.error(t.selectBranch);
        return;
      }
      if (!pickupTime) {
        toast.error(language === 'fr' ? 'Choisissez un créneau' : language === 'rw' ? 'Hitamo igihe' : 'Please select a pickup time');
        return;
      }
      setStep('payment');
      return;
    }

    // Step 3: payment → place order
    if (step === 'payment') {
      if (paymentMethod !== 'cod' && !isValidRwandaPhone(contactPhone)) {
        toast.error(
          language === 'fr' ? 'Entrez un numéro rwandais valide (ex. 078 XXX XXX)' :
          language === 'rw' ? 'Injiza nimero y\'u Rwanda yemewe (urugero: 078 XXX XXX)' :
          'Enter a valid Rwandan number (e.g. 078 XXX XXX)'
        );
        return;
      }

      setIsPlacingOrder(true);
      const id = `SIMB-${Math.floor(Math.random() * 90000 + 10000)}`;

      try {
        // Save the order to the Zustand store immediately so the confirmation
        // screen is shown regardless of database availability.
        placeOrder({
          id,
          items: cart,
          total: orderTotal,
          pickupBranch: selectedBranch?.name ?? '',
          pickupSlot: pickupTime as any,
          depositAmount,
          recurring: recurringOrder,
        });

        // Persist to the database. Failures are swallowed so a transient DB
        // outage does not block the user — the order is already committed to
        // the Zustand store above.
        try {
          const { ordersApi } = await import('@/lib/api');
          await ordersApi.place({
            id,
            userId: user?.id,
            customerName: fullName.trim(),
            customerPhone: `+250${contactPhone}`,
            pickupBranch: selectedBranch?.name ?? '',
            pickupSlot: pickupTime,
            paymentMethod,
            depositAmount,
            items: cart,
            subtotal,
            deliveryFee: 0,
            discount: discountAmount,
            total: orderTotal,
            promoCode: appliedPromo ?? null,
            deliveryNotes: deliveryNotes.trim() || undefined,
          });
        } catch {
          // Database write failed; the order remains in the Zustand store.
        }

        setOrderId(id);
        setIsPlacingOrder(false);
        setStep('tracking');

        // Auto-advance to success after 3 seconds
        setTimeout(() => setStep('success'), 3000);
      } catch (err: any) {
        setIsPlacingOrder(false);
        toast.error(
          language === 'fr' ? 'Impossible de passer la commande. Réessayez.' :
          language === 'rw' ? 'Ntibishoboye gutumiza. Ongera ugerageze.' :
          'Could not place order. Please try again.'
        );
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
    setPromoInput('');
    setPickupTime(pickupSlots[0]?.value ?? '');
    setRecurringOrder('none');
    setDeliveryNotes('');
    setShowClearConfirm(false);
    onClose();
  };

  const canProceed = () => {
    if (step === 'cart') return cart.length > 0 && subtotal >= ORDER_MINIMUM;
    if (step === 'details') return fullName.trim().length > 0 && !!selectedBranch && !!pickupTime;
    if (step === 'payment') return paymentMethod === 'cod' || isValidRwandaPhone(contactPhone);
    return false;
  };

  const STEP_LABELS: Record<CheckoutStep, string> = {
    cart:     t.cart,
    details:  t.pickupDetails,
    payment:  t.paymentMethod,
    tracking: t.branchPrep,
    success:  t.success,
  };

  const CHECKOUT_STEPS: CheckoutStep[] = ['cart', 'details', 'payment'];
  const currentStepIdx = CHECKOUT_STEPS.indexOf(step as CheckoutStep);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 z-[101] w-full sm:max-w-[420px] bg-white dark:bg-gray-950 shadow-2xl flex flex-col"
            style={{ height: '100dvh' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-brand text-white flex-shrink-0">
              <div className="flex items-center gap-3">
                {(step === 'details' || step === 'payment') && (
                  <button
                    onClick={handleBack}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                    aria-label="Back"
                  >
                    <ChevronLeft className="w-4 h-4 stroke-[2.5px]" />
                  </button>
                )}
                <div>
                  <h2 className="font-black text-base">{STEP_LABELS[step]}</h2>
                  {step === 'cart' && cart.length > 0 && (
                    <p className="text-white/70 text-xs font-medium">
                      {itemCount} {itemCount !== 1 ? t.items : t.item}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {step === 'cart' && cart.length > 0 && (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="px-3 py-1.5 text-xs font-black text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                  >
                    {language === 'fr' ? 'Vider' : language === 'rw' ? 'Siba' : 'Clear'}
                  </button>
                )}
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Clear cart confirmation bar */}
            <AnimatePresence>
              {showClearConfirm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 flex items-center justify-between px-5 py-3 flex-shrink-0 overflow-hidden"
                >
                  <p className="text-sm font-bold text-red-700 dark:text-red-400">
                    {language === 'fr' ? 'Supprimer tous les articles ?' : language === 'rw' ? 'Gukura ibintu byose?' : 'Remove all items?'}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setShowClearConfirm(false)}
                      className="px-3 py-1.5 text-xs font-black text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-colors">
                      {language === 'fr' ? 'Annuler' : language === 'rw' ? 'Reka' : 'Cancel'}
                    </button>
                    <button onClick={() => { clearCart(); toast.info(t.cartCleared); setShowClearConfirm(false); }}
                      className="px-3 py-1.5 text-xs font-black text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors">
                      {language === 'fr' ? 'Vider' : language === 'rw' ? 'Siba' : 'Clear'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step progress indicator */}
            {CHECKOUT_STEPS.includes(step as CheckoutStep) && (
              <div className="flex items-center gap-1 px-5 py-3 bg-brand-muted dark:bg-brand/10 border-b border-brand/10 flex-shrink-0">
                {CHECKOUT_STEPS.map((s, i) => {
                  const isDone = currentStepIdx > i;
                  const isCurrent = step === s;
                  return (
                    <div key={s} className="flex items-center gap-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                        isCurrent
                          ? 'bg-brand text-white shadow-sm'
                          : isDone
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                      }`}>
                        {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                      </div>
                      {i < CHECKOUT_STEPS.length - 1 && (
                        <div className={`h-0.5 w-10 rounded-full transition-colors ${
                          isDone ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                        }`} />
                      )}
                    </div>
                  );
                })}
                <span className="ml-2 text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                  {step === 'cart' ? t.cart : step === 'details' ? t.pickupDetails : t.paymentMethod}
                </span>
              </div>
            )}

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">

                {/* ── STEP 1: CART ── */}
                {step === 'cart' && (
                  <motion.div
                    key="cart"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col"
                  >
                    {cart.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                        <div className="w-20 h-20 bg-brand-muted rounded-3xl flex items-center justify-center mb-4">
                          <Package className="w-10 h-10 text-brand/30" />
                        </div>
                        <p className="font-black text-gray-900 dark:text-white mb-1">{t.emptyCart}</p>
                        <p className="text-sm text-gray-400 mb-4">{t.emptyCartSub}</p>
                        <button onClick={onClose} className="px-6 py-3 bg-brand-dark text-white rounded-2xl font-black text-sm hover:bg-gray-800 transition-colors">
                          {t.shopNow}
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Cart items */}
                        <div className="p-4 space-y-3">
                          {cart.map(item => (
                            <div key={item.id} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                              <Link href={`/products/${item.id}`} onClick={onClose} className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                              </Link>
                              <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                  <Link href={`/products/${item.id}`} onClick={onClose}>
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 leading-snug hover:text-brand transition-colors">{item.name}</h4>
                                  </Link>
                                  <p className="text-xs font-black text-brand-dark dark:text-brand mt-0.5">{item.price.toLocaleString()} RWF</p>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <button
                                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                      aria-label="Decrease quantity"
                                    >
                                      <Minus className="w-3 h-3 stroke-[3px]" />
                                    </button>
                                    <span className="text-sm font-black text-gray-900 dark:text-white w-6 text-center select-none">{item.quantity}</span>
                                    <button
                                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-brand hover:bg-brand-muted transition-colors"
                                      aria-label="Increase quantity"
                                    >
                                      <Plus className="w-3 h-3 stroke-[3px]" />
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-black text-gray-900 dark:text-white">
                                      {(item.price * item.quantity).toLocaleString()} RWF
                                    </span>
                                    <button
                                      onClick={() => saveForLater(item.id)}
                                      className="flex items-center gap-1 text-[10px] font-black text-gray-400 hover:text-brand transition-colors"
                                      aria-label="Save for later"
                                    >
                                      <Bookmark className="w-3 h-3" />
                                      {language === 'fr' ? 'Garder' : language === 'rw' ? 'Bika' : 'Save'}
                                    </button>
                                    <button
                                      onClick={() => removeFromCart(item.id)}
                                      className="text-[10px] font-black text-gray-400 hover:text-red-500 transition-colors"
                                      aria-label="Remove item"
                                    >
                                      {language === 'fr' ? 'Retirer' : language === 'rw' ? 'Kura' : 'Remove'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Sign-in nudge */}
                          {!user && (
                            <button
                              onClick={() => setAuthOpen(true)}
                              className="w-full flex items-center gap-3 p-4 bg-brand-dark rounded-2xl text-left hover:bg-gray-800 transition-colors"
                            >
                              <div className="w-8 h-8 bg-brand rounded-xl flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="w-4 h-4 text-gray-900" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-black text-sm text-white">
                                  {language === 'fr' ? 'Connectez-vous pour commander' : language === 'rw' ? 'Injira kugira ngo utumize' : 'Sign in to place your order'}
                                </p>
                                <p className="text-white/60 text-xs font-medium">
                                  {language === 'fr' ? 'Créez un compte gratuit ou connectez-vous' : language === 'rw' ? 'Fungura konti cyangwa injira' : 'Free account — takes under a minute'}
                                </p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-white/60 flex-shrink-0" />
                            </button>
                          )}

                          {/* Order minimum warning */}
                          {cart.length > 0 && subtotal < ORDER_MINIMUM && (
                            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                              <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                                {language === 'fr'
                                  ? `Minimum 1 000 RWF. Ajoutez encore ${(ORDER_MINIMUM - subtotal).toLocaleString()} RWF.`
                                  : language === 'rw'
                                  ? `Imeze nkeya ni RWF 1 000. Ongeraho RWF ${(ORDER_MINIMUM - subtotal).toLocaleString()} kugira ngo ukomeze.`
                                  : `Minimum order is 1,000 RWF. Add ${(ORDER_MINIMUM - subtotal).toLocaleString()} RWF more to continue.`}
                              </p>
                            </div>
                          )}

                          {/* Savings tracker */}
                          <SavingsTracker />

                          {/* Promo code */}
                          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Gift className="w-4 h-4 text-brand" />
                              <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">{t.promoCodeLabel}</p>
                            </div>
                            {appliedPromo ? (
                              <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <Tag className="w-4 h-4 text-green-600" />
                                  <span className="font-black text-green-700 dark:text-green-400 text-sm tracking-widest">{appliedPromo}</span>
                                  <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-800 px-2 py-0.5 rounded-full">-{promoDiscount}%</span>
                                </div>
                                <button onClick={removePromo} className="text-green-600 hover:text-red-500 transition-colors p-1">
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
                                  placeholder={t.enterPromoCode}
                                  className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-bold outline-none focus:border-brand transition-colors text-gray-900 dark:text-white placeholder:text-gray-400 placeholder:font-normal uppercase"
                                />
                                <button
                                  onClick={handleApplyPromo}
                                  className="px-4 py-2.5 bg-brand-dark text-white rounded-xl text-sm font-black hover:bg-gray-800 transition-colors"
                                >
                                  {t.applyBtn}
                                </button>
                              </div>
                            )}
                            <p className="text-[10px] text-gray-400 mt-2 font-medium">{t.promoTryHint}</p>
                          </div>
                        </div>

                        {/* Saved for later */}
                        {savedItems.length > 0 && (
                          <div className="px-4 pb-2">
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
                              {language === 'fr' ? `Sauvegardés (${savedItems.length})` : language === 'rw' ? `Bibitswe (${savedItems.length})` : `Saved for Later (${savedItems.length})`}
                            </p>
                            <div className="space-y-2">
                              {savedItems.map(item => (
                                <div key={item.id} className="flex gap-3 p-3 bg-gray-50/60 dark:bg-gray-900/60 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                  <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                                    <Image src={item.image} alt={item.name} fill className="object-cover opacity-80" sizes="48px" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-xs text-gray-700 dark:text-gray-300 line-clamp-1">{item.name}</p>
                                    <p className="text-xs font-black text-gray-500">{item.price.toLocaleString()} RWF</p>
                                    <div className="flex items-center gap-3 mt-1">
                                      <button onClick={() => moveToCart(item.id)} className="text-[10px] font-black text-brand-dark dark:text-brand hover:underline">
                                        {language === 'fr' ? '+ Remettre au panier' : language === 'rw' ? '+ Subiza mu gitebo' : '+ Move to Cart'}
                                      </button>
                                      <button onClick={() => removeSavedItem(item.id)} className="text-[10px] text-gray-400 hover:text-red-500 transition-colors">
                                        {language === 'fr' ? 'Retirer' : language === 'rw' ? 'Siba' : 'Remove'}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Complete your basket */}
                        <CartSuggestions />
                      </>
                    )}
                  </motion.div>
                )}

                {/* ── STEP 2: PICKUP DETAILS ── */}
                {step === 'details' && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 space-y-4"
                  >
                    {/* Prep time banner */}
                    <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800">
                      <Clock className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-black text-green-700 dark:text-green-400 uppercase tracking-wide">{t.branchPrepTime}</p>
                        <p className="text-sm font-bold text-green-800 dark:text-green-300">{t.pickupReadyIn}</p>
                      </div>
                    </div>

                    {/* Branch selector */}
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5" /> {t.pickupBranch} *
                      </p>
                      <button
                        type="button"
                        onClick={() => setPickupBranchModalOpen(true)}
                        className={`w-full flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-colors ${
                          selectedBranch
                            ? 'bg-brand-muted border-brand/30 hover:border-brand/50'
                            : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 hover:border-red-400'
                        }`}
                      >
                        <MapPin className={`w-5 h-5 flex-shrink-0 mt-0.5 ${selectedBranch ? 'text-brand' : 'text-red-400'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-gray-900 dark:text-white">
                            {selectedBranch?.name ?? t.selectBranch}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {selectedBranch?.area ?? t.chooseBranchDesc}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      </button>
                    </div>

                    {/* Pickup time */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                        {t.pickupTime} *
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
                        {language === 'fr' ? 'Prêt en 20–45 min · Ouvert 8h–21h' : language === 'rw' ? 'Bitegurwa mu minota 20–45 · Buri munsi 8h–21h' : 'Ready in 20–45 min · Open 8am–9pm daily'}
                      </p>
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                        {t.pickupName} *
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder={t.namePlaceholder}
                        className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-brand outline-none transition-all font-bold text-sm text-gray-900 dark:text-white placeholder:text-gray-400 placeholder:font-normal"
                      />
                    </div>

                    {/* Delivery notes */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                        {language === 'fr' ? 'Notes de livraison (facultatif)' : language === 'rw' ? 'Amabwiriza (ntabigomba)' : 'Delivery Notes (optional)'}
                      </label>
                      <textarea
                        value={deliveryNotes}
                        onChange={e => setDeliveryNotes(e.target.value.slice(0, 300))}
                        placeholder={language === 'fr' ? 'Ex: Articles fragiles, emballage spécial...' : language === 'rw' ? 'Urugero: Ibintu byoroheje, ...' : 'e.g. Fragile items, special packaging...'}
                        rows={2}
                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-brand outline-none transition-all text-sm text-gray-900 dark:text-white placeholder:text-gray-400 resize-none"
                      />
                      <p className="text-[10px] text-gray-400 text-right mt-1">{deliveryNotes.length}/300</p>
                    </div>

                    {/* Trust badges */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <ShieldCheck className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 leading-snug">{t.depositProtects}</span>
                      </div>
                      <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <Store className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 leading-snug">{t.branchReceivesOrder}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 3: PAYMENT ── */}
                {step === 'payment' && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 space-y-4"
                  >
                    {/* Deposit summary */}
                    <div className="p-4 rounded-2xl bg-brand-muted border border-brand/20">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">{t.depositDueNow}</p>
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-3xl font-black text-gray-900 dark:text-white">{depositAmount.toLocaleString()} RWF</p>
                          <p className="text-xs text-gray-500 mt-1">{t.depositNote}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            {language === 'fr' ? 'Agence' : language === 'rw' ? 'Ishami' : 'Branch'}
                          </p>
                          <p className="text-sm font-black text-gray-900 dark:text-white">{selectedBranch?.name}</p>
                        </div>
                      </div>
                    </div>

                    {/* Payment methods */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">{t.paymentMethod}</label>
                      <div className="space-y-3">

                        {/* MTN MoMo */}
                        {(['mtn', 'airtel', 'card', 'cod'] as const).map(option => {
                          const isActive = paymentMethod === option;
                          const cfg = {
                            mtn:    { bg: '#FFCC00', text: '#111', border: '#FFCC00', label: 'MTN',    name: 'MTN MoMo',      sub: 'Mobile Money Rwanda' },
                            airtel: { bg: '#E31837', text: '#fff', border: '#E31837', label: 'AIRTEL', name: 'Airtel Money',   sub: 'Airtel Rwanda' },
                            card:   { bg: '#1e293b', text: '#fff', border: '#1e293b', label: 'CARD',   name: language === 'fr' ? 'Carte' : language === 'rw' ? 'Ikarita' : 'Card', sub: 'Visa / Mastercard' },
                            cod:    { bg: '#16a34a', text: '#fff', border: '#16a34a', label: 'CASH',   name: language === 'fr' ? 'Paiement à la livraison' : language === 'rw' ? 'Kwishura ugiye gufata' : 'Cash on Delivery', sub: language === 'fr' ? 'Payer au retrait' : language === 'rw' ? 'Wishura igihe ugiye gufata' : 'Pay balance at pickup' },
                          }[option];

                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => setPaymentMethod(option)}
                              style={isActive ? {
                                backgroundColor: cfg.bg,
                                color: cfg.text,
                                borderColor: cfg.border,
                              } : {
                                borderColor: cfg.border + '55',
                              }}
                              className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all duration-150 border-2 ${
                                isActive
                                  ? 'shadow-lg scale-[1.01]'
                                  : 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 hover:scale-[1.01]'
                              }`}
                            >
                              <span className="flex items-center gap-3">
                                <span
                                  style={{ backgroundColor: cfg.bg, color: cfg.text }}
                                  className="w-11 h-11 rounded-xl flex items-center justify-center text-[10px] font-black shadow flex-shrink-0"
                                >
                                  {cfg.label}
                                </span>
                                <span className="text-left">
                                  <p className="font-black text-sm">{getPaymentMethodLabel(option, language)}</p>
                                  <p className={`text-[11px] font-medium mt-0.5 ${isActive ? 'opacity-75' : 'text-gray-400 dark:text-gray-500'}`}>
                                    {getPaymentMethodSubLabel(option, language)}
                                  </p>
                                </span>
                              </span>
                              <span
                                style={isActive ? { borderColor: cfg.text, backgroundColor: cfg.text } : {}}
                                className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${
                                  isActive ? '' : 'border-gray-300 dark:border-gray-600'
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Phone number — hidden for CoD */}
                    {paymentMethod !== 'cod' && (
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{t.phoneNumber} *</label>
                      <div className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus-within:border-brand transition-all">
                        <span className="font-black text-gray-500 dark:text-gray-400 text-sm flex-shrink-0">+250</span>
                        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                        <input
                          type="tel"
                          inputMode="numeric"
                          value={contactPhone}
                          onChange={e => setContactPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                          placeholder={
                            paymentMethod === 'mtn' ? '78X XXX XXX' :
                            paymentMethod === 'airtel' ? '73X XXX XXX' :
                            '7XX XXX XXX'
                          }
                          className="flex-1 bg-transparent outline-none font-black text-xl tracking-widest text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:font-normal placeholder:text-sm placeholder:tracking-normal"
                        />
                        {contactPhone.length >= 9 && isValidRwandaPhone(contactPhone) && (
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        )}
                        {contactPhone.length >= 9 && !isValidRwandaPhone(contactPhone) && (
                          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        )}
                      </div>
                      {contactPhone.length >= 9 && !isValidRwandaPhone(contactPhone) && (
                        <p className="text-[11px] text-red-500 font-bold mt-1">
                          {language === 'fr' ? 'Numéro invalide. Ex: 078 XXX XXX' : language === 'rw' ? 'Nimero si ya Rwanda. Urugero: 078 XXX XXX' : 'Invalid number. e.g. 078 XXX XXX'}
                        </p>
                      )}
                      <p className="text-[11px] text-gray-400 font-medium mt-2 text-center">
                        {getPaymentMethodNote(paymentMethod, language)}
                      </p>
                    </div>
                    )}

                    {/* ── Recurring order toggle ── */}
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <RefreshCw className="w-4 h-4 text-brand flex-shrink-0" />
                        <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                          {language === 'fr' ? 'Commande récurrente' : language === 'rw' ? 'Itumizwa roisubiwamo' : 'Recurring Order'}
                        </p>
                      </div>
                      <p className="text-[11px] text-gray-400 mb-3 font-medium">
                        {language === 'fr'
                          ? 'Répétez automatiquement cette commande selon votre calendrier.'
                          : language === 'rw'
                          ? 'Ongera ubone ibyo utiguriye nk\'uko ubibonye.'
                          : 'Automatically repeat this order on your chosen schedule.'}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {([
                          { id: 'none',      label: { en: 'One-time',  fr: 'Unique',          rw: 'Rimwe' } },
                          { id: 'weekly',    label: { en: 'Weekly',    fr: 'Chaque semaine',   rw: 'Buri cyumweru' } },
                          { id: 'biweekly',  label: { en: 'Bi-weekly', fr: 'Toutes 2 semaines',rw: 'Buri byumweru 2' } },
                          { id: 'monthly',   label: { en: 'Monthly',   fr: 'Chaque mois',      rw: 'Buri kwezi' } },
                        ] as const).map(opt => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setRecurringOrder(opt.id)}
                            className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all border-2 text-left ${
                              recurringOrder === opt.id
                                ? 'bg-brand-dark text-white border-brand-dark shadow-sm'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-brand/40'
                            }`}
                          >
                            {recurringOrder === opt.id && opt.id !== 'none' && (
                              <RefreshCw className="w-3 h-3 mb-1 inline-block mr-1" />
                            )}
                            {opt.label[language as 'en' | 'fr' | 'rw'] ?? opt.label.en}
                          </button>
                        ))}
                      </div>
                      {recurringOrder !== 'none' && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-[10px] font-bold text-brand-dark dark:text-brand mt-2.5 flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {language === 'fr'
                            ? `Prochaine commande : ${recurringOrder === 'weekly' ? 'dans 7 jours' : recurringOrder === 'biweekly' ? 'dans 14 jours' : 'dans 1 mois'}`
                            : language === 'rw'
                            ? `Itumizwa rikurikira : ${recurringOrder === 'weekly' ? 'mu minsi 7' : recurringOrder === 'biweekly' ? 'mu minsi 14' : 'mu kwezi 1'}`
                            : `Next order: ${recurringOrder === 'weekly' ? 'in 7 days' : recurringOrder === 'biweekly' ? 'in 14 days' : 'in 1 month'}`}
                        </motion.p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 4: TRACKING — live order status timeline ── */}
                {step === 'tracking' && (
                  <motion.div
                    key="tracking"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 space-y-4"
                  >
                    {/* Live pulse header */}
                    <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                      <span className="relative flex h-3 w-3 flex-shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-green-800 dark:text-green-300 uppercase tracking-wide">
                          {language === 'fr' ? 'Commande en cours' : language === 'rw' ? 'Itumizwa ririmo gutunganywa' : 'Order in progress'}
                        </p>
                        <p className="text-[10px] text-green-600 dark:text-green-400 font-medium mt-0.5">
                          {t.orderIdLabel} #{orderId}
                        </p>
                      </div>
                    </div>

                    {/* Branch card */}
                    <div className="flex items-center gap-3 p-4 bg-brand-muted dark:bg-brand/10 rounded-2xl border border-brand/20">
                      <div className="w-11 h-11 bg-brand-dark rounded-xl flex items-center justify-center flex-shrink-0">
                        <Store className="w-5 h-5 text-brand" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{t.preparingAt}</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white truncate">{selectedBranch?.name}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{selectedBranch?.area}</p>
                      </div>
                    </div>

                    {/* Order timeline */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
                        {language === 'fr' ? 'Étapes de la commande' : language === 'rw' ? 'Inzira y\'itumizwa' : 'Order Progress'}
                      </p>
                      <div className="relative">
                        {/* Vertical line */}
                        <div className="absolute left-[10px] top-3 bottom-3 w-0.5 bg-gray-100 dark:bg-gray-800" />
                        {/* Active fill */}
                        <div className="absolute left-[10px] top-3 w-0.5 bg-green-500 transition-all duration-1000" style={{ height: '35%' }} />

                        <div className="space-y-4 relative">
                          {[
                            {
                              done: true, active: false,
                              icon: CheckCircle2,
                              label: { en: 'Order Placed', fr: 'Commande passée', rw: 'Itumizwa ryashyizweho' },
                              sub: { en: `Deposit of ${depositAmount.toLocaleString()} RWF confirmed`, fr: `Dépôt de ${depositAmount.toLocaleString()} RWF confirmé`, rw: `Inguzanyo ya RWF ${depositAmount.toLocaleString()} yemejwe` },
                              color: 'bg-green-500',
                            },
                            {
                              done: true, active: true,
                              icon: Package,
                              label: { en: 'Branch Confirmed', fr: 'Agence confirmée', rw: 'Ishami ryemeje' },
                              sub: { en: 'Staff notified, preparing your basket', fr: "Le personnel est notifié, prépare votre panier", rw: 'Abakozi bamenyeshwa, batunganya igitebo cyawe' },
                              color: 'bg-brand',
                            },
                            {
                              done: false, active: false,
                              icon: ShieldCheck,
                              label: { en: 'Being Packed', fr: 'En cours d\'emballage', rw: 'Birakurunganwa' },
                              sub: { en: 'Your items are being picked and packed', fr: 'Vos articles sont ramassés et emballés', rw: 'Ibintu byawe biratoranywa bikurunganwa' },
                              color: 'bg-gray-300 dark:bg-gray-600',
                            },
                            {
                              done: false, active: false,
                              icon: Store,
                              label: { en: 'Ready for Pickup', fr: 'Prêt à retirer', rw: 'Biteguye gufatwa' },
                              sub: { en: 'Come collect at the branch', fr: "Venez retirer à l'agence", rw: 'Iza gufata ku ishami' },
                              color: 'bg-gray-300 dark:bg-gray-600',
                            },
                          ].map((s, i) => {
                            const Icon = s.icon;
                            const lbl = s.label[language as 'en' | 'fr' | 'rw'] ?? s.label.en;
                            const sublbl = s.sub[language as 'en' | 'fr' | 'rw'] ?? s.sub.en;
                            return (
                              <div key={i} className="flex items-start gap-3 pl-1">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${s.color} ${s.active ? 'ring-2 ring-offset-2 ring-brand dark:ring-offset-gray-900' : ''}`}>
                                  {s.done
                                    ? <Icon className="w-3 h-3 text-white" />
                                    : <span className="w-2 h-2 rounded-full bg-white/40" />
                                  }
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs font-black ${s.done ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                                    {lbl}
                                    {s.active && (
                                      <span className="ml-2 inline-flex items-center gap-1 text-[9px] font-black text-brand bg-brand/10 px-1.5 py-0.5 rounded-full">
                                        <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                                        {language === 'fr' ? 'En cours' : language === 'rw' ? 'Birimo gukorwa' : 'Live'}
                                      </span>
                                    )}
                                  </p>
                                  <p className={`text-[10px] mt-0.5 font-medium ${s.done ? 'text-gray-500 dark:text-gray-400' : 'text-gray-300 dark:text-gray-600'}`}>
                                    {sublbl}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Pickup time */}
                    <div className="flex items-center gap-3 p-3.5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                      <Clock className="w-5 h-5 text-brand flex-shrink-0" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t.pickupWindow}</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {pickupTime
                            ? new Date(pickupTime).toLocaleString(
                                language === 'fr' ? 'fr-FR' : 'en-US',
                                { weekday: 'short', hour: '2-digit', minute: '2-digit' }
                              )
                            : '—'}
                        </p>
                      </div>
                    </div>

                    {/* Payment reminder */}
                    <div className="flex items-center gap-3 p-3.5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                      <Smartphone className="w-5 h-5 text-brand flex-shrink-0" />
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
                        {getPaymentMethodNote(paymentMethod, language)}
                      </p>
                    </div>

                    <button
                      onClick={() => setStep('success')}
                      className="w-full py-4 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-2xl font-black text-sm transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      {language === 'fr' ? 'Voir la confirmation' : language === 'rw' ? 'Reba inyandiko' : 'View Order Confirmation'}
                    </button>
                  </motion.div>
                )}

                {/* ── STEP 5: SUCCESS ── */}
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
                    orderItems={cart}
                    orderTotal={orderTotal}
                    pickupSlot={pickupTime}
                    orderDate={new Date().toLocaleString()}
                  />
                )}

              </AnimatePresence>
            </div>

            {/* ── Sticky bottom totals + CTA ── */}
            {CHECKOUT_STEPS.includes(step as CheckoutStep) && cart.length > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 space-y-3 flex-shrink-0">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">{t.subtotal}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{subtotal.toLocaleString()} RWF</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 dark:text-green-400 font-bold">{t.promoCode} ({appliedPromo})</span>
                      <span className="font-bold text-green-600 dark:text-green-400">-{discountAmount.toLocaleString()} RWF</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">{t.depositDueNow}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{depositAmount.toLocaleString()} RWF</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span className="font-black text-gray-900 dark:text-white text-base">{t.total}</span>
                    <span className="font-black text-xl text-gray-900 dark:text-white">{orderTotal.toLocaleString()} RWF</span>
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  disabled={!canProceed() || isPlacingOrder}
                  className="w-full py-4 bg-brand hover:bg-brand-dark disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-brand/20 disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {isPlacingOrder ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {language === 'fr' ? 'Commande en cours...' : language === 'rw' ? 'Gutumiza...' : 'Placing order...'}
                    </>
                  ) : step === 'payment' ? (
                    `${getPaymentMethodLabel(paymentMethod, language)} — ${depositAmount.toLocaleString()} RWF`
                  ) : !user ? (
                    language === 'fr' ? 'Se connecter pour commander' :
                    language === 'rw' ? 'Injira Utumize' :
                    'Sign in to Checkout'
                  ) : (
                    t.checkout
                  )}
                  {canProceed() && !isPlacingOrder && (
                    <ChevronRight className="w-4 h-4 stroke-[3px]" />
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
