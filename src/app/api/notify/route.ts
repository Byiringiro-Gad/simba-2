import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function ensureTable(conn: any) {
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS notify_waitlist (
      id         SERIAL      PRIMARY KEY,
      product_id INT         NOT NULL,
      email      VARCHAR(150) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (product_id, email)
    )
  `);
}

export async function POST(req: NextRequest) {
  try {
    const { productId, email } = await req.json();
    if (!productId || !email || !email.includes('@')) {
      return NextResponse.json({ ok: false, error: 'Product ID and valid email required' }, { status: 400 });
    }

    try {
      const pool = getPool();
      const conn = await pool.getConnection();
      try {
        await ensureTable(conn);
        await conn.execute(
          `INSERT INTO notify_waitlist (product_id, email)
           VALUES (?, ?)
           ON CONFLICT (product_id, email) DO NOTHING`,
          [productId, email.toLowerCase().trim()]
        );
      } finally { conn.release(); }
    } catch (dbErr: any) {
      // Non-blocking — still return ok so the UI doesn't show an error
      console.warn('[POST /api/notify] DB unavailable:', dbErr.message);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get('productId');
  if (!productId) return NextResponse.json({ ok: false, count: 0 });

  try {
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await ensureTable(conn);
      const [rows] = await conn.execute(
        'SELECT COUNT(*) AS cnt FROM notify_waitlist WHERE product_id = ?',
        [productId]
      ) as any[];
      return NextResponse.json({ ok: true, count: Number((rows as any[])[0]?.cnt ?? 0) });
    } finally { conn.release(); }
  } catch {
    return NextResponse.json({ ok: true, count: 0 });
  }
}
