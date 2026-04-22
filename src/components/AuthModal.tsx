'use client';

import { useState } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Mail, Lock, User, Phone, Eye, EyeOff,
  CheckCircle2, ArrowRight, ShoppingBag, AlertCircle, Gift
} from 'lucide-react';
import { toast } from './Toast';

type Mode = 'login' | 'register' | 'forgot';

// ── In-memory user store (persists for the session) ───────────────────────────
// Simulates a real backend. Users who register can log back in with their password.
// In production: replace with NextAuth / Supabase / your own API.
const registeredUsers = new Map<string, { name: string; phone?: string; passwordHash: string }>();

// Seed one demo account
registeredUsers.set('demo@simba.rw', {
  name: 'Demo User',
  phone: '+250788000000',
  passwordHash: simpleHash('simba123'),
});

function simpleHash(s: string): string {
  // Deterministic hash — NOT cryptographically secure, demo only
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h.toString(36) + '_simba';
}

function validateEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
}
function validatePassword(p: string) {
  return p.length >= 6;
}
function validatePhone(p: string) {
  return /^(\+?250)?[0-9]{9}$/.test(p.replace(/\s/g, ''));
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AuthModal() {
  const { isAuthOpen, setAuthOpen, login } = useSimbaStore();
  const [mode, setMode] = useState<Mode>('login');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [referralInput, setReferralInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const reset = () => {
    setName(''); setEmail(''); setPhone('');
    setPassword(''); setConfirm('');
    setReferralInput('');
    setErrors({}); setShowPass(false);
    setShowConfirm(false); setForgotSent(false);
  };

  const switchMode = (m: Mode) => { reset(); setMode(m); };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!validateEmail(email)) e.email = 'Enter a valid email address';
    if (mode !== 'forgot') {
      if (!validatePassword(password)) e.password = 'Password must be at least 6 characters';
    }
    if (mode === 'register') {
      if (!name.trim()) e.name = 'Full name is required';
      if (phone && !validatePhone(phone)) e.phone = 'Enter a valid Rwandan phone number (+250...)';
      if (password !== confirm) e.confirm = 'Passwords do not match';
      if (registeredUsers.has(email.toLowerCase().trim())) {
        e.email = 'An account with this email already exists';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    await new Promise(r => setTimeout(r, 800));

    const key = email.toLowerCase().trim();

    if (mode === 'login') {
      const stored = registeredUsers.get(key);
      if (!stored) {
        // No account found
        setErrors({ email: 'No account found with this email. Please register first.' });
        setLoading(false);
        return;
      }
      if (stored.passwordHash !== simpleHash(password)) {
        // Wrong password — clear and show error
        setErrors({ password: 'Incorrect password. Please try again.' });
        setPassword('');
        setLoading(false);
        return;
      }
      // ✅ Correct credentials
      login({ id: key, name: stored.name, email: key, phone: stored.phone });
      toast.success(`Welcome back, ${stored.name}!`);
      reset();

    } else if (mode === 'register') {
      // Save new user, then redirect to login — don't auto-login
      registeredUsers.set(key, {
        name: name.trim(),
        phone: phone.trim() || undefined,
        passwordHash: simpleHash(password),
      });
      // Apply referral bonus if code provided
      if (referralInput.trim()) {
        toast.success(`Referral code applied! You'll earn 50 bonus points on your first order.`);
      }
      toast.success(`Account created! Please sign in with your new credentials.`);
      reset();
      setMode('login');
      // Pre-fill email so they just need to enter password
      setEmail(key);

    } else if (mode === 'forgot') {
      // In a real app: send reset email via API
      setForgotSent(true);
      toast.success('Reset link sent! Check your inbox.');
    }

    setLoading(false);
  };

  const inputBase = 'w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 placeholder:font-normal outline-none transition-all';
  const inputClass = (field: string) =>
    `${inputBase} ${errors[field] ? 'border-red-400 focus:border-red-500' : 'border-gray-200 dark:border-gray-700 focus:border-brand'}`;

  const strengthLevel = password.length === 0 ? 0 : password.length < 4 ? 1 : password.length < 6 ? 2 : password.length < 10 ? 3 : 4;
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strengthLevel];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-green-500'][strengthLevel];

  return (
    <AnimatePresence>
      {isAuthOpen && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
            {/* Top accent */}
            <div className="h-1.5 bg-gradient-to-r from-brand-dark via-brand to-brand-dark sticky top-0 z-10" />

            {/* Header */}
            <div className="px-6 pt-5 pb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-dark rounded-2xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <h2 className="font-black text-gray-900 dark:text-white text-lg leading-tight">
                    {mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Create account' : 'Reset password'}
                  </h2>
                  <p className="text-xs text-gray-400 font-medium">
                    {mode === 'login' ? 'Sign in to your Simba account'
                      : mode === 'register' ? 'Join Simba Supermarket today'
                      : 'Enter your email to get a reset link'}
                  </p>
                </div>
              </div>
              <button onClick={() => { setAuthOpen(false); reset(); }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Demo hint */}
            {mode === 'login' && (
              <div className="mx-6 mb-4 px-4 py-2.5 bg-brand/10 border border-brand/20 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-brand-dark flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                  Demo: <span className="font-black">demo@simba.rw</span> / <span className="font-black">simba123</span>
                  <br />Or register a new account above.
                </p>
              </div>
            )}

            {/* Forgot success */}
            {mode === 'forgot' && forgotSent ? (
              <div className="px-6 pb-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="font-black text-gray-900 dark:text-white mb-2">Check your inbox</h3>
                <p className="text-sm text-gray-500 mb-6">
                  We sent a reset link to <span className="font-bold text-gray-800 dark:text-gray-200">{email}</span>
                </p>
                <button onClick={() => switchMode('login')}
                  className="w-full py-3.5 bg-brand-dark text-white rounded-2xl font-black text-sm hover:bg-brand hover:text-gray-900 transition-colors">
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">

                {/* Name — register */}
                <AnimatePresence>
                  {mode === 'register' && (
                    <motion.div key="name-field"
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" value={name} onChange={e => setName(e.target.value)}
                          placeholder="e.g. Jean Pierre" className={`${inputClass('name')} pl-10`} />
                      </div>
                      {errors.name && <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com" className={`${inputClass('email')} pl-10`} autoComplete="email" />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
                </div>

                {/* Phone — register */}
                <AnimatePresence>
                  {mode === 'register' && (
                    <motion.div key="phone-field"
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">
                        Phone <span className="text-gray-400 font-normal normal-case tracking-normal">(optional)</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                          placeholder="+250 78X XXX XXX" className={`${inputClass('phone')} pl-10`} />
                      </div>
                      {errors.phone && <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.phone}</p>}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Referral code — register */}
                <AnimatePresence>
                  {mode === 'register' && (
                    <motion.div key="referral-field"
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">
                        Referral Code <span className="text-gray-400 font-normal normal-case tracking-normal">(optional)</span>
                      </label>
                      <div className="relative">
                        <Gift className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" value={referralInput} onChange={e => setReferralInput(e.target.value.toUpperCase())}
                          placeholder="e.g. SIMBAABCD12" className={`${inputBase} border-gray-200 dark:border-gray-700 focus:border-brand pl-10 uppercase`} />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">You and your friend both earn 50 loyalty points</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Password */}
                {mode !== 'forgot' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Password *</label>
                      {mode === 'login' && (
                        <button type="button" onClick={() => switchMode('forgot')}
                          className="text-xs font-bold text-brand-dark dark:text-brand hover:underline">
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type={showPass ? 'text' : 'password'} value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder={mode === 'register' ? 'Min. 6 characters' : '••••••••'}
                        className={`${inputClass('password')} pl-10 pr-10`}
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.password}</p>}

                    {/* Strength bar — register only */}
                    {mode === 'register' && password.length > 0 && (
                      <div className="mt-2 flex items-center gap-1.5">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strengthLevel ? strengthColor : 'bg-gray-200 dark:bg-gray-700'}`} />
                        ))}
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold ml-1 w-10">{strengthLabel}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Confirm password — register */}
                <AnimatePresence>
                  {mode === 'register' && (
                    <motion.div key="confirm-field"
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">Confirm Password *</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type={showConfirm ? 'text' : 'password'} value={confirm}
                          onChange={e => setConfirm(e.target.value)}
                          placeholder="Repeat your password"
                          className={`${inputClass('confirm')} pl-10 pr-10`}
                          autoComplete="new-password" />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                          {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.confirm && <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.confirm}</p>}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Terms */}
                {mode === 'register' && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                    By creating an account you agree to our{' '}
                    <span className="text-brand-dark dark:text-brand font-bold cursor-pointer hover:underline">Terms of Service</span>{' '}
                    and{' '}
                    <span className="text-brand-dark dark:text-brand font-bold cursor-pointer hover:underline">Privacy Policy</span>.
                  </p>
                )}

                {/* Submit */}
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-brand-dark hover:bg-gray-800 text-white rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  ) : (
                    <>
                      {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
                  <span className="text-xs text-gray-400 font-medium">or continue with</span>
                  <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
                </div>

                {/* Social — Google only */}
                <button type="button"
                  onClick={() => {
                    const u = { id: 'google_demo', name: 'Google User', email: 'google@simba.rw' };
                    registeredUsers.set(u.email, { name: u.name, passwordHash: '' });
                    login(u);
                    toast.success('Signed in with Google!');
                    reset();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-bold text-gray-700 dark:text-gray-300">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                {/* Switch mode */}
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  {mode === 'login' ? (
                    <>Don't have an account?{' '}
                      <button type="button" onClick={() => switchMode('register')}
                        className="font-black text-brand-dark dark:text-brand hover:underline">Sign up free</button>
                    </>
                  ) : mode === 'register' ? (
                    <>Already have an account?{' '}
                      <button type="button" onClick={() => switchMode('login')}
                        className="font-black text-brand-dark dark:text-brand hover:underline">Sign in</button>
                    </>
                  ) : (
                    <>Remember your password?{' '}
                      <button type="button" onClick={() => switchMode('login')}
                        className="font-black text-brand-dark dark:text-brand hover:underline">Sign in</button>
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
