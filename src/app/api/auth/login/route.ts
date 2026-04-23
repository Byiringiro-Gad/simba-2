import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET ?? 'simba_secret_2026';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: 'Email and password required' }, { status: 400 });
    }

    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      const [users] = await conn.execute(
        'SELECT * FROM users WHERE email = ?',
        [email.toLowerCase().trim()]
      ) as any[];

      if (!users || users.length === 0) {
        return NextResponse.json({ ok: false, error: 'No account found with this email' }, { status: 401 });
      }

      const user = users[0];
      const valid = await bcrypt.compare(password, user.password_hash);

      if (!valid) {
        return NextResponse.json({ ok: false, error: 'Incorrect password' }, { status: 401 });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      return NextResponse.json({
        ok: true,
        token,
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
  } catch (err: any) {
    console.error('[POST /api/auth/login]', err.message);
    // Give a clear DB error message so the user knows what's wrong
    const isDbError = err.message?.includes('ECONNREFUSED') || err.message?.includes('connect');
    return NextResponse.json(
      { ok: false, error: isDbError ? 'Database unavailable. Please try again shortly.' : 'Server error' },
      { status: 500 }
    );
  }
}
