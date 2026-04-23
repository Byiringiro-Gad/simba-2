'use client';

import { useEffect } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { getBranchById, SIMBA_BRANCHES } from '@/lib/branches';
import { translations } from '@/lib/translations';
import { MapPin, Check, X, Store, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PickupBranchModal() {
  const {
    isPickupBranchModalOpen,
    setPickupBranchModalOpen,
    pickupBranchId,
    setPickupBranch,
    language,
    branchRatings,
    fetchBranchRatings,
  } = useSimbaStore();

  const t = translations[language];
  const selectedBranch = getBranchById(pickupBranchId);

  // Load branch ratings when modal opens
  useEffect(() => {
    if (isPickupBranchModalOpen) {
      fetchBranchRatings();
    }
  }, [isPickupBranchModalOpen]);

  return (
    <AnimatePresence>
      {isPickupBranchModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setPickupBranchModalOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-xl bg-white dark:bg-gray-950 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-muted rounded-2xl flex items-center justify-center">
                  <Store className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <h2 className="font-black text-gray-900 dark:text-white text-base">{t.chooseBranchTitle}</h2>
                  <p className="text-xs text-gray-400 font-medium">{t.chooseBranchSub}</p>
                </div>
              </div>
              <button onClick={() => setPickupBranchModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="px-6 py-4 bg-brand-muted/60 dark:bg-brand/10 border-b border-brand/10">
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">
                {t.selectedBranch}
              </p>
              <p className="text-sm font-black text-gray-900 dark:text-white">
                {selectedBranch?.name ?? t.selectABranch}
              </p>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
              {SIMBA_BRANCHES.map((branch) => {
                const isSelected = branch.id === pickupBranchId;
                const branchRating = branchRatings[branch.id];
                const avgRating = branchRating?.avgRating ?? null;
                const reviewCount = branchRating?.total ?? 0;

                return (
                  <button
                    key={branch.id}
                    onClick={() => setPickupBranch(branch.id)}
                    className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-brand bg-brand-muted'
                        : 'border-gray-100 dark:border-gray-800 hover:border-brand/30'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-brand' : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      <MapPin className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className={`font-black text-sm ${isSelected ? 'text-brand-dark' : 'text-gray-900 dark:text-white'}`}>
                          {branch.name}
                        </p>
                        {avgRating ? (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 rounded-full">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span className="text-xs font-black text-amber-700 dark:text-amber-400">{avgRating}</span>
                            <span className="text-[10px] text-gray-400">({reviewCount})</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-400">No reviews yet</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{branch.area}</p>
                      <p className="text-xs text-gray-400 mt-1">{branch.pickupNote}</p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 bg-brand rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
