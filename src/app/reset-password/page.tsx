'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { authApi } from '@/lib/api';

// Inner component that uses useSearchParams — must be inside Suspense
function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) setError('Invalid or missing reset token. Please request a new link.');
  }, [token]);

  const strength = password.length === 0 ? 0 : password.length < 4 ? 1 : password.length < 6 ? 2 : password.length < 10 ? 3 : 4;
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-green-500'][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }

    setLoading(true);
    try {
      const res = await authApi.resetPassword({ token, password });
      if (res.ok) {
        setDone(true);
      } else {
        setError(res.error ?? 'Reset failed. The link may have expired.');
      }
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="font-black text-gray-900 dark:text-white text-lg mb-2">Password Updated!</h3>
        <p className="text-sm text-gray-400 mb-6">Your password has been reset successfully.</p>
        <button onClick={() => router.push('/')}
          className="w-full py-3.5 bg-brand-dark text-white rounded-2xl font-black text-sm hover:bg-gray-800 transition-colors">
          Back to Simba
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">New Password</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type={showPass ? 'text' : 'password'} value={password}
            onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters"
            className="w-full pl-10 pr-10 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium outline-none focus:border-brand transition-colors text-gray-900 dark:text-white" />
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {password.length > 0 && (
          <div className="mt-2 flex items-center gap-1.5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? strengthColor : 'bg-gray-200 dark:bg-gray-700'}`} />
            ))}
            <span className="text-[10px] text-gray-400 font-bold ml-1 w-10">{strengthLabel}</span>
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Confirm Password</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
            placeholder="Repeat your password"
            className="w-full pl-10 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium outline-none focus:border-brand transition-colors text-gray-900 dark:text-white" />
        </div>
      </div>

      <button type="submit" disabled={loading || !token}
        className="w-full py-3.5 bg-brand-dark hover:bg-gray-800 text-white rounded-2xl font-black text-sm transition-all disabled:opacity-50 shadow-lg">
        {loading ? 'Updating...' : 'Set New Password'}
      </button>
    </form>
  );
}

// Outer page wraps the form in Suspense (required by Next.js 14 for useSearchParams)
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          {/* Header */}
          <div className="bg-brand-dark px-6 py-8 text-center">
            <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-gray-900" />
            </div>
            <h1 className="font-black text-2xl text-white mb-1">Reset Password</h1>
            <p className="text-white/60 text-sm">Simba Supermarket</p>
          </div>

          <div className="p-6">
            <Suspense fallback={
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
              </div>
            }>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
