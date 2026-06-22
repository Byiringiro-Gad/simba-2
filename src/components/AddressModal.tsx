'use client';

import { useState } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import { MapPin, Plus, X, Check, Navigation, Loader2, ChevronDown, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from './Toast';

// Kigali district zones with delivery fees (RWF)
const KIGALI_ZONES: { zone: string; districts: string[]; fee: number }[] = [
  {
    zone: 'Zone 1 — Central',
    districts: ['Kacyiru', 'Kimihurura', 'Remera', 'Nyamirambo', 'Muhima'],
    fee: 500,
  },
  {
    zone: 'Zone 2 — Inner Ring',
    districts: ['Kimironko', 'Gikondo', 'Kicukiro', 'Niboye', 'Kagarama'],
    fee: 1000,
  },
  {
    zone: 'Zone 3 — Outer Kigali',
    districts: ['Kanombe', 'Kinyinya', 'Kibagabaga', 'Ndera', 'Masaka', 'Nyanza'],
    fee: 1500,
  },
  {
    zone: 'Zone 4 — Greater Kigali',
    districts: ['Bugesera', 'Rwamagana', 'Musanze', 'Other'],
    fee: 2500,
  },
];

export function getDeliveryFeeForDistrict(district: string): number {
  for (const z of KIGALI_ZONES) {
    if (z.districts.some(d => d.toLowerCase() === district.toLowerCase())) return z.fee;
  }
  return KIGALI_ZONES[KIGALI_ZONES.length - 1].fee; // default outer zone
}

export default function AddressModal() {
  const { isAddressModalOpen, setAddressModalOpen, addresses, selectedAddressId, selectAddress, addAddress, removeAddress, language } = useSimbaStore();
  const t = translations[language];
  const lang = language as 'en' | 'fr' | 'rw';

  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newFull, setNewFull] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [zoneOpen, setZoneOpen] = useState(false);
  const [locating, setLocating] = useState(false);

  const selectedZone = KIGALI_ZONES.find(z =>
    z.districts.some(d => d.toLowerCase() === selectedDistrict.toLowerCase())
  );

  const handleAdd = () => {
    if (!newLabel.trim() || !newFull.trim()) {
      toast.error(lang === 'fr' ? 'Veuillez remplir tous les champs' : lang === 'rw' ? 'Uzuza ibibanza byose' : 'Please fill all fields');
      return;
    }
    const fee = selectedDistrict ? getDeliveryFeeForDistrict(selectedDistrict) : null;
    const fullAddr = selectedDistrict ? `${newFull.trim()}, ${selectedDistrict}` : newFull.trim();
    addAddress({
      label: newLabel.trim(),
      full: fee !== null ? `${fullAddr} (${fee.toLocaleString()} RWF delivery)` : fullAddr,
    });
    setNewLabel('');
    setNewFull('');
    setSelectedDistrict('');
    setAdding(false);
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const address = data.display_name ?? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          addAddress({ label: 'Current Location', full: address });
          toast.success('Location detected and saved!');
          setAddressModalOpen(false);
        } catch {
          toast.error('Could not get address. Please enter manually.');
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          toast.error('Location permission denied. Please allow access in your browser settings.');
        } else {
          toast.error('Could not detect location. Please enter manually.');
        }
      },
      { timeout: 10000 }
    );
  };

  return (
    <AnimatePresence>
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setAddressModalOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-md bg-white dark:bg-gray-950 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
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

            <div className="flex-1 overflow-y-auto">
              {/* Delivery zone info */}
              <div className="px-4 pt-4">
                <div className="bg-brand/5 dark:bg-brand/10 rounded-2xl p-3 mb-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                    {lang === 'fr' ? 'Zones de livraison Kigali' : lang === 'rw' ? 'Inzego zo Gutanga muri Kigali' : 'Kigali Delivery Zones'}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {KIGALI_ZONES.map(z => (
                      <div key={z.zone} className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-xl px-2.5 py-2">
                        <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300 truncate">{z.zone.split('—')[1].trim()}</p>
                        <span className="text-[10px] font-black text-brand-dark dark:text-brand flex-shrink-0 ml-1">{z.fee.toLocaleString()} RWF</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Saved addresses */}
              <div className="px-4 space-y-2">
                {addresses.map(addr => (
                  <button key={addr.id} onClick={() => selectAddress(addr.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                      selectedAddressId === addr.id ? 'border-brand bg-brand-muted' : 'border-gray-100 dark:border-gray-800 hover:border-brand/30'
                    }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${selectedAddressId === addr.id ? 'bg-brand' : 'bg-gray-100 dark:bg-gray-800'}`}>
                      <MapPin className={`w-5 h-5 ${selectedAddressId === addr.id ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-black text-sm ${selectedAddressId === addr.id ? 'text-brand' : 'text-gray-900 dark:text-white'}`}>{addr.label}</p>
                      <p className="text-xs text-gray-400 truncate font-medium">{addr.full}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {selectedAddressId === addr.id && (
                        <div className="w-6 h-6 bg-brand rounded-full flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                        </div>
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); removeAddress(addr.id); }}
                        className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        aria-label="Remove address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </button>
                ))}
              </div>

              {/* Add new form */}
              <div className="px-4 py-4">
                <AnimatePresence mode="wait">
                  {!adding ? (
                    <motion.button key="add-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => setAdding(true)}
                      className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-brand hover:bg-brand-muted transition-all text-gray-400 hover:text-brand">
                      <Plus className="w-5 h-5" />
                      <span className="font-bold text-sm">{t.addNewAddress}</span>
                    </motion.button>
                  ) : (
                    <motion.div key="add-form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                      className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">

                      {/* Label */}
                      <input type="text" value={newLabel} onChange={e => setNewLabel(e.target.value)}
                        placeholder={t.addressLabel}
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-bold outline-none focus:border-brand transition-colors text-gray-900 dark:text-white placeholder:text-gray-400 placeholder:font-normal" />

                      {/* Street / full address */}
                      <input type="text" value={newFull} onChange={e => setNewFull(e.target.value)}
                        placeholder={t.addressFull}
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-bold outline-none focus:border-brand transition-colors text-gray-900 dark:text-white placeholder:text-gray-400 placeholder:font-normal" />

                      {/* District / zone picker */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setZoneOpen(!zoneOpen)}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-bold outline-none focus:border-brand transition-colors text-left"
                        >
                          <span className={selectedDistrict ? 'text-gray-900 dark:text-white' : 'text-gray-400 font-normal'}>
                            {selectedDistrict
                              ? `${selectedDistrict}${selectedZone ? ` — ${selectedZone.fee.toLocaleString()} RWF` : ''}`
                              : (lang === 'fr' ? 'Choisir le quartier' : lang === 'rw' ? 'Hitamo akarere' : 'Select district (for delivery fee)')}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${zoneOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {zoneOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 4 }}
                              className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden max-h-64 overflow-y-auto"
                            >
                              {KIGALI_ZONES.map(zone => (
                                <div key={zone.zone}>
                                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{zone.zone} — {zone.fee.toLocaleString()} RWF</p>
                                  </div>
                                  {zone.districts.map(d => (
                                    <button
                                      key={d}
                                      onClick={() => { setSelectedDistrict(d); setZoneOpen(false); }}
                                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-bold text-left transition-colors hover:bg-brand/5 ${
                                        selectedDistrict === d ? 'text-brand bg-brand/5' : 'text-gray-700 dark:text-gray-300'
                                      }`}
                                    >
                                      <span>{d}</span>
                                      {selectedDistrict === d && <Check className="w-3.5 h-3.5 text-brand" />}
                                    </button>
                                  ))}
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Fee info */}
                      {selectedZone && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                          <MapPin className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                          <p className="text-xs font-bold text-green-700 dark:text-green-400">
                            {lang === 'fr' ? 'Frais de livraison' : lang === 'rw' ? 'Amafaranga yo gutanga' : 'Delivery fee'}:
                            {' '}{selectedZone.fee.toLocaleString()} RWF
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button onClick={() => setAdding(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">{t.cancel}</button>
                        <button onClick={handleAdd} className="flex-1 py-2.5 rounded-xl bg-brand text-white text-sm font-black hover:bg-brand-dark transition-colors">{t.saveAddress}</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Use current location */}
              <div className="px-4 pb-5">
                <button
                  onClick={handleUseLocation}
                  disabled={locating}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-brand-dark text-white font-black text-sm hover:bg-gray-800 disabled:opacity-60 transition-colors shadow-lg"
                >
                  {locating
                    ? <><Loader2 className="w-4 h-4 animate-spin" />{lang === 'fr' ? 'Détection...' : lang === 'rw' ? 'Gushakisha...' : 'Detecting location...'}</>
                    : <><Navigation className="w-4 h-4" /> {t.useCurrentLocation}</>
                  }
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
