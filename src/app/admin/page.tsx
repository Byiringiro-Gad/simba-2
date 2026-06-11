
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Clock, CheckCircle2, XCircle, LogOut, Search, Eye, Store,
  TrendingUp, Package, DollarSign, RefreshCw, X, Bike, Star,
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Image as ImageIcon,
  ChevronDown, AlertTriangle, Users, Tag, Settings
} from 'lucide-react';
import Image from 'next/image';
import { clsx } from 'clsx';
import DashboardSettingsBar from '@/components/DashboardSettingsBar';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import { getPaymentMethodLabel, normalizePaymentMethod } from '@/lib/paymentMethods';

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface OrderItem { id: number; name: string; price: number; quantity: number; image: string; unit: string; category: string; }
interface Order {
  id: string; date: string; items: OrderItem[]; total: number;
  status: 'processing' | 'delivered' | 'cancelled';
  pickup_branch?: string; pickup_slot?: string; deposit_amount?: number;
  customer_name?: string; customer_phone?: string; payment_method?: string;
}
interface Product {
  id: number; _dbId?: number; name: string; price: number; category: string;
  unit: string; image: string; inStock: boolean; stockCount: number;
  description?: string | null; source: 'json' | 'override' | 'addition';
}

type AdminView = 'orders' | 'products' | 'branches' | 'promos' | 'users' | 'settings';
type StatusFilter = 'all' | 'processing' | 'delivered' | 'cancelled';

const CATEGORIES = [
  'Groceries','Bakery','Cosmetics & Personal Care','Baby Products',
  'Kitchenware & Electronics','Electronics','Sports & Wellness',
  'Alcoholic Beverages & Spirits','Cleaning & Sanitary','Kitchen Storage','Pet Care',
];

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

