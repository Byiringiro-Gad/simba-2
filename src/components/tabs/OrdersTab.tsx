'use client';

import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import { ClipboardList, Package, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect } from 'react';

export default function OrdersTab() {
  const { orders, addToCart, language, user, fetchOrders } = useSimbaStore();
  const t = translations[language];

  useEffect(() => {
    if (user?.id) {
      fetchOrders(user.id);
    }
  }, [user?.id, fetchOrders]);

  const STATUS_CONFIG = {
    processing: { label: t.processing, icon: Clock,         color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    delivered:  { label: t.delivered,  icon: CheckCircle2,  color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    cancelled:  { label: t.cancelled,  icon: XCircle,       color: 'text-red-500',   bg: 'bg-red-50 dark:bg-red-900/20' },
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-brand-muted rounded-2xl flex items-center justify-center">
          <ClipboardList className="w-5 h-5 text-brand" />
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white">{t.myOrders}</h1>
          <p className="text-sm text-gray-400">{orders.length} {orders.length !== 1 ? t.items : t.item}</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-brand-muted rounded-3xl flex items-center justify-center mb-4">
            <Package className="w-10 h-10 text-brand/40" />
          </div>
          <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">{t.noOrders}</h3>
          <p className="text-sm text-gray-400">{t.noOrdersSub}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => {
            const cfg = STATUS_CONFIG[order.status];
            const StatusIcon = cfg.icon;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden"
              >
                {/* Order header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-gray-800">
                  <div>
                    <p className="font-black text-gray-900 dark:text-white text-sm">#{order.id}</p>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">
                      {new Date(order.date).toLocaleDateString('en-RW', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${cfg.bg}`}>
                    <StatusIcon className={`w-3.5 h-3.5 ${cfg.color}`} />
                    <span className={`text-xs font-black ${cfg.color}`}>{cfg.label}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="px-5 py-3 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                  {order.items.slice(0, 5).map(item => (
                    <div key={item.id} className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                      {item.quantity > 1 && (
                        <div className="absolute bottom-0 right-0 bg-brand text-white text-[8px] font-black w-4 h-4 rounded-tl-lg flex items-center justify-center">
                          {item.quantity}
                        </div>
                      )}
                    </div>
                  ))}
                  {order.items.length > 5 && (
                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-black text-gray-500">+{order.items.length - 5}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-50 dark:border-gray-800">
                  <div>
                    <p className="text-xs text-gray-400 font-medium">
                      {order.items.reduce((a, i) => a + i.quantity, 0)} {t.items}
                    </p>
                    <p className="font-black text-gray-900 dark:text-white">{order.total.toLocaleString()} RWF</p>
                    {'pickupBranch' in order && order.pickupBranch && (
                      <p className="text-xs text-gray-400 mt-1">
                        {order.pickupBranch}
                        {'pickupSlot' in order && order.pickupSlot ? ` • ${order.pickupSlot}` : ''}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => order.items.forEach(item => addToCart(item))}
                    className="px-4 py-2 bg-brand text-white rounded-xl text-xs font-black hover:bg-brand-dark transition-colors"
                  >
                    {t.reorder}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
