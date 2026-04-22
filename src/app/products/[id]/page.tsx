'use client';

import { useParams, useRouter } from 'next/navigation';
import { getSimbaData, getRelatedProducts } from '@/lib/data';
import { getReviews, addReview, getProductRating, getStockCount } from '@/lib/reviews';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import ProductCard from '@/components/ProductCard';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import {
  ChevronLeft, Plus, Minus, ShieldCheck, Truck,
  Star, Package, Heart, Clock, Send, CheckCircle2,
  Share2, ChevronRight
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useEffect, useState } from 'react';
import { Review, DeliverySlot } from '@/types';
import { clsx } from 'clsx';
import { toast } from '@/components/Toast';

const DELIVERY_SLOTS: { id: DeliverySlot; label: string; sub: string; icon: string }[] = [
  { id: 'asap',      label: 'ASAP',       sub: '30–45 min',    icon: '⚡' },
  { id: 'morning',   label: 'Morning',    sub: '8am – 12pm',   icon: '🌅' },
  { id: 'afternoon', label: 'Afternoon',  sub: '12pm – 5pm',   icon: '☀️' },
  { id: 'evening',   label: 'Evening',    sub: '5pm – 9pm',    icon: '🌙' },
];

// Deterministic recipe suggestions based on category

function StarRating({ value, onChange, size = 'md' }: { value: number; onChange?: (v: number) => void; size?: 'sm' | 'md' }) {
  const [hover, setHover] = useState(0);
  const sz = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i)}
          onMouseEnter={() => onChange && setHover(i)}
          onMouseLeave={() => onChange && setHover(0)}
          className={clsx(sz, 'transition-colors', onChange ? 'cursor-pointer' : 'cursor-default')}
          disabled={!onChange}
        >
          <Star className={clsx(
            'w-full h-full',
            (hover || value) >= i ? 'fill-brand text-brand' : 'text-gray-200 dark:text-gray-700'
          )} />
        </button>
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const {
    language, addToCart, updateQuantity, cart,
    isCartOpen, setCartOpen, toggleFavorite, favorites,
    addToRecentlyViewed, scheduledDelivery, setScheduledDelivery,
    user,
  } = useSimbaStore();
  const t = translations[language];

  const data = useMemo(() => getSimbaData(), []);
  const product = data.products.find(p => p.id === Number(id));
  const related = product ? getRelatedProducts(product, 6) : [];

  const cartItem = cart.find(item => item.id === product?.id);
  const quantity = cartItem?.quantity ?? 0;
  const isFav = product ? favorites.includes(product.id) : false;
  const { avg, count } = product ? getProductRating(product.id) : { avg: 0, count: 0 };
  const stockLeft = product ? getStockCount(product.id) : null;

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product.id);
      setReviews(getReviews(product.id));
    }
  }, [product?.id]);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 text-center px-4">
          <Package className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Product not found</h2>
          <button onClick={() => router.back()} className="text-brand font-bold hover:underline">{t.backToStore}</button>
        </div>
      </div>
    );
  }

  const points = Math.floor(product.price / 100);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 600));
    const review = addReview({
      productId: product.id,
      userId: user?.id ?? 'guest',
      userName: user?.name ?? 'Anonymous',
      rating: newRating,
      comment: newComment.trim(),
      verified: !!user,
    });
    setReviews(prev => [review, ...prev]);
    setNewComment('');
    setNewRating(5);
    setShowReviewForm(false);
    setSubmitting(false);
    toast.success('Review submitted! Thank you.');
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: product.name, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-5">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-5 overflow-x-auto whitespace-nowrap" style={{ scrollbarWidth: 'none' }}>
          <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-400 hover:text-brand transition-colors font-medium flex-shrink-0">
            <ChevronLeft className="w-4 h-4" /> {t.backToStore}
          </button>
          <span className="text-gray-300 dark:text-gray-700">/</span>
          <span className="text-gray-400 font-medium">{product.category}</span>
          <span className="text-gray-300 dark:text-gray-700">/</span>
          <span className="text-gray-700 dark:text-gray-300 font-bold truncate max-w-[180px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

          {/* ── Image ── */}
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }}
            className="relative aspect-square rounded-3xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
            <Image src={product.image} alt={product.name} fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 50vw" />

            {/* Low stock */}
            {stockLeft !== null && product.inStock && (
              <div className="absolute top-4 left-4 px-3 py-1.5 bg-red-500 text-white rounded-full text-xs font-black shadow-lg animate-pulse">
                🔥 Only {stockLeft} left!
              </div>
            )}

            {/* Fav + Share */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button onClick={() => toggleFavorite(product.id)}
                className="w-9 h-9 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                <Heart className={clsx('w-4 h-4', isFav ? 'fill-red-500 text-red-500' : 'text-gray-400')} />
              </button>
              <button onClick={handleShare}
                className="w-9 h-9 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                <Share2 className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {!product.inStock && (
              <div className="absolute inset-0 bg-white/70 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center">
                <span className="bg-gray-900 text-white px-5 py-2.5 rounded-full font-black uppercase tracking-widest text-sm">{t.outOfStock}</span>
              </div>
            )}
          </motion.div>

          {/* ── Info ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }} className="flex flex-col">

            {/* Category + stock */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="px-3 py-1 bg-brand/10 text-brand-dark dark:text-brand rounded-full text-xs font-black">{product.category}</span>
              <span className={clsx('px-3 py-1 rounded-full text-xs font-black',
                product.inStock ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600')}>
                {product.inStock ? t.inStock : t.outOfStock}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight mb-2">{product.name}</h1>
            <p className="text-sm text-gray-400 font-medium mb-3">{t.perUnit} {product.unit || 'unit'}</p>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <StarRating value={Math.round(avg)} size="sm" />
              <span className="text-sm font-black text-gray-900 dark:text-white">{avg}</span>
              <span className="text-sm text-gray-400">({count} {count === 1 ? 'review' : 'reviews'})</span>
              <button onClick={() => { setActiveTab('reviews'); document.getElementById('tabs')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="text-xs text-brand font-bold hover:underline ml-1">Write a review</button>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-black text-gray-900 dark:text-white">{product.price.toLocaleString()}</span>
              <span className="text-base font-bold text-gray-400 uppercase">RWF</span>
            </div>

            {/* Loyalty points */}
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-brand/10 rounded-xl mb-5 self-start">
              <Star className="w-4 h-4 text-brand" />
              <span className="text-xs font-black text-brand-dark dark:text-brand">{t.earnPoints} {points} {t.points}</span>
            </div>

            {/* Add to cart */}
            <div className="flex items-center gap-3 mb-5">
              {quantity === 0 ? (
                <button onClick={() => product.inStock && addToCart(product)} disabled={!product.inStock}
                  className="flex-1 py-4 bg-brand-dark hover:bg-gray-800 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5 stroke-[2.5px]" /> {t.addToCart}
                </button>
              ) : (
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center bg-brand-dark rounded-2xl overflow-hidden shadow-lg">
                    <button onClick={() => updateQuantity(product.id, quantity - 1)} className="w-12 h-12 flex items-center justify-center text-white hover:bg-black/10 transition-colors">
                      <Minus className="w-4 h-4 stroke-[3px]" />
                    </button>
                    <span className="text-white font-black text-lg w-8 text-center">{quantity}</span>
                    <button onClick={() => updateQuantity(product.id, quantity + 1)} className="w-12 h-12 flex items-center justify-center text-white hover:bg-black/10 transition-colors">
                      <Plus className="w-4 h-4 stroke-[3px]" />
                    </button>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Subtotal</p>
                    <p className="font-black text-gray-900 dark:text-white">{(product.price * quantity).toLocaleString()} RWF</p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Scheduled Delivery ── */}
            <div className="mb-5">
              <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Choose Delivery Time
              </p>
              <div className="grid grid-cols-4 gap-2">
                {DELIVERY_SLOTS.map(slot => (
                  <button key={slot.id} onClick={() => setScheduledDelivery(slot.id)}
                    className={clsx(
                      'flex flex-col items-center gap-0.5 py-2.5 px-1 rounded-xl border-2 text-center transition-all',
                      scheduledDelivery === slot.id
                        ? 'border-brand-dark bg-brand-dark/5 dark:bg-brand-dark/20'
                        : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                    )}>
                    <span className="text-base">{slot.icon}</span>
                    <span className={clsx('text-xs font-black', scheduledDelivery === slot.id ? 'text-brand-dark dark:text-brand' : 'text-gray-700 dark:text-gray-300')}>{slot.label}</span>
                    <span className="text-xs text-gray-400 font-medium">{slot.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 py-4 border-t border-gray-100 dark:border-gray-800">
              {[
                { icon: ShieldCheck, label: t.authentic },
                { icon: Truck,       label: t.fastDelivery },
                { icon: CheckCircle2,label: t.easyReturn },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                  <div className="w-9 h-9 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5 text-brand-dark dark:text-brand" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Tabs: Details / Reviews ── */}
        <div id="tabs" className="mb-8">
          <div className="flex border-b border-gray-100 dark:border-gray-800 mb-5">
            {(['details', 'reviews'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={clsx(
                  'px-5 py-3 text-sm font-black capitalize transition-colors border-b-2 -mb-px',
                  activeTab === tab
                    ? 'border-brand-dark text-brand-dark dark:text-brand dark:border-brand'
                    : 'border-transparent text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                )}>
                {tab === 'reviews' ? `Reviews (${reviews.length + count})` : tab}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'details' && (
              <motion.div key="details" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {product.name} is a high-quality product available at Simba Supermarket, sourced to meet the highest standards. Sold per {product.unit}. Order now for fast delivery across Kigali in 45 minutes.
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                    {[
                      { label: 'Category',  value: product.category },
                      { label: 'Unit',      value: product.unit },
                      { label: 'SKU',       value: `#${product.id}` },
                      { label: 'Status',    value: product.inStock ? 'In Stock' : 'Out of Stock' },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400">{label}</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div key="reviews" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">

                {/* Rating summary */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex items-center gap-6">
                  <div className="text-center flex-shrink-0">
                    <p className="text-5xl font-black text-gray-900 dark:text-white">{avg}</p>
                    <StarRating value={Math.round(avg)} size="sm" />
                    <p className="text-xs text-gray-400 mt-1">{count} reviews</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map(star => {
                      const pct = star >= Math.round(avg) ? Math.max(20, 100 - (5 - star) * 20) : Math.max(5, (star / 5) * 40);
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-400 w-3">{star}</span>
                          <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-brand rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Write review button */}
                {!showReviewForm && (
                  <button onClick={() => setShowReviewForm(true)}
                    className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-gray-500 hover:border-brand-dark hover:text-brand-dark dark:hover:text-brand transition-colors flex items-center justify-center gap-2">
                    <Star className="w-4 h-4" /> Write a Review
                  </button>
                )}

                {/* Review form */}
                <AnimatePresence>
                  {showReviewForm && (
                    <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleSubmitReview}
                      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4 overflow-hidden">
                      <h3 className="font-black text-gray-900 dark:text-white">Your Review</h3>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Rating</p>
                        <StarRating value={newRating} onChange={setNewRating} />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Comment</p>
                        <textarea value={newComment} onChange={e => setNewComment(e.target.value)}
                          placeholder="Share your experience with this product..."
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-brand-dark transition-colors text-gray-900 dark:text-white placeholder:text-gray-400 resize-none" />
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setShowReviewForm(false)}
                          className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          Cancel
                        </button>
                        <button type="submit" disabled={submitting || !newComment.trim()}
                          className="flex-1 py-2.5 rounded-xl bg-brand-dark text-white text-sm font-black hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                          {submitting ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> : <><Send className="w-4 h-4" /> Submit</>}
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Review list */}
                {reviews.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Star className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-medium">No reviews yet. Be the first!</p>
                  </div>
                ) : (
                  reviews.map(r => (
                    <div key={r.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-black text-sm text-gray-900 dark:text-white">{r.userName}</p>
                            {r.verified && (
                              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-black uppercase tracking-wide">Verified</span>
                            )}
                          </div>
                          <StarRating value={r.rating} size="sm" />
                        </div>
                        <p className="text-xs text-gray-400 font-medium">{r.date}</p>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{r.comment}</p>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">{t.relatedProducts}</h2>
              <button onClick={() => router.back()} className="flex items-center gap-1 text-sm font-bold text-brand-dark dark:text-brand hover:underline">
                {t.viewAll} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {related.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
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
