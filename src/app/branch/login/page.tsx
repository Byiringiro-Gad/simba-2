'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Lock, User, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BranchLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

      if (!data.ok) {
        setError(data.error ?? 'Invalid credentials');
        setLoading(false);
        return;
      }

      // Store token and staff info
      localStorage.setItem('branch_token', data.token);
      localStorage.setItem('branch_staff', JSON.stringify(data.staff));

      // Route based on role
      if (data.staff.role === 'manager') {
        router.push('/branch');
      } else {
        router.push('/branch/staff');
      }
    } catch {
      setError('Could not reach the server. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-brand-dark px-6 py-8 text-center">
            <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-gray-900" />
            </div>
            <h1 className="font-black text-2xl text-white mb-1">Branch Dashboard</h1>
            <p className="text-white/60 text-sm">Simba Supermarket — Staff Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. manager_remera"
                  required
                  className="w-full pl-10 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-medium outline-none focus:border-brand transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-medium outline-none focus:border-brand transition-colors" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-brand-dark hover:bg-gray-800 text-white rounded-2xl font-black text-sm transition-all disabled:opacity-50 shadow-lg">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            {/* Demo credentials */}
            <div className="bg-brand-muted rounded-2xl p-4 space-y-2">
              <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Demo Credentials</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white rounded-xl p-2.5">
                  <p className="font-black text-gray-900">Manager (Remera)</p>
                  <p className="text-gray-500 font-mono">manager_remera</p>
                  <p className="text-gray-500 font-mono">manager123</p>
                </div>
                <div className="bg-white rounded-xl p-2.5">
                  <p className="font-black text-gray-900">Staff (Remera)</p>
                  <p className="text-gray-500 font-mono">staff_remera</p>
                  <p className="text-gray-500 font-mono">staff123</p>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Replace "remera" with any branch ID: kimironko, kacyiru, nyamirambo, gikondo, kanombe, kinyinya, kibagabaga, nyanza</p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
