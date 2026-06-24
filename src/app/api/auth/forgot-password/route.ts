import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

async function ensureResetTable(conn: any) {
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id         SERIAL       PRIMARY KEY,
      user_id    VARCHAR(36)  NOT NULL,
      token      VARCHAR(255) NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ  NOT NULL,
      used_at    TIMESTAMPTZ  DEFAULT NULL,
      created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `);
}

export async function POST(req: NextRequest) {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ ok: false, error: 'Email required' }, { status: 400 });
    }

    await ensureResetTable(conn);

    const [users] = await conn.execute(
      'SELECT id, name, email FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    ) as any[];

    // Always return the same message to prevent email enumeration
    const SAFE_RESPONSE = NextResponse.json({
      ok: true,
      message: 'If that email is registered, a reset link has been sent.',
    });

    if (!users || (users as any[]).length === 0) {
      return SAFE_RESPONSE;
    }

    const user = (users as any[])[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Invalidate any existing unused tokens for this user
    await conn.execute(
      'UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL',
      [user.id]
    );

    await conn.execute(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, token, expiresAt]
    );

    const frontendUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? 'https://simba2gad.vercel.app';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    const sent = await sendPasswordResetEmail({
      name: user.name ?? 'Customer',
      email: user.email,
      resetLink,
    });

    if (!sent) {
      // SMTP not configured — log the link server-side so it's not lost
      console.info(`[forgot-password] Reset link for ${user.email}: ${resetLink}`);
    }

    return SAFE_RESPONSE;
  } catch (err: any) {
    console.error('[POST /api/auth/forgot-password]', err.message);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  } finally {
    conn.release();
  }
}
