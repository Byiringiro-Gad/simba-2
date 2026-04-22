'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Clock, CheckCircle2, XCircle,
  LogOut, Search, Filter, ChevronDown, Eye,
  TrendingUp, Users, Package, DollarSign,
  RefreshCw, X, ChevronRight, Bike
} from 'lucide-react';
import Image from 'next/image';
import { clsx } from 'clsx';

// ── Types ─────────────────────────────────────────────────────────────────────
interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  unit: string;
  category: string;
}

interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: 'processing' | 'delivered' | 'cancelled';
}

type StatusFilter = 'all' | 'processing' | 'delivered' | 'cancelled';

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS = {
  processing: { label: 'Processing', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', icon: Clock },
  delivered:  { label: 'Delivered',  color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20',  border: 'border-green-200 dark:border-green-800',  icon: CheckCircle2 },
  cancelled:  { label: 'Cancelled',  color: 'text-red-600',   bg: 'bg-red-50 dark:bg-red-900/20',      border: 'border-red-200 dark:border-red-800',      icon: XCircle },
};

// ── Load orders from backend API ──────────────────────────────────────────────
const ADMIN_TOKEN = typeof window !== 'undefined'
  ? localStorage.getItem('admin_token') ?? ''
  : '';

async function fetchOrders(): Promise<Order[]> {
  try {
    const token = localStorage.getItem('admin_token') ?? '';
    const { adminApi } = await import('@/lib/api');
    const data = await adminApi.getOrders(token);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // Load orders on mount and every 30s
  const loadData = async () => {
    const data = await fetchOrders();
    setOrders(data);
    setLastRefresh(new Date());
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    setUpdating(orderId);
    try {
      const token = localStorage.getItem('admin_token') ?? '';
      const { adminApi } = await import('@/lib/api');
      const res = await adminApi.updateStatus(token, orderId, newStatus);
      if (res.ok) {
        const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
        setOrders(updated);
        if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
    setUpdating(null);
  };

  const handleRefresh = () => {
    setLoading(true);
    loadData();
  };

  // Stats
  const stats = useMemo(() => {
    const total = orders.length;
    const processing = orders.filter(o => o.status === 'processing').length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const cancelled = orders.filter(o => o.status === 'cancelled').length;
    const revenue = orders.filter(o => o.status !== 'cancelled').reduce((a, o) => a + o.total, 0);
    const todayOrders = orders.filter(o => {
      const d = new Date(o.date);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    }).length;
    return { total, processing, delivered, cancelled, revenue, todayOrders };
  }, [orders]);

  // Filtered orders
  const filtered = useMemo(() => {
    return orders
      .filter(o => statusFilter === 'all' || o.status === statusFilter)
      .filter(o => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return o.id.toLowerCase().includes(q) ||
          o.items.some(i => i.name.toLowerCase().includes(q));
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [orders, statusFilter, search]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Top navbar */}
      <header className="sticky top-0 z-40 bg-brand-dark shadow-lg">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-gray-900" />
            </div>
            <div>
              <p className="font-black text-white text-sm leading-none">Simba Admin</p>
              <p className="text-white/50 text-[10px] font-medium">Order Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleRefresh}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-white text-xs font-bold transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:block">Refresh</span>
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-red-500/30 rounded-xl text-white text-xs font-bold transition-colors">
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total Orders',   value: stats.total,                  icon: Package,     color: 'text-gray-900 dark:text-white',  bg: 'bg-white dark:bg-gray-900' },
            { label: "Today's Orders", value: stats.todayOrders,            icon: TrendingUp,  color: 'text-blue-600',                  bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Processing',     value: stats.processing,             icon: Clock,       color: 'text-amber-600',                 bg: 'bg-amber-50 dark:bg-amber-900/20' },
            { label: 'Delivered',      value: stats.delivered,              icon: CheckCircle2,color: 'text-green-600',                 bg: 'bg-green-50 dark:bg-green-900/20' },
            { label: 'Cancelled',      value: stats.cancelled,              icon: XCircle,     color: 'text-red-600',                   bg: 'bg-red-50 dark:bg-red-900/20' },
            { label: 'Revenue (RWF)',  value: `${(stats.revenue/1000).toFixed(0)}K`, icon: DollarSign, color: 'text-brand-dark dark:text-brand', bg: 'bg-brand-muted dark:bg-brand/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl border border-gray-100 dark:border-gray-800 p-4`}>
              <Icon className={`w-5 h-5 ${color} mb-2`} />
              <p className={`font-black text-xl ${color} leading-none`}>{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:border-brand transition-colors">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by order ID or product name..."
              className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400" />
            {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-gray-400" /></button>}
          </div>

          {/* Status filter */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'processing', 'delivered', 'cancelled'] as StatusFilter[]).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={clsx(
                  'px-4 py-2.5 rounded-xl text-sm font-bold capitalize transition-all border',
                  statusFilter === s
                    ? 'bg-brand-dark text-white border-brand-dark'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-brand-dark'
                )}>
                {s === 'all' ? `All (${orders.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${orders.filter(o => o.status === s).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Last refresh */}
        <p className="text-xs text-gray-400 -mt-3">
          Last updated: {lastRefresh.toLocaleTimeString()} · Auto-refreshes every 30s
        </p>

        {/* Orders table */}
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-16 text-center">
            <Package className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
            <p className="font-black text-gray-900 dark:text-white mb-1">No orders found</p>
            <p className="text-sm text-gray-400">
              {orders.length === 0 ? 'Orders placed by customers will appear here.' : 'Try a different filter or search term.'}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-[1fr_140px_120px_160px_80px] gap-4 px-5 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
              {['Order', 'Date', 'Total', 'Status', 'Action'].map(h => (
                <p key={h} className="text-[10px] font-black uppercase tracking-widest text-gray-400">{h}</p>
              ))}
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.map((order, i) => {
                const cfg = STATUS[order.status];
                const StatusIcon = cfg.icon;
                return (
                  <motion.div key={order.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_140px_120px_160px_80px] gap-3 sm:gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    {/* Order info */}
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1 flex-shrink-0">
                        {order.items.slice(0, 3).map(item => (
                          <div key={item.id} className="relative w-9 h-9 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                            <Image src={item.image} alt={item.name} fill className="object-cover" sizes="36px" />
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-black text-gray-500">+{order.items.length - 3}</span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-sm text-gray-900 dark:text-white">#{order.id}</p>
                        <p className="text-xs text-gray-400 truncate">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center">
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {new Date(order.date).toLocaleDateString('en-RW', { day: 'numeric', month: 'short' })}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(order.date).toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="flex items-center">
                      <p className="font-black text-sm text-gray-900 dark:text-white">{order.total.toLocaleString()} <span className="text-gray-400 font-medium text-xs">RWF</span></p>
                    </div>

                    {/* Status */}
                    <div className="flex items-center">
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${cfg.bg} ${cfg.border}`}>
                        <StatusIcon className={`w-3.5 h-3.5 ${cfg.color}`} />
                        <span className={`text-xs font-black ${cfg.color}`}>{cfg.label}</span>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex items-center">
                      <button onClick={() => setSelectedOrder(order)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-brand-dark text-white rounded-xl text-xs font-black hover:bg-gray-800 transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Order detail drawer */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
              onClick={() => setSelectedOrder(null)} />

            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-gray-950 z-[110] shadow-2xl flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 py-4 bg-brand-dark">
                <div>
                  <p className="font-black text-white">Order #{selectedOrder.id}</p>
                  <p className="text-white/60 text-xs font-medium">
                    {new Date(selectedOrder.date).toLocaleString('en-RW', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5">

                {/* Status badge */}
                <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl border ${STATUS[selectedOrder.status].bg} ${STATUS[selectedOrder.status].border}`}>
                  {(() => { const Icon = STATUS[selectedOrder.status].icon; return <Icon className={`w-5 h-5 ${STATUS[selectedOrder.status].color}`} />; })()}
                  <span className={`font-black text-sm ${STATUS[selectedOrder.status].color}`}>
                    {STATUS[selectedOrder.status].label}
                  </span>
                </div>

                {/* Items */}
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Items ({selectedOrder.items.length})</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{item.name}</p>
                          <p className="text-xs text-gray-400">Qty: {item.quantity} × {item.price.toLocaleString()} RWF</p>
                        </div>
                        <p className="font-black text-sm text-gray-900 dark:text-white flex-shrink-0">
                          {(item.price * item.quantity).toLocaleString()} RWF
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order summary */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 space-y-2">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Order Summary</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-bold text-gray-900 dark:text-white">{(selectedOrder.total - 1000).toLocaleString()} RWF</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Delivery Fee</span>
                    <span className="font-bold text-gray-900 dark:text-white">1,000 RWF</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-black text-gray-900 dark:text-white">Total</span>
                    <span className="font-black text-lg text-gray-900 dark:text-white">{selectedOrder.total.toLocaleString()} RWF</span>
                  </div>
                </div>

                {/* Update status */}
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Update Status</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(['processing', 'delivered', 'cancelled'] as Order['status'][]).map(s => {
                      const cfg = STATUS[s];
                      const Icon = cfg.icon;
                      const isActive = selectedOrder.status === s;
                      const isUpdating = updating === selectedOrder.id;
                      return (
                        <button key={s}
                          onClick={() => !isActive && handleStatusChange(selectedOrder.id, s)}
                          disabled={isActive || isUpdating}
                          className={clsx(
                            'flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border-2 transition-all text-center',
                            isActive
                              ? `${cfg.bg} ${cfg.border} cursor-default`
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900 cursor-pointer',
                            isUpdating && !isActive ? 'opacity-50 cursor-not-allowed' : ''
                          )}>
                          <Icon className={`w-5 h-5 ${isActive ? cfg.color : 'text-gray-400'}`} />
                          <span className={`text-xs font-black ${isActive ? cfg.color : 'text-gray-500 dark:text-gray-400'}`}>
                            {cfg.label}
                          </span>
                          {isActive && <span className="text-[9px] text-gray-400 font-medium">Current</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Rider assignment (visual) */}
                {selectedOrder.status === 'processing' && (
                  <div className="bg-brand-muted dark:bg-brand/10 border border-brand/20 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-dark rounded-xl flex items-center justify-center flex-shrink-0">
                      <Bike className="w-5 h-5 text-brand" />
                    </div>
                    <div>
                      <p className="font-black text-sm text-gray-900 dark:text-white">Rider: Jean Pierre</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Assigned · ETA 45 min</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
