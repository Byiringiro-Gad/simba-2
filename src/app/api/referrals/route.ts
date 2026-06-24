import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function ensureTable(conn: any) {
  // Track which users registered using a referral code
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS referrals (
      id           SERIAL       PRIMARY KEY,
      referral_code VARCHAR(20)  NOT NULL,
      referred_user VARCHAR(36)  NOT NULL UNIQUE,
      referrer_user VARCHAR(36)  DEFAULT NULL,
      bonus_granted BOOLEAN      NOT NULL DEFAULT FALSE,
      created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `);
  await conn.execute(`
    CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code)
  `).catch(() => {});
}

// GET /api/referrals?code=SIMBA123456 — count referrals for a code
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.json({ ok: false, error: 'code required' }, { status: 400 });
  }

  try {
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await ensureTable(conn);
      const [rows] = await conn.execute(
        'SELECT COUNT(*) AS cnt FROM referrals WHERE referral_code = ?',
        [code.toUpperCase().trim()]
      ) as any[];
      return NextResponse.json({ ok: true, count: Number((rows as any[])[0]?.cnt ?? 0) });
    } finally { conn.release(); }
  } catch (err: any) {
    console.error('[GET /api/referrals]', err.message);
    return NextResponse.json({ ok: true, count: 0 });
  }
}

// POST /api/referrals — record that a new user signed up with a referral code
export async function POST(req: NextRequest) {
  try {
    const { referralCode, referredUserId } = await req.json();
    if (!referralCode || !referredUserId) {
      return NextResponse.json({ ok: false, error: 'referralCode and referredUserId required' }, { status: 400 });
    }

    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await ensureTable(conn);

      // Look up the referrer by their code (stored on the users table)
      const [userRows] = await conn.execute(
        'SELECT id FROM users WHERE referral_code = ?',
        [referralCode.toUpperCase().trim()]
      ) as any[];
      const referrerId = (userRows as any[])[0]?.id ?? null;

      await conn.execute(
        `INSERT INTO referrals (referral_code, referred_user, referrer_user)
         VALUES (?, ?, ?)
         ON CONFLICT (referred_user) DO NOTHING`,
        [referralCode.toUpperCase().trim(), referredUserId, referrerId]
      );

      // Grant 50 bonus loyalty points to the referrer if they exist
      if (referrerId) {
        await conn.execute(
          `UPDATE users SET loyalty_points = loyalty_points + 50
           WHERE id = ?
             AND NOT EXISTS (
               SELECT 1 FROM referrals WHERE referral_code = ? AND bonus_granted = TRUE
               LIMIT 1
             )`,
          [referrerId, referralCode.toUpperCase().trim()]
        ).catch(() => {/* best-effort */});

        await conn.execute(
          'UPDATE referrals SET bonus_granted = TRUE WHERE referral_code = ? AND referred_user = ?',
          [referralCode.toUpperCase().trim(), referredUserId]
        ).catch(() => {});
      }

      return NextResponse.json({ ok: true });
    } finally { conn.release(); }
  } catch (err: any) {
    console.error('[POST /api/referrals]', err.message);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
