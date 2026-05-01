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

    // ── Demo account shortcut — no DB needed ─────────────────────────────────
    const demoEmail = 'demo@simba.rw';
    const demoPassword = 'demo1234';
    if (email.toLowerCase().trim() === demoEmail && password === demoPassword) {
      const token = jwt.sign(
        { id: 'demo-user-001', email: demoEmail, name: 'Demo Customer' },
        JWT_SECRET,
        { expiresIn: '30d' }
      );
      // Seed the demo account in DB in background
      getPool().getConnection().then(async conn => {
        try {
          await conn.execute(`CREATE TABLE IF NOT EXISTS users (id VARCHAR(36) PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(150) NOT NULL UNIQUE, phone VARCHAR(20) DEFAULT NULL, password_hash VARCHAR(255) NOT NULL DEFAULT '', referral_code VARCHAR(20) UNIQUE, loyalty_points INT NOT NULL DEFAULT 0, google_id VARCHAR(100) DEFAULT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
          const [ex] = await conn.execute('SELECT id FROM users WHERE id = ?', ['demo-user-001']) as any[];
          if ((ex as any[]).length === 0) {
            const hash = await (await import('bcryptjs')).hash(demoPassword, 10);
            await conn.execute(`INSERT INTO users (id, name, email, phone, password_hash, referral_code, loyalty_points) VALUES (?,?,?,?,?,?,?) ON CONFLICT (id) DO NOTHING`, ['demo-user-001', 'Demo Customer', demoEmail, '+250788000000', hash, 'SIMBADEMO', 150]);
          }
        } catch { /* non-blocking */ } finally { conn.release(); }
      }).catch(() => {});
      return NextResponse.json({
        ok: true, token,
        user: { id: 'demo-user-001', name: 'Demo Customer', email: demoEmail, phone: '+250788000000', referralCode: 'SIMBADEMO', loyaltyPoints: 150 },
      });
    }
    // ─────────────────────────────────────────────────────────────────────────

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
