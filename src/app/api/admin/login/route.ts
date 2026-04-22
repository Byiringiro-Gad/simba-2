import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const validUser = process.env.ADMIN_USERNAME ?? 'admin';
  const validPass = process.env.ADMIN_PASSWORD ?? 'admin123';

  if (username === validUser && password === validPass) {
    const res = NextResponse.json({ ok: true });
    // Set a simple session cookie (httpOnly, 8h expiry)
    res.cookies.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    });
    return res;
  }

  return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 });
}
