'use client';

import { useEffect, useState } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { motion } from 'framer-motion';
import { Sun, Sunrise, Sunset, Moon, Star, Package } from 'lucide-react';

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

function getTimeOfDay(): TimeOfDay {
  const h = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Kigali' })).getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 20) return 'evening';
  return 'night';
}

export default function PersonalisedGreeting() {
  const { user, orders, language } = useSimbaStore();
  const [timeLabel, setTimeLabel] = useState<TimeOfDay>('morning');

  useEffect(() => {
    setTimeLabel(getTimeOfDay());
  }, []);

  if (!user) return null;

  const icons = {
    morning: Sunrise,
    afternoon: Sun,
    evening: Sunset,
    night: Moon,
  } as const;

  const accent = {
    morning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    afternoon: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300',
    evening: 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300',
    night: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300',
  } as const;

  const greeting = {
    morning: { en: 'Good morning', fr: 'Bonjour', rw: 'Muraho' },
    afternoon: { en: 'Good afternoon', fr: 'Bonne apres-midi', rw: 'Mwiriwe' },
    evening: { en: 'Good evening', fr: 'Bonsoir', rw: 'Ijoro ryiza' },
    night: { en: 'Good evening', fr: 'Bonne soiree', rw: 'Ijoro ryiza' },
  };

  const Icon = icons[timeLabel];
  const firstName = user.name.split(' ')[0];
  const processingOrders = orders.filter((o) => o.status === 'processing').length;
  const loyaltyPoints = user.loyaltyPoints ?? orders.reduce((a, o) => a + Math.floor(o.total / 100), 0);
  const greetingText = greeting[timeLabel][language] ?? greeting.morning.en;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${accent[timeLabel]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-black leading-tight text-gray-900 dark:text-white">
              {greetingText}, {firstName}
            </p>
            <p className="text-xs text-gray-400">
              {language === 'fr'
                ? `${loyaltyPoints} points fidelite`
                : language === 'rw'
                  ? `${loyaltyPoints} amanota`
                  : `${loyaltyPoints} loyalty points`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {processingOrders > 0 && (
            <div className="rounded-xl bg-gray-50 px-3 py-2 text-center dark:bg-gray-800">
              <div className="flex items-center justify-center gap-1">
                <Package className="h-3.5 w-3.5 text-brand-dark" />
                <span className="text-sm font-black text-gray-900 dark:text-white">{processingOrders}</span>
              </div>
              <p className="mt-0.5 text-[9px] font-medium uppercase tracking-wide text-gray-400">
                {language === 'fr' ? 'en cours' : language === 'rw' ? 'irimo' : 'active'}
              </p>
            </div>
          )}
          <div className="rounded-xl bg-gray-50 px-3 py-2 text-center dark:bg-gray-800">
            <div className="flex items-center justify-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-300 text-yellow-300" />
              <span className="text-sm font-black text-gray-900 dark:text-white">{loyaltyPoints}</span>
            </div>
            <p className="mt-0.5 text-[9px] font-medium uppercase tracking-wide text-gray-400">pts</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
