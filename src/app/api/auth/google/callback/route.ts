import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET ?? 'simba_secret_2026';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://simba-2-ebon.vercel.app';

  if (!code) {
    return NextResponse.redirect(`${siteUrl}/?auth_error=no_code`);
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const redirectUri = `${siteUrl}/api/auth/google/callback`;

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return NextResponse.redirect(`${siteUrl}/?auth_error=token_failed`);
    }

    // Get user info from Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const googleUser = await userRes.json();

    if (!googleUser.email) {
      return NextResponse.redirect(`${siteUrl}/?auth_error=no_email`);
    }

    // Upsert user in database
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id            VARCHAR(36)  PRIMARY KEY,
          name          VARCHAR(100) NOT NULL,
          email         VARCHAR(150) NOT NULL UNIQUE,
          phone         VARCHAR(20)  DEFAULT NULL,
          password_hash VARCHAR(255) NOT NULL DEFAULT '',
          referral_code VARCHAR(20)  UNIQUE,
          loyalty_points INT         NOT NULL DEFAULT 0,
          google_id     VARCHAR(100) DEFAULT NULL,
          created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);

      const [existing] = await conn.execute(
        'SELECT * FROM users WHERE email = ?',
        [googleUser.email.toLowerCase()]
      ) as any[];

      let user: any;

      if (existing && existing.length > 0) {
        user = existing[0];
        // Update google_id if not set
        if (!user.google_id) {
          await conn.execute('UPDATE users SET google_id = ? WHERE id = ?', [googleUser.id, user.id]);
        }
      } else {
        // Create new user
        const id = uuidv4();
        const code = `SIMBA${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        await conn.execute(
          `INSERT INTO users (id, name, email, google_id, referral_code) VALUES (?, ?, ?, ?, ?)`,
          [id, googleUser.name ?? googleUser.email.split('@')[0], googleUser.email.toLowerCase(), googleUser.id, code]
        );
        const [newUser] = await conn.execute('SELECT * FROM users WHERE id = ?', [id]) as any[];
        user = newUser[0];
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      // Redirect back to frontend with token in URL fragment
      const userData = encodeURIComponent(JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        referralCode: user.referral_code,
        loyaltyPoints: user.loyalty_points,
      }));

      return NextResponse.redirect(`${siteUrl}/?auth_token=${token}&auth_user=${userData}`);
    } finally {
      conn.release();
    }
  } catch (err: any) {
    console.error('[Google OAuth callback]', err.message);
    return NextResponse.redirect(`${siteUrl}/?auth_error=server_error`);
  }
}
