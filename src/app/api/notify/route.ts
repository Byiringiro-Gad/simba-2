import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function ensureTable(conn: any) {
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS notify_waitlist (
      id          SERIAL       PRIMARY KEY,
      product_id  INT          NOT NULL,
      email       VARCHAR(150) NOT NULL,
      notified_at TIMESTAMPTZ  DEFAULT NULL,
      created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      UNIQUE (product_id, email)
    )
  `);
  // Add notified_at column if it doesn't exist on older tables
  await conn.execute(`
    ALTER TABLE notify_waitlist ADD COLUMN IF NOT EXISTS notified_at TIMESTAMPTZ DEFAULT NULL
  `).catch(() => {/* ignore if column already exists or ALTER IF NOT EXISTS not supported */});
}

// POST /api/notify — register for back-in-stock notification
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
      console.warn('[POST /api/notify] DB unavailable:', dbErr.message);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }
}

// GET /api/notify?productId=123 — count waiting
export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get('productId');
  if (!productId) return NextResponse.json({ ok: false, count: 0 });

  try {
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await ensureTable(conn);
      const [rows] = await conn.execute(
        'SELECT COUNT(*) AS cnt FROM notify_waitlist WHERE product_id = ? AND notified_at IS NULL',
        [productId]
      ) as any[];
      return NextResponse.json({ ok: true, count: Number((rows as any[])[0]?.cnt ?? 0) });
    } finally { conn.release(); }
  } catch {
    return NextResponse.json({ ok: true, count: 0 });
  }
}

// Internal helper used by inventory PATCH — not an HTTP endpoint
// Exported so the inventory route can import it
export async function triggerBackInStockNotifications(productId: number, productName: string): Promise<void> {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(
      'SELECT id, email FROM notify_waitlist WHERE product_id = ? AND notified_at IS NULL',
      [productId]
    ) as any[];

    if (!rows || (rows as any[]).length === 0) return;

    const { sendBackInStockEmail } = await import('@/lib/email');
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://simba2gad.vercel.app';
    const ids: number[] = [];

    await Promise.all(
      (rows as any[]).map(async (row: any) => {
        const sent = await sendBackInStockEmail({
          email: row.email,
          productName,
          productId,
          siteUrl,
        });
        if (sent) ids.push(row.id);
      })
    );

    if (ids.length > 0) {
      // Mark as notified — use parameterized IN clause
      const placeholders = ids.map(() => '?').join(',');
      await conn.execute(
        `UPDATE notify_waitlist SET notified_at = NOW() WHERE id IN (${placeholders})`,
        ids
      );
      console.info(`[notify] Sent back-in-stock emails for product ${productId} to ${ids.length} subscriber(s)`);
    }
  } catch (err: any) {
    console.error('[notify] Failed to send back-in-stock notifications:', err.message);
  } finally {
    conn.release();
  }
}
