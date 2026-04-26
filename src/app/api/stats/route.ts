import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT COUNT(*) AS total FROM orders`
      ) as any[];
      const total = Number((rows as any[])[0]?.total ?? 0);
      return NextResponse.json({ ok: true, total });
    } finally {
      conn.release();
    }
  } catch {
    return NextResponse.json({ ok: true, total: 0 });
  }
}
