import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function ensureInventoryTable(conn: any) {
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS branch_inventory (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      branch_id    VARCHAR(50)  NOT NULL,
      product_id   INT          NOT NULL,
      stock_count  INT          NOT NULL DEFAULT 50,
      is_available TINYINT(1)   NOT NULL DEFAULT 1,
      updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_branch_product (branch_id, product_id),
      INDEX idx_branch (branch_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { branchId: string } }
) {
  try {
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await ensureInventoryTable(conn);
      const [rows] = await conn.execute(
        `SELECT product_id, stock_count AS stockCount, is_available AS isAvailable FROM branch_inventory WHERE branch_id = ?`,
        [params.branchId]
      ) as any[];

      const inventory: Record<number, { stockCount: number; isAvailable: boolean }> = {};
      for (const row of (rows as any[])) {
        inventory[row.product_id] = { stockCount: row.stockCount, isAvailable: !!row.isAvailable };
      }
      return NextResponse.json({ ok: true, inventory });
    } finally {
      conn.release();
    }
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
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await ensureInventoryTable(conn);
      await conn.execute(
        `INSERT INTO branch_inventory (branch_id, product_id, stock_count, is_available)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE stock_count = VALUES(stock_count), is_available = VALUES(is_available), updated_at = NOW()`,
        [params.branchId, productId, stockCount, isAvailable ? 1 : 0]
      );
      return NextResponse.json({ ok: true });
    } finally {
      conn.release();
    }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
