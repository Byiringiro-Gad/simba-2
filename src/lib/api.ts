// ── API client ────────────────────────────────────────────────────────────────
// If NEXT_PUBLIC_API_URL is set → calls the Express backend (Render)
// If empty → calls Next.js built-in API routes (local XAMPP or Vercel)

const EXTERNAL = process.env.NEXT_PUBLIC_API_URL ?? '';

function url(path: string): string {
  if (EXTERNAL) return `${EXTERNAL}${path}`;
  // Map backend paths to Next.js API routes
  const map: Record<string, string> = {
    '/auth/register':       '/api/auth/register',
    '/auth/login':          '/api/auth/login',
    '/auth/me':             '/api/auth/me',
    '/auth/forgot-password':'/api/auth/forgot-password',
    '/auth/reset-password': '/api/auth/reset-password',
    '/orders':              '/api/orders',
    '/admin/login':         '/api/admin/login',
    '/admin/orders':        '/api/admin/orders',
    '/admin/stats':         '/api/admin/stats',
  };
  // Handle dynamic paths like /admin/orders/:id
  for (const [key, val] of Object.entries(map)) {
    if (path === key || path.startsWith(key + '/')) {
      return val + path.slice(key.length);
    }
  }
  return `/api${path}`;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url(path), {
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
    request<{ ok: boolean; error?: string; user?: any }>('/auth/me', {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    }),

  forgotPassword: (body: { email: string }) =>
    request<{ ok: boolean; error?: string; message?: string; resetLink?: string }>(
      '/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }
    ),

  resetPassword: (body: { token: string; password: string }) =>
    request<{ ok: boolean; error?: string; message?: string }>(
      '/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }
    ),
};

// ── Orders ────────────────────────────────────────────────────────────────────
export const ordersApi = {
  place: (body: {
    id: string; userId?: string; customerName: string; customerPhone: string;
    pickupBranch: string; pickupSlot: string; paymentMethod: string;
    depositAmount: number; items: any[]; subtotal: number; deliveryFee: number;
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
    fetch(url('/admin/orders'), {
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
    }).then(r => r.json()),

  updateStatus: (token: string, orderId: string, status: string) =>
    fetch(url(`/admin/orders/${orderId}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ status }),
    }).then(r => r.json()),

  getStats: (token: string) =>
    fetch(url('/admin/stats'), {
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
    }).then(r => r.json()),
};
