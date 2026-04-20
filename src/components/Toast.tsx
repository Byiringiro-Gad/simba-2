'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3500);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

// Convenience helpers
export const toast = {
  success: (msg: string) => useToastStore.getState().addToast(msg, 'success'),
  error: (msg: string) => useToastStore.getState().addToast(msg, 'error'),
  info: (msg: string) => useToastStore.getState().addToast(msg, 'info'),
};

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const colors = {
  success: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
  error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
  info: 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200',
};

const iconColors = {
  success: 'text-green-500',
  error: 'text-red-500',
  info: 'text-brand',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-20 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg max-w-sm ${colors[toast.type]}`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${iconColors[toast.type]}`} />
              <p className="text-sm font-bold flex-1">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex-shrink-0"
              >
                <X className="w-3.5 h-3.5 opacity-50" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

