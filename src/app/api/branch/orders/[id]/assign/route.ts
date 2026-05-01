import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET ?? 'simba_secret_2026';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = req.headers.get('authorization') ?? '';
  if (!auth.startsWith('Bearer ')) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  let manager: any;
  try { manager = jwt.verify(auth.slice(7), JWT_SECRET); } catch {
    return NextResponse.json({ ok: false, error: 'Invalid token' }, { status: 401 });
  }

  if (manager.role !== 'manager') {
    return NextResponse.json({ ok: false, error: 'Manager only' }, { status: 403 });
  }

  try {
    const { staffId, staffName } = await req.json();

    // Demo orders — return success without DB (UI updates optimistically)
    if (params.id.startsWith('DEMO-')) {
      return NextResponse.json({ ok: true });
    }

    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await conn.execute(
        `UPDATE orders SET assigned_to = ?, assigned_name = ?, branch_status = 'preparing', updated_at = NOW() WHERE id = ?`,
        [staffId, staffName, params.id]
      );
      return NextResponse.json({ ok: true });
    } finally {
      conn.release();
    }
  } catch (err: any) {
    console.error('[PATCH /api/branch/orders/[id]/assign]', err.message);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
