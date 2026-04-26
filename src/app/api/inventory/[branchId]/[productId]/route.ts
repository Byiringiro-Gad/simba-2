import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { branchId: string; productId: string } }
) {
  try {
    const { stockCount, isAvailable } = await req.json();
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await conn.execute(
        `INSERT INTO branch_inventory (branch_id, product_id, stock_count, is_available)
         VALUES (?, ?, ?, ?)
         ON CONFLICT (branch_id, product_id) DO UPDATE
           SET stock_count = EXCLUDED.stock_count, is_available = EXCLUDED.is_available, updated_at = NOW()`,
        [params.branchId, Number(params.productId), stockCount, isAvailable ? 1 : 0]
      );
      return NextResponse.json({ ok: true });
    } finally {
      conn.release();
    }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
