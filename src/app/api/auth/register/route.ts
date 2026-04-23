import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const { name, email, phone, password, referralCode } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ ok: false, error: 'Name, email and password are required' }, { status: 400 });
    }

    // Ensure users table exists
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id            VARCHAR(36)  PRIMARY KEY,
        name          VARCHAR(100) NOT NULL,
        email         VARCHAR(150) NOT NULL UNIQUE,
        phone         VARCHAR(20)  DEFAULT NULL,
        password_hash VARCHAR(255) NOT NULL,
        referral_code VARCHAR(20)  UNIQUE,
        loyalty_points INT         NOT NULL DEFAULT 0,
        created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    const [existing] = await conn.execute('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]) as any[];
    if (existing.length > 0) {
      return NextResponse.json({ ok: false, error: 'Email already registered' }, { status: 409 });
    }

    const id = uuidv4();
    const hash = await bcrypt.hash(password, 10);
    const code = `SIMBA${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    await conn.execute(
      `INSERT INTO users (id, name, email, phone, password_hash, referral_code) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, name.trim(), email.toLowerCase().trim(), phone ?? null, hash, code]
    );

    if (referralCode) {
      await conn.execute(
        `UPDATE users SET loyalty_points = loyalty_points + 50 WHERE referral_code = ?`,
        [referralCode.toUpperCase()]
      );
    }

    return NextResponse.json({ ok: true, message: 'Account created. Please sign in.' });
  } catch (err: any) {
    console.error('[POST /api/auth/register]', err.message);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  } finally {
    conn.release();
  }
}
