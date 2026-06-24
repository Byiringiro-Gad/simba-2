import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { verifyAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

async function ensureTable(conn: any) {
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS flash_deals (
      id           SERIAL       PRIMARY KEY,
      product_id   INT          NOT NULL UNIQUE,
      discount_pct SMALLINT     NOT NULL DEFAULT 10,
      deal_tag     VARCHAR(50)  NOT NULL DEFAULT 'Deal',
      active       BOOLEAN      NOT NULL DEFAULT TRUE,
      expires_at   TIMESTAMPTZ  DEFAULT NULL,
      created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `);
}

// GET /api/admin/deals — list all configured flash deals
export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type');
  try {
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await ensureTable(conn);

      // Only return active, non-expired deals
      const [rows] = await conn.execute(`
        SELECT id, product_id, discount_pct, deal_tag, active, expires_at, created_at
        FROM flash_deals
        WHERE active = TRUE
          AND (expires_at IS NULL OR expires_at > NOW())
        ORDER BY created_at DESC
      `) as any[];

      // Return empty array without error when no deals configured
      return NextResponse.json({ ok: true, deals: rows ?? [] });
    } finally { conn.release(); }
  } catch (err: any) {
    console.error('[GET /api/admin/deals]', err.message);
    return NextResponse.json({ ok: true, deals: [] });
  }
}

// POST /api/admin/deals — add a flash deal
export async function POST(req: NextRequest) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { productId, discountPct, dealTag, expiresAt } = await req.json();
    if (!productId || !discountPct || discountPct < 1 || discountPct > 90) {
      return NextResponse.json(
        { ok: false, error: 'productId and discountPct (1–90) are required' },
        { status: 400 }
      );
    }

    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await ensureTable(conn);
      await conn.execute(
        `INSERT INTO flash_deals (product_id, discount_pct, deal_tag, expires_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT (product_id) DO UPDATE
           SET discount_pct = EXCLUDED.discount_pct,
               deal_tag = EXCLUDED.deal_tag,
               expires_at = EXCLUDED.expires_at,
               active = TRUE`,
        [
          Number(productId),
          Number(discountPct),
          dealTag ?? 'Deal',
          expiresAt ?? null,
        ]
      );
      return NextResponse.json({ ok: true });
    } finally { conn.release(); }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/admin/deals?productId=123 — remove a deal
export async function DELETE(req: NextRequest) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const productId = req.nextUrl.searchParams.get('productId');
  if (!productId) {
    return NextResponse.json({ ok: false, error: 'productId required' }, { status: 400 });
  }
  try {
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await conn.execute('DELETE FROM flash_deals WHERE product_id = ?', [Number(productId)]);
      return NextResponse.json({ ok: true });
    } finally { conn.release(); }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
