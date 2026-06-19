'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSimbaStore } from '@/store/useSimbaStore';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, Gift } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { language } = useSimbaStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const lang = language as 'en' | 'fr' | 'rw';

  const L = {
    title:       { en: 'Create Account', fr: 'Créer un compte', rw: 'Fungura konti' },
    sub:         { en: 'Join Simba Supermarket', fr: 'Rejoignez Simba Supermarket', rw: 'Injira muri Simba Supermarket' },
    name:        { en: 'Full Name', fr: 'Nom complet', rw: 'Amazina yose' },
    email:       { en: 'Email Address', fr: 'Adresse email', rw: 'Imeyili' },
    phone:       { en: 'Phone Number (optional)', fr: 'Numéro de téléphone (optionnel)', rw: 'Telephone (si ngombwa)' },
    password:    { en: 'Password', fr: 'Mot de passe', rw: 'Ijambobanga' },
    referral:    { en: 'Referral Code (optional)', fr: 'Code de parrainage (optionnel)', rw: 'Code yo kwinjiza (si ngombwa)' },
    register:    { en: 'Create Account', fr: 'Créer le compte', rw: 'Fungura konti' },
    hasAccount:  { en: 'Already have an account?', fr: 'Déjà un compte ?', rw: 'Usanze ufite konti?' },
    signIn:      { en: 'Sign In', fr: 'Se connecter', rw: 'Injira' },
    successMsg:  { en: 'Account created! Redirecting to sign in...', fr: 'Compte créé ! Redirection vers la connexion...', rw: 'Konti ifunguwe! Turakunganira...' },
  };

  const t = (k: keyof typeof L) => L[k][lang] ?? L[k].en;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError('Name, email and password are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || undefined,
          password,
          referralCode: referralCode.trim().toUpperCase() || undefined,
        }),
      });
      const data = await res.json();

      if (!data.ok) {
        setError(data.error ?? 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push('/login'), 1500);
    } catch {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-brand-dark flex items-center justify-center overflow-hidden">
            <Image src="/simba-icon.png" alt="Simba" width={28} height={28} className="object-contain" />
          </div>
          <span className="font-black text-gray-900 dark:text-white text-sm">Simba Supermarket</span>
        </Link>
        <Link href="/login" className="text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
          {t('signIn')}
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">

          {/* Logo + title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-dark rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl overflow-hidden">
              <Image src="/simba-icon.png" alt="Simba" width={48} height={48} className="object-contain" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">{t('title')}</h1>
            <p className="text-sm text-gray-400 mt-1">{t('sub')}</p>
          </div>

          {success ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{t('successMsg')}</p>
            </motion.div>
          ) : (
            <motion.form initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit} className="space-y-4">

              {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                  {t('name')} *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={name} onChange={e => { setName(e.target.value); setError(''); }}
                    placeholder="Jean Pierre Habimana" required autoComplete="name"
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 focus:border-brand dark:focus:border-brand text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 placeholder:font-normal outline-none transition-all" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                  {t('email')} *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="you@example.com" required autoComplete="email"
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 focus:border-brand dark:focus:border-brand text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 placeholder:font-normal outline-none transition-all" />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                  {t('phone')}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="+250 788 000 000" autoComplete="tel"
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 focus:border-brand dark:focus:border-brand text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 placeholder:font-normal outline-none transition-all" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                  {t('password')} *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showPass ? 'text' : 'password'} value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="Min. 6 characters" required autoComplete="new-password" minLength={6}
                    className="w-full pl-10 pr-12 py-3.5 rounded-2xl bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 focus:border-brand dark:focus:border-brand text-sm font-medium text-gray-900 dark:text-white outline-none transition-all" />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Referral code */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                  {t('referral')}
                </label>
                <div className="relative">
                  <Gift className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={referralCode} onChange={e => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="SIMBAXXXXX" autoComplete="off" maxLength={12}
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 focus:border-brand dark:focus:border-brand text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 placeholder:font-normal outline-none transition-all uppercase" />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-dark hover:bg-gray-800 text-white rounded-2xl font-black text-sm transition-all shadow-lg disabled:opacity-50">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>{t('register')} <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                {t('hasAccount')}{' '}
                <Link href="/login" className="font-black text-brand-dark dark:text-brand hover:underline">
                  {t('signIn')}
                </Link>
              </p>
            </motion.form>
          )}
        </div>
      </div>

      <div className="text-center pb-6">
        <p className="text-xs text-gray-400">Simba Supermarket · Kigali, Rwanda</p>
      </div>
    </div>
  );
}
