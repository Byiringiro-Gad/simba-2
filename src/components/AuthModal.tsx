'use client';

import { useState } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Mail, Lock, User, Phone, Eye, EyeOff,
  CheckCircle2, ArrowRight, ShoppingBag, AlertCircle, Gift
} from 'lucide-react';
import { toast } from './Toast';
import { authApi } from '@/lib/api';
import { translations } from '@/lib/translations';

type Mode = 'login' | 'register' | 'forgot';

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validatePassword(password: string) {
  return password.length >= 6;
}

function validatePhone(phone: string) {
  return /^(\+?250)?[0-9]{9}$/.test(phone.replace(/\s/g, ''));
}

export default function AuthModal() {
  const { isAuthOpen, setAuthOpen, login, language } = useSimbaStore();
  const t = translations[language];
  const [mode, setMode] = useState<Mode>('login');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [resetLink, setResetLink] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [referralInput, setReferralInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const reset = () => {
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setConfirm('');
    setReferralInput('');
    setErrors({});
    setShowPass(false);
    setShowConfirm(false);
    setForgotSent(false);
    setResetLink('');
    setLoading(false);
  };

  const switchMode = (nextMode: Mode) => {
    reset();
    setMode(nextMode);
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!validateEmail(email)) nextErrors.email = t.emailAddress + ' — ' + t.emailPlaceholder;

    if (mode !== 'forgot' && !validatePassword(password)) {
      nextErrors.password = t.minChars;
    }

    if (mode === 'register') {
      if (!name.trim()) nextErrors.name = t.fullNameLabel + ' ' + t.optional.replace('(', '').replace(')', '') + ' required';
      if (phone && !validatePhone(phone)) nextErrors.phone = t.phonePlaceholder;
      if (password !== confirm) nextErrors.confirm = t.confirmPassword;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      if (mode === 'login') {
        const res = await authApi.login({
          email: email.trim(),
          password,
        });

        if (!res.ok || !res.token || !res.user) {
          setErrors({ email: res.error ?? 'Could not sign in' });
          setLoading(false);
          return;
        }

        login(res.user, res.token);
        toast.success(`Welcome back, ${res.user.name}!`);
        reset();
      } else if (mode === 'register') {
        const res = await authApi.register({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          password,
          referralCode: referralInput.trim() || undefined,
        });

        if (!res.ok) {
          setErrors({ email: res.error ?? 'Could not create account' });
          setLoading(false);
          return;
        }

        toast.success(res.message ?? 'Account created. Please sign in.');
        const emailValue = email.trim();
        reset();
        setMode('login');
        setEmail(emailValue);
      } else {
        const res = await authApi.forgotPassword({ email: email.trim() });

        if (!res.ok) {
          setErrors({ email: res.error ?? 'Could not prepare reset link' });
          setLoading(false);
          return;
        }

        setForgotSent(true);
        setResetLink(res.resetLink ?? '');
        toast.success(res.message ?? 'Reset link sent. Check your inbox.');
      }
    } catch {
      setErrors({ email: 'Could not reach the authentication service' });
    } finally {
      setLoading(false);
    }
  };

  const inputBase = 'w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 placeholder:font-normal outline-none transition-all';
  const inputClass = (field: string) =>
    `${inputBase} ${errors[field] ? 'border-red-400 focus:border-red-500' : 'border-gray-200 dark:border-gray-700 focus:border-brand'}`;

  const strengthLevel = password.length === 0 ? 0 : password.length < 4 ? 1 : password.length < 6 ? 2 : password.length < 10 ? 3 : 4;
  const strengthLabel = [
    '',
    t.passwordWeak,
    t.passwordFair,
    t.passwordGood,
    t.passwordStrong,
  ][strengthLevel];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-green-500'][strengthLevel];

  return (
    <AnimatePresence>
      {isAuthOpen && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => { setAuthOpen(false); reset(); }}
          />

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-md bg-white dark:bg-gray-950 rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto"
          >
            <div className="h-1.5 bg-gradient-to-r from-brand-dark via-brand to-brand-dark sticky top-0 z-10" />

            <div className="px-6 pt-5 pb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-dark rounded-2xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <h2 className="font-black text-gray-900 dark:text-white text-lg leading-tight">
                    {mode === 'login' ? t.welcomeBack : mode === 'register' ? t.createAccount : t.resetPassword}
                  </h2>
                  <p className="text-xs text-gray-400 font-medium">
                    {mode === 'login'
                      ? t.signInToAccount
                      : mode === 'register'
                        ? t.createRealAccount
                        : t.enterEmailForReset}
                  </p>
                </div>
              </div>
              <button onClick={() => { setAuthOpen(false); reset(); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {mode === 'forgot' && forgotSent ? (
              <div className="px-6 pb-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="font-black text-gray-900 dark:text-white mb-2">{t.resetLinkReady}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {t.resetLinkSentTo} <span className="font-bold text-gray-800 dark:text-gray-200">{email}</span>.
                </p>
                {resetLink && (
                  <div className="w-full mb-5 p-3 rounded-2xl bg-brand-muted border border-brand/20 text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{t.demoResetLink}</p>
                    <a href={resetLink} className="text-xs font-bold text-brand-dark break-all hover:underline">
                      {resetLink}
                    </a>
                  </div>
                )}
                <button onClick={() => switchMode('login')} className="w-full py-3.5 bg-brand-dark text-white rounded-2xl font-black text-sm hover:bg-brand hover:text-gray-900 transition-colors">
                  {t.backToSignIn}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
                <AnimatePresence>
                  {mode === 'register' && (
                    <motion.div key="name-field" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">{t.fullNameLabel} *</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t.namePlaceholderFull} className={`${inputClass('name')} pl-10`} />
                      </div>
                      {errors.name && <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">{t.emailAddress} *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.emailPlaceholder} className={`${inputClass('email')} pl-10`} autoComplete="email" />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
                </div>

                <AnimatePresence>
                  {mode === 'register' && (
                    <motion.div key="phone-field" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">
                        {t.phoneOptional} <span className="text-gray-400 font-normal normal-case tracking-normal">{t.optional}</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t.phonePlaceholder} className={`${inputClass('phone')} pl-10`} />
                      </div>
                      {errors.phone && <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.phone}</p>}
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {mode === 'register' && (
                    <motion.div key="referral-field" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">
                        {t.referralCode} <span className="text-gray-400 font-normal normal-case tracking-normal">{t.optional}</span>
                      </label>
                      <div className="relative">
                        <Gift className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" value={referralInput} onChange={(e) => setReferralInput(e.target.value.toUpperCase())} placeholder={t.referralPlaceholder} className={`${inputBase} border-gray-200 dark:border-gray-700 focus:border-brand pl-10 uppercase`} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {mode !== 'forgot' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">{t.passwordLabel} *</label>
                      {mode === 'login' && (
                        <button type="button" onClick={() => switchMode('forgot')} className="text-xs font-bold text-brand-dark dark:text-brand hover:underline">
                          {t.forgotPassword}
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={mode === 'register' ? t.minChars : t.enterYourPassword}
                        className={`${inputClass('password')} pl-10 pr-10`}
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.password}</p>}

                    {mode === 'register' && password.length > 0 && (
                      <div className="mt-2 flex items-center gap-1.5">
                        {[1, 2, 3, 4].map((index) => (
                          <div key={index} className={`h-1 flex-1 rounded-full transition-colors ${index <= strengthLevel ? strengthColor : 'bg-gray-200 dark:bg-gray-700'}`} />
                        ))}
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold ml-1 w-10">{strengthLabel}</span>
                      </div>
                    )}
                  </div>
                )}

                <AnimatePresence>
                  {mode === 'register' && (
                    <motion.div key="confirm-field" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">{t.confirmPassword} *</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type={showConfirm ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder={t.repeatPassword} className={`${inputClass('confirm')} pl-10 pr-10`} autoComplete="new-password" />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                          {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.confirm && <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.confirm}</p>}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button type="submit" disabled={loading} className="w-full py-3.5 bg-brand-dark hover:bg-gray-800 text-white rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  ) : (
                    <>
                          {mode === 'login' ? t.signIn : mode === 'register' ? t.createAccountBtn : t.sendResetLink}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Google sign-in */}
                {mode !== 'forgot' && (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
                      <span className="text-xs text-gray-400 font-medium">or</span>
                      <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
                    </div>
                    <a
                      href="/api/auth/google"
                      className="w-full flex items-center justify-center gap-3 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-bold text-gray-700 dark:text-gray-300"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      {t.continueWithGoogle}
                    </a>
                  </>
                )}

                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  {mode === 'login' ? (
                    <>{t.noAccount}{' '}
                      <button type="button" onClick={() => switchMode('register')} className="font-black text-brand-dark dark:text-brand hover:underline">{t.signUp}</button>
                    </>
                  ) : mode === 'register' ? (
                    <>{t.alreadyHaveAccount}{' '}
                      <button type="button" onClick={() => switchMode('login')} className="font-black text-brand-dark dark:text-brand hover:underline">{t.signIn}</button>
                    </>
                  ) : (
                    <>{t.rememberPassword}{' '}
                      <button type="button" onClick={() => switchMode('login')} className="font-black text-brand-dark dark:text-brand hover:underline">{t.signIn}</button>
                    </>
                  )}
                </p>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

