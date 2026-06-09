'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Send, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { toast } from './Toast';

interface SiteReview {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

function StarRating({
  value,
  onChange,
  size = 'md',
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: 'sm' | 'md';
}) {
  const [hover, setHover] = useState(0);
  const sz = size === 'sm' ? 'w-4 h-4' : 'w-8 h-8';
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(s)}
          onMouseEnter={() => onChange && setHover(s)}
          onMouseLeave={() => onChange && setHover(0)}
          className={onChange ? 'transition transform hover:scale-110' : 'cursor-default'}
          disabled={!onChange}
        >
          <Star
            className={`${sz} ${
              s <= (hover || value)
                ? 'fill-brand text-brand'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function SiteReviewWidget() {
  const { user, language } = useSimbaStore();

  const [isOpen, setIsOpen] = useState(false);
  const [activeView, setActiveView] = useState<'form' | 'list'>('form');

  // Form state
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Reviews list
  const [reviews, setReviews] = useState<SiteReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Pre-fill name from logged-in user
  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user]);

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await fetch('/api/site-reviews');
      const data = await res.json();
      if (data.ok) setReviews(data.reviews ?? []);
    } catch {
      /* silent */
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeView === 'list') fetchReviews();
  }, [isOpen, activeView]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error(language === 'fr' ? 'Veuillez écrire un commentaire' : language === 'rw' ? 'Andika igitekerezo' : 'Please write a comment');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/site-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: name.trim() || 'Anonymous',
          rating,
          comment: comment.trim(),
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setSubmitted(true);
        toast.success(
          language === 'fr'
            ? 'Merci pour votre avis !'
            : language === 'rw'
            ? 'Murakoze ibitekerezo byanyu!'
            : 'Thank you for your review!'
        );
        setComment('');
        setRating(5);
        // Refresh reviews if on list view
        fetchReviews();
      } else {
        toast.error(data.error ?? 'Failed to submit');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  const displayedReviews = showAll ? reviews : reviews.slice(0, 4);

  const labelMap = {
    en: {
      trigger: 'Leave a Review',
      formTitle: 'Share Your Experience',
      formSub: 'Tell us what you think about Simba Online Supermarket',
      yourName: 'Your Name',
      namePlaceholder: 'e.g. Jean Pierre',
      yourRating: 'Your Rating',
      yourComment: 'Your Comment',
      commentPlaceholder: 'What did you like? Any suggestions?',
      submit: 'Submit Review',
      thankYou: 'Thank you!',
      thankYouSub: 'Your review helps others discover Simba.',
      anotherReview: 'Submit another review',
      viewAll: 'See All Reviews',
      writeReview: 'Write a Review',
      reviews: 'Customer Reviews',
      reviewCount: (n: number) => `${n} review${n !== 1 ? 's' : ''}`,
      noReviews: 'No reviews yet — be the first!',
      showMore: 'Show more',
      showLess: 'Show less',
    },
    fr: {
      trigger: 'Laisser un avis',
      formTitle: 'Partagez votre expérience',
      formSub: 'Dites-nous ce que vous pensez de Simba Online Supermarket',
      yourName: 'Votre Nom',
      namePlaceholder: 'ex. Jean Pierre',
      yourRating: 'Votre Note',
      yourComment: 'Votre Commentaire',
      commentPlaceholder: 'Qu\'avez-vous aimé ? Des suggestions ?',
      submit: 'Soumettre l\'avis',
      thankYou: 'Merci !',
      thankYouSub: 'Votre avis aide d\'autres personnes à découvrir Simba.',
      anotherReview: 'Soumettre un autre avis',
      viewAll: 'Voir tous les avis',
      writeReview: 'Écrire un avis',
      reviews: 'Avis clients',
      reviewCount: (n: number) => `${n} avis`,
      noReviews: 'Aucun avis pour l\'instant — soyez le premier !',
      showMore: 'Afficher plus',
      showLess: 'Afficher moins',
    },
    rw: {
      trigger: 'Tanga igitekerezo',
      formTitle: 'Sangira uburambe bwawe',
      formSub: 'Tubwire ibyo utekereza kuri Simba Online Supermarket',
      yourName: 'Izina ryawe',
      namePlaceholder: 'urugero: Jean Pierre',
      yourRating: 'Amanota yawe',
      yourComment: 'Igitekerezo cyawe',
      commentPlaceholder: 'Ni iki wakukunzwe? Ufite inama?',
      submit: 'Ohereza igitekerezo',
      thankYou: 'Murakoze!',
      thankYouSub: 'Ibitekerezo byanyu bifasha abandi kumenya Simba.',
      anotherReview: 'Ohereza ikindi gitekerezo',
      viewAll: 'Reba ibitekerezo byose',
      writeReview: 'Andika igitekerezo',
      reviews: 'Ibitekerezo by\'abakiriya',
      reviewCount: (n: number) => `ibitekerezo ${n}`,
      noReviews: 'Nta tekerezo rihari — ube wa mbere!',
      showMore: 'Erekana ibindi',
      showLess: 'Erekana bike',
    },
  };

  const lbl = labelMap[language as keyof typeof labelMap] ?? labelMap.en;

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, type: 'spring', stiffness: 260, damping: 20 }}
        onClick={() => { setIsOpen(true); setSubmitted(false); setActiveView('form'); }}
        className="fixed bottom-24 right-4 sm:bottom-8 sm:right-8 z-[55] flex items-center gap-2 px-4 py-3 bg-brand text-gray-900 rounded-2xl shadow-brand-lg font-black text-sm hover:bg-brand-dark hover:text-white transition-all"
        style={{ boxShadow: '0 8px 32px rgba(252,125,0,0.45)' }}
        aria-label={lbl.trigger}
      >
        <MessageSquare className="w-4 h-4 flex-shrink-0" />
        <span className="hidden sm:block">{lbl.trigger}</span>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="bg-white dark:bg-gray-900 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
                <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                  <button
                    onClick={() => setActiveView('form')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                      activeView === 'form'
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    {lbl.writeReview}
                  </button>
                  <button
                    onClick={() => setActiveView('list')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                      activeView === 'list'
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    {lbl.reviews}
                  </button>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto">

                {/* ── FORM VIEW ── */}
                {activeView === 'form' && (
                  <div className="p-6">
                    {submitted ? (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center text-center py-8 gap-4"
                      >
                        <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center">
                          <span className="text-3xl">🎉</span>
                        </div>
                        <div>
                          <h3 className="font-black text-xl text-gray-900 dark:text-white mb-1">
                            {lbl.thankYou}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{lbl.thankYouSub}</p>
                        </div>
                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => { setSubmitted(false); setComment(''); setRating(5); }}
                            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            {lbl.anotherReview}
                          </button>
                          <button
                            onClick={() => setActiveView('list')}
                            className="px-4 py-2 rounded-xl bg-brand text-gray-900 text-sm font-bold hover:bg-brand-dark hover:text-white transition-colors"
                          >
                            {lbl.viewAll}
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Title */}
                        <div>
                          <h2 className="font-black text-lg text-gray-900 dark:text-white">{lbl.formTitle}</h2>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{lbl.formSub}</p>
                        </div>

                        {/* Name */}
                        <div>
                          <label className="block text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-2">
                            {lbl.yourName}
                          </label>
                          <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder={lbl.namePlaceholder}
                            maxLength={100}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition"
                          />
                        </div>

                        {/* Rating */}
                        <div>
                          <label className="block text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">
                            {lbl.yourRating}
                          </label>
                          <StarRating value={rating} onChange={setRating} />
                          <p className="text-xs text-gray-400 mt-2 font-medium">
                            {rating === 1 ? '😞 Very poor' : rating === 2 ? '😐 Poor' : rating === 3 ? '🙂 Okay' : rating === 4 ? '😊 Good' : '🤩 Excellent!'}
                          </p>
                        </div>

                        {/* Comment */}
                        <div>
                          <label className="block text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-2">
                            {lbl.yourComment} <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder={lbl.commentPlaceholder}
                            required
                            maxLength={1000}
                            rows={4}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-none transition"
                          />
                          <p className="text-[11px] text-gray-400 mt-1 text-right">{comment.length}/1000</p>
                        </div>

                        {/* Submit */}
                        <button
                          type="submit"
                          disabled={submitting || !comment.trim()}
                          className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-brand text-gray-900 font-black rounded-xl hover:bg-brand-dark hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                        >
                          {submitting ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          {lbl.submit}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* ── REVIEWS LIST VIEW ── */}
                {activeView === 'list' && (
                  <div className="p-6">
                    {/* Summary */}
                    {reviews.length > 0 && (
                      <div className="flex items-center gap-4 mb-6 p-4 bg-brand/5 dark:bg-brand/10 rounded-2xl border border-brand/20">
                        <div className="text-center">
                          <p className="text-4xl font-black text-gray-900 dark:text-white leading-none">
                            {avgRating.toFixed(1)}
                          </p>
                          <StarRating value={Math.round(avgRating)} size="sm" />
                          <p className="text-[10px] text-gray-400 font-medium mt-1">
                            {lbl.reviewCount(reviews.length)}
                          </p>
                        </div>
                        <div className="flex-1 space-y-1.5">
                          {[5, 4, 3, 2, 1].map(star => {
                            const count = reviews.filter(r => r.rating === star).length;
                            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                            return (
                              <div key={star} className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-400 font-bold w-2">{star}</span>
                                <Star className="w-3 h-3 fill-brand text-brand flex-shrink-0" />
                                <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-brand rounded-full transition-all duration-500"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-gray-400 font-bold w-4 text-right">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Review cards */}
                    {loadingReviews ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
                        ))}
                      </div>
                    ) : reviews.length === 0 ? (
                      <div className="py-12 text-center">
                        <p className="text-4xl mb-3">💬</p>
                        <p className="text-gray-400 text-sm font-medium">{lbl.noReviews}</p>
                        <button
                          onClick={() => setActiveView('form')}
                          className="mt-4 px-4 py-2 bg-brand text-gray-900 rounded-xl text-sm font-black hover:bg-brand-dark hover:text-white transition-colors"
                        >
                          {lbl.writeReview}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {displayedReviews.map(review => (
                          <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl"
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center font-black text-gray-900 text-sm flex-shrink-0">
                                  {review.user_name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-black text-gray-900 dark:text-white leading-none">
                                    {review.user_name}
                                  </p>
                                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                    {formatDate(review.created_at)}
                                  </p>
                                </div>
                              </div>
                              <StarRating value={review.rating} size="sm" />
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                              {review.comment}
                            </p>
                          </motion.div>
                        ))}

                        {reviews.length > 4 && (
                          <button
                            onClick={() => setShowAll(v => !v)}
                            className="w-full flex items-center justify-center gap-1.5 py-2.5 text-sm font-black text-brand-dark dark:text-brand hover:underline"
                          >
                            {showAll ? (
                              <><ChevronUp className="w-4 h-4" />{lbl.showLess}</>
                            ) : (
                              <><ChevronDown className="w-4 h-4" />{lbl.showMore} ({reviews.length - 4})</>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
