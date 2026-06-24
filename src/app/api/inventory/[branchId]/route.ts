import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { getSimbaData } from '@/lib/data';

export const dynamic = 'force-dynamic';

async function ensureInventoryTable(conn: any) {
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS branch_inventory (
      id           SERIAL       PRIMARY KEY,
      branch_id    VARCHAR(50)  NOT NULL,
      product_id   INT          NOT NULL,
      stock_count  INT          NOT NULL DEFAULT 50,
      is_available BOOLEAN      NOT NULL DEFAULT true,
      updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      UNIQUE (branch_id, product_id)
    )
  `);
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ branchId: string }> }) {
  try {
    const { branchId } = await params;
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await ensureInventoryTable(conn);
      const [rows] = await conn.execute(
        `SELECT product_id, stock_count AS "stockCount", is_available AS "isAvailable"
         FROM branch_inventory WHERE branch_id = ?`,
        [branchId]
      ) as any[];

      const inventory: Record<number, { stockCount: number; isAvailable: boolean }> = {};
      for (const row of (rows as any[])) {
        inventory[row.product_id] = {
          stockCount: Number(row.stockCount),
          isAvailable: Boolean(row.isAvailable),
        };
      }
      return NextResponse.json({ ok: true, inventory });
    } finally { conn.release(); }
  } catch {
    return NextResponse.json({ ok: true, inventory: {} });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ branchId: string }> }) {
  try {
    const { branchId } = await params;
    const { productId, stockCount, isAvailable } = await req.json();

    if (!productId) {
      return NextResponse.json({ ok: false, error: 'productId is required' }, { status: 400 });
    }

    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await ensureInventoryTable(conn);

      // Check previous availability status to detect restocking events
      const [prevRows] = await conn.execute(
        'SELECT is_available FROM branch_inventory WHERE branch_id = ? AND product_id = ?',
        [branchId, productId]
      ) as any[];
      const wasUnavailable = prevRows && (prevRows as any[]).length > 0
        ? !Boolean((prevRows as any[])[0].is_available)
        : false;

      await conn.execute(
        `INSERT INTO branch_inventory (branch_id, product_id, stock_count, is_available)
         VALUES (?, ?, ?, ?)
         ON CONFLICT (branch_id, product_id) DO UPDATE
           SET stock_count = EXCLUDED.stock_count,
               is_available = EXCLUDED.is_available,
               updated_at = NOW()`,
        [branchId, productId, Number(stockCount ?? 0), isAvailable ? true : false]
      );

      // If product just became available again, fire back-in-stock notifications
      if (isAvailable && wasUnavailable) {
        // Resolve product name from static data
        const productName = (() => {
          try {
            const data = getSimbaData();
            return data.products.find(p => p.id === Number(productId))?.name ?? `Product #${productId}`;
          } catch {
            return `Product #${productId}`;
          }
        })();

        // Fire-and-forget — do not block the response
        import('@/app/api/notify/route').then(({ triggerBackInStockNotifications }) => {
          triggerBackInStockNotifications(Number(productId), productName).catch(
            (e) => console.error('[inventory PATCH] notification error:', e.message)
          );
        });
      }

      return NextResponse.json({ ok: true });
    } finally { conn.release(); }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
