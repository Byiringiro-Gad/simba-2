'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Clock, AlertCircle, CheckCircle2, User, Users, Zap, ChevronDown } from 'lucide-react';
import { toast } from './Toast';

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  pickupSlot: string;
  subtotal: number;
  depositAmount: number;
  total: number;
  status: string;
  branchStatus: string;
  assignedTo?: string;
  assignedName?: string;
  items: { name: string; quantity: number; price: number }[];
  createdAt: string;
}

interface StaffMember {
  id: string;
  name: string;
  username: string;
}

interface BranchDashboardProps {
  token: string;
  staff: { id: string; name: string; role: string; branchName: string };
}

export default function BranchDashboard({ token, staff }: BranchDashboardProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigningTo, setAssigningTo] = useState<{ orderId: string; staffId: string } | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing' | 'ready'>('all');

  const isManager = staff.role === 'manager';

  // Fetch orders
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  // Fetch staff if manager
  useEffect(() => {
    if (isManager) fetchStaffList();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/branch/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.ok) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffList = async () => {
    try {
      const res = await fetch('/api/branch/staff-list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.ok) setStaffList(data.staff || []);
    } catch (err) {
      console.error('Failed to fetch staff', err);
    }
  };

  const assignOrder = async (orderId: string, staffId: string, staffName: string) => {
    try {
      const res = await fetch(`/api/branch/orders/${orderId}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ staffId, staffName }),
      });
      if (res.ok) {
        toast.success('Order assigned');
        fetchOrders();
        setAssigningTo(null);
      } else {
        toast.error('Failed to assign order');
      }
    } catch (err) {
      toast.error('Error assigning order');
    }
  };

  const markReady = async (orderId: string) => {
    try {
      const res = await fetch(`/api/branch/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'ready' }),
      });
      if (res.ok) {
        toast.success('Order marked ready');
        fetchOrders();
      } else {
        toast.error('Failed to mark order ready');
      }
    } catch (err) {
      toast.error('Error updating order');
    }
  };

  const logout = () => {
    localStorage.removeItem('branchToken');
    localStorage.removeItem('branchStaff');
    router.push('/branch/login');
  };

  const filtered = orders.filter(o => {
    if (filter === 'all') return true;
    return o.branchStatus === filter;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.branchStatus === 'pending').length,
    preparing: orders.filter(o => o.branchStatus === 'preparing').length,
    ready: orders.filter(o => o.branchStatus === 'ready').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ready': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'preparing': return <Zap className="w-4 h-4" />;
      case 'ready': return <CheckCircle2 className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-dark to-gray-900">
      {/* Header */}
      <div className="bg-brand-dark shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">{staff.branchName}</h1>
            <p className="text-sm text-gray-300 mt-1">{staff.role === 'manager' ? 'Manager Dashboard' : 'Staff Dashboard'}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-300">Logged in as</p>
              <p className="font-bold text-white flex items-center gap-2"><User className="w-4 h-4" /> {staff.name}</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 font-bold transition"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'bg-gray-700' },
            { label: 'Pending', value: stats.pending, color: 'bg-yellow-600' },
            { label: 'Preparing', value: stats.preparing, color: 'bg-blue-600' },
            { label: 'Ready', value: stats.ready, color: 'bg-green-600' },
          ].map((stat, i) => (
            <div key={i} className={`${stat.color} rounded-lg p-4 text-white`}>
              <p className="text-sm opacity-90">{stat.label}</p>
              <p className="text-3xl font-black">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(['all', 'pending', 'preparing', 'ready'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition ${
                filter === f
                  ? 'bg-brand text-gray-900'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Orders list */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-600 border-t-brand rounded-full" />
              <p className="text-gray-400 mt-4">Loading orders...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No orders to show</p>
            </div>
          ) : (
            filtered.map(order => (
              <motion.div
                key={order.id}
                layout
                className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition"
              >
                <button
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-750 transition"
                >
                  <div className="flex items-center gap-4 flex-1 text-left">
                    <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${getStatusColor(order.branchStatus)}`}>
                      {getStatusIcon(order.branchStatus)}
                      <span className="text-xs font-bold">{order.branchStatus.toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-bold text-white">{order.customerName}</p>
                      <p className="text-sm text-gray-400">{order.customerPhone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brand">{order.total} RWF</p>
                    <p className="text-xs text-gray-400">Order #{order.id}</p>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 ml-3 transition ${expandedOrder === order.id ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {expandedOrder === order.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-700 bg-gray-750 px-4 py-4"
                    >
                      {/* Items */}
                      <div className="mb-4">
                        <p className="text-sm font-bold text-gray-300 mb-2">Items ({order.items.length})</p>
                        <div className="space-y-1">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm text-gray-400">
                              <span>{item.name} x{item.quantity}</span>
                              <span>{(item.price * item.quantity).toLocaleString()} RWF</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pickup time */}
                      <div className="mb-4 pb-4 border-b border-gray-700">
                        <p className="text-sm font-bold text-gray-300">Pickup Slot</p>
                        <p className="text-white font-bold">{order.pickupSlot}</p>
                      </div>

                      {/* Assignment (manager only) */}
                      {isManager && order.branchStatus === 'pending' && (
                        <div className="mb-4 pb-4 border-b border-gray-700">
                          <p className="text-sm font-bold text-gray-300 mb-2">Assign to Staff</p>
                          <div className="flex gap-2">
                            {staffList.map(s => (
                              <button
                                key={s.id}
                                onClick={() => assignOrder(order.id, s.id, s.name)}
                                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition flex items-center gap-2"
                              >
                                <Users className="w-3 h-3" /> {s.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Assigned staff */}
                      {order.assignedName && (
                        <div className="mb-4 pb-4 border-b border-gray-700">
                          <p className="text-sm font-bold text-gray-300">Assigned to</p>
                          <p className="text-white font-bold flex items-center gap-2"><User className="w-4 h-4" /> {order.assignedName}</p>
                        </div>
                      )}

                      {/* Mark ready button */}
                      {order.branchStatus === 'preparing' && (
                        <button
                          onClick={() => markReady(order.id)}
                          className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Mark Ready for Pickup
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
