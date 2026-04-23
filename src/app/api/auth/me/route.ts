import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET ?? 'simba_secret_2026';

export async function GET(req: NextRequest) {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json({ ok: false, error: 'No token' }, { status: 401 });
    }

    const token = auth.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const [users] = await conn.execute('SELECT * FROM users WHERE id = ?', [decoded.id]) as any[];

    if (!users || users.length === 0) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    const user = users[0];
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
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid token' }, { status: 401 });
  } finally {
    conn.release();
  }
}
