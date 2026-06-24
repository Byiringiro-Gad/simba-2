import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function ensureTable(conn: any) {
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS product_reviews (
      id          SERIAL        PRIMARY KEY,
      product_id  INT           NOT NULL,
      user_id     VARCHAR(36)   DEFAULT NULL,
      user_name   VARCHAR(100)  NOT NULL DEFAULT 'Anonymous',
      rating      SMALLINT      NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment     TEXT          NOT NULL DEFAULT '',
      verified    BOOLEAN       NOT NULL DEFAULT FALSE,
      created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    )
  `);
  // Index for fast lookup by product
  await conn.execute(`
    CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id)
  `).catch(() => {/* ignore if exists */});
}

// GET /api/product-reviews?productId=123
export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get('productId');
  if (!productId) {
    return NextResponse.json({ ok: false, error: 'productId required' }, { status: 400 });
  }

  try {
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await ensureTable(conn);
      const [rows] = await conn.execute(
        `SELECT id, product_id, user_id, user_name, rating, comment, verified, created_at
         FROM product_reviews WHERE product_id = ? ORDER BY created_at DESC`,
        [Number(productId)]
      ) as any[];

      const reviews = (rows as any[]).map((r) => ({
        id: String(r.id),
        productId: r.product_id,
        userId: r.user_id ?? 'guest',
        userName: r.user_name,
        rating: r.rating,
        comment: r.comment,
        verified: Boolean(r.verified),
        date: new Date(r.created_at).toISOString().split('T')[0],
      }));

      const avg = reviews.length
        ? parseFloat((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1))
        : 0;

      return NextResponse.json({ ok: true, reviews, avg, count: reviews.length });
    } finally { conn.release(); }
  } catch (err: any) {
    console.error('[GET /api/product-reviews]', err.message);
    return NextResponse.json({ ok: true, reviews: [], avg: 0, count: 0 });
  }
}

// POST /api/product-reviews
export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const { productId, userId, userName, rating, comment, verified } = body;

  if (!productId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json(
      { ok: false, error: 'productId and rating (1-5) are required' },
      { status: 400 }
    );
  }

  try {
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await ensureTable(conn);
      const [result] = await conn.execute(
        `INSERT INTO product_reviews (product_id, user_id, user_name, rating, comment, verified)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          Number(productId),
          userId ?? null,
          userName ?? 'Anonymous',
          Number(rating),
          (comment ?? '').trim(),
          verified ? true : false,
        ]
      ) as any[];

      const insertedId = result?.insertId ?? result?.lastInsertRowid ?? Date.now();
      return NextResponse.json({
        ok: true,
        review: {
          id: String(insertedId),
          productId: Number(productId),
          userId: userId ?? 'guest',
          userName: userName ?? 'Anonymous',
          rating: Number(rating),
          comment: (comment ?? '').trim(),
          verified: Boolean(verified),
          date: new Date().toISOString().split('T')[0],
        },
      });
    } finally { conn.release(); }
  } catch (err: any) {
    console.error('[POST /api/product-reviews]', err.message);
    return NextResponse.json({ ok: false, error: 'Failed to save review' }, { status: 500 });
  }
}
