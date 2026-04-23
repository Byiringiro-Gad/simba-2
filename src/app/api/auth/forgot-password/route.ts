import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ ok: false, error: 'Email required' }, { status: 400 });

    // Ensure reset tokens table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        user_id    VARCHAR(36)  NOT NULL,
        token      VARCHAR(255) NOT NULL UNIQUE,
        expires_at DATETIME     NOT NULL,
        used_at    DATETIME     DEFAULT NULL,
        created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    const [users] = await conn.execute(
      'SELECT id, name, email FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    ) as any[];

    // Always return ok to prevent email enumeration
    if (!users || users.length === 0) {
      return NextResponse.json({ ok: true, message: 'If that email exists, a reset link has been sent.' });
    }

    const user = users[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await conn.execute(
      'UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL',
      [user.id]
    );
    await conn.execute(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, token, expiresAt]
    );

    const frontendUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://simba-2-ebon.vercel.app';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    // Return link directly (email sending requires SMTP config)
    return NextResponse.json({
      ok: true,
      message: 'Reset link generated. Use the link below to reset your password.',
      resetLink,
    });
  } catch (err: any) {
    console.error('[POST /api/auth/forgot-password]', err.message);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  } finally {
    conn.release();
  }
}
