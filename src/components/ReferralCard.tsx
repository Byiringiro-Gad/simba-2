'use client';

import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import { Copy, Gift, Users, TrendingUp } from 'lucide-react';
import { toast } from './Toast';
import { motion } from 'framer-motion';

// Generate a deterministic referral code from the user's ID
function generateReferralCode(userId: string): string {
  const clean = userId.replace(/-/g, '').toUpperCase();
  return 'SIMBA' + clean.slice(0, 6);
}

export default function ReferralCard() {
  const { user, language, orders } = useSimbaStore();
  const t = translations[language];

  if (!user) return null;

  // Use stored referral code if it exists, otherwise generate from user id
  const referralCode = user.referralCode ?? generateReferralCode(user.id);

  // Count how many orders used this code (proxy for referrals)
  const referralCount = 0; // Would be fetched from API in production

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode).catch(() => {
      // Fallback for environments without clipboard API
      const el = document.createElement('textarea');
      el.value = referralCode;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    });
    toast.success(t.referralCopied);
  };

  const shareText = language === 'fr'
    ? `Commandez chez Simba Supermarket avec mon code ${referralCode} et obtenez 50 points de fidélité offerts ! simbaonlineshopping.com`
    : language === 'rw'
    ? `Gura kuri Simba ukoresheje kode yanjye ${referralCode} maze ubone amanota 50 ubuntu! simbaonlineshopping.com`
    : `Shop at Simba Supermarket with my code ${referralCode} and get 50 free loyalty points! simbaonlineshopping.com`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'Simba Supermarket', text: shareText });
    } else {
      handleCopy();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-brand-dark via-gray-900 to-gray-800 rounded-2xl p-5 text-white overflow-hidden relative"
    >
      {/* Decorative */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-brand/10 rounded-full" />
      <div className="absolute -right-4 bottom-4 w-20 h-20 bg-brand/5 rounded-full" />

      <div className="relative">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center flex-shrink-0">
            <Gift className="w-5 h-5 text-gray-900" />
          </div>
          <div>
            <p className="font-black text-sm">{t.referAFriend}</p>
            <p className="text-white/60 text-xs font-medium mt-0.5 leading-snug">
              {t.referralDesc}
            </p>
          </div>
        </div>

        {/* Code box */}
        <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-3 mb-3">
          <span className="flex-1 font-black text-brand tracking-widest text-base">{referralCode}</span>
          <button onClick={handleCopy}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" title="Copy code">
            <Copy className="w-4 h-4 text-white/70" />
          </button>
        </div>

        {/* Share button */}
        <button onClick={handleShare}
          className="w-full py-2.5 bg-brand hover:bg-brand-dark text-gray-900 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mb-3">
          <TrendingUp className="w-3.5 h-3.5" />
          {language === 'fr' ? 'Partager mon code' : language === 'rw' ? 'Sangira kode yanjye' : 'Share My Code'}
        </button>

        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-white/40" />
          <p className="text-xs text-white/40 font-medium">
            {referralCount} {t.friendsReferred}
            {' · '}
            {language === 'fr' ? '+50 pts par parrainage' : language === 'rw' ? '+50 pts buri gutumira' : '+50 pts per referral'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
