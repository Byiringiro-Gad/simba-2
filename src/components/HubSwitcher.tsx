'use client';

import { useSimbaStore } from '@/store/useSimbaStore';
import { ShoppingBag, Utensils, Croissant } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const hubs = [
  { id: 'supermarket', label: 'Supermarket', icon: ShoppingBag, color: 'bg-simba-primary' },
  { id: 'bakery', label: 'Bakery', icon: Croissant, color: 'bg-amber-600' },
  { id: 'restaurant', label: 'Restaurant', icon: Utensils, color: 'bg-red-600' },
];

export default function HubSwitcher() {
  const { selectedHub, setSelectedHub } = useSimbaStore();

  return (
    <div className="flex justify-center gap-4 py-6 px-4">
      {hubs.map((hub) => {
        const Icon = hub.icon;
        const isActive = selectedHub === hub.id;

        return (
          <motion.button
            key={hub.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedHub(hub.id)}
            className={clsx(
              "flex flex-col items-center gap-2 px-6 py-4 rounded-3xl transition-all duration-300 border-2 shadow-lg",
              isActive 
                ? `${hub.color} text-white border-transparent scale-110 shadow-simba-primary/20`
                : "bg-white dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700 hover:border-simba-primary"
            )}
          >
            <div className={clsx(
              "p-3 rounded-2xl transition-colors",
              isActive ? "bg-white/20" : "bg-gray-50 dark:bg-gray-700"
            )}>
              <Icon className={clsx("w-6 h-6", isActive ? "text-white" : "text-gray-400")} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest">
              {hub.label}
            </span>
            {isActive && (
              <motion.div 
                layoutId="active-hub"
                className="w-1.5 h-1.5 bg-white rounded-full mt-1"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
