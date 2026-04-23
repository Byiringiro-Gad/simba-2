import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Redirect user to Google OAuth consent screen
export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json({ ok: false, error: 'Google OAuth not configured' }, { status: 501 });
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://simba-2-ebon.vercel.app'}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
