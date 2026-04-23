import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
const API = process.env.NEXT_PUBLIC_API_URL ?? '';

// GET /api/reviews — all branch ratings
export async function GET() {
  try {
    if (!API) return NextResponse.json({ ok: true, ratings: {} });
    const res = await fetch(`${API}/reviews`);
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ ok: true, ratings: {} });
  }
}

// POST /api/reviews — submit a review
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!API) return NextResponse.json({ ok: true }); // silent success if no backend
    const res = await fetch(`${API}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return NextResponse.json(await res.json());
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
