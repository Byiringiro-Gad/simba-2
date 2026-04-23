import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET ?? 'simba_secret_2026';

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json({ ok: false, error: 'No token' }, { status: 401 });
    }

    const token = auth.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Try DB lookup — fall back to JWT payload if DB is unavailable
    try {
      const pool = getPool();
      const conn = await pool.getConnection();
      try {
        const [users] = await conn.execute(
          'SELECT * FROM users WHERE id = ?',
          [decoded.id]
        ) as any[];

        if (!users || (users as any[]).length === 0) {
          return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
        }

        const user = (users as any[])[0];
        return NextResponse.json({
          ok: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            referralCode: user.referral_code,
            loyaltyPoints: user.loyalty_points,
          },
        });
      } finally {
        conn.release();
      }
    } catch (dbErr: any) {
      // DB unavailable — return user from JWT payload so session still works
      console.warn('[GET /api/auth/me] DB unavailable, using JWT payload:', dbErr.message);
      return NextResponse.json({
        ok: true,
        user: {
          id: decoded.id,
          name: decoded.name,
          email: decoded.email,
          phone: decoded.phone ?? null,
          referralCode: null,
          loyaltyPoints: 0,
        },
      });
    }
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid token' }, { status: 401 });
  }
}
