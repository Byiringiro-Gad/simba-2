import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function verifyAdmin(req: NextRequest) {
  const jar = await cookies();
  if (jar.get('admin_session')?.value === 'authenticated') return true;
  const headerToken = req.headers.get('x-admin-token') ?? '';
  return headerToken === (process.env.ADMIN_PASSWORD ?? 'admin123');
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    const { status } = await req.json();
    const { id } = await params;

    if (!['processing', 'delivered', 'cancelled'].includes(status)) {
      return NextResponse.json({ ok: false, error: 'Invalid status' }, { status: 400 });
    }

    if (id.startsWith('DEMO-')) {
      return NextResponse.json({ ok: true });
    }

    await conn.execute(
      `UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?`,
      [status, id]
    );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[PATCH /api/admin/orders/:id]', err.message);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  } finally {
    conn.release();
  }
}
