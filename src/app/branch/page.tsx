'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store, LogOut, RefreshCw, Clock, CheckCircle2,
  Package, Users, X, UserCheck, ChevronDown,
  AlertCircle, Bike, ShoppingBag
} from 'lucide-react';
import Image from 'next/image';
import { clsx } from 'clsx';
import { dt, DashLang } from '@/lib/dashboardTranslations';
import DashboardSettingsBar from '@/components/DashboardSettingsBar';
import { useSimbaStore } from '@/store/useSimbaStore';

const API = '/api';

interface StaffMember { id: string; name: string; username: string; }
interface OrderItem { id: number; name: string; price: number; quantity: number; image: string; }
interface Order {
  id: string; date: string; items: OrderItem[]; total: number;
  status: string; branch_status: string;
  customer_name: string; customer_phone: string;
  pickup_slot: string; deposit_amount: number;
  assigned_to: string | null; assigned_name: string | null;
  user_id?: string | null;
}

export default function ManagerDashboard() {
  const router = useRouter();
  const { language, isDarkMode } = useSimbaStore();
  const d = dt(language as DashLang);

  const BRANCH_STATUS_CONFIG = {
    pending:   { label: d.pending,   color: 'text-gray-600',  bg: 'bg-gray-100',  icon: Clock },
    preparing: { label: d.preparing, color: 'text-amber-600', bg: 'bg-amber-50',  icon: Bike },
    ready:     { label: d.ready,     color: 'text-green-600', bg: 'bg-green-50',  icon: CheckCircle2 },
    picked_up: { label: d.pickedUp,  color: 'text-blue-600',  bg: 'bg-blue-50',   icon: ShoppingBag },
  };
  const [staff, setStaff] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing' | 'ready'>('all');
  const [assignMenuOpen, setAssignMenuOpen] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  // Live clock for order timers
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  const getOrderAge = (dateStr: string) => {
    const mins = Math.floor((now - new Date(dateStr).getTime()) / 60000);
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  const getOrderUrgency = (dateStr: string) => {
    const mins = Math.floor((now - new Date(dateStr).getTime()) / 60000);
    if (mins > 45) return 'text-red-600 bg-red-50';
    if (mins > 20) return 'text-amber-600 bg-amber-50';
    return 'text-green-600 bg-green-50';
  };

  const token = typeof window !== 'undefined' ? localStorage.getItem('branch_token') ?? '' : '';

  useEffect(() => {
    const s = localStorage.getItem('branch_staff');
    if (!s) { router.push('/branch/login'); return; }
    const parsed = JSON.parse(s);
    if (parsed.role !== 'manager') { router.push('/branch/staff'); return; }
    setStaff(parsed);
    loadData(parsed);
  }, []);

  const loadData = async (s?: any) => {
    const t = localStorage.getItem('branch_token') ?? '';
    try {
      const [ordersRes, staffRes] = await Promise.all([
        fetch(`${API}/branch/orders`, { headers: { Authorization: `Bearer ${t}` } }),
        fetch(`${API}/branch/staff-list`, { headers: { Authorization: `Bearer ${t}` } }),
      ]);
      const ordersData = await ordersRes.json();
      const staffData = await staffRes.json();
      if (ordersData.ok) setOrders(ordersData.orders ?? []);
      if (staffData.ok) setStaffList(staffData.staff ?? []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const assignOrder = async (orderId: string, staffId: string, staffName: string) => {
    setAssigning(orderId);
    try {
      const t = localStorage.getItem('branch_token') ?? '';
      await fetch(`${API}/branch/orders/${orderId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ staffId, staffName }),
      });
      await loadData();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, assigned_to: staffId, assigned_name: staffName, branch_status: 'preparing' } : null);
      }
    } catch (err) { console.error(err); }
    setAssigning(null);
  };

  const updateStatus = async (orderId: string, branchStatus: string) => {
    try {
      const t = localStorage.getItem('branch_token') ?? '';
      await fetch(`${API}/branch/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ branchStatus }),
      });
      await loadData();
      setSelectedOrder(null);
    } catch (err) { console.error(err); }
  };

  const acceptAllPending = async () => {
    const pending = orders.filter(o => o.branch_status === 'pending');
    if (pending.length === 0) return;
    const t = localStorage.getItem('branch_token') ?? '';
    await Promise.all(pending.map(o =>
      fetch(`${API}/branch/orders/${o.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ branchStatus: 'preparing' }),
      })
    ));
    await loadData();
  };

  const staffPerformance = useMemo(() => {
    const map: Record<string, { name: string; completed: number; preparing: number }> = {};
    for (const o of orders) {
      if (!o.assigned_name) continue;
      if (!map[o.assigned_name]) map[o.assigned_name] = { name: o.assigned_name, completed: 0, preparing: 0 };
      if (o.branch_status === 'picked_up') map[o.assigned_name].completed++;
      if (o.branch_status === 'preparing' || o.branch_status === 'ready') map[o.assigned_name].preparing++;
    }
    return Object.values(map);
  }, [orders]);

  const logout = () => {
    localStorage.removeItem('branch_token');
    localStorage.removeItem('branch_staff');
    router.push('/branch/login');
  };

  const filtered = useMemo(() =>
    orders.filter(o => filter === 'all' || o.branch_status === filter),
    [orders, filter]
  );

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o => o.branch_status === 'pending').length,
    preparing: orders.filter(o => o.branch_status === 'preparing').length,
    ready: orders.filter(o => o.branch_status === 'ready').length,
  }), [orders]);

  if (!staff) return null;

  return (
    <div className={clsx("min-h-screen bg-gray-50 dark:bg-gray-950", isDarkMode && "dark")}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-brand-dark shadow-lg">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand rounded-xl flex items-center justify-center">
              <Store className="w-4 h-4 text-gray-900" />
            </div>
            <div>
              <p className="font-black text-white text-sm leading-none">{staff.branchName}</p>
              <p className="text-white/50 text-[10px]">{d.managerRole} · {staff.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DashboardSettingsBar />
            <button onClick={() => loadData()} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <RefreshCw className="w-4 h-4 text-white" />
            </button>
            <button onClick={logout} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-red-500/30 rounded-xl text-white text-xs font-bold transition-colors">
              <LogOut className="w-3.5 h-3.5" />
              {d.logout}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 py-5 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: d.totalOrders,     value: stats.total,     icon: Package,      color: 'text-gray-900',  bg: 'bg-white' },
            { label: d.pendingOrders,   value: stats.pending,   icon: Clock,        color: 'text-gray-600',  bg: 'bg-gray-50' },
            { label: d.preparingOrders, value: stats.preparing, icon: Bike,         color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: d.readyOrders,     value: stats.ready,     icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl border border-gray-100 p-4`}>
              <Icon className={`w-5 h-5 ${color} mb-2`} />
              <p className={`font-black text-2xl ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Staff count */}
        <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <Users className="w-4 h-4 text-brand" />
          <p className="text-sm font-bold text-gray-900 dark:text-white">{d.staffMembers(staffList.length)}</p>
          <div className="flex gap-2 ml-2">
            {staffList.map(s => (
              <span key={s.id} className="px-2 py-0.5 bg-brand-muted text-brand-dark rounded-full text-xs font-bold">{s.name.replace('Staff ', '')}</span>
            ))}
          </div>
        </div>

        {/* Filter tabs + Accept All */}
        <div className="flex gap-2 overflow-x-auto items-center" style={{ scrollbarWidth: 'none' }}>
          {(['all', 'pending', 'preparing', 'ready'] as const).map(f => {
            const cnt = f === 'all' ? orders.length : orders.filter(o => o.branch_status === f).length;
            const label = f === 'all' ? `${d.all} (${cnt})` : f === 'pending' ? `${d.pending} (${cnt})` : f === 'preparing' ? `${d.preparing} (${cnt})` : `${d.ready} (${cnt})`;
            return (
              <button key={f} onClick={() => setFilter(f)}
                className={clsx('flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all border',
                  filter === f ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-brand-dark'
                )}>
                {label}
              </button>
            );
          })}
          {stats.pending > 0 && (
            <button onClick={acceptAllPending}
              className="flex-shrink-0 ml-auto flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-black transition-colors">
              <CheckCircle2 className="w-4 h-4" />
              {language === 'fr' ? 'Tout accepter' : language === 'rw' ? 'Emera byose' : 'Accept All'} ({stats.pending})
            </button>
          )}
        </div>

        {/* Staff performance */}
        {staffPerformance.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
              {language === 'fr' ? 'Performance du personnel' : language === 'rw' ? 'Imikorere y\'abakozi' : 'Staff Performance'}
            </p>
            <div className="space-y-2">
              {staffPerformance.map(s => (
                <div key={s.name} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-muted rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-black text-brand-dark">{s.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{s.name}</p>
                    <div className="flex gap-3 mt-0.5">
                      <span className="text-[10px] text-green-600 font-bold">✓ {s.completed} done</span>
                      {s.preparing > 0 && <span className="text-[10px] text-amber-600 font-bold">⏳ {s.preparing} active</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>

        {/* Orders */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="font-black text-gray-900 mb-1">{d.noOrders}</p>
            <p className="text-sm text-gray-400">{d.noOrdersForBranch}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order, i) => {
              const cfg = BRANCH_STATUS_CONFIG[order.branch_status as keyof typeof BRANCH_STATUS_CONFIG] ?? BRANCH_STATUS_CONFIG.pending;
              const StatusIcon = cfg.icon;
              return (
                <motion.div key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-4 px-5 py-4">
                    {/* Product thumbnails */}
                    <div className="flex gap-1 flex-shrink-0">
                      {order.items.slice(0, 3).map(item => (
                        <div key={item.id} className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="40px" />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <span className="text-[10px] font-black text-gray-500">+{order.items.length - 3}</span>
                        </div>
                      )}
                    </div>

                    {/* Order info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-black text-sm text-gray-900">#{order.id}</p>
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${cfg.bg} ${cfg.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                        {order.assigned_name && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-brand-muted text-brand-dark rounded-full text-[10px] font-black">
                            <UserCheck className="w-3 h-3" />
                            {order.assigned_name}
                          </span>
                        )}
                        {/* Order age timer */}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${getOrderUrgency(order.date)}`}>
                          ⏱ {getOrderAge(order.date)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {order.customer_name} · {order.items.length} items · {order.total.toLocaleString()} RWF · {order.pickup_slot}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Assign button */}
                      {(order.branch_status === 'pending' || !order.assigned_to) && staffList.length > 0 && (
                        <div className="relative">
                          <button
                            onClick={() => setAssignMenuOpen(assignMenuOpen === order.id ? null : order.id)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-brand-dark text-white rounded-xl text-xs font-black hover:bg-gray-800 transition-colors">
                            <UserCheck className="w-3.5 h-3.5" />
                            {d.assignOrder}
                            <ChevronDown className={`w-3 h-3 transition-transform ${assignMenuOpen === order.id ? 'rotate-180' : ''}`} />
                          </button>
                          <AnimatePresence>
                            {assignMenuOpen === order.id && (
                              <motion.div
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 4 }}
                                className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden py-1">
                                {staffList.map(s => (
                                  <button key={s.id}
                                    onClick={() => { assignOrder(order.id, s.id, s.name); setAssignMenuOpen(null); }}
                                    disabled={assigning === order.id}
                                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-brand-muted hover:text-brand-dark transition-colors">
                                    {s.name}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      <button onClick={() => setSelectedOrder(order)}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-black transition-colors">
                        {d.view}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order detail drawer */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[100]" onClick={() => setSelectedOrder(null)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[110] shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 bg-brand-dark">
                <div>
                  <p className="font-black text-white">Order #{selectedOrder.id}</p>
                  <p className="text-white/60 text-xs">{new Date(selectedOrder.date).toLocaleString()}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white/10 rounded-xl">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Customer */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{d.customer}</p>
                  <p className="font-bold text-gray-900 dark:text-white">{selectedOrder.customer_name}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.customer_phone}</p>
                  <p className="text-sm text-gray-500">{d.pickupSlot}: {selectedOrder.pickup_slot} · {d.depositPaid}: {selectedOrder.deposit_amount?.toLocaleString()} RWF</p>
                </div>

                {/* Items */}
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{d.items} ({selectedOrder.items.length})</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="40px" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{item.name}</p>
                          <p className="text-xs text-gray-400">x{item.quantity}</p>
                        </div>
                        <p className="font-black text-sm text-gray-900 dark:text-white">{(item.price * item.quantity).toLocaleString()} RWF</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assign to staff */}
                {staffList.length > 0 && (
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{d.assignToStaff}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {staffList.map(s => (
                        <button key={s.id}
                          onClick={() => assignOrder(selectedOrder.id, s.id, s.name)}
                          disabled={assigning === selectedOrder.id}
                          className={clsx(
                            'py-3 px-4 rounded-xl text-sm font-bold transition-all border-2',
                            selectedOrder.assigned_to === s.id
                              ? 'border-brand bg-brand-muted text-brand-dark'
                              : 'border-gray-200 hover:border-brand text-gray-700 dark:text-gray-300'
                          )}>
                          {selectedOrder.assigned_to === s.id && <UserCheck className="w-3.5 h-3.5 inline mr-1" />}
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Update branch status */}
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{d.updateStatus}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(['pending', 'preparing', 'ready', 'picked_up'] as const).map(s => {
                      const cfg = BRANCH_STATUS_CONFIG[s];
                      const Icon = cfg.icon;
                      const isActive = selectedOrder.branch_status === s;
                      return (
                        <button key={s} onClick={() => !isActive && updateStatus(selectedOrder.id, s)}
                          disabled={isActive}
                          className={clsx(
                            'flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all',
                            isActive ? `${cfg.bg} border-current ${cfg.color}` : 'border-gray-200 hover:border-gray-300 bg-white dark:bg-gray-800 text-gray-500'
                          )}>
                          <Icon className={`w-5 h-5 ${isActive ? cfg.color : 'text-gray-400'}`} />
                          <span className={`text-xs font-black ${isActive ? cfg.color : 'text-gray-500'}`}>{cfg.label}</span>
                          {isActive && <span className="text-[9px] text-gray-400">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* No-show flag */}
                {(selectedOrder.branch_status === 'ready' || selectedOrder.branch_status === 'picked_up') && (
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{d.customerNoShow}</p>
                    <button
                      onClick={async () => {
                        if (!confirm(d.noShowConfirm)) return;
                        const t = localStorage.getItem('branch_token') ?? '';
                        await fetch('/api/branch/flag', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
                          body: JSON.stringify({
                            userId: selectedOrder.user_id ?? null,
                            phone: selectedOrder.customer_phone ?? null,
                            orderId: selectedOrder.id,
                            reason: 'no_show',
                          }),
                        });
                        alert(d.noShowSuccess);
                      }}
                      className="w-full py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-2"
                    >
                      🚩 {d.noShowFlag}
                    </button>
                    <p className="text-[10px] text-gray-400 mt-1.5 text-center">{d.noShowInfo}</p>
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
