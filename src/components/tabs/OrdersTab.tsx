'use client';

import { useEffect, useState } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import {
  Package, Clock, CheckCircle2, XCircle, RefreshCw,
  MapPin, ChevronDown, ChevronUp, ShoppingBag, LogIn,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import Image from 'next/image';

type OrderStatus = 'processing' | 'delivered' | 'cancelled';

const STATUS_CONFIG: Record<OrderStatus, {
  label: { en: string; fr: string; rw: string };
  color: string; bg: string; icon: any;
}> = {
  processing: {
    label: { en: 'Processing', fr: 'En cours', rw: 'Ritegurwa' },
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    icon: Clock,
  },
  delivered: {
    label: { en: 'Delivered', fr: 'Livré', rw: 'Ryagezweho' },
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20',
    icon: CheckCircle2,
  },
  cancelled: {
    label: { en: 'Cancelled', fr: 'Annulé', rw: 'Ryahagaritswe' },
    color: 'text-red-500 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
    icon: XCircle,
  },
};

// Timeline steps for order tracking
const TIMELINE_STEPS = [
  { key: 'placed',    en: 'Order Placed',         fr: 'Commande passée',       rw: 'Itumizwa ryashyizweho' },
  { key: 'confirmed', en: 'Confirmed',             fr: 'Confirmé',              rw: 'Byemejwe' },
  { key: 'packed',    en: 'Being Packed',          fr: 'En cours d\'emballage', rw: 'Ritunganyirizwa' },
  { key: 'ready',     en: 'Ready for Pickup',      fr: 'Prêt à retirer',        rw: 'Biteguye gufatwa' },
  { key: 'delivered', en: 'Picked Up / Delivered', fr: 'Retiré / Livré',        rw: 'Byafashwe / Byagezweho' },
];

function getTimelineStep(status: string, branchStatus?: string): number {
  if (status === 'delivered') return 4;
  if (status === 'cancelled') return -1;
  if (branchStatus === 'picked_up') return 4;
  if (branchStatus === 'ready') return 3;
  if (branchStatus === 'preparing') return 2;
  if (branchStatus === 'pending') return 1;
  return 1; // processing
}

export default function OrdersTab() {
  const { user, orders, fetchOrders, addToCart, clearCart, language, setAuthOpen } = useSimbaStore();
  const t = translations[language];
  const lang = language as 'en' | 'fr' | 'rw';

  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reordering, setReordering] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      fetchOrders(user.id).finally(() => setLoading(false));
    }
  }, [user?.id]);

  const handleReorder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    setReordering(orderId);
    for (const item of order.items) {
      addToCart(item as any);
    }
    setTimeout(() => setReordering(null), 800);
  };

  // Not logged in
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-20 h-20 bg-brand/10 rounded-3xl flex items-center justify-center mb-4">
          <Package className="w-10 h-10 text-brand/40" />
        </div>
        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">
          {lang === 'fr' ? 'Vos commandes' : lang === 'rw' ? 'Amabwiriza yawe' : 'Your Orders'}
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          {lang === 'fr' ? 'Connectez-vous pour voir vos commandes' : lang === 'rw' ? 'Injira kugira ngo ubone amabwiriza yawe' : 'Sign in to view your orders'}
        </p>
        <button onClick={() => setAuthOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-brand-dark text-white rounded-2xl font-black text-sm hover:bg-gray-800 transition-colors">
          <LogIn className="w-4 h-4" />
          {t.signInOrCreate}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-screen-sm mx-auto px-4 sm:px-6 py-5 pb-28 sm:pb-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand/10 rounded-2xl flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-brand-dark dark:text-brand" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white">
              {lang === 'fr' ? 'Mes Commandes' : lang === 'rw' ? 'Amabwiriza Yanjye' : 'My Orders'}
            </h1>
            <p className="text-sm text-gray-400">
              {orders.length} {orders.length === 1
                ? (lang === 'fr' ? 'commande' : lang === 'rw' ? 'itumizwa' : 'order')
                : (lang === 'fr' ? 'commandes' : lang === 'rw' ? 'amabwiriza' : 'orders')}
            </p>
          </div>
        </div>
        <button
          onClick={() => { setLoading(true); fetchOrders(user.id).finally(() => setLoading(false)); }}
          disabled={loading}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors disabled:opacity-50"
        >
          <RefreshCw className={clsx('w-4 h-4 text-gray-400', loading && 'animate-spin')} />
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-brand/10 rounded-3xl flex items-center justify-center mb-4">
            <Package className="w-10 h-10 text-brand/40" />
          </div>
          <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">
            {lang === 'fr' ? 'Aucune commande' : lang === 'rw' ? 'Nta mabwiriza' : 'No orders yet'}
          </h3>
          <p className="text-sm text-gray-400">
            {lang === 'fr' ? 'Vos commandes apparaîtront ici' : lang === 'rw' ? 'Amabwiriza yawe azagaragara hano' : 'Your orders will appear here'}
          </p>
        </div>
      )}

      {/* Orders list */}
      {!loading && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map(order => {
            const status = (order.status ?? 'processing') as OrderStatus;
            const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.processing;
            const StatusIcon = cfg.icon;
            const isExpanded = expandedId === order.id;
            const timelineStep = getTimelineStep(order.status, (order as any).branch_status);
            const orderDate = new Date(order.date).toLocaleDateString(
              lang === 'fr' ? 'fr-FR' : lang === 'rw' ? 'rw-RW' : 'en-US',
              { day: 'numeric', month: 'short', year: 'numeric' }
            );

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
              >
                {/* Order header */}
                <button
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  {/* Status icon */}
                  <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', cfg.bg)}>
                    <StatusIcon className={clsx('w-5 h-5', cfg.color)} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-black text-sm text-gray-900 dark:text-white">#{order.id}</p>
                      <span className={clsx('px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide', cfg.bg, cfg.color)}>
                        {cfg.label[lang]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {orderDate} · {order.items.length} {order.items.length === 1 ? (lang === 'fr' ? 'article' : lang === 'rw' ? 'akagari' : 'item') : (lang === 'fr' ? 'articles' : lang === 'rw' ? 'ibintu' : 'items')}
                    </p>
                  </div>

                  {/* Total + expand */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <p className="font-black text-sm text-gray-900 dark:text-white">{order.total.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">RWF</p>
                    </div>
                    {isExpanded
                      ? <ChevronUp className="w-4 h-4 text-gray-400" />
                      : <ChevronDown className="w-4 h-4 text-gray-400" />
                    }
                  </div>
                </button>

                {/* Expanded detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-4 border-t border-gray-100 dark:border-gray-800 pt-3">

                        {/* Order tracking timeline */}
                        {status !== 'cancelled' && (
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                              {lang === 'fr' ? 'Suivi de commande' : lang === 'rw' ? 'Gukurikirana itumizwa' : 'Order Tracking'}
                            </p>
                            <div className="relative">
                              {/* Track line */}
                              <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-gray-100 dark:bg-gray-800" />
                              <div
                                className="absolute left-3 top-3 w-0.5 bg-green-500 transition-all duration-700"
                                style={{ height: `${(timelineStep / (TIMELINE_STEPS.length - 1)) * 100}%` }}
                              />
                              <div className="space-y-3 relative">
                                {TIMELINE_STEPS.map((step, i) => {
                                  const done = i <= timelineStep;
                                  const active = i === timelineStep;
                                  return (
                                    <div key={step.key} className="flex items-center gap-3 pl-1">
                                      <div className={clsx(
                                        'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                                        done ? 'bg-green-500 border-green-500' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                                      )}>
                                        {done && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                        {active && !done && <div className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse" />}
                                      </div>
                                      <span className={clsx(
                                        'text-xs font-bold',
                                        done ? 'text-gray-900 dark:text-white' : 'text-gray-400',
                                        active && 'font-black'
                                      )}>
                                        {step[lang]}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Branch */}
                        {order.pickupBranch && (
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="font-medium">{order.pickupBranch}</span>
                          </div>
                        )}

                        {/* Items */}
                        <div className="space-y-2">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 flex-shrink-0">
                                <Image
                                  src={(item as any).image || '/simba-icon.png'}
                                  alt={(item as any).name}
                                  fill className="object-cover"
                                  sizes="40px"
                                  onError={(e) => { (e.target as HTMLImageElement).src = '/simba-icon.png'; }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{(item as any).name}</p>
                                <p className="text-[10px] text-gray-400">×{(item as any).quantity} · {((item as any).price * (item as any).quantity).toLocaleString()} RWF</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Summary */}
                        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-1 text-xs">
                          <div className="flex justify-between text-gray-500">
                            <span>{lang === 'fr' ? 'Sous-total' : lang === 'rw' ? 'Igiteranyo' : 'Subtotal'}</span>
                            <span>{order.total.toLocaleString()} RWF</span>
                          </div>
                          {order.depositAmount && (
                            <div className="flex justify-between text-green-600 dark:text-green-400">
                              <span>{lang === 'fr' ? 'Dépôt payé' : lang === 'rw' ? 'Inguzanyo wishyuye' : 'Deposit paid'}</span>
                              <span>-{order.depositAmount.toLocaleString()} RWF</span>
                            </div>
                          )}
                        </div>

                        {/* Reorder button */}
                        <button
                          onClick={() => handleReorder(order.id)}
                          disabled={reordering === order.id}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-dark hover:bg-gray-800 text-white rounded-xl font-black text-xs transition-all disabled:opacity-70"
                        >
                          <RotateCcw className={clsx('w-3.5 h-3.5', reordering === order.id && 'animate-spin')} />
                          {reordering === order.id
                            ? (lang === 'fr' ? 'Ajout...' : lang === 'rw' ? 'Ongeraho...' : 'Adding...')
                            : (lang === 'fr' ? 'Recommander' : lang === 'rw' ? 'Ongera utumize' : 'Reorder')}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
