'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store, LogOut, RefreshCw, Clock, CheckCircle2,
  Package, Bike, ShoppingBag, Search, X,
  AlertTriangle, ToggleLeft, ToggleRight
} from 'lucide-react';
import Image from 'next/image';
import { clsx } from 'clsx';
import { getSimbaData } from '@/lib/data';
import DashboardSettingsBar from '@/components/DashboardSettingsBar';
import { useSimbaStore } from '@/store/useSimbaStore';
import { dt, DashLang } from '@/lib/dashboardTranslations';

const API = '/api';

interface OrderItem { id: number; name: string; price: number; quantity: number; image: string; }
interface Order {
  id: string; date: string; items: OrderItem[]; total: number;
  status: string; branch_status: string;
  customer_name: string; customer_phone: string;
  pickup_slot: string; deposit_amount: number;
}
interface InventoryItem {
  productId: number; name: string; category: string; image: string; price: number;
  stockCount: number; isAvailable: boolean;
}

export default function StaffDashboard() {
  const router = useRouter();
  const { language } = useSimbaStore();
  const d = dt(language as DashLang);

  // Status config — inside component so it reacts to language changes
  const STATUS_CONFIG = {
    pending:   { label: language === 'fr' ? 'En attente' : language === 'rw' ? 'Bitegerejwe' : 'Pending',    color: 'text-gray-600',  bg: 'bg-gray-100', icon: Clock,        next: 'preparing', nextLabel: language === 'fr' ? 'Commencer' : language === 'rw' ? 'Tangira' : 'Start Preparing', nextBg: 'bg-brand-dark hover:bg-gray-800 text-white' },
    preparing: { label: language === 'fr' ? 'En préparation' : language === 'rw' ? 'Bitegurwa' : 'Preparing', color: 'text-amber-600', bg: 'bg-amber-50', icon: Bike,         next: 'ready',     nextLabel: language === 'fr' ? 'Marquer prêt ✓' : language === 'rw' ? 'Biteguye ✓' : 'Mark Ready ✓',    nextBg: 'bg-green-500 hover:bg-green-600 text-white' },
    ready:     { label: language === 'fr' ? 'Prêt ✓' : language === 'rw' ? 'Biteguye ✓' : 'Ready ✓',        color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2, next: 'picked_up', nextLabel: language === 'fr' ? 'Marquer récupéré' : language === 'rw' ? 'Byafashwe' : 'Mark Picked Up',  nextBg: 'bg-blue-500 hover:bg-blue-600 text-white' },
    picked_up: { label: language === 'fr' ? 'Récupéré' : language === 'rw' ? 'Byafashwe' : 'Picked Up',      color: 'text-blue-600',  bg: 'bg-blue-50',  icon: ShoppingBag,  next: null,        nextLabel: '',                nextBg: '' },
  };
  const [staff, setStaff] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<Record<number, { stockCount: number; isAvailable: boolean }>>({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory'>('orders');
  const [invSearch, setInvSearch] = useState('');
  const [savingInv, setSavingInv] = useState<number | null>(null);

  const allProducts = useMemo(() => getSimbaData().products, []);

  useEffect(() => {
    const s = localStorage.getItem('branch_staff');
    if (!s) { router.push('/branch/login'); return; }
    const parsed = JSON.parse(s);
    if (parsed.role !== 'staff') { router.push('/branch'); return; }
    setStaff(parsed);
    loadAll(parsed);
  }, []);

  const loadAll = async (s?: any) => {
    const t = localStorage.getItem('branch_token') ?? '';
    const branchId = s?.branchId ?? staff?.branchId;
    try {
      const [ordersRes, invRes] = await Promise.all([
        fetch(`${API}/branch/orders`, { headers: { Authorization: `Bearer ${t}` } }),
        fetch(`${API}/inventory/${branchId}`),
      ]);
      const ordersData = await ordersRes.json();
      const invData = await invRes.json();
      if (ordersData.ok) setOrders(ordersData.orders ?? []);
      if (invData.ok) setInventory(invData.inventory ?? {});
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, branchStatus: string) => {
    setUpdating(orderId);
    const t = localStorage.getItem('branch_token') ?? '';
    try {
      await fetch(`${API}/branch/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ branchStatus }),
      });
      await loadAll();
    } catch (err) { console.error(err); }
    setUpdating(null);
  };

  const updateInventory = async (productId: number, stockCount: number, isAvailable: boolean) => {
    setSavingInv(productId);
    const t = localStorage.getItem('branch_token') ?? '';
    try {
      await fetch(`${API}/inventory/${staff.branchId}/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ stockCount, isAvailable }),
      });
      setInventory(prev => ({ ...prev, [productId]: { stockCount, isAvailable } }));
    } catch (err) { console.error(err); }
    setSavingInv(null);
  };

  const logout = () => {
    localStorage.removeItem('branch_token');
    localStorage.removeItem('branch_staff');
    router.push('/branch/login');
  };

  const { isDarkMode } = useSimbaStore();

  // Build inventory list from products + current stock data
  const inventoryList: InventoryItem[] = useMemo(() => {
    return allProducts
      .filter(p => invSearch === '' || p.name.toLowerCase().includes(invSearch.toLowerCase()) || p.category.toLowerCase().includes(invSearch.toLowerCase()))
      .map(p => {
        const stock = inventory[p.id];
        return {
          productId: p.id,
          name: p.name,
          category: p.category,
          image: p.image,
          price: p.price,
          stockCount: stock?.stockCount ?? 50,
          isAvailable: stock?.isAvailable ?? p.inStock,
        };
      });
  }, [allProducts, inventory, invSearch]);

  const active = orders.filter(o => o.branch_status !== 'picked_up');
  const done = orders.filter(o => o.branch_status === 'picked_up');
  const outOfStock = inventoryList.filter(i => !i.isAvailable || i.stockCount === 0).length;

  if (!staff) return null;

  return (
    <div className={isDarkMode ? 'dark' : ''}>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-brand-dark shadow-lg">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand rounded-xl flex items-center justify-center">
              <Store className="w-4 h-4 text-gray-900" />
            </div>
            <div>
              <p className="font-black text-white text-sm leading-none">{staff.branchName}</p>
              <p className="text-white/50 text-[10px]">{d.staffRole} · {staff.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DashboardSettingsBar />
            <button onClick={() => loadAll()} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <RefreshCw className="w-4 h-4 text-white" />
            </button>
            <button onClick={logout} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-red-500/30 rounded-xl text-white text-xs font-bold transition-colors">
              <LogOut className="w-3.5 h-3.5" />
              {d.logout}
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex px-4 pb-0">
          {[
            { id: 'orders',    label: `${d.ordersTab} (${active.length})` },
            { id: 'inventory', label: `${d.inventoryTab}${outOfStock > 0 ? ` (${outOfStock})` : ''}` },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                'px-4 py-2.5 text-xs font-black border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-brand text-brand'
                  : 'border-transparent text-white/60 hover:text-white/80'
              )}>
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 py-5">

        {/* ── ORDERS TAB ── */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {active.length > 0 && (
              <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
                <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
                <p className="font-black text-amber-800 text-sm">
                  {active.length} {d.activeOrders(active.length)}
                </p>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="font-black text-gray-900 dark:text-white mb-1">{d.noOrdersAssigned}</p>
                <p className="text-sm text-gray-400">{d.managerWillAssign}</p>
              </div>
            ) : (
              <>
                {active.map((order, i) => {
                  const cfg = STATUS_CONFIG[order.branch_status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
                  const StatusIcon = cfg.icon;
                  return (
                    <motion.div key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                      <div className={`px-5 py-2.5 flex items-center gap-2 ${cfg.bg}`}>
                        <StatusIcon className={`w-4 h-4 ${cfg.color}`} />
                        <span className={`text-xs font-black uppercase tracking-wide ${cfg.color}`}>{cfg.label}</span>
                        <span className="ml-auto text-xs text-gray-400 font-medium">#{order.id}</span>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-black text-gray-900">{order.customer_name}</p>
                            <p className="text-xs text-gray-500">{order.customer_phone} · {order.pickup_slot}</p>
                          </div>
                          <p className="font-black text-gray-900">{order.total.toLocaleString()} RWF</p>
                        </div>
                        <div className="flex gap-2 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                          {order.items.map(item => (
                            <div key={item.id} className="flex-shrink-0 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                              <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="32px" />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-gray-900 max-w-[80px] truncate">{item.name}</p>
                                <p className="text-[10px] text-gray-400">×{item.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        {cfg.next && (
                          <button onClick={() => updateOrderStatus(order.id, cfg.next!)} disabled={updating === order.id}
                            className={clsx('w-full py-3 rounded-2xl font-black text-sm transition-all active:scale-[0.98] shadow-sm', cfg.nextBg)}>
                            {updating === order.id ? (
                              <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                {d.updating}
                              </span>
                            ) : cfg.nextLabel}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {done.length > 0 && (
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{d.completed} ({done.length})</p>
                    {done.map(order => (
                      <div key={order.id} className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-100 opacity-60 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <p className="font-bold text-sm text-gray-700">#{order.id}</p>
                        <p className="text-xs text-gray-400">{order.customer_name}</p>
                        <p className="ml-auto font-black text-sm text-gray-700">{order.total.toLocaleString()} RWF</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── INVENTORY TAB ── */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-2 px-4 py-3 bg-white rounded-2xl border border-gray-200 focus-within:border-brand transition-colors">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input type="text" value={invSearch} onChange={e => setInvSearch(e.target.value)}
                placeholder={d.searchProducts}
                className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400" />
              {invSearch && <button onClick={() => setInvSearch('')}><X className="w-4 h-4 text-gray-400" /></button>}
            </div>

            {/* Out of stock alert */}
            {outOfStock > 0 && (
              <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm font-bold text-red-700">{d.outOfStockAlert(outOfStock)}</p>
              </div>
            )}

            {/* Inventory list */}
            <div className="space-y-2">
              {inventoryList.map(item => (
                <div key={item.productId} className={clsx(
                  'bg-white rounded-2xl border overflow-hidden transition-all',
                  !item.isAvailable || item.stockCount === 0 ? 'border-red-200' : 'border-gray-100'
                )}>
                  <div className="flex items-center gap-3 p-3">
                    {/* Image */}
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                      {(!item.isAvailable || item.stockCount === 0) && (
                        <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                          <X className="w-4 h-4 text-red-600" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.category} · {item.price.toLocaleString()} RWF</p>
                    </div>

                    {/* Stock count input */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => updateInventory(item.productId, Math.max(0, item.stockCount - 1), item.stockCount - 1 > 0)}
                          className="w-7 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors font-black text-sm"
                        >−</button>
                        <span className="w-8 text-center text-sm font-black text-gray-900">{item.stockCount}</span>
                        <button
                          onClick={() => updateInventory(item.productId, item.stockCount + 1, true)}
                          className="w-7 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors font-black text-sm"
                        >+</button>
                      </div>

                      {/* Toggle availability */}
                      <button
                        onClick={() => updateInventory(item.productId, item.stockCount, !item.isAvailable)}
                        disabled={savingInv === item.productId}
                        className="transition-colors"
                        title={item.isAvailable ? d.markOutOfStock : d.markAvailable}
                      >
                        {item.isAvailable ? (
                          <ToggleRight className="w-8 h-8 text-green-500" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-gray-300" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Low stock warning */}
                  {item.isAvailable && item.stockCount > 0 && item.stockCount <= 5 && (
                    <div className="px-3 pb-2">
                      <p className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {d.lowStock(item.stockCount)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
