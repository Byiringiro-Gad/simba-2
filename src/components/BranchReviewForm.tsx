'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Send } from 'lucide-react';
import { toast } from './Toast';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';

interface BranchReviewFormProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  branchId: string;
  branchName: string;
}

export default function BranchReviewForm({
  isOpen,
  onClose,
  orderId,
  branchId,
  branchName,
}: BranchReviewFormProps) {
  const { user, language, submitBranchReview } = useSimbaStore();
  const t = translations[language];
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to leave a review');
      return;
    }

    setLoading(true);
    const success = await submitBranchReview({
      branchId,
      branchName,
      orderId,
      rating,
      comment: comment.trim() || undefined,
    });

    if (success) {
      toast(t.reviewSubmitted, 'success');
      setRating(5);
      setComment('');
      onClose();
    } else {
      toast.error('Failed to submit review');
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">
                {t.rateExperience}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Branch name */}
              <div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {branchName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Order #{orderId}
                </p>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                  {t.ratingLabel}
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? 'fill-brand text-brand'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  {t.commentLabel} ({t.optional})
                </label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder={t.commentPlaceholder}
                  maxLength={500}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {comment.length}/500
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 rounded-lg bg-brand text-gray-900 font-bold hover:bg-brand-light disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {t.submitReview}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
