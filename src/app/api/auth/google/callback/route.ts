import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET ?? 'simba_secret_2026';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://simba2gad.vercel.app';

  if (!code) return NextResponse.redirect(`${siteUrl}/?auth_error=no_code`);

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const redirectUri = `${siteUrl}/api/auth/google/callback`;

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: 'authorization_code' }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) return NextResponse.redirect(`${siteUrl}/?auth_error=token_failed`);

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const googleUser = await userRes.json();
    if (!googleUser.email) return NextResponse.redirect(`${siteUrl}/?auth_error=no_email`);

    let userId = uuidv4();
    let userName = googleUser.name ?? googleUser.email.split('@')[0];
    const userEmail = googleUser.email.toLowerCase();
    let userPhone: string | null = null;
    let referralCode: string | null = `SIMBA${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    let loyaltyPoints = 0;

    try {
      const { getPool } = await import('@/lib/db');
      const pool = getPool();
      const conn = await pool.getConnection();
      try {
        await conn.execute(`
          CREATE TABLE IF NOT EXISTS users (
            id             VARCHAR(36)  PRIMARY KEY,
            name           VARCHAR(100) NOT NULL,
            email          VARCHAR(150) NOT NULL UNIQUE,
            phone          VARCHAR(20)  DEFAULT NULL,
            password_hash  VARCHAR(255) NOT NULL DEFAULT '',
            referral_code  VARCHAR(20)  UNIQUE,
            loyalty_points INT          NOT NULL DEFAULT 0,
            google_id      VARCHAR(100) DEFAULT NULL,
            created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
          )
        `);

        const [existing] = await conn.execute('SELECT * FROM users WHERE email = ?', [userEmail]) as any[];
        if (existing && (existing as any[]).length > 0) {
          const dbUser = (existing as any[])[0];
          userId = dbUser.id; userName = dbUser.name; userPhone = dbUser.phone;
          referralCode = dbUser.referral_code; loyaltyPoints = dbUser.loyalty_points;
          if (!dbUser.google_id) {
            await conn.execute('UPDATE users SET google_id = ? WHERE id = ?', [googleUser.id, userId]);
          }
        } else {
          await conn.execute(
            `INSERT INTO users (id, name, email, google_id, referral_code) VALUES (?, ?, ?, ?, ?)`,
            [userId, userName, userEmail, googleUser.id, referralCode]
          );
        }
      } finally { conn.release(); }
    } catch (dbErr: any) {
      console.warn('[Google OAuth] DB unavailable:', dbErr.message);
    }

    const token = jwt.sign({ id: userId, email: userEmail, name: userName }, JWT_SECRET, { expiresIn: '30d' });
    const userData = encodeURIComponent(JSON.stringify({ id: userId, name: userName, email: userEmail, phone: userPhone, referralCode, loyaltyPoints }));
    return NextResponse.redirect(`${siteUrl}/?auth_token=${token}&auth_user=${userData}`);
  } catch (err: any) {
    console.error('[Google OAuth callback]', err.message);
    return NextResponse.redirect(`${siteUrl}/?auth_error=server_error`);
  }
}
