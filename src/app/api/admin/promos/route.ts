import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { verifyAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute('SELECT * FROM promo_codes ORDER BY created_at DESC') as [any[], any];
      return NextResponse.json({ ok: true, promos: rows ?? [] });
    } finally { conn.release(); }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { code, discount, active } = await req.json();
    if (!code || !discount) {
      return NextResponse.json({ ok: false, error: 'Code and discount required' }, { status: 400 });
    }
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await conn.execute(
        'INSERT INTO promo_codes (code, discount, active) VALUES (?, ?, ?)',
        [code.toUpperCase(), discount, active !== false]
      );
      return NextResponse.json({ ok: true });
    } finally { conn.release(); }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
