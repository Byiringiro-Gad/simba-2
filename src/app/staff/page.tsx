'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Lock, User, AlertCircle, ShieldCheck, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import Link from 'next/link';

type Role = 'branch' | 'admin';

const ROLE_CONFIG = {
  branch: {
    icon: Store,
    title: 'Branch Staff Portal',
    subtitle: 'Manager & Staff — Simba Branches',
    color: 'bg-brand',
    usernamePlaceholder: 'e.g. manager_remera',
    passwordPlaceholder: '••••••••',
    credentials: [
      { role: 'Manager', username: 'manager_remera', password: 'manager123' },
      { role: 'Staff',   username: 'staff_remera',   password: 'staff123' },
    ],
    hint: 'Replace "remera" with: kimironko, kacyiru, nyamirambo, gikondo, kanombe',
  },
  admin: {
    icon: ShieldCheck,
    title: 'Admin Portal',
    subtitle: 'HQ Operations — All Branches',
    color: 'bg-red-500',
    usernamePlaceholder: 'admin',
    passwordPlaceholder: '••••••••',
    credentials: [
      { role: 'Admin', username: 'admin', password: 'admin123' },
    ],
    hint: 'Full access to all orders, products and branch analytics',
  },
};

export default function StaffPortal() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('branch');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const cfg = ROLE_CONFIG[role];

  const switchRole = (r: Role) => {
    setRole(r);
    setUsername('');
    setPassword('');
    setError('');
  };

  const fillDemo = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (role === 'admin') {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.trim(), password }),
        });
        const data = await res.json();
        if (!data.ok) { setError('Invalid username or password'); setLoading(false); return; }
        localStorage.setItem('admin_token', password);
        router.push('/admin');
        router.refresh();
      } else {
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
      }
    } catch {
      setError('Could not reach the server. Please try again.');
    }
    setLoading(false);
  };

  const Icon = cfg.icon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4">
      {/* Back to store */}
      <Link href="/" className="flex items-center gap-2 mb-6 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
        <span>←</span> Back to Simba Store
      </Link>

      {/* Buyer / Customer test credentials */}
      <div className="w-full max-w-md mb-4 bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <ShoppingBag className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <p className="text-xs font-black uppercase tracking-widest text-blue-600">Buyer / Customer Account</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div><p className="text-gray-500 font-medium">Email</p><p className="font-black text-gray-900 font-mono">demo@simba.rw</p></div>
          <div><p className="text-gray-500 font-medium">Password</p><p className="font-black text-gray-900 font-mono">demo1234</p></div>
        </div>
        <Link href="/" className="mt-3 block text-center px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-colors">
          Go to Store → Sign In
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">

          {/* Header */}
          <div className="bg-brand-dark px-6 pt-8 pb-0 text-center">
            {/* Logo */}
            <div className="w-14 h-14 rounded-2xl overflow-hidden mx-auto mb-4 relative bg-brand">
              <img src="/simbaheaderM.png" alt="Simba"
                style={{ position: 'absolute', height: '100%', width: 'auto', maxWidth: 'none', left: 0, top: 0 }} />
            </div>
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-5">Simba Supermarket · Staff Portal</p>

            {/* Role tabs */}
            <div className="flex bg-white/10 rounded-2xl p-1 gap-1 mb-0">
              {(['branch', 'admin'] as Role[]).map(r => (
                <button
                  key={r}
                  onClick={() => switchRole(r)}
                  className={clsx(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black transition-all',
                    role === r
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-white/60 hover:text-white'
                  )}
                >
                  {r === 'branch'
                    ? <><Store className="w-4 h-4" /> Branch</>
                    : <><ShieldCheck className="w-4 h-4" /> Admin</>
                  }
                </button>
              ))}
            </div>
          </div>

          {/* Animated form area */}
          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {/* Role info bar */}
              <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', cfg.color)}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-black text-sm text-gray-900 dark:text-white">{cfg.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{cfg.subtitle}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Username</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text" value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder={cfg.usernamePlaceholder}
                      required autoComplete="username"
                      className="w-full pl-10 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium outline-none focus:border-brand transition-colors text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password" value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder={cfg.passwordPlaceholder}
                      required autoComplete="current-password"
                      className="w-full pl-10 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium outline-none focus:border-brand transition-colors text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit" disabled={loading}
                  className="w-full py-3.5 bg-brand-dark hover:bg-gray-800 text-white rounded-2xl font-black text-sm transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
                >
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                    : 'Sign In'
                  }
                </button>

                {/* Demo credentials */}
                <div className="bg-brand-muted dark:bg-brand/10 rounded-2xl p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">
                    Demo Credentials — click to fill
                  </p>
                  <div className={clsx('grid gap-2', cfg.credentials.length > 1 ? 'grid-cols-2' : 'grid-cols-1')}>
                    {cfg.credentials.map(c => (
                      <button
                        key={c.username}
                        type="button"
                        onClick={() => fillDemo(c.username, c.password)}
                        className="bg-white dark:bg-gray-800 rounded-xl p-2.5 text-left hover:ring-2 hover:ring-brand transition-all"
                      >
                        <p className="font-black text-xs text-gray-900 dark:text-white">{c.role}</p>
                        <p className="text-gray-500 dark:text-gray-400 font-mono text-[10px]">{c.username}</p>
                        <p className="text-gray-400 font-mono text-[10px]">{c.password}</p>
                      </button>
                    ))}
                  </div>
                  {cfg.hint && (
                    <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">{cfg.hint}</p>
                  )}
                </div>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
