import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET ?? 'simba_secret_2026';

function verifyToken(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  if (!auth.startsWith('Bearer ')) return null;
  try { return jwt.verify(auth.slice(7), JWT_SECRET) as any; } catch { return null; }
}

export async function PATCH(req: NextRequest) {
  const staff = verifyToken(req);
  if (!staff || staff.role !== 'manager') {
    return NextResponse.json({ ok: false, error: 'Manager only' }, { status: 403 });
  }

  const { orderId, staffId, staffName } = await req.json();
  if (!orderId || !staffId) {
    return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
  }

  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.execute(
      `UPDATE orders SET assigned_to = ?, assigned_name = ?, branch_status = 'preparing', updated_at = NOW() WHERE id = ?`,
      [staffId, staffName, orderId]
    );
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[PATCH /api/branch/orders/assign]', err.message);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  } finally {
    conn.release();
  }
}
