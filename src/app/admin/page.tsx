
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Clock, CheckCircle2, XCircle, LogOut, Search, Eye, Store,
  TrendingUp, Package, DollarSign, RefreshCw, X, Bike, Star,
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Image as ImageIcon,
  ChevronDown, AlertTriangle, Users, Tag
} from 'lucide-react';
import Image from 'next/image';
import { clsx } from 'clsx';
import DashboardSettingsBar from '@/components/DashboardSettingsBar';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface OrderItem { id: number; name: string; price: number; quantity: number; image: string; unit: string; category: string; }
interface Order {
  id: string; date: string; items: OrderItem[]; total: number;
  status: 'processing' | 'delivered' | 'cancelled';
  pickup_branch?: string; pickup_slot?: string; deposit_amount?: number;
  customer_name?: string; customer_phone?: string;
}
interface Product {
  id: number; _dbId?: number; name: string; price: number; category: string;
  unit: string; image: string; inStock: boolean; stockCount: number;
  description?: string | null; source: 'json' | 'override' | 'addition';
}

type AdminView = 'orders' | 'products' | 'branches';
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

  // View
  const [activeView, setActiveView] = useState<AdminView>('orders');

  const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') ?? '' : '';
  const { isDarkMode, language } = useSimbaStore();

  const STATUS = {
    processing: { label: language === 'fr' ? 'En cours'    : language === 'rw' ? 'Ritegurwa'      : 'Processing', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock },
    delivered:  { label: language === 'fr' ? 'Livré'       : language === 'rw' ? 'Ryagezweho'     : 'Delivered',  color: 'text-green-600', bg: 'bg-green-50',  border: 'border-green-200', icon: CheckCircle2 },
    cancelled:  { label: language === 'fr' ? 'Annulé'      : language === 'rw' ? 'Ryahagaritswe'  : 'Cancelled',  color: 'text-red-600',   bg: 'bg-red-50',    border: 'border-red-200',   icon: XCircle },
  };

  /* ── Load orders ── */
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

  useEffect(() => {
    loadOrders();
    loadProducts();
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-brand-dark shadow-lg">
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
                <div className="hidden sm:grid grid-cols-[1fr_160px_120px_120px_160px_80px] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100">
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
                        className="grid grid-cols-1 sm:grid-cols-[1fr_160px_120px_120px_160px_80px] gap-3 sm:gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
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
