import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function ensureReviewsTable(conn: any) {
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS branch_reviews (
      id          SERIAL       PRIMARY KEY,
      branch_id   VARCHAR(50)  NOT NULL,
      branch_name VARCHAR(255) NOT NULL,
      user_id     VARCHAR(36)  DEFAULT NULL,
      user_name   VARCHAR(100) NOT NULL DEFAULT 'Anonymous',
      order_id    VARCHAR(20)  NOT NULL UNIQUE,
      rating      SMALLINT     NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment     TEXT         DEFAULT NULL,
      created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `);
}

// GET /api/reviews — all branch ratings aggregated
export async function GET() {
  try {
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await ensureReviewsTable(conn);
      const [rows] = await conn.execute(`
        SELECT branch_id, COUNT(*) AS total, ROUND(AVG(rating), 1) AS avg_rating
        FROM branch_reviews GROUP BY branch_id
      `) as any[];

      const ratings: Record<string, { total: number; avgRating: number }> = {};
      for (const row of (rows as any[])) {
        ratings[row.branch_id] = { total: Number(row.total), avgRating: Number(row.avg_rating) };
      }
      return NextResponse.json({ ok: true, ratings });
    } finally { conn.release(); }
  } catch {
    return NextResponse.json({ ok: true, ratings: {} });
  }
}

// POST /api/reviews — submit a branch review
export async function POST(req: NextRequest) {
  try {
    const { branchId, branchName, userId, userName, orderId, rating, comment } = await req.json();
    if (!branchId || !orderId || !rating) {
      return NextResponse.json({ ok: false, error: 'branchId, orderId and rating required' }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ ok: false, error: 'Rating must be 1-5' }, { status: 400 });
    }

    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await ensureReviewsTable(conn);
      await conn.execute(
        `INSERT INTO branch_reviews (branch_id, branch_name, user_id, user_name, order_id, rating, comment)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (order_id) DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment`,
        [branchId, branchName ?? branchId, userId ?? null, userName ?? 'Anonymous', orderId, rating, comment ?? null]
      );
      return NextResponse.json({ ok: true });
    } finally { conn.release(); }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// GET /api/reviews/[branchId] is handled by the [branchId] route
