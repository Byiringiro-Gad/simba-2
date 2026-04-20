'use client';

import { useState } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import { MapPin, Plus, X, Check, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AddressModal() {
  const { isAddressModalOpen, setAddressModalOpen, addresses, selectedAddressId, selectAddress, addAddress, language } = useSimbaStore();
  const t = translations[language];
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newFull, setNewFull] = useState('');

  const handleAdd = () => {
    if (!newLabel.trim() || !newFull.trim()) return;
    addAddress({ label: newLabel.trim(), full: newFull.trim() });
    setNewLabel('');
    setNewFull('');
    setAdding(false);
  };

  return (
    <AnimatePresence>
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setAddressModalOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-md bg-white dark:bg-gray-950 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-muted rounded-2xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <h2 className="font-black text-gray-900 dark:text-white text-base">{t.deliveryAddressTitle}</h2>
                  <p className="text-xs text-gray-400 font-medium">{t.deliveryAddressSub}</p>
                </div>
              </div>
              <button onClick={() => setAddressModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Address list */}
            <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
              {addresses.map(addr => (
                <button
                  key={addr.id}
                  onClick={() => selectAddress(addr.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                    selectedAddressId === addr.id
                      ? 'border-brand bg-brand-muted'
                      : 'border-gray-100 dark:border-gray-800 hover:border-brand/30'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    selectedAddressId === addr.id ? 'bg-brand' : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    <MapPin className={`w-5 h-5 ${selectedAddressId === addr.id ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-black text-sm ${selectedAddressId === addr.id ? 'text-brand' : 'text-gray-900 dark:text-white'}`}>
                      {addr.label}
                    </p>
                    <p className="text-xs text-gray-400 truncate font-medium">{addr.full}</p>
                  </div>
                  {selectedAddressId === addr.id && (
                    <div className="w-6 h-6 bg-brand rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Add new */}
            <div className="px-4 pb-4">
              <AnimatePresence mode="wait">
                {!adding ? (
                  <motion.button
                    key="add-btn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setAdding(true)}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-brand hover:bg-brand-muted transition-all text-gray-400 hover:text-brand"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-bold text-sm">{t.addNewAddress}</span>
                  </motion.button>
                ) : (
                  <motion.div
                    key="add-form"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl"
                  >
                    <input
                      type="text"
                      value={newLabel}
                      onChange={e => setNewLabel(e.target.value)}
                      placeholder={t.addressLabel}
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-bold outline-none focus:border-brand transition-colors text-gray-900 dark:text-white placeholder:text-gray-400 placeholder:font-normal"
                    />
                    <input
                      type="text"
                      value={newFull}
                      onChange={e => setNewFull(e.target.value)}
                      placeholder={t.addressFull}
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-bold outline-none focus:border-brand transition-colors text-gray-900 dark:text-white placeholder:text-gray-400 placeholder:font-normal"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => setAdding(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        {t.cancel}
                      </button>
                      <button onClick={handleAdd} className="flex-1 py-2.5 rounded-xl bg-brand text-white text-sm font-black hover:bg-brand-dark transition-colors">
                        {t.saveAddress}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Use current location */}
            <div className="px-4 pb-5">
              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-brand text-white font-black text-sm hover:bg-brand-dark transition-colors shadow-lg shadow-brand/20">
                <Navigation className="w-4 h-4" />
                {t.useCurrentLocation}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
