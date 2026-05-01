import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET ?? 'simba_secret_2026';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = req.headers.get('authorization') ?? '';
  if (!auth.startsWith('Bearer ')) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  try { jwt.verify(auth.slice(7), JWT_SECRET); } catch {
    return NextResponse.json({ ok: false, error: 'Invalid token' }, { status: 401 });
  }

  try {
    const { branchStatus } = await req.json();
    const validStatuses = ['pending', 'preparing', 'ready', 'picked_up'];
    if (!validStatuses.includes(branchStatus)) {
      return NextResponse.json({ ok: false, error: 'Invalid status' }, { status: 400 });
    }

    // Demo orders — return success without DB (UI updates optimistically)
    if (params.id.startsWith('DEMO-')) {
      return NextResponse.json({ ok: true });
    }

    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      if (branchStatus === 'picked_up') {
        await conn.execute(
          `UPDATE orders SET branch_status = ?, status = 'delivered', updated_at = NOW() WHERE id = ?`,
          [branchStatus, params.id]
        );
      } else {
        await conn.execute(
          `UPDATE orders SET branch_status = ?, updated_at = NOW() WHERE id = ?`,
          [branchStatus, params.id]
        );
      }
      return NextResponse.json({ ok: true });
    } finally {
      conn.release();
    }
  } catch (err: any) {
    console.error('[PATCH /api/branch/orders/[id]/status]', err.message);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
