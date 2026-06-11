import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
const API = process.env.NEXT_PUBLIC_API_URL ?? '';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ branchId: string }> }
) {
  try {
    const { branchId } = await params;
    if (!API) return NextResponse.json({ ok: true, reviews: [], total: 0, avgRating: null });
    const res = await fetch(`${API}/reviews/${branchId}`);
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ ok: true, reviews: [], total: 0, avgRating: null });
  }
}
