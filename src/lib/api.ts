// Central API client — points to the Express backend
const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  return data as T;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (body: {
    name: string; email: string; password: string;
    phone?: string; referralCode?: string;
  }) => request<{ ok: boolean; error?: string; message?: string }>(
    '/auth/register', { method: 'POST', body: JSON.stringify(body) }
  ),

  login: (body: { email: string; password: string }) =>
    request<{
      ok: boolean; error?: string;
      token?: string;
      user?: { id: string; name: string; email: string; phone?: string; referralCode?: string; loyaltyPoints?: number };
    }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  me: (token: string) =>
    request<{ ok: boolean; user?: any }>('/auth/me', {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    }),
};

// ── Orders ────────────────────────────────────────────────────────────────────
export const ordersApi = {
  place: (body: {
    id: string; userId?: string; customerName: string; customerPhone: string;
    deliveryAddress: string; deliverySlot: string; paymentMethod: string;
    items: any[]; subtotal: number; deliveryFee: number;
    discount: number; total: number; promoCode?: string | null;
  }) => request<{ ok: boolean; id?: string; error?: string }>(
    '/orders', { method: 'POST', body: JSON.stringify(body) }
  ),

  getByUser: (userId: string) =>
    request<{ ok: boolean; orders: any[] }>(`/orders?userId=${userId}`),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  login: (username: string, password: string) =>
    request<{ ok: boolean; token?: string; error?: string }>(
      '/admin/login', { method: 'POST', body: JSON.stringify({ username, password }) }
    ),

  getOrders: (token: string) =>
    fetch(`${BASE}/admin/orders`, {
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
    }).then(r => r.json()),

  updateStatus: (token: string, orderId: string, status: string) =>
    fetch(`${BASE}/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ status }),
    }).then(r => r.json()),

  getStats: (token: string) =>
    fetch(`${BASE}/admin/stats`, {
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
    }).then(r => r.json()),
};
