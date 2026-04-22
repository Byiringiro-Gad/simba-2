import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    const [orders] = await conn.execute(`
      SELECT o.id, o.customer_name, o.customer_phone, o.delivery_address,
             o.delivery_slot, o.payment_method, o.subtotal, o.delivery_fee,
             o.discount, o.total, o.promo_code, o.status,
             o.created_at AS date, o.updated_at
      FROM orders o
      ORDER BY o.created_at DESC
    `) as any[];

    const result = await Promise.all(
      (orders as any[]).map(async (o: any) => {
        const [items] = await conn.execute(
          `SELECT product_id AS id, name, price, quantity, unit, image, category
           FROM order_items WHERE order_id = ?`,
          [o.id]
        ) as any[];
        return { ...o, items: items ?? [] };
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
