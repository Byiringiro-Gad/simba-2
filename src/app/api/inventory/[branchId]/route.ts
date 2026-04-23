import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

export async function GET(
  _req: NextRequest,
  { params }: { params: { branchId: string } }
) {
  try {
    if (!API) {
      return NextResponse.json({ ok: true, inventory: {} });
    }
    const res = await fetch(`${API}/inventory/${params.branchId}`, {
      next: { revalidate: 0 },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ ok: true, inventory: {} });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { branchId: string } }
) {
  try {
    const { productId, stockCount, isAvailable } = await req.json();
    const token = req.headers.get('authorization') ?? '';

    if (!API) {
      return NextResponse.json({ ok: true });
    }

    const res = await fetch(`${API}/inventory/${params.branchId}/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify({ stockCount, isAvailable }),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
