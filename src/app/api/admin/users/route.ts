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

export async function GET(req: NextRequest) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      const [users] = await conn.execute(
        'SELECT id, name, email, phone, loyalty_points, created_at FROM users ORDER BY created_at DESC'
      ) as any[];
      return NextResponse.json({ ok: true, users: users ?? [] });
    } finally { conn.release(); }
  } catch (err: any) {
    return NextResponse.json({ ok: true, users: [] });
  }
}

export async function DELETE(req: NextRequest) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { userId } = await req.json();
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await conn.execute('DELETE FROM users WHERE id = ?', [userId]);
      return NextResponse.json({ ok: true });
    } finally { conn.release(); }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
