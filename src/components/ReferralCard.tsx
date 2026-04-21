'use client';

import { useSimbaStore } from '@/store/useSimbaStore';
import { Copy, Gift, Users } from 'lucide-react';
import { toast } from './Toast';
import { motion } from 'framer-motion';

export default function ReferralCard() {
  const { user } = useSimbaStore();
  if (!user?.referralCode) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(user.referralCode!);
    toast.success('Referral code copied!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-brand-dark to-gray-800 rounded-2xl p-5 text-white"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center flex-shrink-0">
          <Gift className="w-5 h-5 text-gray-900" />
        </div>
        <div>
          <p className="font-black text-sm">Refer a Friend</p>
          <p className="text-white/60 text-xs font-medium mt-0.5">
            Share your code — you both earn 50 loyalty points when they place their first order.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3">
        <span className="flex-1 font-black text-brand tracking-widest text-sm">{user.referralCode}</span>
        <button onClick={handleCopy} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
          <Copy className="w-4 h-4 text-white/70" />
        </button>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <Users className="w-3.5 h-3.5 text-white/40" />
        <p className="text-[10px] text-white/40 font-medium">0 friends referred so far</p>
      </div>
    </motion.div>
  );
}
