import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET ?? 'simba_secret_2026';

// POST /api/branch/flag — manager flags a customer as no-show
export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  if (!auth.startsWith('Bearer ')) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  let manager: any;
  try { manager = jwt.verify(auth.slice(7), JWT_SECRET); } catch {
    return NextResponse.json({ ok: false, error: 'Invalid token' }, { status: 401 });
  }
  if (manager.role !== 'manager') return NextResponse.json({ ok: false, error: 'Manager only' }, { status: 403 });

  try {
    const { userId, phone, orderId, reason } = await req.json();
    if (!orderId) return NextResponse.json({ ok: false, error: 'orderId required' }, { status: 400 });

    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await conn.execute(
        `INSERT INTO customer_flags (user_id, phone, branch_id, order_id, reason)
         VALUES (?, ?, ?, ?, ?) ON CONFLICT (order_id) DO NOTHING`,
        [userId ?? null, phone ?? null, manager.branchId, orderId, reason ?? 'no_show']
      );
      return NextResponse.json({ ok: true });
    } finally { conn.release(); }
  } catch (err: any) {
    console.error('[POST /api/branch/flag]', err.message);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// GET /api/branch/flag?userId=xxx&phone=xxx — get flag count for a user
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    const phone = req.nextUrl.searchParams.get('phone');

    if (!userId && !phone) return NextResponse.json({ ok: true, flags: 0 });

    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      const conditions: string[] = [];
      const params: any[] = [];
      if (userId) { conditions.push('user_id = ?'); params.push(userId); }
      if (phone)  { conditions.push('phone = ?');   params.push(phone); }

      const [rows] = await conn.execute(
        `SELECT COUNT(*) AS cnt FROM customer_flags WHERE ${conditions.join(' OR ')}`,
        params
      ) as any[];
      return NextResponse.json({ ok: true, flags: Number((rows as any[])[0]?.cnt ?? 0) });
    } finally { conn.release(); }
  } catch {
    return NextResponse.json({ ok: true, flags: 0 });
  }
}
