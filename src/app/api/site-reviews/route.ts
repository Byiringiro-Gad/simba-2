import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function ensureSiteReviewsTable(conn: any) {
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS site_reviews (
      id         INT          AUTO_INCREMENT PRIMARY KEY,
      user_name  VARCHAR(100) NOT NULL DEFAULT 'Anonymous',
      rating     TINYINT      NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment    TEXT         NOT NULL,
      created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// GET /api/site-reviews — fetch recent site reviews
export async function GET() {
  try {
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await ensureSiteReviewsTable(conn);
      const [rows] = await conn.execute(
        `SELECT id, user_name, rating, comment, created_at
         FROM site_reviews
         ORDER BY created_at DESC
         LIMIT 50`
      ) as any[];
      return NextResponse.json({ ok: true, reviews: rows });
    } finally { conn.release(); }
  } catch {
    return NextResponse.json({ ok: true, reviews: [] });
  }
}

// POST /api/site-reviews — submit a site review
export async function POST(req: NextRequest) {
  try {
    const { userName, rating, comment } = await req.json();

    if (!rating || !comment?.trim()) {
      return NextResponse.json(
        { ok: false, error: 'Rating and comment are required' },
        { status: 400 }
      );
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { ok: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }
    if (comment.trim().length > 1000) {
      return NextResponse.json(
        { ok: false, error: 'Comment too long (max 1000 characters)' },
        { status: 400 }
      );
    }

    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await ensureSiteReviewsTable(conn);
      await conn.execute(
        `INSERT INTO site_reviews (user_name, rating, comment) VALUES (?, ?, ?)`,
        [userName?.trim() || 'Anonymous', rating, comment.trim()]
      );
      return NextResponse.json({ ok: true });
    } finally { conn.release(); }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
