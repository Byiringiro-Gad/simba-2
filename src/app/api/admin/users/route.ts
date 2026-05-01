import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = req.headers.get('x-admin-token') ?? '';
  if (token !== (process.env.ADMIN_PASSWORD ?? 'admin123')) {
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
  const token = req.headers.get('x-admin-token') ?? '';
  if (token !== (process.env.ADMIN_PASSWORD ?? 'admin123')) {
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
