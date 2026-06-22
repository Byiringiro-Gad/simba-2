'use client';

import { useState } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle,
  CheckCircle2, ShieldCheck, Store, ShoppingBag, Globe, ChevronRight,
} from 'lucide-react';

type LoginStep = 'identify' | 'password' | 'success';

export default function UnifiedLoginPage() {
  const { login, language, setLanguage } = useSimbaStore();

  const [step, setStep] = useState<LoginStep>('identify');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detectedRole, setDetectedRole] = useState<string | null>(null);
  const [userName, setUserName] = useState('');

  const lang = language as 'en' | 'fr' | 'rw';

  const L = {
    title:       { en: 'Welcome to Simba', fr: 'Bienvenue chez Simba', rw: 'Murakaza neza kuri Simba' },
    sub:         { en: 'Sign in to your account', fr: 'Connectez-vous à votre compte', rw: 'Injira muri konti yawe' },
    identifier:  { en: 'Email or Username', fr: 'Email ou nom d\'utilisateur', rw: 'Imeyili cyangwa izina' },
    idPlaceholder:{ en: 'e.g. user@email.com or manager_remera', fr: 'ex. user@email.com ou manager_remera', rw: 'urugero: user@email.com cyangwa manager_remera' },
    continue:    { en: 'Continue', fr: 'Continuer', rw: 'Komeza' },
    password:    { en: 'Password', fr: 'Mot de passe', rw: 'Ijambobanga' },
    signIn:      { en: 'Sign In', fr: 'Se connecter', rw: 'Injira' },
    back:        { en: 'Back', fr: 'Retour', rw: 'Subira' },
    noAccount:   { en: 'No account?', fr: 'Pas de compte ?', rw: 'Nta konti?' },
    register:    { en: 'Create one', fr: 'Créez-en un', rw: 'Fungura' },
    forgot:      { en: 'Forgot password?', fr: 'Mot de passe oublié ?', rw: 'Wibagiwe ijambobanga?' },
    greeting:    { en: `Welcome back`, fr: `Bon retour`, rw: `Murakaza neza` },
    redirecting: { en: 'Redirecting you now...', fr: 'Redirection en cours...', rw: 'Turakunganira...' },
    roleCustomer:{ en: 'Customer account', fr: 'Compte client', rw: 'Konti y\'umukiriya' },
    roleAdmin:   { en: 'Admin account', fr: 'Compte administrateur', rw: 'Konti y\'umuyobozi' },
    roleManager: { en: 'Branch manager account', fr: 'Compte responsable d\'agence', rw: 'Konti y\'umuyobozi w\'ishami' },
    roleStaff:   { en: 'Branch staff account', fr: 'Compte personnel d\'agence', rw: 'Konti y\'umukozi w\'ishami' },
    or:          { en: 'or', fr: 'ou', rw: 'cyangwa' },
    google:      { en: 'Continue with Google', fr: 'Continuer avec Google', rw: 'Komeza na Google' },
  };

  const t = (k: keyof typeof L) => L[k][lang] ?? L[k].en;

  const roleLabel = (role: string | null) => {
    if (role === 'admin')    return t('roleAdmin');
    if (role === 'manager')  return t('roleManager');
    if (role === 'staff')    return t('roleStaff');
    return t('roleCustomer');
  };

  const roleIcon = (role: string | null) => {
    if (role === 'admin')   return <ShieldCheck className="w-5 h-5 text-red-500" />;
    if (role === 'manager') return <Store className="w-5 h-5 text-blue-500" />;
    if (role === 'staff')   return <Store className="w-5 h-5 text-green-500" />;
    return <ShoppingBag className="w-5 h-5 text-brand" />;
  };

  const roleColor = (role: string | null) => {
    if (role === 'admin')   return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    if (role === 'manager') return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    if (role === 'staff')   return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    return 'bg-brand-muted dark:bg-brand/10 border-brand/30';
  };

  const handleIdentify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) { setError('Please enter your email or username'); return; }
    setError('');
    setStep('password');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) { setError('Please enter your password'); return; }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/unified-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.error ?? 'Invalid credentials');
        setLoading(false);
        return;
      }

      setDetectedRole(data.role);
      setUserName(data.user?.name ?? data.staff?.name ?? identifier);
      setStep('success');

      // Handle each role's session setup
      if (data.role === 'customer' && data.token && data.user) {
        login(data.user, data.token);
      }
      if ((data.role === 'manager' || data.role === 'staff') && data.token && data.staff) {
        localStorage.setItem('branch_token', data.token);
        localStorage.setItem('branch_staff', JSON.stringify(data.staff));
      }
      // Admin: set admin_token in localStorage so the admin dashboard auth guard passes
      if (data.role === 'admin') {
        localStorage.setItem('admin_token', password);
      }

      // Redirect after brief success screen
      setTimeout(() => {
        window.location.href = data.redirect ?? '/';
      }, 1200);

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

        {/* Language switcher */}
        <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {(['en', 'fr', 'rw'] as const).map(l => (
            <button key={l} onClick={() => setLanguage(l)}
              className={`px-3 py-1.5 text-xs font-bold transition-colors ${lang === l ? 'bg-brand-dark text-white' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
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

          <AnimatePresence mode="wait">

            {/* ── STEP 1: Enter identifier ── */}
            {step === 'identify' && (
              <motion.div key="identify" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                <form onSubmit={handleIdentify} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                      {t('identifier')}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={identifier}
                        onChange={e => { setIdentifier(e.target.value); setError(''); }}
                        placeholder={t('idPlaceholder')}
                        autoComplete="username email"
                        autoFocus
                        className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 focus:border-brand dark:focus:border-brand text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 placeholder:font-normal outline-none transition-all"
                      />
                    </div>
                    {error && (
                      <p className="text-xs text-red-500 mt-2 flex items-center gap-1.5 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{error}
                      </p>
                    )}
                  </div>

                  <button type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-dark hover:bg-gray-800 text-white rounded-2xl font-black text-sm transition-all shadow-lg">
                    {t('continue')} <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* Google */}
                  <div className="flex items-center gap-3 my-1">
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                    <span className="text-xs text-gray-400">{t('or')}</span>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                  </div>
                  <a href="/api/auth/google"
                    className="w-full flex items-center justify-center gap-3 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <svg viewBox="0 0 24 24" className="w-5 h-5">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {t('google')}
                  </a>

                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {t('noAccount')}{' '}
                    <Link href="/register" className="font-black text-brand-dark dark:text-brand hover:underline">{t('register')}</Link>
                  </p>
                </form>
              </motion.div>
            )}

            {/* ── STEP 2: Enter password ── */}
            {step === 'password' && (
              <motion.div key="password" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                <form onSubmit={handleSignIn} className="space-y-4">
                  {/* Identity chip */}
                  <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                    <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 flex-1 truncate">{identifier}</span>
                    <button type="button" onClick={() => { setStep('identify'); setPassword(''); setError(''); }}
                      className="text-xs text-brand-dark dark:text-brand font-bold hover:underline flex-shrink-0">
                      {t('back')}
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                        {t('password')}
                      </label>
                      <Link href="/reset-password" className="text-xs text-brand-dark dark:text-brand font-bold hover:underline">
                        {t('forgot')}
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={e => { setPassword(e.target.value); setError(''); }}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        autoFocus
                        className="w-full pl-10 pr-12 py-3.5 rounded-2xl bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 focus:border-brand dark:focus:border-brand text-sm font-medium text-gray-900 dark:text-white outline-none transition-all"
                      />
                      <button type="button" onClick={() => setShowPass(p => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {error && (
                      <p className="text-xs text-red-500 mt-2 flex items-center gap-1.5 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{error}
                      </p>
                    )}
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-dark hover:bg-gray-800 text-white rounded-2xl font-black text-sm transition-all shadow-lg disabled:opacity-50">
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>{t('signIn')} <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── STEP 3: Success ── */}
            {step === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-5">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">
                    {t('greeting')}, {userName.split(' ')[0]}
                  </h2>
                  <div className={`inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${roleColor(detectedRole)}`}>
                    {roleIcon(detectedRole)}
                    {roleLabel(detectedRole)}
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                  <motion.div className="w-1.5 h-1.5 bg-brand rounded-full"
                    animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
                  {t('redirecting')}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Footer note */}
      <div className="text-center pb-6">
        <p className="text-xs text-gray-400">
          {lang === 'fr' ? 'Simba Supermarket · Kigali, Rwanda' : lang === 'rw' ? 'Simba Supermarket · Kigali, u Rwanda' : 'Simba Supermarket · Kigali, Rwanda'}
        </p>
      </div>
    </div>
  );
}
