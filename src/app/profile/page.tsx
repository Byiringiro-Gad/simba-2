'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Plus, Trash2, Check,
  ArrowLeft, Save, LogOut, Edit3, ChevronDown,
} from 'lucide-react';
import { toast } from '@/components/Toast';
import { clsx } from 'clsx';

const KIGALI_ZONES = [
  { zone: 'Central', districts: ['Kacyiru', 'Kimihurura', 'Remera', 'Nyamirambo', 'Muhima'], fee: 500 },
  { zone: 'Inner Ring', districts: ['Kimironko', 'Gikondo', 'Kicukiro', 'Niboye', 'Kagarama'], fee: 1000 },
  { zone: 'Outer Kigali', districts: ['Kanombe', 'Kinyinya', 'Kibagabaga', 'Ndera', 'Masaka', 'Nyanza'], fee: 1500 },
  { zone: 'Greater Kigali', districts: ['Bugesera', 'Rwamagana', 'Musanze', 'Other'], fee: 2500 },
];

export default function ProfilePage() {
  const router = useRouter();
  const {
    user, setUser, logout, language,
    addresses, selectedAddressId, selectAddress, addAddress,
  } = useSimbaStore();
  const t = translations[language];

  const [editingName, setEditingName] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [addingAddress, setAddingAddress] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newFull, setNewFull] = useState('');
  const [newDistrict, setNewDistrict] = useState('');
  const [zoneOpen, setZoneOpen] = useState(false);

  if (!user) {
    router.push('/');
    return null;
  }

  const lang = language as 'en' | 'fr' | 'rw';

  const saveName = () => {
    if (name.trim().length < 2) { toast.error('Name must be at least 2 characters'); return; }
    setUser({ ...user, name: name.trim() });
    setEditingName(false);
    toast.success(lang === 'fr' ? 'Nom mis à jour' : lang === 'rw' ? 'Izina ryavugururiwe' : 'Name updated');
  };

  const savePhone = () => {
    if (phone && !/^(?:\+?250)?7[2389]\d{7}$/.test(phone.replace(/\s/g, ''))) {
      toast.error(lang === 'fr' ? 'Numéro invalide (ex: 078 XXX XXX)' : lang === 'rw' ? 'Nimero si yo (urugero: 078 XXX XXX)' : 'Invalid number (e.g. 078 XXX XXX)');
      return;
    }
    setUser({ ...user, phone: phone.trim() || undefined });
    setEditingPhone(false);
    toast.success(lang === 'fr' ? 'Téléphone mis à jour' : lang === 'rw' ? 'Terefone yavugururiwe' : 'Phone updated');
  };

  const handleAddAddress = () => {
    if (!newLabel.trim() || !newFull.trim()) {
      toast.error(lang === 'fr' ? 'Remplissez tous les champs' : lang === 'rw' ? 'Uzuza ibibanza byose' : 'Fill in all fields');
      return;
    }
    const zone = KIGALI_ZONES.find(z => z.districts.some(d => d.toLowerCase() === newDistrict.toLowerCase()));
    const fullAddr = newDistrict ? `${newFull.trim()}, ${newDistrict}${zone ? ` (${zone.fee.toLocaleString()} RWF delivery)` : ''}` : newFull.trim();
    addAddress({ label: newLabel.trim(), full: fullAddr });
    setNewLabel(''); setNewFull(''); setNewDistrict(''); setAddingAddress(false);
    toast.success(lang === 'fr' ? 'Adresse ajoutée' : lang === 'rw' ? 'Aderesi yongeweho' : 'Address added');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">

        {/* Back */}
        <button onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {lang === 'fr' ? 'Retour' : lang === 'rw' ? 'Subira' : 'Back'}
        </button>

        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-6">
          {lang === 'fr' ? 'Mon Profil' : lang === 'rw' ? 'Umwirondoro Wanjye' : 'My Profile'}
        </h1>

        {/* Avatar */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-brand-dark rounded-3xl px-6 py-8 flex items-center gap-5 mb-6">
          <div className="w-20 h-20 bg-brand rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <span className="font-black text-4xl text-gray-900">{user.name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="font-black text-xl text-white leading-tight">{user.name}</p>
            <p className="text-white/60 text-sm">{user.email}</p>
            {user.phone && <p className="text-white/40 text-sm mt-0.5">{user.phone}</p>}
          </div>
        </motion.div>

        {/* Personal info */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-4">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">
              {lang === 'fr' ? 'Informations personnelles' : lang === 'rw' ? 'Amakuru Yihariye' : 'Personal Information'}
            </p>
          </div>

          {/* Name */}
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-black uppercase tracking-widest text-gray-400">{t.fullNameLabel}</span>
              </div>
              <button onClick={() => { setEditingName(!editingName); setName(user.name); }}
                className="p-1.5 text-gray-400 hover:text-brand transition-colors">
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
            {editingName ? (
              <div className="flex gap-2 mt-2">
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-brand outline-none text-sm font-bold text-gray-900 dark:text-white"
                  autoFocus onKeyDown={e => e.key === 'Enter' && saveName()} />
                <button onClick={saveName} className="px-4 py-2.5 bg-brand-dark text-white rounded-xl text-sm font-black hover:bg-brand transition-colors">
                  <Save className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{user.name}</p>
            )}
          </div>

          {/* Email (read-only) */}
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">{t.emailAddress}</span>
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{user.email}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {lang === 'fr' ? 'Non modifiable' : lang === 'rw' ? 'Ntibishobora guhindurwa' : 'Cannot be changed'}
            </p>
          </div>

          {/* Phone */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-black uppercase tracking-widest text-gray-400">{t.phoneOptional}</span>
              </div>
              <button onClick={() => { setEditingPhone(!editingPhone); setPhone(user.phone ?? ''); }}
                className="p-1.5 text-gray-400 hover:text-brand transition-colors">
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
            {editingPhone ? (
              <div className="flex gap-2 mt-2">
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+250 78X XXX XXX"
                  className="flex-1 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-brand outline-none text-sm font-bold text-gray-900 dark:text-white"
                  autoFocus onKeyDown={e => e.key === 'Enter' && savePhone()} />
                <button onClick={savePhone} className="px-4 py-2.5 bg-brand-dark text-white rounded-xl text-sm font-black hover:bg-brand transition-colors">
                  <Save className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                {user.phone ?? <span className="text-gray-400 font-normal">{t.optional}</span>}
              </p>
            )}
          </div>
        </motion.div>

        {/* Saved addresses */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-4">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">
              {t.deliveryAddresses} ({addresses.length})
            </p>
            <button onClick={() => setAddingAddress(true)}
              className="flex items-center gap-1 text-xs font-black text-brand hover:text-brand-dark transition-colors">
              <Plus className="w-3.5 h-3.5" />
              {lang === 'fr' ? 'Ajouter' : lang === 'rw' ? 'Ongeraho' : 'Add'}
            </button>
          </div>

          {addresses.length === 0 && !addingAddress ? (
            <div className="px-5 py-8 text-center">
              <MapPin className="w-8 h-8 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
              <p className="text-sm text-gray-400">
                {lang === 'fr' ? 'Aucune adresse enregistrée' : lang === 'rw' ? 'Nta deresi yabitswe' : 'No saved addresses'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {addresses.map(addr => (
                <div key={addr.id}
                  className={clsx('flex items-center gap-4 px-5 py-4', selectedAddressId === addr.id && 'bg-brand/5')}>
                  <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                    selectedAddressId === addr.id ? 'bg-brand' : 'bg-gray-100 dark:bg-gray-800')}>
                    <MapPin className={clsx('w-5 h-5', selectedAddressId === addr.id ? 'text-white' : 'text-gray-400')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-gray-900 dark:text-white">{addr.label}</p>
                    <p className="text-xs text-gray-400 truncate">{addr.full}</p>
                  </div>
                  <button onClick={() => selectAddress(addr.id)}
                    className={clsx('w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                      selectedAddressId === addr.id ? 'bg-brand border-brand' : 'border-gray-300 dark:border-gray-600 hover:border-brand')}>
                    {selectedAddressId === addr.id && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add address form */}
          {addingAddress && (
            <div className="px-5 py-4 bg-gray-50 dark:bg-gray-900/50 space-y-3 border-t border-gray-100 dark:border-gray-800">
              <input type="text" value={newLabel} onChange={e => setNewLabel(e.target.value)}
                placeholder={lang === 'fr' ? 'Étiquette (ex: Domicile)' : lang === 'rw' ? 'Izina (urugero: Inzu)' : 'Label (e.g. Home)'}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-bold outline-none focus:border-brand transition-colors text-gray-900 dark:text-white placeholder:text-gray-400 placeholder:font-normal" />
              <input type="text" value={newFull} onChange={e => setNewFull(e.target.value)}
                placeholder={lang === 'fr' ? 'Adresse complète' : lang === 'rw' ? 'Aderesi yuzuye' : 'Full address'}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-bold outline-none focus:border-brand transition-colors text-gray-900 dark:text-white placeholder:text-gray-400 placeholder:font-normal" />

              {/* District picker */}
              <div className="relative">
                <button type="button" onClick={() => setZoneOpen(!zoneOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-left">
                  <span className={newDistrict ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-400 font-normal'}>
                    {newDistrict || (lang === 'fr' ? 'Quartier (pour les frais)' : lang === 'rw' ? 'Akarere (ku mafaranga)' : 'District (for delivery fee)')}
                  </span>
                  <ChevronDown className={clsx('w-4 h-4 text-gray-400 transition-transform', zoneOpen && 'rotate-180')} />
                </button>
                {zoneOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 max-h-48 overflow-y-auto">
                    {KIGALI_ZONES.map(zone => (
                      <div key={zone.zone}>
                        <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900">
                          <p className="text-[10px] font-black uppercase text-gray-400">{zone.zone} — {zone.fee.toLocaleString()} RWF</p>
                        </div>
                        {zone.districts.map(d => (
                          <button key={d} onClick={() => { setNewDistrict(d); setZoneOpen(false); }}
                            className={clsx('w-full text-left px-4 py-2 text-sm font-bold transition-colors hover:bg-brand/5',
                              newDistrict === d ? 'text-brand bg-brand/5' : 'text-gray-700 dark:text-gray-300')}>
                            {d}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={() => { setAddingAddress(false); setNewLabel(''); setNewFull(''); setNewDistrict(''); }}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  {t.cancel}
                </button>
                <button onClick={handleAddAddress}
                  className="flex-1 py-2.5 rounded-xl bg-brand-dark text-white text-sm font-black hover:bg-gray-800 transition-colors">
                  {t.saveAddress}
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Sign out */}
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          onClick={() => { logout(); router.push('/'); }}
          className="w-full py-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
          <LogOut className="w-4 h-4" />
          {t.signOut}
        </motion.button>
      </div>
    </div>
  );
}
