import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

function verifyAdmin() {
  const session = cookies().get('admin_session');
  return session?.value === 'authenticated';
}

export async function DELETE(_req: NextRequest, { params }: { params: { code: string } }) {
  if (!verifyAdmin()) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await conn.execute('DELETE FROM promo_codes WHERE code = ?', [params.code]);
      return NextResponse.json({ ok: true });
    } finally { conn.release(); }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { code: string } }) {
  if (!verifyAdmin()) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const { active } = await req.json();
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await conn.execute('UPDATE promo_codes SET active = ? WHERE code = ?', [active, params.code]);
      return NextResponse.json({ ok: true });
    } finally { conn.release(); }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
