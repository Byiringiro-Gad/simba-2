import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function verifyAdmin() {
  const jar = await cookies();
  const session = jar.get('admin_session');
  return session?.value === 'authenticated';
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await verifyAdmin()) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await conn.execute('DELETE FROM branch_staff WHERE id = ?', [id]);
      return NextResponse.json({ ok: true });
    } finally { conn.release(); }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
