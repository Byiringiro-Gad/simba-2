import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const { status } = await req.json();
    const { id } = params;

    if (!['processing', 'delivered', 'cancelled'].includes(status)) {
      return NextResponse.json({ ok: false, error: 'Invalid status' }, { status: 400 });
    }

    await conn.execute(
      `UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?`,
      [status, id]
    );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[PATCH /api/orders/:id]', err.message);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  } finally {
    conn.release();
  }
}