/* ─── Product Form Modal ─────────────────────────────────────────────────── */
function ProductModal({
  product, categories, onSave, onClose, language,
}: {
  product: Product | null;
  categories: string[];
  onSave: (data: Partial<Product>) => Promise<void>;
  onClose: () => void;
  language: string;
}) {
  const isNew = !product;
  const [form, setForm] = useState({
    name: product?.name ?? '',
    price: product?.price ?? 0,
    category: product?.category ?? categories[0] ?? 'Groceries',
    unit: product?.unit ?? 'Pcs',
    image: product?.image ?? '',
    inStock: product?.inStock ?? true,
    stockCount: product?.stockCount ?? 100,
    description: product?.description ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.price || !form.category) {
      setError('Name, price and category are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave({ ...form, price: Number(form.price), stockCount: Number(form.stockCount) });
      onClose();
    } catch (e: any) {
      setError(e.message ?? 'Save failed');
    }
    setSaving(false);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg pointer-events-auto overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-brand-dark">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand rounded-xl flex items-center justify-center">
                {isNew ? <Plus className="w-4 h-4 text-gray-900" /> : <Pencil className="w-4 h-4 text-gray-900" />}
              </div>
              <p className="font-black text-white">{isNew ? 'Add New Product' : 'Edit Product'}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Image preview */}
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                {form.image ? (
                  <Image src={form.image} alt="preview" fill className="object-cover" sizes="80px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Image URL</label>
                <input value={form.image} onChange={e => set('image', e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:border-brand transition-colors" />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Product Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="e.g. Fresh Whole Milk 1L"
                className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm font-medium outline-none focus:border-brand transition-colors" />
            </div>

            {/* Price + Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Price (RWF) *</label>
                <input type="number" value={form.price} onChange={e => set('price', e.target.value)}
                  min={0} placeholder="e.g. 1500"
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm font-medium outline-none focus:border-brand transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Unit</label>
                <select value={form.unit} onChange={e => set('unit', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm font-medium outline-none focus:border-brand transition-colors">
                  {['Pcs','Kg','L','Pack','Box','Bottle','Bag','Can','Dozen'].map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Category *</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm font-medium outline-none focus:border-brand transition-colors">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Stock */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Stock Count</label>
                <input type="number" value={form.stockCount} onChange={e => set('stockCount', e.target.value)}
                  min={0}
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm font-medium outline-none focus:border-brand transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Availability</label>
                <button type="button" onClick={() => set('inStock', !form.inStock)}
                  className={clsx('w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-black transition-all',
                    form.inStock ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-300 bg-red-50 text-red-600'
                  )}>
                  {form.inStock ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  {form.inStock
                    ? (language === 'fr' ? 'En stock' : language === 'rw' ? 'Biraboneka' : 'In Stock')
                    : (language === 'fr' ? 'Rupture' : language === 'rw' ? 'Ntibiraboneka' : 'Out of Stock')}
                </button>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Description (optional)</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                rows={3} placeholder="Product description visible to customers..."
                className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:border-brand transition-colors resize-none" />
            </div>
          </div>

          <div className="px-6 pb-6 flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-black text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-3 rounded-2xl bg-brand-dark text-white font-black text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
              ) : (
                <>{isNew ? <Plus className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />} {isNew ? 'Add Product' : 'Save Changes'}</>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ─── Main Admin Page ────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const router = useRouter();

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ratings, setRatings] = useState<Record<string, { total: number; avgRating: number }>>({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [prodLoading, setProdLoading] = useState(false);
  const [prodSearch, setProdSearch] = useState('');
  const [prodCategory, setProdCategory] = useState('all');
  const [prodStockFilter, setProdStockFilter] = useState<'all' | 'in' | 'out'>('all');
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Users state
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Promo codes state — loaded from real API
  const [promos, setPromos] = useState<{ code: string; discount: number; uses: number; active: boolean }[]>([]);
  const [promosLoading, setPromosLoading] = useState(false);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState(10);

  // Site settings state
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Bulk selection
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<'delivered' | 'cancelled' | ''>('');
  const [bulkUpdating, setBulkUpdating] = useState(false);

  // View
  const [activeView, setActiveView] = useState<AdminView>('orders');

  const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') ?? '' : '';
  const { isDarkMode, language } = useSimbaStore();

  const STATUS = {
    processing: { label: language === 'fr' ? 'En cours'    : language === 'rw' ? 'Ritegurwa'      : 'Processing', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock },
    delivered:  { label: language === 'fr' ? 'Livré'       : language === 'rw' ? 'Ryagezweho'     : 'Delivered',  color: 'text-green-600', bg: 'bg-green-50',  border: 'border-green-200', icon: CheckCircle2 },
    cancelled:  { label: language === 'fr' ? 'Annulé'      : language === 'rw' ? 'Ryahagaritswe'  : 'Cancelled',  color: 'text-red-600',   bg: 'bg-red-50',    border: 'border-red-200',   icon: XCircle },
  };

  /* ── Load promos from real API ── */
  const loadPromos = async () => {
    setPromosLoading(true);
    try {
      const res = await fetch('/api/admin/promos');
      const data = await res.json();
      if (data.ok) setPromos(data.promos ?? []);
    } catch { /* silent */ }
    setPromosLoading(false);
  };

  /* ── Load site settings ── */
  const loadSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.ok) setSettings(data.settings ?? {});
    } catch { /* silent */ }
  };

  /* ── Save site settings ── */
  const saveSettings = async (updates: Record<string, string>) => {
    setSettingsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.ok) {
        setSettings(prev => ({ ...prev, ...updates }));
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 2000);
      }
    } catch { /* silent */ }
    setSettingsSaving(false);
  };
  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('admin_token') ?? '';
      const [oRes, rRes] = await Promise.all([
        fetch(`${API}/admin/orders`, { headers: { 'x-admin-token': token } }),
        fetch(`${API}/reviews`),
      ]);
      const oData = await oRes.json();
      const rData = await rRes.json();
      setOrders(Array.isArray(oData) ? oData : []);
      if (rData.ok) setRatings(rData.ratings ?? {});
      setLastRefresh(new Date());
    } catch { /* silent */ }
    setLoading(false);
  };

  /* ── Load products ── */
  const loadProducts = async () => {
    setProdLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (data.ok) setProducts(data.products);
    } catch { /* silent */ }
    setProdLoading(false);
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const token = localStorage.getItem('admin_token') ?? '';
      const res = await fetch('/api/admin/users', { headers: { 'x-admin-token': token } });
      const data = await res.json();
      if (data.ok) setUsers(data.users ?? []);
    } catch { /* silent */ }
    setUsersLoading(false);
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Delete this user account?')) return;
    try {
      const token = localStorage.getItem('admin_token') ?? '';
      await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ userId }),
      });
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch { /* silent */ }
  };

  useEffect(() => {
    loadOrders();
    loadProducts();
    loadUsers();
    loadPromos();
    loadSettings();
    const iv = setInterval(loadOrders, 30000);
    return () => clearInterval(iv);
  }, []);

  /* ── Order actions ── */
  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    setUpdating(orderId);
    try {
      const token = localStorage.getItem('admin_token') ?? '';
      const res = await fetch(`${API}/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch { /* silent */ }
    setUpdating(null);
  };

  /* ── Product actions ── */
  const handleSaveProduct = async (data: Partial<Product>) => {
    const isNew = isNewProduct || !editProduct;
    const id = editProduct?.id ?? null;

    if (isNew) {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!result.ok) throw new Error(result.error ?? 'Failed');
    } else {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!result.ok) throw new Error(result.error ?? 'Failed');
    }
    await loadProducts();
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Mark "${product.name}" as out of stock / remove?`)) return;
    setDeletingId(product.id);
    try {
      await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' });
      await loadProducts();
    } catch { /* silent */ }
    setDeletingId(null);
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedOrderIds.size === 0) return;
    if (!confirm(`Mark ${selectedOrderIds.size} orders as ${bulkAction}?`)) return;
    setBulkUpdating(true);
    const token = localStorage.getItem('admin_token') ?? '';
    await Promise.all(Array.from(selectedOrderIds).map(id =>
      fetch(`${API}/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ status: bulkAction }),
      })
    ));
    setSelectedOrderIds(new Set());
    setBulkAction('');
    await loadOrders();
    setBulkUpdating(false);
  };

  const toggleOrderSelect = (id: string) => {
    setSelectedOrderIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addPromo = async () => {
    const code = newPromoCode.trim().toUpperCase();
    if (!code) return;
    try {
      const res = await fetch('/api/admin/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, discount: newPromoDiscount, active: true }),
      });
      const data = await res.json();
      if (data.ok) { setNewPromoCode(''); setNewPromoDiscount(10); await loadPromos(); }
    } catch { /* silent */ }
  };

  const togglePromo = async (code: string) => {
    const promo = promos.find(p => p.code === code);
    if (!promo) return;
    try {
      await fetch(`/api/admin/promos/${code}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !promo.active }),
      });
      await loadPromos();
    } catch { /* silent */ }
  };

  const deletePromo = async (code: string) => {
    if (!confirm(`Delete promo code ${code}?`)) return;
    try {
      await fetch(`/api/admin/promos/${code}`, { method: 'DELETE' });
      await loadPromos();
    } catch { /* silent */ }
  };

  /* ── Computed ── */
  const stats = useMemo(() => ({
    total: orders.length,
    processing: orders.filter(o => o.status === 'processing').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    revenue: orders.filter(o => o.status !== 'cancelled').reduce((a, o) => a + o.total, 0),
    todayOrders: orders.filter(o => new Date(o.date).toDateString() === new Date().toDateString()).length,
    deposits: orders.reduce((a, o) => a + (o.deposit_amount ?? 0), 0),
  }), [orders]);

  const branchStats = useMemo(() => {
    const map: Record<string, { name: string; total: number; revenue: number; processing: number; delivered: number }> = {};
    for (const o of orders) {
      const b = o.pickup_branch ?? 'Unknown';
      if (!map[b]) map[b] = { name: b, total: 0, revenue: 0, processing: 0, delivered: 0 };
      map[b].total++;
      if (o.status !== 'cancelled') map[b].revenue += o.total;
      if (o.status === 'processing') map[b].processing++;
      if (o.status === 'delivered') map[b].delivered++;
    }
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [orders]);

  // Top products by order frequency
  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; image: string; count: number; revenue: number }> = {};
    for (const o of orders) {
      for (const item of o.items) {
        if (!map[item.name]) map[item.name] = { name: item.name, image: item.image, count: 0, revenue: 0 };
        map[item.name].count += item.quantity;
        map[item.name].revenue += item.price * item.quantity;
      }
    }
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [orders]);

  // Revenue last 7 days
  const revenueByDay = useMemo(() => {
    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days[d.toLocaleDateString('en-RW', { weekday: 'short' })] = 0;
    }
    for (const o of orders) {
      if (o.status === 'cancelled') continue;
      const day = new Date(o.date).toLocaleDateString('en-RW', { weekday: 'short' });
      if (day in days) days[day] += o.total;
    }
    return Object.entries(days).map(([day, rev]) => ({ day, rev }));
  }, [orders]);

  const maxRev = Math.max(...revenueByDay.map(d => d.rev), 1);

  const filteredOrders = useMemo(() =>
    orders
      .filter(o => statusFilter === 'all' || o.status === statusFilter)
      .filter(o => branchFilter === 'all' || o.pickup_branch === branchFilter)
      .filter(o => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return o.id.toLowerCase().includes(q) ||
          (o.customer_name ?? '').toLowerCase().includes(q) ||
          o.items.some(i => i.name.toLowerCase().includes(q));
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [orders, statusFilter, branchFilter, search]
  );

  const filteredProducts = useMemo(() =>
    products
      .filter(p => prodCategory === 'all' || p.category === prodCategory)
      .filter(p => prodStockFilter === 'all' || (prodStockFilter === 'in' ? p.inStock : !p.inStock))
      .filter(p => !prodSearch.trim() || p.name.toLowerCase().includes(prodSearch.toLowerCase()) || p.category.toLowerCase().includes(prodSearch.toLowerCase())),
    [products, prodCategory, prodStockFilter, prodSearch]
  );

  const productCategories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return Array.from(cats).sort();
  }, [products]);

  const prodStats = useMemo(() => ({
    total: products.length,
    inStock: products.filter(p => p.inStock).length,
    outOfStock: products.filter(p => !p.inStock).length,
    additions: products.filter(p => p.source === 'addition').length,
    overrides: products.filter(p => p.source === 'override').length,
  }), [products]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">

      {/* ── SIDEBAR ── */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 sticky top-0 h-screen overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="w-8 h-8 bg-brand rounded-xl flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-4 h-4 text-gray-900" />
          </div>
          <div>
            <p className="font-black text-gray-900 dark:text-white text-sm leading-none">Simba Admin</p>
            <p className="text-gray-400 text-[10px] mt-0.5">Central Operations</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {([
            { id: 'orders',   label: 'Orders',   icon: Package,    badge: stats.processing > 0 ? stats.processing : undefined },
            { id: 'products', label: 'Products', icon: ShoppingBag },
            { id: 'branches', label: 'Branches', icon: Store },
            { id: 'promos',   label: 'Promos',   icon: Tag,        badge: promos.filter(p => p.active).length > 0 ? promos.filter(p => p.active).length : undefined },
            { id: 'users',    label: 'Users',    icon: Users },
            { id: 'settings', label: 'Settings', icon: Settings },
          ] as { id: AdminView; label: string; icon: any; badge?: number }[]).map(item => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button key={item.id} onClick={() => setActiveView(item.id)}
                className={clsx('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left',
                  active ? 'bg-brand text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                )}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && (
                  <span className={clsx('text-[10px] font-black px-1.5 py-0.5 rounded-full',
                    active ? 'bg-white/25 text-white' : 'bg-brand/10 text-brand-dark dark:text-brand'
                  )}>{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800 space-y-1">
          <button onClick={() => { loadOrders(); loadProducts(); loadPromos(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5 text-gray-900" />
            </div>
            <span className="font-black text-gray-900 dark:text-white text-sm">Simba Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { loadOrders(); loadProducts(); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
            <button onClick={handleLogout} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
              <LogOut className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </header>

        {/* Mobile tab bar */}
        <div className="lg:hidden flex overflow-x-auto bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-2" style={{ scrollbarWidth: 'none' }}>
          {([
            { id: 'orders',   label: 'Orders',   icon: Package },
            { id: 'products', label: 'Products', icon: ShoppingBag },
            { id: 'branches', label: 'Branches', icon: Store },
            { id: 'promos',   label: 'Promos',   icon: Tag },
            { id: 'users',    label: 'Users',    icon: Users },
            { id: 'settings', label: 'Settings', icon: Settings },
          ] as { id: AdminView; label: string; icon: any }[]).map(item => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button key={item.id} onClick={() => setActiveView(item.id)}
                className={clsx('flex-shrink-0 flex flex-col items-center gap-0.5 px-4 py-2.5 text-[10px] font-bold border-b-2 transition-colors',
                  active ? 'border-brand text-brand-dark dark:text-brand' : 'border-transparent text-gray-400 hover:text-gray-600'
                )}>
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 space-y-6">

          {/* ── Page header ── */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-gray-900 dark:text-white capitalize">
                {activeView === 'orders' ? `Orders` : activeView === 'products' ? 'Products' : activeView === 'branches' ? 'Branches' : activeView === 'promos' ? 'Promo Codes' : activeView === 'users' ? 'Users' : 'Settings'}
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {activeView === 'orders' && `Last updated: ${lastRefresh.toLocaleTimeString()} · Auto-refreshes every 30s`}
                {activeView === 'products' && `${prodStats.inStock} in stock · ${prodStats.outOfStock} out of stock`}
                {activeView === 'branches' && `${branchStats.length} branches with order activity`}
                {activeView === 'promos' && `${promos.filter(p => p.active).length} active codes`}
                {activeView === 'users' && `${users.length} registered users`}
                {activeView === 'settings' && 'Site configuration and feature flags'}
              </p>
            </div>
            {activeView === 'products' && (
              <button onClick={() => { setEditProduct(null); setIsNewProduct(true); setShowProductModal(true); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-brand-dark text-white rounded-xl text-sm font-black hover:bg-gray-800 transition-colors shadow-sm">
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            )}
          </div>

          {/* ── KPI Cards (orders view) ── */}
          {activeView === 'orders' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {[
                { label: 'Total',      value: stats.total,                            color: 'text-gray-900 dark:text-white',   bg: 'bg-white dark:bg-gray-900', icon: Package },
                { label: 'Today',      value: stats.todayOrders,                      color: 'text-blue-600',                   bg: 'bg-blue-50 dark:bg-blue-900/20', icon: TrendingUp },
                { label: 'Processing', value: stats.processing,                       color: 'text-amber-600',                  bg: 'bg-amber-50 dark:bg-amber-900/20', icon: Clock },
                { label: 'Delivered',  value: stats.delivered,                        color: 'text-green-600',                  bg: 'bg-green-50 dark:bg-green-900/20', icon: CheckCircle2 },
                { label: 'Cancelled',  value: stats.cancelled,                        color: 'text-red-500',                    bg: 'bg-red-50 dark:bg-red-900/20', icon: XCircle },
                { label: 'Revenue',    value: `${(stats.revenue/1000).toFixed(0)}K`,  color: 'text-brand-dark dark:text-brand', bg: 'bg-brand-muted dark:bg-brand/10', icon: DollarSign },
                { label: 'Deposits',   value: `${(stats.deposits/1000).toFixed(0)}K`, color: 'text-purple-600',                 bg: 'bg-purple-50 dark:bg-purple-900/20', icon: Bike },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className={`${bg} rounded-2xl border border-gray-100 dark:border-gray-800 p-4`}>
                  <Icon className={`w-4 h-4 ${color} mb-3 opacity-70`} />
                  <p className={`font-black text-2xl leading-none ${color}`}>{value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1.5">{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* ══ ORDERS VIEW ══ */}
          {activeView === 'orders' && (
            <div className="space-y-4">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:border-brand transition-colors">
                  <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search by order ID, customer or product..."
                    className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400" />
                  {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-gray-400" /></button>}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(['all','processing','delivered','cancelled'] as StatusFilter[]).map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)}
                      className={clsx('px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all border',
                        statusFilter === s ? 'bg-brand-dark text-white border-brand-dark dark:bg-brand dark:text-gray-900' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-brand-dark'
                      )}>
                      {s === 'all' ? `All (${orders.length})` : `${s.charAt(0).toUpperCase()+s.slice(1)} (${orders.filter(o=>o.status===s).length})`}
                    </button>
                  ))}
                </div>
              </div>

              {branchFilter !== 'all' && (
                <div className="flex items-center gap-2 px-3 py-2 bg-brand-muted dark:bg-brand/10 rounded-xl w-fit">
                  <Store className="w-3.5 h-3.5 text-brand" />
                  <span className="text-xs font-bold text-brand-dark dark:text-brand">{branchFilter}</span>
                  <button onClick={() => setBranchFilter('all')}><X className="w-3.5 h-3.5 text-brand-dark" /></button>
                </div>
              )}

              {/* Bulk actions */}
              {selectedOrderIds.size > 0 && (
                <div className="flex items-center gap-3 px-4 py-3 bg-brand-dark rounded-xl">
                  <span className="text-white font-black text-sm">{selectedOrderIds.size} selected</span>
                  <div className="flex gap-2 ml-auto">
                    <select value={bulkAction} onChange={e => setBulkAction(e.target.value as any)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-bold border border-white/20 outline-none">
                      <option value="">Choose action...</option>
                      <option value="delivered">Mark Delivered</option>
                      <option value="cancelled">Mark Cancelled</option>
                    </select>
                    <button onClick={handleBulkAction} disabled={!bulkAction || bulkUpdating}
                      className="px-4 py-1.5 bg-brand text-gray-900 rounded-lg text-xs font-black hover:bg-brand-light disabled:opacity-50 transition-colors">
                      {bulkUpdating ? 'Updating...' : 'Apply'}
                    </button>
                    <button onClick={() => setSelectedOrderIds(new Set())}
                      className="px-3 py-1.5 bg-white/10 text-white rounded-lg text-xs font-bold hover:bg-white/20 transition-colors">
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Orders table */}
              {loading ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-16 flex justify-center">
                  <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-16 text-center">
                  <Package className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                  <p className="font-black text-gray-900 dark:text-white mb-1">No orders found</p>
                  <p className="text-sm text-gray-400">{orders.length === 0 ? 'Orders will appear here once customers place them.' : 'Try a different filter.'}</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                  {/* Table header */}
                  <div className="hidden sm:grid grid-cols-[32px_1fr_160px_100px_120px_140px_80px] gap-4 px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    {['', 'Order', 'Branch', 'Total', 'Date', 'Status', ''].map((h,i) => (
                      <p key={i} className="text-[10px] font-black uppercase tracking-widest text-gray-400">{h}</p>
                    ))}
                  </div>
                  <div className="divide-y divide-gray-50 dark:divide-gray-800">
                    {filteredOrders.map((order, i) => {
                      const cfg = STATUS[order.status];
                      const StatusIcon = cfg.icon;
                      return (
                        <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.01, 0.2) }}
                          className="grid grid-cols-1 sm:grid-cols-[32px_1fr_160px_100px_120px_140px_80px] gap-3 sm:gap-4 px-5 py-3.5 hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors cursor-pointer"
                          onClick={() => setSelectedOrder(order)}>
                          <div className="hidden sm:flex items-center" onClick={e => e.stopPropagation()}>
                            <input type="checkbox" checked={selectedOrderIds.has(order.id)} onChange={() => toggleOrderSelect(order.id)}
                              className="w-4 h-4 rounded accent-brand cursor-pointer" />
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1 flex-shrink-0">
                              {order.items.slice(0,2).map(item => (
                                <div key={item.id} className="relative w-8 h-8 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="32px" />
                                </div>
                              ))}
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-sm text-gray-900 dark:text-white">#{order.id}</p>
                              <p className="text-xs text-gray-400 truncate">{order.customer_name ?? `${order.items.length} item${order.items.length!==1?'s':''}`}</p>
                            </div>
                          </div>
                          <div className="hidden sm:flex items-center">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 truncate">{order.pickup_branch?.replace('Simba Supermarket ','') ?? '—'}</p>
                          </div>
                          <div className="hidden sm:flex items-center">
                            <p className="font-bold text-sm text-gray-900 dark:text-white">{order.total.toLocaleString()}<span className="text-xs text-gray-400 font-normal ml-1">RWF</span></p>
                          </div>
                          <div className="hidden sm:flex items-center">
                            <div>
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{new Date(order.date).toLocaleDateString('en-RW',{day:'numeric',month:'short'})}</p>
                              <p className="text-xs text-gray-400">{new Date(order.date).toLocaleTimeString('en-RW',{hour:'2-digit',minute:'2-digit'})}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black border', cfg.bg, cfg.color, cfg.border)}>
                              <StatusIcon className="w-3 h-3" />
                              {cfg.label}
                            </span>
                          </div>
                          <div className="hidden sm:flex items-center justify-end">
                            <button onClick={e => { e.stopPropagation(); setSelectedOrder(order); }}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                              <Eye className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ PRODUCTS VIEW ══ */}
          {activeView === 'products' && (
            <div className="space-y-4">
              {/* Product KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Total', value: prodStats.total, color: 'text-gray-900 dark:text-white', bg: 'bg-white dark:bg-gray-900', icon: Package },
                  { label: 'In Stock', value: prodStats.inStock, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', icon: CheckCircle2 },
                  { label: 'Out of Stock', value: prodStats.outOfStock, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', icon: XCircle },
                  { label: 'Added by Admin', value: prodStats.additions, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: Plus },
                ].map(({ label, value, color, bg, icon: Icon }) => (
                  <div key={label} className={`${bg} rounded-2xl border border-gray-100 dark:border-gray-800 p-4`}>
                    <Icon className={`w-4 h-4 ${color} mb-3 opacity-70`} />
                    <p className={`font-black text-2xl leading-none ${color}`}>{value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:border-brand transition-colors">
                  <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input value={prodSearch} onChange={e => setProdSearch(e.target.value)}
                    placeholder="Search products by name or category..."
                    className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400" />
                  {prodSearch && <button onClick={() => setProdSearch('')}><X className="w-4 h-4 text-gray-400" /></button>}
                </div>
                <div className="flex gap-2">
                  <select value={prodCategory} onChange={e => setProdCategory(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-300 outline-none focus:border-brand transition-colors">
                    <option value="all">All Categories</option>
                    {productCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={prodStockFilter} onChange={e => setProdStockFilter(e.target.value as any)}
                    className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-300 outline-none focus:border-brand transition-colors">
                    <option value="all">All Stock</option>
                    <option value="in">In Stock</option>
                    <option value="out">Out of Stock</option>
                  </select>
                </div>
              </div>
              <p className="text-xs text-gray-400">{filteredProducts.length} products shown</p>

              {prodLoading ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-16 flex justify-center">
                  <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-16 text-center">
                  <Package className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                  <p className="font-black text-gray-900 dark:text-white mb-1">No products found</p>
                  <p className="text-sm text-gray-400">Try a different search or filter.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProducts.map((product, i) => (
                    <motion.div key={product.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i*0.02, 0.3) }}
                      className={clsx('bg-white dark:bg-gray-900 rounded-2xl border overflow-hidden group hover:shadow-md transition-all',
                        !product.inStock ? 'border-red-200 dark:border-red-900/50' : product.source==='addition' ? 'border-blue-200 dark:border-blue-900/50' : product.source==='override' ? 'border-amber-200 dark:border-amber-900/50' : 'border-gray-100 dark:border-gray-800'
                      )}>
                      <div className="relative aspect-square bg-gray-50 dark:bg-gray-800 overflow-hidden">
                        {product.image
                          ? <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="300px" />
                          : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-12 h-12 text-gray-200" /></div>
                        }
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {!product.inStock && <span className="px-2 py-0.5 bg-red-500 text-white text-[9px] font-black rounded-full uppercase">Out of stock</span>}
                          {product.source==='addition' && <span className="px-2 py-0.5 bg-blue-500 text-white text-[9px] font-black rounded-full uppercase">New</span>}
                          {product.source==='override' && <span className="px-2 py-0.5 bg-amber-500 text-white text-[9px] font-black rounded-full uppercase">Edited</span>}
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                          <button onClick={() => { setEditProduct(product); setIsNewProduct(false); setShowProductModal(true); }}
                            className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg hover:bg-brand hover:text-gray-900 transition-colors">
                            <Pencil className="w-4 h-4 text-gray-700" />
                          </button>
                          <button onClick={() => handleDeleteProduct(product)} disabled={deletingId===product.id}
                            className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg hover:bg-red-500 transition-colors">
                            {deletingId===product.id ? <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"/> : <Trash2 className="w-4 h-4 text-red-500" />}
                          </button>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="font-black text-sm text-gray-900 dark:text-white line-clamp-1 mb-0.5">{product.name}</p>
                        <p className="text-xs text-gray-400 mb-2">{product.category} · {product.unit}</p>
                        <div className="flex items-center justify-between">
                          <p className="font-black text-brand-dark dark:text-brand">{product.price.toLocaleString()} <span className="text-xs text-gray-400 font-normal">RWF</span></p>
                          <span className={clsx('text-[10px] font-black px-2 py-0.5 rounded-full', product.inStock ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600')}>
                            {product.inStock ? `${product.stockCount??'—'} left` : 'Out'}
                          </span>
                        </div>
                      </div>
                      <div className="px-3 pb-3 grid grid-cols-2 gap-2">
                        <button onClick={() => { setEditProduct(product); setIsNewProduct(false); setShowProductModal(true); }}
                          className="py-2 bg-gray-50 dark:bg-gray-800 hover:bg-brand-muted dark:hover:bg-brand/10 rounded-xl text-xs font-black text-gray-600 dark:text-gray-300 hover:text-brand-dark dark:hover:text-brand transition-colors flex items-center justify-center gap-1.5">
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button onClick={() => handleDeleteProduct(product)} disabled={deletingId===product.id}
                          className="py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl text-xs font-black text-red-500 transition-colors flex items-center justify-center gap-1.5">
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ BRANCHES VIEW ══ */}
          {activeView === 'branches' && (
            <div className="space-y-3">
              {branchStats.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-16 text-center">
                  <Store className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                  <p className="font-black text-gray-900 dark:text-white">No branch activity yet</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="hidden sm:grid grid-cols-[1fr_80px_120px_80px_80px_100px_120px] gap-4 px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    {['Branch', 'Orders', 'Revenue', 'Active', 'Done', 'Rating', ''].map((h, i) => (
                      <p key={i} className="text-[10px] font-black uppercase tracking-widest text-gray-400">{h}</p>
                    ))}
                  </div>
                  <div className="divide-y divide-gray-50 dark:divide-gray-800">
                    {branchStats.map((b, i) => {
                      const branchId = b.name.toLowerCase().replace('simba supermarket ', '').replace(/\s+/g, '_');
                      const rating = ratings[branchId];
                      const maxRev2 = Math.max(...branchStats.map(x => x.revenue), 1);
                      return (
                        <motion.div key={b.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                          className="grid grid-cols-1 sm:grid-cols-[1fr_80px_120px_80px_80px_100px_120px] gap-3 sm:gap-4 px-5 py-4 hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-brand-muted dark:bg-brand/10 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Store className="w-4 h-4 text-brand" />
                            </div>
                            <div>
                              <p className="font-black text-sm text-gray-900 dark:text-white">{b.name.replace('Simba Supermarket ','')}</p>
                              <div className="mt-1 h-1 w-24 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-brand rounded-full" style={{ width: `${(b.revenue/maxRev2)*100}%` }} />
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center"><p className="font-black text-sm text-gray-900 dark:text-white">{b.total}</p></div>
                          <div className="flex items-center"><p className="font-bold text-sm text-gray-700 dark:text-gray-300">{b.revenue.toLocaleString()} RWF</p></div>
                          <div className="flex items-center"><span className="px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-black">{b.processing}</span></div>
                          <div className="flex items-center"><span className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-xs font-black">{b.delivered}</span></div>
                          <div className="flex items-center">
                            {rating?.avgRating ? (
                              <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span className="text-sm font-black text-gray-900 dark:text-white">{rating.avgRating}</span>
                                <span className="text-xs text-gray-400">({rating.total})</span>
                              </div>
                            ) : <span className="text-xs text-gray-400">—</span>}
                          </div>
                          <div className="flex items-center justify-end">
                            <button onClick={() => { setBranchFilter(b.name); setActiveView('orders'); }}
                              className="px-3 py-1.5 bg-brand-dark dark:bg-brand dark:text-gray-900 text-white rounded-lg text-xs font-black hover:bg-gray-800 transition-colors">
                              View Orders
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Revenue chart */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                <p className="text-sm font-black text-gray-900 dark:text-white mb-4">Revenue — Last 7 Days</p>
                <div className="flex items-end gap-2 h-32">
                  {revenueByDay.map(({ day, rev }) => (
                    <div key={day} className="flex-1 flex flex-col items-center gap-1">
                      <p className="text-[9px] font-bold text-gray-500 dark:text-gray-400">{rev > 0 ? `${(rev/1000).toFixed(0)}K` : ''}</p>
                      <div className="w-full bg-brand rounded-t-lg transition-all" style={{ height: `${Math.max(4, (rev/maxRev)*96)}px` }} />
                      <p className="text-[9px] font-bold text-gray-400">{day}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top products */}
              {topProducts.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                  <p className="text-sm font-black text-gray-900 dark:text-white mb-4">Top Selling Products</p>
                  <div className="space-y-3">
                    {topProducts.map((p, i) => (
                      <div key={p.name} className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-xs font-black text-gray-500">{i+1}</span>
                        <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                          <Image src={p.image} alt={p.name} fill className="object-cover" sizes="36px" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.count} units sold</p>
                        </div>
                        <p className="font-black text-sm text-gray-900 dark:text-white flex-shrink-0">{p.revenue.toLocaleString()} RWF</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ PROMOS VIEW ══ */}
          {activeView === 'promos' && (
            <div className="space-y-5 max-w-2xl">
              {/* Create form */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                <p className="text-sm font-black text-gray-900 dark:text-white mb-4">Create New Promo Code</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input value={newPromoCode} onChange={e => setNewPromoCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} placeholder="e.g. SUMMER20" maxLength={12}
                    className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-black uppercase outline-none focus:border-brand transition-colors dark:text-white" />
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <input type="number" min={1} max={50} value={newPromoDiscount} onChange={e => setNewPromoDiscount(Number(e.target.value))}
                      className="w-16 bg-transparent text-sm font-black outline-none text-gray-900 dark:text-white" />
                    <span className="text-sm font-black text-gray-400">% off</span>
                  </div>
                  <button onClick={addPromo} disabled={!newPromoCode.trim()}
                    className="flex items-center justify-center gap-2 px-5 py-3 bg-brand-dark text-white rounded-xl text-sm font-black hover:bg-gray-800 disabled:opacity-50 transition-colors">
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
              </div>

              {/* Promo list */}
              {promosLoading ? (
                <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" /></div>
              ) : promos.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-12 text-center">
                  <Tag className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                  <p className="font-black text-gray-900 dark:text-white">No promo codes yet</p>
                  <p className="text-sm text-gray-400 mt-1">Create your first code above</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="hidden sm:grid grid-cols-[1fr_80px_80px_100px_100px] gap-4 px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    {['Code', 'Discount', 'Uses', 'Status', ''].map((h,i) => (
                      <p key={i} className="text-[10px] font-black uppercase tracking-widest text-gray-400">{h}</p>
                    ))}
                  </div>
                  <div className="divide-y divide-gray-50 dark:divide-gray-800">
                    {promos.map(promo => (
                      <div key={promo.code} className={clsx('grid grid-cols-1 sm:grid-cols-[1fr_80px_80px_100px_100px] gap-3 sm:gap-4 px-5 py-4 transition-colors', !promo.active && 'opacity-50')}>
                        <div className="flex items-center gap-3">
                          <div className={clsx('px-3 py-1.5 rounded-xl font-black text-sm tracking-widest', promo.active ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400')}>
                            {promo.code}
                          </div>
                        </div>
                        <div className="flex items-center"><p className="font-black text-gray-900 dark:text-white">{promo.discount}%</p></div>
                        <div className="flex items-center"><p className="text-sm text-gray-500 dark:text-gray-400">{promo.uses ?? 0}</p></div>
                        <div className="flex items-center">
                          <span className={clsx('px-2.5 py-1 rounded-full text-xs font-black', promo.active ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500')}>
                            {promo.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => togglePromo(promo.code)}
                            className="px-3 py-1.5 rounded-lg text-xs font-black transition-colors bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
                            {promo.active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button onClick={() => deletePromo(promo.code)}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ USERS VIEW ══ */}
          {activeView === 'users' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button onClick={loadUsers} className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:border-brand transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
              </div>
              {usersLoading ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-16 flex justify-center">
                  <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                </div>
              ) : users.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-16 text-center">
                  <Users className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                  <p className="font-black text-gray-900 dark:text-white">No users yet</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="hidden sm:grid grid-cols-[1fr_200px_120px_90px_60px] gap-4 px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    {['User', 'Email', 'Phone', 'Points', ''].map((h,i) => (
                      <p key={i} className="text-[10px] font-black uppercase tracking-widest text-gray-400">{h}</p>
                    ))}
                  </div>
                  <div className="divide-y divide-gray-50 dark:divide-gray-800">
                    {users.map((u, i) => (
                      <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                        className="grid grid-cols-1 sm:grid-cols-[1fr_200px_120px_90px_60px] gap-3 sm:gap-4 px-5 py-3.5 hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-brand-muted dark:bg-brand/10 rounded-full flex items-center justify-center font-black text-brand-dark dark:text-brand text-sm flex-shrink-0">
                            {u.name?.charAt(0)?.toUpperCase() ?? '?'}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-gray-900 dark:text-white">{u.name}</p>
                            <p className="text-xs text-gray-400">{new Date(u.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center"><p className="text-xs text-gray-600 dark:text-gray-300 truncate">{u.email}</p></div>
                        <div className="flex items-center"><p className="text-xs text-gray-500 dark:text-gray-400">{u.phone ?? '—'}</p></div>
                        <div className="flex items-center">
                          <span className="px-2 py-0.5 bg-brand-muted dark:bg-brand/10 text-brand-dark dark:text-brand rounded-full text-xs font-black">{u.loyalty_points ?? 0} pts</span>
                        </div>
                        <div className="flex items-center justify-end">
                          <button onClick={() => deleteUser(u.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ SETTINGS VIEW ══ */}
          {activeView === 'settings' && (
            <div className="space-y-5 max-w-2xl">
              {settingsSaved && (
                <div className="flex items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <p className="text-sm font-bold text-green-700 dark:text-green-400">Settings saved successfully</p>
                </div>
              )}

              {/* Pickup & Store */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                  <p className="font-black text-sm text-gray-900 dark:text-white">Pickup & Store Hours</p>
                  <p className="text-xs text-gray-400 mt-0.5">Deposit amount, pickup time, and operating hours</p>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                  {[
                    { key: 'deposit_amount',   label: 'Deposit Amount (RWF)',    hint: 'Upfront deposit to confirm an order' },
                    { key: 'pickup_time_min',  label: 'Min Pickup Time (min)',   hint: 'Minimum estimated pickup time' },
                    { key: 'pickup_time_max',  label: 'Max Pickup Time (min)',   hint: 'Maximum estimated pickup time' },
                    { key: 'store_open_hour',  label: 'Opens at (24h hour)',     hint: 'Store opening hour in Kigali time' },
                    { key: 'store_close_hour', label: 'Closes at (24h hour)',    hint: 'Store closing hour in Kigali time' },
                  ].map(({ key, label, hint }) => (
                    <div key={key} className="flex items-center justify-between px-5 py-4 gap-4">
                      <div>
                        <p className="font-bold text-sm text-gray-900 dark:text-white">{label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{hint}</p>
                      </div>
                      <input type="number" value={settings[key] ?? ''} onChange={e => setSettings(p => ({...p,[key]:e.target.value}))} onBlur={e => saveSettings({[key]:e.target.value})}
                        className="w-24 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-black text-right outline-none focus:border-brand transition-colors dark:text-white" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Loyalty */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                  <p className="font-black text-sm text-gray-900 dark:text-white">Loyalty Program</p>
                  <p className="text-xs text-gray-400 mt-0.5">Points earning rate and tier thresholds</p>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                  {[
                    { key: 'loyalty_earn_rate',  label: 'Earn 1 Point per X RWF', hint: 'e.g. 100 means 1 pt per 100 RWF spent' },
                    { key: 'loyalty_bronze_max', label: 'Bronze Max Points',       hint: 'Upper limit of Bronze tier' },
                    { key: 'loyalty_silver_max', label: 'Silver Max Points',       hint: 'Upper limit of Silver tier' },
                  ].map(({ key, label, hint }) => (
                    <div key={key} className="flex items-center justify-between px-5 py-4 gap-4">
                      <div>
                        <p className="font-bold text-sm text-gray-900 dark:text-white">{label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{hint}</p>
                      </div>
                      <input type="number" value={settings[key] ?? ''} onChange={e => setSettings(p => ({...p,[key]:e.target.value}))} onBlur={e => saveSettings({[key]:e.target.value})}
                        className="w-24 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-black text-right outline-none focus:border-brand transition-colors dark:text-white" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature flags */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                  <p className="font-black text-sm text-gray-900 dark:text-white">Feature Flags</p>
                  <p className="text-xs text-gray-400 mt-0.5">Enable or disable sections of the storefront</p>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                  {[
                    { key: 'feature_flash_deals',  label: 'Flash Deals Banner',    hint: 'Show the flash deals section on the homepage' },
                    { key: 'feature_deals_of_day', label: 'Deals of the Day',       hint: 'Show the daily deals section' },
                    { key: 'feature_trending',     label: 'Trending Products',      hint: 'Show the trending now section' },
                    { key: 'feature_buy_it_again', label: 'Buy It Again',           hint: 'Show repurchase suggestions for returning customers' },
                    { key: 'feature_compare',      label: 'Product Compare',        hint: 'Allow customers to compare up to 3 products' },
                    { key: 'feature_reviews',      label: 'Product Reviews',        hint: 'Allow customers to leave and read reviews' },
                    { key: 'feature_referrals',    label: 'Referral Program',       hint: 'Show the referral card in the account tab' },
                  ].map(({ key, label, hint }) => {
                    const enabled = settings[key] !== 'false';
                    return (
                      <div key={key} className="flex items-center justify-between px-5 py-4">
                        <div>
                          <p className="font-bold text-sm text-gray-900 dark:text-white">{label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{hint}</p>
                        </div>
                        <button onClick={() => saveSettings({[key]: enabled ? 'false' : 'true'})} disabled={settingsSaving}
                          className={clsx('w-11 h-6 rounded-full transition-all relative flex-shrink-0', enabled ? 'bg-brand' : 'bg-gray-200 dark:bg-gray-700')}>
                          <span className={clsx('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all', enabled ? 'left-5' : 'left-0.5')} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── Order detail drawer ── */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]" onClick={() => setSelectedOrder(null)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 z-[110] shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <p className="font-black text-gray-900 dark:text-white">Order #{selectedOrder.id}</p>
                  <p className="text-xs text-gray-400">{new Date(selectedOrder.date).toLocaleString('en-RW',{dateStyle:'medium',timeStyle:'short'})}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Status */}
                <div className={clsx('flex items-center gap-2 px-4 py-3 rounded-xl border', STATUS[selectedOrder.status].bg, STATUS[selectedOrder.status].border)}>
                  {(() => { const Icon = STATUS[selectedOrder.status].icon; return <Icon className={`w-4 h-4 ${STATUS[selectedOrder.status].color}`} />; })()}
                  <span className={`font-black text-sm ${STATUS[selectedOrder.status].color}`}>{STATUS[selectedOrder.status].label}</span>
                  <span className="ml-auto text-xs text-gray-500 dark:text-gray-400 truncate">{selectedOrder.pickup_branch?.replace('Simba Supermarket ','')}</span>
                </div>

                {/* Customer */}
                {selectedOrder.customer_name && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Customer</p>
                    <p className="font-bold text-gray-900 dark:text-white">{selectedOrder.customer_name}</p>
                    {selectedOrder.customer_phone && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{selectedOrder.customer_phone}</p>}
                  </div>
                )}

                {/* Items */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Items ({selectedOrder.items.length})</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="40px" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{item.name}</p>
                          <p className="text-xs text-gray-400">×{item.quantity} · {item.price.toLocaleString()} RWF each</p>
                        </div>
                        <p className="font-black text-sm text-gray-900 dark:text-white flex-shrink-0">{(item.price*item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order summary */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">Payment</span><span className="font-bold text-gray-900 dark:text-white">{getPaymentMethodLabel(normalizePaymentMethod(selectedOrder.payment_method), language)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">Pickup slot</span><span className="font-bold text-gray-900 dark:text-white">{selectedOrder.pickup_slot ?? 'asap'}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">Deposit paid</span><span className="font-bold text-gray-900 dark:text-white">{(selectedOrder.deposit_amount??0).toLocaleString()} RWF</span></div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-black text-gray-900 dark:text-white">Total</span>
                    <span className="font-black text-lg text-gray-900 dark:text-white">{selectedOrder.total.toLocaleString()} RWF</span>
                  </div>
                </div>

                {/* Update status */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Update Status</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(['processing','delivered','cancelled'] as Order['status'][]).map(s => {
                      const cfg = STATUS[s]; const Icon = cfg.icon; const isActive = selectedOrder.status===s;
                      return (
                        <button key={s} onClick={() => !isActive && handleStatusChange(selectedOrder.id, s)}
                          disabled={isActive || updating===selectedOrder.id}
                          className={clsx('flex flex-col items-center gap-2 py-3 rounded-xl border-2 transition-all',
                            isActive ? `${cfg.bg} ${cfg.border}` : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                          )}>
                          <Icon className={`w-5 h-5 ${isActive ? cfg.color : 'text-gray-400'}`} />
                          <span className={`text-xs font-black ${isActive ? cfg.color : 'text-gray-500 dark:text-gray-400'}`}>{cfg.label}</span>
                          {isActive && <span className="text-[9px] text-gray-400">Current</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Product modal ── */}
      <AnimatePresence>
        {showProductModal && (
          <ProductModal product={isNewProduct ? null : editProduct} categories={CATEGORIES} onSave={handleSaveProduct}
            onClose={() => { setShowProductModal(false); setEditProduct(null); setIsNewProduct(false); }} language={language} />
        )}
      </AnimatePresence>
    </div>
    </div>
  );
}
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-gray-900" />
            </div>
            <div>
              <p className="font-black text-white text-sm leading-none">Simba HQ Admin</p>
              <p className="text-white/50 text-[10px]">All Branches · Central Operations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DashboardSettingsBar />
            <button onClick={() => { loadOrders(); loadProducts(); }}
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
        {/* Tab bar */}
        <div className="flex px-4 sm:px-6 pb-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {([
            { id: 'orders',   label: `${language === 'fr' ? 'Commandes' : language === 'rw' ? 'Itumiziwa' : 'Orders'} (${orders.length})` },
            { id: 'products', label: `${language === 'fr' ? 'Produits' : language === 'rw' ? 'Ibicuruzwa' : 'Products'} (${products.length})` },
            { id: 'branches', label: `${language === 'fr' ? 'Agences' : language === 'rw' ? 'Amashami' : 'Branches'} (${branchStats.length})` },
            { id: 'promos',   label: `${language === 'fr' ? 'Promos' : language === 'rw' ? 'Promo' : 'Promos'} (${promos.filter(p => p.active).length})` },
            { id: 'users',    label: `${language === 'fr' ? 'Utilisateurs' : language === 'rw' ? 'Abakoresha' : 'Users'} (${users.length})` },
            { id: 'settings', label: language === 'fr' ? 'Paramètres' : language === 'rw' ? 'Igenamiterere' : 'Settings' },
          ] as { id: AdminView; label: string }[]).map(tab => (
            <button key={tab.id} onClick={() => setActiveView(tab.id)}
              className={clsx('flex-shrink-0 px-4 py-2.5 text-xs font-black border-b-2 transition-colors',
                activeView === tab.id ? 'border-brand text-brand' : 'border-transparent text-white/60 hover:text-white/80'
              )}>
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-5 space-y-5">

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: language === 'fr' ? 'Total commandes' : language === 'rw' ? 'Itumiziwa ryose' : 'Total Orders',   value: stats.total,                            icon: Package,      color: 'text-gray-900',   bg: 'bg-white' },
            { label: language === 'fr' ? "Aujourd'hui"     : language === 'rw' ? 'Uyu munsi'       : 'Today',          value: stats.todayOrders,                      icon: TrendingUp,   color: 'text-blue-600',   bg: 'bg-blue-50' },
            { label: language === 'fr' ? 'En cours'        : language === 'rw' ? 'Ritegurwa'        : 'Processing',     value: stats.processing,                       icon: Clock,        color: 'text-amber-600',  bg: 'bg-amber-50' },
            { label: language === 'fr' ? 'Livré'           : language === 'rw' ? 'Ryagezweho'       : 'Delivered',      value: stats.delivered,                        icon: CheckCircle2, color: 'text-green-600',  bg: 'bg-green-50' },
            { label: language === 'fr' ? 'Annulé'          : language === 'rw' ? 'Ryahagaritswe'    : 'Cancelled',      value: stats.cancelled,                        icon: XCircle,      color: 'text-red-600',    bg: 'bg-red-50' },
            { label: language === 'fr' ? 'Revenus (RWF)'   : language === 'rw' ? 'Amafaranga (RWF)' : 'Revenue (RWF)',  value: `${(stats.revenue/1000).toFixed(0)}K`,  icon: DollarSign,   color: 'text-brand-dark', bg: 'bg-brand-muted' },
            { label: language === 'fr' ? 'Dépôts (RWF)'    : language === 'rw' ? 'Inguzanyo (RWF)'  : 'Deposits (RWF)', value: `${(stats.deposits/1000).toFixed(0)}K`, icon: Bike,         color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl border border-gray-100 p-3`}>
              <Icon className={`w-4 h-4 ${color} mb-1.5`} />
              <p className={`font-black text-lg ${color} leading-none`}>{value}</p>
              <p className="text-[10px] text-gray-500 font-medium mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            PRODUCTS VIEW
        ══════════════════════════════════════════════════════════════════ */}
        {activeView === 'products' && (
          <div className="space-y-4">
            {/* Product stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: 'Total Products', value: prodStats.total,      color: 'text-gray-900',  bg: 'bg-white',       icon: Package },
                { label: 'In Stock',       value: prodStats.inStock,    color: 'text-green-600', bg: 'bg-green-50',    icon: CheckCircle2 },
                { label: 'Out of Stock',   value: prodStats.outOfStock, color: 'text-red-600',   bg: 'bg-red-50',      icon: XCircle },
                { label: 'Admin Added',    value: prodStats.additions,  color: 'text-blue-600',  bg: 'bg-blue-50',     icon: Plus },
                { label: 'Edited',         value: prodStats.overrides,  color: 'text-amber-600', bg: 'bg-amber-50',    icon: Pencil },
              ].map(({ label, value, color, bg, icon: Icon }) => (
                <div key={label} className={`${bg} rounded-2xl border border-gray-100 p-3`}>
                  <Icon className={`w-4 h-4 ${color} mb-1.5`} />
                  <p className={`font-black text-xl ${color} leading-none`}>{value}</p>
                  <p className="text-[10px] text-gray-500 font-medium mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-gray-200 focus-within:border-brand transition-colors">
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input value={prodSearch} onChange={e => setProdSearch(e.target.value)}
                  placeholder="Search products by name or category..."
                  className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400" />
                {prodSearch && <button onClick={() => setProdSearch('')}><X className="w-4 h-4 text-gray-400" /></button>}
              </div>
              <div className="flex gap-2 flex-wrap">
                <select value={prodCategory} onChange={e => setProdCategory(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 outline-none focus:border-brand transition-colors">
                  <option value="all">All Categories</option>
                  {productCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={prodStockFilter} onChange={e => setProdStockFilter(e.target.value as any)}
                  className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 outline-none focus:border-brand transition-colors">
                  <option value="all">All Stock</option>
                  <option value="in">In Stock</option>
                  <option value="out">Out of Stock</option>
                </select>
                <button onClick={() => { setEditProduct(null); setIsNewProduct(true); setShowProductModal(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-dark text-white rounded-xl text-sm font-black hover:bg-gray-800 transition-colors shadow-sm">
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-400">{filteredProducts.length} products shown</p>

            {/* Product grid */}
            {prodLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="font-black text-gray-900 mb-1">No products found</p>
                <p className="text-sm text-gray-400">Try a different search or filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product, i) => (
                  <motion.div key={product.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                    className={clsx(
                      'bg-white rounded-2xl border overflow-hidden hover:shadow-md transition-all group',
                      !product.inStock ? 'border-red-200' : product.source === 'addition' ? 'border-blue-200' : product.source === 'override' ? 'border-amber-200' : 'border-gray-100'
                    )}>
                    {/* Image */}
                    <div className="relative aspect-square bg-gray-50 overflow-hidden">
                      {product.image ? (
                        <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="300px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-gray-200" />
                        </div>
                      )}
                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {!product.inStock && (
                          <span className="px-2 py-0.5 bg-red-500 text-white text-[9px] font-black rounded-full">OUT OF STOCK</span>
                        )}
                        {product.source === 'addition' && (
                          <span className="px-2 py-0.5 bg-blue-500 text-white text-[9px] font-black rounded-full">NEW</span>
                        )}
                        {product.source === 'override' && (
                          <span className="px-2 py-0.5 bg-amber-500 text-white text-[9px] font-black rounded-full">EDITED</span>
                        )}
                      </div>
                      {/* Action overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <button onClick={() => { setEditProduct(product); setIsNewProduct(false); setShowProductModal(true); }}
                          className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg hover:bg-brand transition-colors">
                          <Pencil className="w-4 h-4 text-gray-700" />
                        </button>
                        <button onClick={() => handleDeleteProduct(product)} disabled={deletingId === product.id}
                          className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition-colors">
                          {deletingId === product.id
                            ? <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                            : <Trash2 className="w-4 h-4 text-red-500 group-hover:text-white" />}
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <p className="font-black text-sm text-gray-900 line-clamp-2 leading-snug mb-1">{product.name}</p>
                      <p className="text-[10px] text-gray-400 font-medium mb-2">{product.category} · {product.unit}</p>
                      <div className="flex items-center justify-between">
                        <p className="font-black text-brand-dark">{product.price.toLocaleString()} <span className="text-[10px] text-gray-400 font-medium">RWF</span></p>
                        <div className="flex items-center gap-1">
                          <span className={clsx('text-[10px] font-black px-2 py-0.5 rounded-full',
                            product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                          )}>
                            {product.inStock ? `${product.stockCount ?? '—'} left` : 'Out'}
                          </span>
                        </div>
                      </div>
                      {product.description && (
                        <p className="text-[10px] text-gray-400 mt-1.5 line-clamp-2">{product.description}</p>
                      )}
                    </div>

                    {/* Footer actions */}
                    <div className="px-3 pb-3 flex gap-2">
                      <button onClick={() => { setEditProduct(product); setIsNewProduct(false); setShowProductModal(true); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-100 hover:bg-brand-muted rounded-xl text-xs font-black text-gray-700 hover:text-brand-dark transition-colors">
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => handleDeleteProduct(product)} disabled={deletingId === product.id}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 rounded-xl text-xs font-black text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            BRANCHES VIEW
        ══════════════════════════════════════════════════════════════════ */}
        {activeView === 'branches' && (
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Performance by Branch</p>
            {branchStats.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <Store className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="font-black text-gray-900">No orders yet</p>
              </div>
            ) : branchStats.map((b, i) => {
              const branchId = b.name.toLowerCase().replace('simba supermarket ', '').replace(/\s+/g, '_');
              const rating = ratings[branchId];
              return (
                <motion.div key={b.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-muted rounded-xl flex items-center justify-center flex-shrink-0">
                        <Store className="w-5 h-5 text-brand" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-black text-sm text-gray-900">{b.name}</p>
                          {rating?.avgRating && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 rounded-full">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              <span className="text-xs font-black text-amber-700">{rating.avgRating}</span>
                              <span className="text-[10px] text-gray-400">({rating.total})</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{b.total} orders · {b.revenue.toLocaleString()} RWF</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <p className="font-black text-amber-600 text-lg leading-none">{b.processing}</p>
                        <p className="text-[10px] text-gray-400">Active</p>
                      </div>
                      <div className="text-center">
                        <p className="font-black text-green-600 text-lg leading-none">{b.delivered}</p>
                        <p className="text-[10px] text-gray-400">Done</p>
                      </div>
                      <button onClick={() => { setBranchFilter(b.name); setActiveView('orders'); }}
                        className="px-3 py-1.5 bg-brand-dark text-white rounded-xl text-xs font-black hover:bg-gray-800 transition-colors">
                        View Orders
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand rounded-full"
                      style={{ width: `${Math.min(100, (b.revenue / Math.max(...branchStats.map(x => x.revenue), 1)) * 100)}%` }} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            PROMOS VIEW
        ══════════════════════════════════════════════════════════════════ */}
        {activeView === 'promos' && (
          <div className="space-y-5">
            {/* Create new promo */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
                {language === 'fr' ? 'Créer un code promo' : language === 'rw' ? 'Kora kode ya promo' : 'Create Promo Code'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  value={newPromoCode}
                  onChange={e => setNewPromoCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  placeholder="e.g. SUMMER20"
                  maxLength={12}
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-black uppercase outline-none focus:border-brand transition-colors"
                />
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <input
                    type="number" min={1} max={50}
                    value={newPromoDiscount}
                    onChange={e => setNewPromoDiscount(Number(e.target.value))}
                    className="w-16 bg-transparent text-sm font-black outline-none text-gray-900"
                  />
                  <span className="text-sm font-black text-gray-400">% off</span>
                </div>
                <button onClick={addPromo} disabled={!newPromoCode.trim()}
                  className="flex items-center gap-2 px-5 py-3 bg-brand-dark text-white rounded-xl text-sm font-black hover:bg-gray-800 disabled:opacity-50 transition-colors">
                  <Plus className="w-4 h-4" />
                  {language === 'fr' ? 'Ajouter' : language === 'rw' ? 'Ongeraho' : 'Add Code'}
                </button>
              </div>
            </div>

            {/* Promo list */}
            <div className="space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                {language === 'fr' ? 'Codes actifs' : language === 'rw' ? 'Kode zikoreshwa' : 'Active Codes'} ({promos.filter(p => p.active).length})
              </p>
              {promos.map(promo => (
                <div key={promo.code} className={clsx(
                  'flex items-center gap-4 p-4 bg-white rounded-2xl border transition-all',
                  promo.active ? 'border-green-200' : 'border-gray-100 opacity-60'
                )}>
                  <div className={clsx('px-4 py-2 rounded-xl font-black text-sm tracking-widest', promo.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400')}>
                    {promo.code}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-gray-900">{promo.discount}% discount</p>
                    <p className="text-xs text-gray-400">{promo.uses} uses</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => togglePromo(promo.code)}
                      className={clsx('px-3 py-1.5 rounded-xl text-xs font-black transition-colors',
                        promo.active ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-green-50 text-green-700 hover:bg-green-100'
                      )}>
                      {promo.active
                        ? (language === 'fr' ? 'Désactiver' : language === 'rw' ? 'Hagarika' : 'Deactivate')
                        : (language === 'fr' ? 'Activer' : language === 'rw' ? 'Fungura' : 'Activate')}
                    </button>
                    <button onClick={() => deletePromo(promo.code)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Revenue by day chart */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
                {language === 'fr' ? 'Revenus 7 derniers jours' : language === 'rw' ? 'Amafaranga - Iminsi 7' : 'Revenue — Last 7 Days'}
              </p>
              <div className="flex items-end gap-2 h-32">
                {revenueByDay.map(({ day, rev }) => (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1">
                    <p className="text-[9px] font-black text-gray-500">{rev > 0 ? `${(rev/1000).toFixed(0)}K` : ''}</p>
                    <div className="w-full bg-brand rounded-t-lg transition-all" style={{ height: `${Math.max(4, (rev / maxRev) * 96)}px` }} />
                    <p className="text-[9px] font-bold text-gray-400">{day}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top products */}
            {topProducts.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
                  {language === 'fr' ? 'Produits les plus vendus' : language === 'rw' ? 'Ibicuruzwa bikunzwe' : 'Top Selling Products'}
                </p>
                <div className="space-y-3">
                  {topProducts.map((p, i) => (
                    <div key={p.name} className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-brand-muted rounded-lg flex items-center justify-center text-xs font-black text-brand-dark flex-shrink-0">{i + 1}</span>
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image src={p.image} alt={p.name} fill className="object-cover" sizes="40px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-900 truncate">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.count} units sold</p>
                      </div>
                      <p className="font-black text-sm text-gray-900">{p.revenue.toLocaleString()} RWF</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            USERS VIEW
        ══════════════════════════════════════════════════════════════════ */}
        {activeView === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                {language === 'fr' ? `${users.length} utilisateurs enregistrés` : language === 'rw' ? `Abakoresha ${users.length} biyandikishije` : `${users.length} registered users`}
              </p>
              <button onClick={loadUsers} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-dark text-white rounded-xl text-xs font-black hover:bg-gray-800 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
                {language === 'fr' ? 'Actualiser' : language === 'rw' ? 'Vugurura' : 'Refresh'}
              </button>
            </div>

            {usersLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="font-black text-gray-900">
                  {language === 'fr' ? 'Aucun utilisateur' : language === 'rw' ? 'Nta bakoresha' : 'No users yet'}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="hidden sm:grid grid-cols-[1fr_200px_120px_100px_80px] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100">
                  {['User', 'Email', 'Phone', 'Points', 'Action'].map(h => (
                    <p key={h} className="text-[10px] font-black uppercase tracking-widest text-gray-400">{h}</p>
                  ))}
                </div>
                <div className="divide-y divide-gray-50">
                  {users.map((u, i) => (
                    <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className="grid grid-cols-1 sm:grid-cols-[1fr_200px_120px_100px_80px] gap-3 sm:gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-muted rounded-full flex items-center justify-center font-black text-brand-dark text-sm flex-shrink-0">
                          {u.name?.charAt(0)?.toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <p className="font-black text-sm text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-400">{new Date(u.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center"><p className="text-xs text-gray-600 truncate">{u.email}</p></div>
                      <div className="flex items-center"><p className="text-xs text-gray-600">{u.phone ?? '—'}</p></div>
                      <div className="flex items-center">
                        <span className="px-2 py-0.5 bg-brand-muted text-brand-dark rounded-full text-xs font-black">{u.loyalty_points ?? 0} pts</span>
                      </div>
                      <div className="flex items-center">
                        <button onClick={() => deleteUser(u.id)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SETTINGS VIEW
        ══════════════════════════════════════════════════════════════════ */}
        {activeView === 'settings' && (
          <div className="space-y-6 max-w-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-black text-gray-900 dark:text-white text-lg">Site Settings</h2>
                <p className="text-sm text-gray-400">Control features and configuration for the whole site</p>
              </div>
              {settingsSaved && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-xl text-xs font-black border border-green-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                </span>
              )}
            </div>

            {/* ── Pickup & Payments ── */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Pickup &amp; Payments</p>
              </div>
              <div className="divide-y divide-gray-50">
                {[
                  { key: 'deposit_amount',    label: 'Pickup Deposit (RWF)',    type: 'number', hint: 'Amount paid upfront to confirm order' },
                  { key: 'pickup_time_min',   label: 'Pickup Time Min (min)',   type: 'number', hint: 'Minimum estimated pickup time' },
                  { key: 'pickup_time_max',   label: 'Pickup Time Max (min)',   type: 'number', hint: 'Maximum estimated pickup time' },
                  { key: 'store_open_hour',   label: 'Store Opens (24h)',       type: 'number', hint: 'Hour the store opens (Kigali time)' },
                  { key: 'store_close_hour',  label: 'Store Closes (24h)',      type: 'number', hint: 'Hour the store closes (Kigali time)' },
                ].map(({ key, label, type, hint }) => (
                  <div key={key} className="flex items-center justify-between px-5 py-4 gap-4">
                    <div>
                      <p className="font-bold text-sm text-gray-900">{label}</p>
                      <p className="text-xs text-gray-400">{hint}</p>
                    </div>
                    <input
                      type={type}
                      value={settings[key] ?? ''}
                      onChange={e => setSettings(prev => ({ ...prev, [key]: e.target.value }))}
                      onBlur={e => saveSettings({ [key]: e.target.value })}
                      className="w-24 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm font-black text-right outline-none focus:border-brand transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ── Loyalty Program ── */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Loyalty Program</p>
              </div>
              <div className="divide-y divide-gray-50">
                {[
                  { key: 'loyalty_earn_rate',   label: '1 Point Per X RWF Spent', hint: 'e.g. 100 = earn 1 pt per 100 RWF' },
                  { key: 'loyalty_bronze_max',  label: 'Bronze Tier Max Points',  hint: 'Points threshold to exit Bronze' },
                  { key: 'loyalty_silver_max',  label: 'Silver Tier Max Points',  hint: 'Points threshold to exit Silver' },
                ].map(({ key, label, hint }) => (
                  <div key={key} className="flex items-center justify-between px-5 py-4 gap-4">
                    <div>
                      <p className="font-bold text-sm text-gray-900">{label}</p>
                      <p className="text-xs text-gray-400">{hint}</p>
                    </div>
                    <input
                      type="number"
                      value={settings[key] ?? ''}
                      onChange={e => setSettings(prev => ({ ...prev, [key]: e.target.value }))}
                      onBlur={e => saveSettings({ [key]: e.target.value })}
                      className="w-24 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm font-black text-right outline-none focus:border-brand transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ── Feature Flags ── */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Feature Flags</p>
              </div>
              <div className="divide-y divide-gray-50">
                {[
                  { key: 'feature_flash_deals',  label: 'Flash Deals Banner',     hint: 'Show / hide the Flash Deals section' },
                  { key: 'feature_deals_of_day', label: 'Deals of the Day',        hint: 'Show / hide the Deals of the Day section' },
                  { key: 'feature_trending',     label: 'Trending Products',       hint: 'Show / hide the Trending Now section' },
                  { key: 'feature_buy_it_again', label: 'Buy It Again',            hint: 'Show / hide Buy It Again for returning customers' },
                  { key: 'feature_compare',      label: 'Product Compare',         hint: 'Allow customers to compare products' },
                  { key: 'feature_reviews',      label: 'Product Reviews',         hint: 'Allow customers to leave product reviews' },
                  { key: 'feature_referrals',    label: 'Referral Program',        hint: 'Show referral card and track referrals' },
                ].map(({ key, label, hint }) => {
                  const enabled = settings[key] !== 'false';
                  return (
                    <div key={key} className="flex items-center justify-between px-5 py-4">
                      <div>
                        <p className="font-bold text-sm text-gray-900">{label}</p>
                        <p className="text-xs text-gray-400">{hint}</p>
                      </div>
                      <button
                        onClick={() => saveSettings({ [key]: enabled ? 'false' : 'true' })}
                        disabled={settingsSaving}
                        className={clsx('w-12 h-6 rounded-full transition-all relative flex-shrink-0', enabled ? 'bg-brand' : 'bg-gray-200')}
                      >
                        <span className={clsx('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all', enabled ? 'left-6' : 'left-0.5')} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Flash Deal Config ── */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Flash Deals</p>
              </div>
              <div className="divide-y divide-gray-50">
                <div className="flex items-center justify-between px-5 py-4 gap-4">
                  <div>
                    <p className="font-bold text-sm text-gray-900">Rotation Every X Hours</p>
                    <p className="text-xs text-gray-400">How often flash deals rotate</p>
                  </div>
                  <input
                    type="number" min={1} max={24}
                    value={settings['flash_deal_duration_h'] ?? '4'}
                    onChange={e => setSettings(prev => ({ ...prev, flash_deal_duration_h: e.target.value }))}
                    onBlur={e => saveSettings({ flash_deal_duration_h: e.target.value })}
                    className="w-24 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm font-black text-right outline-none focus:border-brand transition-colors"
                  />
                </div>
                <div className="px-5 py-4">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    To set flash deal products and real discounts, create promo codes of type <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-brand-dark">flash</span> in the Promos tab. Products with active flash promos appear in the Flash Deals banner automatically.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => saveSettings(settings)}
              disabled={settingsSaving}
              className="w-full py-3.5 bg-brand-dark text-white rounded-2xl font-black text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Settings className="w-4 h-4" />
              {settingsSaving ? 'Saving...' : 'Save All Settings'}
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            ORDERS VIEW
        ══════════════════════════════════════════════════════════════════ */}
        {activeView === 'orders' && (
          <>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-gray-200 focus-within:border-brand transition-colors">
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by order ID, customer or product..."
                  className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400" />
                {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-gray-400" /></button>}
              </div>
              <div className="flex gap-2 flex-wrap">
                {(['all', 'processing', 'delivered', 'cancelled'] as StatusFilter[]).map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={clsx('px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all border',
                      statusFilter === s ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-dark'
                    )}>
                    {s === 'all' ? `All (${orders.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${orders.filter(o => o.status === s).length})`}
                  </button>
                ))}
              </div>
            </div>

            {branchFilter !== 'all' && (
              <div className="flex items-center gap-2 px-3 py-2 bg-brand-muted rounded-xl w-fit">
                <Store className="w-3.5 h-3.5 text-brand" />
                <span className="text-xs font-bold text-brand-dark">{branchFilter}</span>
                <button onClick={() => setBranchFilter('all')}><X className="w-3.5 h-3.5 text-brand-dark" /></button>
              </div>
            )}

            <p className="text-xs text-gray-400">Last updated: {lastRefresh.toLocaleTimeString()} · Auto-refreshes every 30s</p>

            {/* Bulk action bar */}
            {selectedOrderIds.size > 0 && (
              <div className="flex items-center gap-3 px-4 py-3 bg-brand-dark rounded-2xl">
                <span className="text-white font-black text-sm">{selectedOrderIds.size} selected</span>
                <div className="flex gap-2 ml-auto">
                  <select value={bulkAction} onChange={e => setBulkAction(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs font-bold border border-white/20 outline-none">
                    <option value="">Choose action...</option>
                    <option value="delivered">Mark Delivered</option>
                    <option value="cancelled">Mark Cancelled</option>
                  </select>
                  <button onClick={handleBulkAction} disabled={!bulkAction || bulkUpdating}
                    className="px-4 py-1.5 bg-brand text-gray-900 rounded-xl text-xs font-black hover:bg-brand-light disabled:opacity-50 transition-colors">
                    {bulkUpdating ? 'Updating...' : 'Apply'}
                  </button>
                  <button onClick={() => setSelectedOrderIds(new Set())}
                    className="px-3 py-1.5 bg-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/20 transition-colors">
                    Clear
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="font-black text-gray-900 mb-1">No orders found</p>
                <p className="text-sm text-gray-400">{orders.length === 0 ? 'Orders will appear here.' : 'Try a different filter.'}</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="hidden sm:grid grid-cols-[32px_1fr_160px_120px_120px_160px_80px] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <div />
                  {['Order', 'Branch', 'Date', 'Total', 'Status', 'Action'].map(h => (
                    <p key={h} className="text-[10px] font-black uppercase tracking-widest text-gray-400">{h}</p>
                  ))}
                </div>
                <div className="divide-y divide-gray-50">
                  {filteredOrders.map((order, i) => {
                    const cfg = STATUS[order.status];
                    const StatusIcon = cfg.icon;
                    return (
                      <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                        className="grid grid-cols-1 sm:grid-cols-[32px_1fr_160px_120px_120px_160px_80px] gap-3 sm:gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                        <div className="hidden sm:flex items-center">
                          <input type="checkbox" checked={selectedOrderIds.has(order.id)}
                            onChange={() => toggleOrderSelect(order.id)}
                            className="w-4 h-4 rounded accent-brand cursor-pointer" />
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1 flex-shrink-0">
                            {order.items.slice(0, 2).map(item => (
                              <div key={item.id} className="relative w-9 h-9 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="36px" />
                              </div>
                            ))}
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-sm text-gray-900">#{order.id}</p>
                            <p className="text-xs text-gray-400 truncate">{order.customer_name ?? `${order.items.length} items`}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <p className="text-xs font-bold text-gray-600 truncate">{order.pickup_branch?.replace('Simba Supermarket ', '') ?? '—'}</p>
                        </div>
                        <div className="flex items-center">
                          <div>
                            <p className="text-sm font-bold text-gray-900">{new Date(order.date).toLocaleDateString('en-RW', { day: 'numeric', month: 'short' })}</p>
                            <p className="text-xs text-gray-400">{new Date(order.date).toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <p className="font-black text-sm text-gray-900">{order.total.toLocaleString()} <span className="text-gray-400 font-medium text-xs">RWF</span></p>
                        </div>
                        <div className="flex items-center">
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${cfg.bg} ${cfg.border}`}>
                            <StatusIcon className={`w-3.5 h-3.5 ${cfg.color}`} />
                            <span className={`text-xs font-black ${cfg.color}`}>{cfg.label}</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <button onClick={() => setSelectedOrder(order)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-brand-dark text-white rounded-xl text-xs font-black hover:bg-gray-800 transition-colors">
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Order detail drawer ── */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]" onClick={() => setSelectedOrder(null)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-[110] shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 bg-brand-dark">
                <div>
                  <p className="font-black text-white">Order #{selectedOrder.id}</p>
                  <p className="text-white/60 text-xs">{new Date(selectedOrder.date).toLocaleString('en-RW', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white/10 rounded-xl">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl border ${STATUS[selectedOrder.status].bg} ${STATUS[selectedOrder.status].border}`}>
                  {(() => { const Icon = STATUS[selectedOrder.status].icon; return <Icon className={`w-5 h-5 ${STATUS[selectedOrder.status].color}`} />; })()}
                  <span className={`font-black text-sm ${STATUS[selectedOrder.status].color}`}>{STATUS[selectedOrder.status].label}</span>
                  <span className="ml-auto text-xs text-gray-500">{selectedOrder.pickup_branch}</span>
                </div>
                {selectedOrder.customer_name && (
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Customer</p>
                    <p className="font-bold text-gray-900">{selectedOrder.customer_name}</p>
                    <p className="text-sm text-gray-500">{selectedOrder.customer_phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Items ({selectedOrder.items.length})</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="40px" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs text-gray-400">x{item.quantity} · {item.price.toLocaleString()} RWF each</p>
                        </div>
                        <p className="font-black text-sm text-gray-900">{(item.price * item.quantity).toLocaleString()} RWF</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{translations[language].paymentMethod}</span>
                    <span className="font-bold">{getPaymentMethodLabel(normalizePaymentMethod(selectedOrder.payment_method), language)}</span>
                  </div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Pickup Slot</span><span className="font-bold">{selectedOrder.pickup_slot ?? 'asap'}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Deposit Paid</span><span className="font-bold">{(selectedOrder.deposit_amount ?? 0).toLocaleString()} RWF</span></div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-black text-gray-900">Total</span>
                    <span className="font-black text-lg">{selectedOrder.total.toLocaleString()} RWF</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Update Status</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(['processing', 'delivered', 'cancelled'] as Order['status'][]).map(s => {
                      const cfg = STATUS[s]; const Icon = cfg.icon; const isActive = selectedOrder.status === s;
                      return (
                        <button key={s} onClick={() => !isActive && handleStatusChange(selectedOrder.id, s)}
                          disabled={isActive || updating === selectedOrder.id}
                          className={clsx('flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all',
                            isActive ? `${cfg.bg} ${cfg.border}` : 'border-gray-200 hover:border-gray-300 bg-white'
                          )}>
                          <Icon className={`w-5 h-5 ${isActive ? cfg.color : 'text-gray-400'}`} />
                          <span className={`text-xs font-black ${isActive ? cfg.color : 'text-gray-500'}`}>{cfg.label}</span>
                          {isActive && <span className="text-[9px] text-gray-400">Current</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Product modal ── */}
      <AnimatePresence>
        {showProductModal && (
          <ProductModal
            product={isNewProduct ? null : editProduct}
            categories={CATEGORIES}
            onSave={handleSaveProduct}
            onClose={() => { setShowProductModal(false); setEditProduct(null); setIsNewProduct(false); }}
            language={language}
          />
        )}
      </AnimatePresence>
    </div>
    </div>
  );
}
