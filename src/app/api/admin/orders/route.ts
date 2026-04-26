import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const [orders] = await conn.execute(`
      SELECT o.id, o.user_id, o.customer_name, o.customer_phone, o.pickup_branch,
             o.pickup_slot, o.payment_method, o.subtotal, o.delivery_fee,
             o.discount, o.deposit_amount, o.total, o.promo_code,
             o.fulfillment_type, o.status, o.branch_status, o.assigned_to, o.assigned_name,
             o.created_at AS date, o.updated_at
      FROM orders o
      ORDER BY o.created_at DESC
    `) as any[];

    const result = await Promise.all(
      (orders as any[]).map(async (order: any) => {
        const [items] = await conn.execute(
          `SELECT product_id AS id, name, price, quantity, unit, image, category
           FROM order_items WHERE order_id = ?`,
          [order.id]
        ) as any[];
        return { ...order, items: items ?? [] };
      })
    );
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[GET /api/admin/orders]', err.message);
    return NextResponse.json([]);
  } finally {
    conn.release();
  }
}
