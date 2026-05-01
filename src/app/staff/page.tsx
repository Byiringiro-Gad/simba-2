'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Lock, User, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function BranchLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fillDemo = (u: string, p: string) => { setUsername(u); setPassword(p); setError(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/branch/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!data.ok) { setError(data.error ?? 'Invalid credentials'); setLoading(false); return; }
      localStorage.setItem('branch_token', data.token);
      localStorage.setItem('branch_staff', JSON.stringify(data.staff));
      router.push(data.staff.role === 'manager' ? '/branch' : '/branch/staff');
    } catch {
      setError('Could not reach the server. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4">
      <Link href="/" className="flex items-center gap-2 mb-6 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
        <span>←</span> Back to Simba Store
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="bg-brand-dark px-6 pt-8 pb-6 text-center">
            <div className="w-14 h-14 rounded-2xl overflow-hidden mx-auto mb-4 relative bg-brand">
              <img src="/simbaheaderM.png" alt="Simba" style={{ position: 'absolute', height: '100%', width: 'auto', maxWidth: 'none', left: 0, top: 0 }} />
            </div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <Store className="w-5 h-5 text-brand" />
              <p className="text-white font-black text-lg">Branch Staff Portal</p>
            </div>
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Manager & Staff — Simba Branches</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
              </div>
            )}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. manager_remera" required autoComplete="username"
                  className="w-full pl-10 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium outline-none focus:border-brand transition-colors text-gray-900 dark:text-white" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required autoComplete="current-password"
                  className="w-full pl-10 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium outline-none focus:border-brand transition-colors text-gray-900 dark:text-white" />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-brand-dark hover:bg-gray-800 text-white rounded-2xl font-black text-sm transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
            <div className="bg-brand-muted dark:bg-brand/10 rounded-2xl p-4">
              <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Demo Credentials — click to fill</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { role: 'Manager', username: 'manager_remera', password: 'manager123' },
                  { role: 'Staff',   username: 'staff_remera',   password: 'staff123' },
                ].map(c => (
                  <button key={c.username} type="button" onClick={() => fillDemo(c.username, c.password)}
                    className="bg-white dark:bg-gray-800 rounded-xl p-2.5 text-left hover:ring-2 hover:ring-brand transition-all">
                    <p className="font-black text-xs text-gray-900 dark:text-white">{c.role}</p>
                    <p className="text-gray-500 font-mono text-[10px]">{c.username}</p>
                    <p className="text-gray-400 font-mono text-[10px]">{c.password}</p>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-2">Replace &quot;remera&quot; with: kimironko, kacyiru, nyamirambo, gikondo, kanombe</p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
