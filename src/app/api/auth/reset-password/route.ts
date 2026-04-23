import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const { token, password } = await req.json();

    if (!token || !password || password.length < 6) {
      return NextResponse.json({ ok: false, error: 'Valid token and password (min 6 chars) required' }, { status: 400 });
    }

    const [rows] = await conn.execute(
      `SELECT * FROM password_reset_tokens
       WHERE token = ? AND used_at IS NULL AND expires_at > NOW()
       ORDER BY id DESC LIMIT 1`,
      [token]
    ) as any[];

    if (!rows || rows.length === 0) {
      return NextResponse.json({ ok: false, error: 'Reset link is invalid or expired' }, { status: 400 });
    }

    const resetToken = rows[0];
    const hash = await bcrypt.hash(password, 10);

    await conn.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hash, resetToken.user_id]);
    await conn.execute('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?', [resetToken.id]);

    return NextResponse.json({ ok: true, message: 'Password reset successful. You can sign in now.' });
  } catch (err: any) {
    console.error('[POST /api/auth/reset-password]', err.message);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  } finally {
    conn.release();
  }
}
